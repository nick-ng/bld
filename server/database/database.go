package database

import (
	"bufio"
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
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
	IsPublic     bool   `json:"isPublic"`
}

const VERSION_PREFIX = "v2"
const USER_DATA_DIRECTORY = "user-data"
const SYNC_ALL_WRITES = false
const LOG_SIZE_FACTOR = 3

var FlashCardData = map[string]FlashCard{}
var lastSnapshotFileSize int64 = 1000
var db1 *sql.DB

func init() {
	err := os.Mkdir(USER_DATA_DIRECTORY, 0755)
	if err != nil && !errors.Is(err, fs.ErrExist) {
		fmt.Println(err)
		os.Exit(1)
	}

	migrateDb()

	FlashCardData, err = loadData("")
	if err != nil {
		fmt.Println("couldn't load data")
		fmt.Println(err)
		os.Exit(1)
	}

}

func GetDb() *sql.DB {
	if db1 == nil {
		sqliteDb, err := sql.Open("sqlite3", filepath.Join(USER_DATA_DIRECTORY, "bld.db"))
		if err != nil {
			fmt.Println("error opening sqlite3 db", err)
			os.Exit(1)
		}

		db1 = sqliteDb
	}

	return db1
}

func migrateDb() {
	db := GetDb()

	query := "SELECT name FROM sqlite_master WHERE type='table' AND name='migration';"

	tableExistsRows, err := db.Query(query)
	if err != nil {
		fmt.Println("error executing sql statement", err)
		return
	}
	defer tableExistsRows.Close()

	migrationTableExists := false
	for tableExistsRows.Next() {
		var name string
		err = tableExistsRows.Scan(&name)
		fmt.Println("name", name)
		if name == "migration" {
			migrationTableExists = true
		}
	}

	if !migrationTableExists {
		createMigrationTableQuery := "CREATE TABLE migration (filename string)"
		_, err := db.Exec(createMigrationTableQuery)
		if err != nil {
			fmt.Println("error creating migration table:", err)
			return
		}
	}

	// @todo(nick-ng): list migration files
	// @todo(nick-ng): apply migration files that haven't been applied
}

func loadData(finalFilename string) (map[string]FlashCard, error) {
	newFlashCardData := map[string]FlashCard{}
	dirEntries, err := os.ReadDir(USER_DATA_DIRECTORY)
	if err != nil {
		return newFlashCardData, err
	}

	// sort files ignoring version prefix (v1, v2, etc.)
	slices.SortFunc(dirEntries, func(a, b os.DirEntry) int {
		// names will begin with "-" (e.g. -202507...) which won't affect sort order
		cutset := "v0123456789"
		aName := strings.TrimLeft(a.Name(), cutset)
		bName := strings.TrimLeft(b.Name(), cutset)

		return strings.Compare(aName, bName)
	})

	var filenames []string
	var lastSnapshot string
	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		filenames = append(filenames, filename)
		if strings.HasSuffix(filename, "-snap.csv") {
			lastSnapshot = filename
		}
	}

	for _, filename := range filenames {
		if len(finalFilename) > 0 && filename == finalFilename {
			return newFlashCardData, nil
		}

		if !strings.HasSuffix(filename, ".csv") {
			continue
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
			} else if fileStats.Size() > 1000 {
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

			var flashCard FlashCard
			switch {
			case strings.HasPrefix(filename, "v2-"):
				{
					flashCard, err = rowV2ToFlashCard(tempLine)
				}
			default:
				{
					// v1
					flashCard, err = rowV1ToFlashCard(tempLine)
				}
			}
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

func logsToSnapshot(finalFilename string) {
	now := time.Now()
	snapshotFilename := fmt.Sprintf("%s-%s-snap.csv", VERSION_PREFIX, now.Format("20060102-150405"))
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

		if finalFilename == filename {
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
		}
	}

	now := time.Now()
	filenameStart := fmt.Sprintf("%s-%s", VERSION_PREFIX, now.Format("20060102-150405"))
	matchingFileCount := 0
	for _, filename := range actualLogFilenames {
		if strings.HasPrefix(filename, filenameStart) {
			matchingFileCount += 1
		}
	}

	filename := fmt.Sprintf("%s-zz-%d-log.csv", filenameStart, matchingFileCount)
	fullPath := filepath.Join(USER_DATA_DIRECTORY, filename)
	go logsToSnapshot(filename)

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
	isPublicString := "0"
	if flashCard.IsPublic {
		isPublicString = "1"
	}

	row := []string{
		flashCard.Owner,
		flashCard.LetterPair,
		flashCard.Memo,
		flashCard.Image,
		flashCard.Commutator,
		flashCard.Tags,
		flashCardType,
		fmt.Sprintf("%d", flashCard.Confidence),
		isPublicString,
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

func rowV1ToFlashCard(row string) (FlashCard, error) {
	items := rowToItems(row)

	if len(items) != 9 {
		fmt.Println("error: v1 wrong number of items", row)
		return FlashCard{}, errors.New("wrong number of items")
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
		IsPublic:     false,
		LastQuizUnix: lastQuizUnix,
	}

	return flashCard, nil
}

func rowV2ToFlashCard(row string) (FlashCard, error) {
	items := rowToItems(row)

	if len(items) != 10 {
		fmt.Println("error: v2 wrong number of items", row)
		return FlashCard{}, errors.New("wrong number of items")
	}

	confidence, err := strconv.ParseInt(items[7], 10, 0)
	if err != nil {
		confidence = 0
	}

	isPublic := false
	if items[8] == "1" {
		isPublic = true
	}

	lastQuizUnix, err := strconv.ParseInt(items[9], 10, 64)
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
		IsPublic:     isPublic,
		LastQuizUnix: lastQuizUnix,
	}

	return flashCard, nil

}

func rowToItems(row string) []string {
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

	return items
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
		IsPublic:     false,
	}, nil
}
