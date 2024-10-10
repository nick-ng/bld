package database

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
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
const LOG_SIZE_FACTOR = 5

var FlashCardData = map[string]FlashCard{}
var lastSnapshotFileSize int64 = 1000

func init() {
	err := os.Mkdir(USER_DATA_DIRECTORY, 0755)

	if err != nil && !errors.Is(err, fs.ErrExist) {
		fmt.Println(err)
		os.Exit(1)
	}

	FlashCardData, err = loadData("")
	if err != nil {
		fmt.Println("couldn't load data")
		fmt.Println(err)
		os.Exit(1)
	}

}

func loadData(finalFilename string) (map[string]FlashCard, error) {
	newFlashCardData := map[string]FlashCard{}
	dirEntries, err := os.ReadDir(USER_DATA_DIRECTORY)
	if err != nil {
		return newFlashCardData, err
	}

	var filenames []string
	var lastSnapshot string
	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		filenames = append(filenames, filename)
		if strings.HasSuffix(filename, "-snap.csv") {
			lastSnapshot = filename
		}
	}

	slices.Sort(filenames)
	for _, filename := range filenames {
		if len(finalFilename) > 0 && filename == finalFilename {
			return newFlashCardData, nil
		}

		fullPath := filepath.Join(USER_DATA_DIRECTORY, filename)
		f, err := os.OpenFile(fullPath, os.O_RDONLY, 0666)
		if err != nil {
			f.Close()
			return newFlashCardData, err
		}
		defer f.Close()

		if filename == lastSnapshot {
			fileStats, err := f.Stat()
			if err != nil {
				fmt.Println("error when getting snapshot stats", err)
			} else {
				lastSnapshotFileSize = fileStats.Size()
			}
		}

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

			// @todo: use correct version of rowToFlashCard
			flashCard, err := rowToFlashCard(tempLine)
			if err != nil {
				continue
			}

			primaryKey, err := flashCardToPrimaryKey(flashCard)
			if err != nil {
				continue
			}

			newFlashCardData[primaryKey] = flashCard
		}
	}

	return newFlashCardData, nil
}

var snapshotRe = regexp.MustCompile(`-\d+-log\.csv$`)

func logsToSnapshot(finalFilename string) {
	snapshotFilename := snapshotRe.ReplaceAllString(finalFilename, "-snap.csv")
	snapshotFullPath := filepath.Join(USER_DATA_DIRECTORY, snapshotFilename)

	newFlashCards, err := loadData(finalFilename)
	if err != nil {
		fmt.Println("error when making snapshot", err)
		return
	}

	var snapshotRows []string
	for _, flashCard := range newFlashCards {
		flashCardRow, err := flashCardToRow(flashCard)
		if err != nil {
			fmt.Println("error when making snapshot", err)
			return
		}

		snapshotRows = append(snapshotRows, flashCardRow)
	}

	snapshotString := strings.Join(snapshotRows, "")
	err = os.WriteFile(snapshotFullPath, []byte(snapshotString), 0666)
	if err != nil {
		fmt.Println("error when making snapshot", err)
		return
	}

	f, err := os.OpenFile(snapshotFullPath, os.O_RDONLY, 0666)
	if err != nil {
		fmt.Println("error when opening snapshot", err)
		return
	}
	defer f.Close()
	fileStats, err := f.Stat()
	if err != nil {
		fmt.Println("error when getting snapshot stats", err)
	}

	lastSnapshotFileSize = fileStats.Size()

	dirEntries, err := os.ReadDir(USER_DATA_DIRECTORY)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		if snapshotFilename == filename {
			return
		}

		if !strings.HasSuffix(filename, ".csv") {
			continue
		}

		fullPath := filepath.Join(USER_DATA_DIRECTORY, filename)
		err := os.Remove(fullPath)
		if err != nil {
			fmt.Println("error when deleting old database log files:", err)
		}
	}
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
		if fileSize < int64(lastSnapshotFileSize*LOG_SIZE_FACTOR) {
			return fullPath
		} else {
			go logsToSnapshot(newestLogFilename)
		}
	}

	now := time.Now()

	fullPath := filepath.Join(USER_DATA_DIRECTORY, fmt.Sprintf("%s-%s-%d-log.csv", VERSION_PREFIX, now.Format("20060102-150405"), len(dirEntries)))

	return fullPath
}

func getPrimaryKey(owner string, flashCardType string, letterPair string) (string, error) {
	if len(owner) == 0 {
		return "", errors.New("flash card has no owner")
	}

	if len(flashCardType) == 0 {
		return "", errors.New("flash card has no type")
	}

	if len(letterPair) == 0 {
		return "", errors.New("flash card has no letter pair")
	}

	return fmt.Sprintf("%s:%s:%s", owner, flashCardType, letterPair), nil
}

func flashCardToPrimaryKey(flashCard FlashCard) (string, error) {
	return getPrimaryKey(flashCard.Owner, flashCard.Type, flashCard.LetterPair)
}

// you're not realistically going to learn two lettering schemes
func normaliseFlashCardType(flashCardType string) string {
	if flashCardType == "edge" || strings.Contains(flashCardType, "edge") {
		return "edge"
	}

	if flashCardType == "corner" || strings.Contains(flashCardType, "corner") {
		return "corner"
	}

	// wings and centres or something
	return flashCardType
}

func flashCardToRow(flashCard FlashCard) (string, error) {
	flashCardType := normaliseFlashCardType(flashCard.Type)

	row := []string{
		flashCard.Owner,
		flashCard.LetterPair,
		flashCard.Memo,
		flashCard.Image,
		flashCard.Commutator,
		flashCard.Tags,
		flashCardType,
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
	rowString = strings.ReplaceAll(rowString, "\n", " ")
	rowString = strings.ReplaceAll(rowString, "\r", "")
	return fmt.Sprintf("%s\n", rowString), nil
}

func rowToFlashCard(row string) (FlashCard, error) {
	// @todo(nick-ng): handle new lines?
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

	flashCardType := normaliseFlashCardType(items[6])
	flashCard := FlashCard{
		Owner:        items[0],
		LetterPair:   items[1],
		Memo:         items[2],
		Image:        items[3],
		Commutator:   items[4],
		Tags:         items[5],
		Type:         flashCardType,
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

func ReadFlashCard(owner string, flashCardType string, letterPair string) (FlashCard, error) {
	primaryKey, err := getPrimaryKey(owner, flashCardType, letterPair)

	if err != nil {
		return FlashCard{}, err
	}

	flashCard, ok := FlashCardData[primaryKey]

	if ok {
		return flashCard, nil
	}

	return FlashCard{
		Type:         "corner",
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
