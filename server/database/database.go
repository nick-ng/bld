package database

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"
)

type FlashCard struct {
	Type         string `json:"type"`
	Owner        string `json:"owner"`
	LetterPair   string `json:"letterPair"`
	Memo         string `json:"memo"`
	Image        string `json:"image"`
	Commutator   string `json:"commutator"`
	Tags         string `json:"tags"`
	LastQuizUnix int64  `json:"lastQuizUnix"`
	Confidence   int    `json:"confidence"`
}

const VERSION_PREFIX = "v1"
const USER_DATA_DIRECTORY = "user-data"
const SYNC_ALL_WRITES = false

var FlashCardData map[string]FlashCard = map[string]FlashCard{}

// @todo(nick-ng): update snapshot file size as you make snapshots
var lastSnapshotFileSize = 1000

func init() {
	err := os.Mkdir(USER_DATA_DIRECTORY, 0755)

	if err != nil && !errors.Is(err, fs.ErrExist) {
		fmt.Println(err)
		os.Exit(1)
	}

	loadData()
}

func loadData() error {
	dirEntries, err := os.ReadDir(USER_DATA_DIRECTORY)

	if err != nil {
		return err
	}

	var filenames []string
	hasSnapshot := false
	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		if !hasSnapshot && strings.HasSuffix(filename, "-snap.csv") {
			filenames = []string{filename}
		} else {
			filenames = append(filenames, filename)
		}
	}

	slices.Sort(filenames)
	for _, filename := range filenames {
		fullPath := filepath.Join(USER_DATA_DIRECTORY, filename)
		f, err := os.OpenFile(fullPath, os.O_RDONLY, 0666)
		if err != nil {
			f.Close()
			return err
		}
		defer f.Close()

		reader := bufio.NewReader(f)

		keepGoing := true

		for keepGoing {
			tempBytes, _, err := reader.ReadLine()
			tempLine := string(tempBytes)

			if err != nil {
				keepGoing = false

				if !errors.Is(err, io.EOF) {
					fmt.Println("error:", err)
				}

				continue
			}

			flashCard, err := rowToFlashCard(tempLine)
			if err != nil {
				continue
			}

			primaryKey, err := flashCardToPrimaryKey(flashCard)
			if err != nil {
				continue
			}

			FlashCardData[primaryKey] = flashCard
		}

	}

	return nil
}

func getCurrentChangeLogFullPath() string {
	dirEntries, err := os.ReadDir(USER_DATA_DIRECTORY)

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	actualLogFilenames := []string{}
	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		if strings.HasPrefix(filename, fmt.Sprintf("%s-", VERSION_PREFIX)) && strings.HasSuffix(filename, "-log.csv") {
			actualLogFilenames = append(actualLogFilenames, filename)
		}
	}

	if len(actualLogFilenames) > 0 {
		slices.Sort(actualLogFilenames)
		newestLogFilename := actualLogFilenames[len(actualLogFilenames)-1]
		fullPath := filepath.Join(USER_DATA_DIRECTORY, newestLogFilename)
		f, err := os.OpenFile(fullPath, os.O_RDONLY, 0666)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer f.Close()
		fileStats, err := f.Stat()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		fileSize := fileStats.Size()
		if fileSize < int64(lastSnapshotFileSize*5) {
			return fullPath
		} else {
			// @todo(nick-ng): convert log to snapshot
		}
	}

	now := time.Now()

	fullPath := filepath.Join(USER_DATA_DIRECTORY, fmt.Sprintf("%s-%s-%d-log.csv", VERSION_PREFIX, now.Format("20060102-150405"), len(dirEntries)))

	return fullPath
}

func flashCardToPrimaryKey(flashCard FlashCard) (string, error) {
	if len(flashCard.Owner) == 0 {
		return "", errors.New("flash card has no owner")
	}

	if len(flashCard.LetterPair) == 0 {
		return "", errors.New("flash card has no letter pair")
	}

	return fmt.Sprintf("%s:%s", flashCard.Owner, flashCard.LetterPair), nil
}

func flashCardToRow(flashCard FlashCard) (string, error) {
	row := []string{
		flashCard.Owner,
		flashCard.LetterPair,
		flashCard.Memo,
		flashCard.Image,
		flashCard.Commutator,
		flashCard.Tags,
		flashCard.Type,
		fmt.Sprintf("%d", flashCard.Confidence),
		fmt.Sprintf("%d", flashCard.LastQuizUnix),
	}

	row2 := []string{}
	for _, item := range row {
		rowItem := item
		if strings.ContainsAny(item, ",") {
			cleanItem := strings.ReplaceAll(item, "\"", "\"\"")
			rowItem = fmt.Sprintf("\"%s\"", cleanItem)
		}

		row2 = append(row2, rowItem)
	}

	rowString := strings.Join(row2, ",")
	return fmt.Sprintf("%s\n", rowString), nil
}

func rowToFlashCard(row string) (FlashCard, error) {
	var items []string

	characters := strings.Split(row, "")
	var item string
	inEscapedValue := false
	for i, character := range characters {
		previousCharacter := ""
		if i != 0 {
			previousCharacter = characters[i-1]
		}

		if inEscapedValue {
			if character == "\"" {
				if previousCharacter == "\"" {
					item = fmt.Sprintf("%s%s", item, character)
				}

				continue
			}

			if character == "," && previousCharacter == "\"" {
				inEscapedValue = false
				items = append(items, item)
				item = ""
				continue
			}

			item = fmt.Sprintf("%s%s", item, character)
			continue
		}

		if character == "\"" && len(item) == 0 {
			inEscapedValue = true
			continue
		}

		if character == "," {
			items = append(items, item)
			item = ""
			continue
		}

		item = fmt.Sprintf("%s%s", item, character)
	}

	if len(item) > 0 {
		items = append(items, item)
	}

	if len(items) != 9 {
		return FlashCard{}, errors.New("wrong number of values")
	}

	confidence, err := strconv.ParseInt(items[7], 10, 0)
	if err != nil {
		confidence = 0
	}

	lastQuizUnix, err := strconv.ParseInt(items[8], 10, 64)
	if err != nil {
		lastQuizUnix = 0
	}

	flashCard := FlashCard{
		Owner:        items[0],
		LetterPair:   items[1],
		Memo:         items[2],
		Image:        items[3],
		Commutator:   items[4],
		Tags:         items[5],
		Type:         items[6],
		Confidence:   int(confidence),
		LastQuizUnix: lastQuizUnix,
	}

	return flashCard, nil
}

func WriteFlashCard(flashCard FlashCard) error {
	// @todo(nick-ng): make sure owner doesn't have a colon (doesn't matter?)
	primaryKey, err := flashCardToPrimaryKey(flashCard)
	if err != nil {
		return err
	}

	FlashCardData[primaryKey] = flashCard

	changeLogPath := getCurrentChangeLogFullPath()
	f, err := os.OpenFile(changeLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		f.Close()
		return err
	}
	defer f.Close()

	row, err := flashCardToRow(flashCard)
	if err != nil {
		return err
	}

	_, err = f.Write([]byte(row))
	if err != nil {
		return err
	}
	if SYNC_ALL_WRITES {
		err = f.Sync()
		if err != nil {
			return err
		}
	}

	return nil
}

func ReadAllFlashCards(owner string) ([]FlashCard, error) {
	allFlashCards := []FlashCard{}

	for _, flashCard := range FlashCardData {
		if flashCard.Owner == owner {
			allFlashCards = append(allFlashCards, flashCard)
		}
	}

	return allFlashCards, nil
}

func ReadFlashCard(owner string, letterPair string) (FlashCard, error) {
	allFlashCards, err := ReadAllFlashCards(owner)

	if err != nil {
		return FlashCard{}, err
	}

	for _, flashCard := range allFlashCards {
		if flashCard.LetterPair == letterPair {
			return flashCard, nil
		}
	}

	return FlashCard{
		Type:         "spefz-corners",
		Owner:        owner,
		LetterPair:   letterPair,
		Memo:         "",
		Image:        "",
		Commutator:   "",
		Tags:         "",
		LastQuizUnix: 0,
		Confidence:   0,
	}, nil
}
