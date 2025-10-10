package database

import (
	"bufio"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type FlashCard struct {
	Type           string `json:"type"`
	Owner          string `json:"owner"`
	LetterPair     string `json:"letterPair"`
	Memo           string `json:"memo"`
	Image          string `json:"image"`
	Commutator     string `json:"commutator"`
	Tags           string `json:"tags"`
	LastQuizUnix   int64  `json:"lastQuizUnix"`
	Confidence     int    `json:"confidence"`
	MemoConfidence int    `json:"memoConfidence"`
	CommConfidence int    `json:"commConfidence"`
	DrillTimeMs    int    `json:"drillTimeMs"`
	LastDrillUnix  int64  `json:"lastDrillUnix"`
	IsPublic       bool   `json:"isPublic"`
	ModifiedAt     int64  `json:"modifiedAt"`
}

const VERSION_PREFIX = "v2"
const USER_DATA_DIRECTORY = "user-data"
const MIGRATIONS_DIRECTORY = "migrations"
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

	// migrate from old db to sqlite
	db := GetDb()
	tx, err := db.Begin()
	if err != nil {
		fmt.Println("error getting database transaction", err)
		os.Exit(1)
	}
	statement, err := tx.Prepare(`INSERT OR IGNORE INTO flash_card(
		owner,
		type,
		letter_pair,
		memo,
		image,
		commutator,
		tags,
		last_quiz_unix,
		last_drill_unix,
		memo_confidence,
		comm_confidence,
		drill_time_ms,
		is_public
		) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		fmt.Println("error preparing insert statement", err)
		os.Exit(1)
	}

	defer statement.Close()
	for pk, flashCard := range FlashCardData {
		_, err = statement.Exec(
			flashCard.Owner,
			flashCard.Type,
			flashCard.LetterPair,
			flashCard.Memo,
			flashCard.Image,
			flashCard.Commutator,
			flashCard.Tags,
			flashCard.LastQuizUnix,
			flashCard.LastDrillUnix,
			flashCard.MemoConfidence,
			flashCard.CommConfidence,
			flashCard.DrillTimeMs,
			flashCard.IsPublic,
		)

		if err != nil {
			fmt.Println("error inserting", pk, err)
		}
	}

	err = tx.Commit()
	if err != nil {
		fmt.Println("error committing transaction", err)
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
		db.Close()
		os.Exit(1)
	}
	defer tableExistsRows.Close()

	migrationTableExists := false
	for tableExistsRows.Next() {
		var name string
		err = tableExistsRows.Scan(&name)
		if name == "migration" {
			migrationTableExists = true
		}
	}

	if !migrationTableExists {
		createMigrationTableQuery := "CREATE TABLE migration (filename TEXT)"
		_, err := db.Exec(createMigrationTableQuery)
		if err != nil {
			fmt.Println("error creating migration table:", err)
			db.Close()
			os.Exit(1)
		}
	}

	dirEntries, err := os.ReadDir(MIGRATIONS_DIRECTORY)
	if err != nil {
		fmt.Println("error getting migration files:", err)
		return
	}

	slices.SortFunc(dirEntries, func(a, b os.DirEntry) int {
		aName := a.Name()
		bName := b.Name()

		return strings.Compare(aName, bName)
	})

	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		if !strings.HasSuffix(filename, ".sql") {
			continue
		}

		tx, err := db.Begin()
		if err != nil {
			fmt.Println("error getting database transaction:", err)
			db.Close()
			os.Exit(1)
		}

		query := "SELECT filename FROM migration WHERE filename = ?"
		migrationExistsRows, err := tx.Query(query, filename)
		migrationExists := false
		for migrationExistsRows.Next() {
			var tempFilename string
			err = migrationExistsRows.Scan(&tempFilename)
			if tempFilename == filename {
				err = tx.Commit()
				if err != nil {
					fmt.Println("error committing database transaction:", err)
					db.Close()
					os.Exit(1)
				}

				migrationExists = true
				continue
			}
		}

		if migrationExists {
			fmt.Printf("%s already applied. skipping\n", filename)
			continue
		}

		fullPath := filepath.Join(MIGRATIONS_DIRECTORY, filename)
		contentBytes, err := os.ReadFile(fullPath)
		if err != nil {
			fmt.Println("error reading", fullPath, err)
			err := tx.Rollback()
			if err != nil {
				fmt.Println("error rolling back database transaction:", err)
			}

			db.Close()
			os.Exit(1)
		}

		content := string(contentBytes)
		sqlQueries := strings.Split(content, "-- split")

		for i, sqlQuery := range sqlQueries {
			fmt.Printf("applying query %d from %s\n", i, fullPath)
			_, err := tx.Exec(sqlQuery)
			if err != nil {
				fmt.Println("error applying sql query:", sqlQuery)
				err := tx.Rollback()
				if err != nil {
					fmt.Println("error rolling back database transaction:", err)
				}

				db.Close()
				os.Exit(1)
			}
		}

		recordMigrationQuery := "INSERT INTO migration (filename) VALUES (?)"
		_, err = tx.Exec(recordMigrationQuery, filename)
		if err != nil {
			fmt.Println("error recording migration completion:", err)
			err := tx.Rollback()
			if err != nil {
				fmt.Println("error rolling back database transaction:", err)
				db.Close()
				os.Exit(1)
			}
		}

		err = tx.Commit()
		if err != nil {
			fmt.Println("error committing database transaction:", err)
			db.Close()
			os.Exit(1)
		}
	}
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
	memoConfidence := confidence & 3
	commConfidence := (confidence >> 2) & 3
	drillTimeDs := ((confidence >> 4) & 255) * 2
	if drillTimeDs == 0 {
		drillTimeDs = 509
	}
	flashCard := FlashCard{
		Owner:          items[0],
		LetterPair:     items[1],
		Memo:           items[2],
		Image:          items[3],
		Commutator:     items[4],
		Tags:           items[5],
		Type:           flashCardType,
		Confidence:     int(confidence),
		MemoConfidence: int(memoConfidence),
		CommConfidence: int(commConfidence),
		DrillTimeMs:    int(drillTimeDs * 100),
		IsPublic:       false,
		LastQuizUnix:   lastQuizUnix,
		LastDrillUnix:  lastQuizUnix,
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
	memoConfidence := confidence & 3
	commConfidence := (confidence >> 2) & 3
	drillTimeDs := ((confidence >> 4) & 255) * 2
	if drillTimeDs == 0 {
		drillTimeDs = 509
	}
	flashCard := FlashCard{
		Owner:          items[0],
		LetterPair:     items[1],
		Memo:           items[2],
		Image:          items[3],
		Commutator:     items[4],
		Tags:           items[5],
		Type:           flashCardType,
		Confidence:     int(confidence),
		MemoConfidence: int(memoConfidence),
		CommConfidence: int(commConfidence),
		DrillTimeMs:    int(drillTimeDs * 100),
		IsPublic:       isPublic,
		LastQuizUnix:   lastQuizUnix,
		LastDrillUnix:  lastQuizUnix,
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

var flashCardKeyColumnMap = map[string]string{
	"Owner":          "owner",
	"Type":           "type",
	"LetterPair":     "letter_pair",
	"Memo":           "memo",
	"Image":          "image",
	"Commutator":     "commutator",
	"Tags":           "tags",
	"LastQuizUnix":   "last_quiz_unix",
	"LastDrillUnix":  "last_drill_unix",
	"MemoConfidence": "memo_confidence",
	"CommConfidence": "comm_confidence",
	"DrillTimeMs":    "drill_time_ms",
	"IsPublic":       "is_public",
	"IsDeleted":      "is_deleted",
}

func prepareFlashCardFragments(flashCard FlashCard) ([]string, []any, string, string, string, string) {
	v := reflect.ValueOf(flashCard)
	typeOfV := v.Type()
	columns := []string{}
	updateColumns := []string{}
	upsertColumns := []string{}
	values := []any{}
	placeHolders := []string{}
	for i := 0; i < v.NumField(); i++ {
		key := typeOfV.Field(i).Name
		column, ok := flashCardKeyColumnMap[key]
		if !ok {
			continue
		}

		value := v.Field(i).Interface()
		columns = append(columns, column)
		placeHolders = append(placeHolders, "?")
		updateColumns = append(updateColumns, fmt.Sprintf("%s = ?", column))
		upsertColumns = append(upsertColumns, fmt.Sprintf("%s = excluded.%s", column, column))
		values = append(values, value)
	}

	placeHoldersString := strings.Join(placeHolders, ", ")
	insertString := strings.Join(columns, ", ")
	updateString := strings.Join(updateColumns, ", ")
	upsertString := strings.Join(upsertColumns, ", ")

	return columns, values, placeHoldersString, insertString, updateString, upsertString
}

func preparePartialFlashCardFragments(flashCardProperties map[string]any) ([]string, []any, string, string, string, string) {
	columns := []string{}
	updateColumns := []string{}
	upsertColumns := []string{}
	values := []any{}
	placeHolders := []string{}
	for key, columnName := range flashCardKeyColumnMap {
		value, ok := flashCardProperties[key]
		if !ok {
			continue
		}

		columns = append(columns, columnName)
		placeHolders = append(placeHolders, "?")
		updateColumns = append(updateColumns, fmt.Sprintf("%s = ?", columnName))
		upsertColumns = append(upsertColumns, fmt.Sprintf("%s = excluded.%s", columnName, columnName))
		values = append(values, value)
	}

	placeHoldersString := strings.Join(placeHolders, ", ")
	insertString := strings.Join(columns, ", ")
	updateString := strings.Join(updateColumns, ", ")
	upsertString := strings.Join(upsertColumns, ", ")

	return columns, values, placeHoldersString, insertString, updateString, upsertString
}

func getDefaultFlashCard(owner string, flashCardType string, letterPair string) FlashCard {
	return FlashCard{
		Type:           flashCardType,
		Owner:          owner,
		LetterPair:     letterPair,
		Memo:           "",
		Image:          "",
		Commutator:     "",
		Tags:           "",
		LastQuizUnix:   0,
		LastDrillUnix:  0,
		CommConfidence: 0,
		MemoConfidence: 0,
		DrillTimeMs:    50000,
		IsPublic:       false,
	}
}

var flashCardSelectColumns = `owner,
type,
letter_pair,
memo, 
image,
commutator,
tags,
last_quiz_unix,
last_drill_unix,
memo_confidence,
comm_confidence,
drill_time_ms,
is_public`

func WriteFlashCard(flashCard FlashCard) (FlashCard, error) {
	db := GetDb()

	_, values, placeHoldersString, insertString, _, upsertString := prepareFlashCardFragments(flashCard)
	query := fmt.Sprintf(`INSERT INTO flash_card (%s)
		VALUES (%s),
		ON CONFLICT (owner, type, letter_pair) DO UPDATE SET %s
		RETURNING %s`,
		insertString, placeHoldersString, upsertString, flashCardSelectColumns)
	insertStatement, err := db.Prepare(query)
	if err != nil {
		fmt.Println("error preparing flash card insert statement:", err)
		return getDefaultFlashCard(flashCard.Owner, flashCard.Type, flashCard.LetterPair), err
	}

	rows, err := insertStatement.Query(values...)
	if err != nil {
		fmt.Println("error executing flash card insert statement:", err)
		return getDefaultFlashCard(flashCard.Owner, flashCard.Type, flashCard.LetterPair), err
	}
	defer rows.Close()

	for rows.Next() {
		var owner string
		var flashCardType string
		var letterPair string
		var memo string
		var image string
		var commutator string
		var tags string
		var lastQuizUnix int64
		var lastDrillUnix int64
		var memoConfidence int
		var commConfidence int
		var drillTimeMs int
		var isPublic int

		rows.Scan(&owner, &flashCardType, &letterPair, &memo, &image, &commutator, &tags, &lastQuizUnix, &lastDrillUnix, &memoConfidence, &commConfidence, &drillTimeMs, &isPublic)

		flashCardFromDb := FlashCard{
			Owner:          owner,
			Type:           flashCardType,
			LetterPair:     letterPair,
			Memo:           memo,
			Image:          image,
			Commutator:     commutator,
			Tags:           tags,
			LastQuizUnix:   lastQuizUnix,
			LastDrillUnix:  lastDrillUnix,
			MemoConfidence: memoConfidence,
			CommConfidence: commConfidence,
			DrillTimeMs:    drillTimeMs,
			IsPublic:       isPublic > 0,
		}

		return flashCardFromDb, nil
	}

	return getDefaultFlashCard(flashCard.Owner, flashCard.Type, flashCard.LetterPair), err
}

func WritePartialFlashCard(flashCardProperties map[string]any) (FlashCard, error) {
	temp1, ok := flashCardProperties["Owner"]
	owner, ok2 := temp1.(string)
	if !ok || !ok2 {
		return FlashCard{}, errors.New("no owner provided")
	}

	temp2, ok := flashCardProperties["Type"]
	flashCardType, ok2 := temp2.(string)
	if !ok || !ok2 {
		return FlashCard{}, errors.New("no type provided")
	}

	temp3, ok := flashCardProperties["LetterPair"]
	letterPair, ok2 := temp3.(string)
	if !ok || !ok2 {
		return FlashCard{}, errors.New("no letter pair provided")
	}

	db := GetDb()

	_, values, placeHoldersString, insertString, _, upsertString := preparePartialFlashCardFragments(flashCardProperties)
	query := fmt.Sprintf(`INSERT INTO flash_card (%s)
		VALUES (%s),
		ON CONFLICT (owner, type, letter_pair) DO UPDATE SET %s
		RETURNING %s`,
		insertString, placeHoldersString, upsertString, flashCardSelectColumns)
	insertStatement, err := db.Prepare(query)
	if err != nil {
		fmt.Println("error preparing flash card insert statement:", err)
		return getDefaultFlashCard(owner, flashCardType, letterPair), err
	}

	rows, err := insertStatement.Query(values...)
	if err != nil {
		fmt.Println("error executing flash card insert statement:", err)
		return getDefaultFlashCard(owner, flashCardType, letterPair), err
	}
	defer rows.Close()

	for rows.Next() {
		var owner string
		var flashCardType string
		var letterPair string
		var memo string
		var image string
		var commutator string
		var tags string
		var lastQuizUnix int64
		var lastDrillUnix int64
		var memoConfidence int
		var commConfidence int
		var drillTimeMs int
		var isPublic int

		rows.Scan(&owner, &flashCardType, &letterPair, &memo, &image, &commutator, &tags, &lastQuizUnix, &lastDrillUnix, &memoConfidence, &commConfidence, &drillTimeMs, &isPublic)

		flashCardFromDb := FlashCard{
			Owner:          owner,
			Type:           flashCardType,
			LetterPair:     letterPair,
			Memo:           memo,
			Image:          image,
			Commutator:     commutator,
			Tags:           tags,
			LastQuizUnix:   lastQuizUnix,
			LastDrillUnix:  lastDrillUnix,
			MemoConfidence: memoConfidence,
			CommConfidence: commConfidence,
			DrillTimeMs:    drillTimeMs,
			IsPublic:       isPublic > 0,
		}

		return flashCardFromDb, nil
	}

	return getDefaultFlashCard(owner, flashCardType, letterPair), err
}

func ReadAllFlashCards(owner string) ([]FlashCard, error) {
	allFlashCards := []FlashCard{}

	db := GetDb()

	query := fmt.Sprintf(`SELECT %s FROM flash_card WHERE owner = ?`, flashCardSelectColumns)
	selectStatement, err := db.Prepare(query)
	if err != nil {
		fmt.Println("error preparing flash card select statement:", err)
		return allFlashCards, err
	}

	rows, err := selectStatement.Query(owner)
	if err != nil {
		fmt.Println("error executing flash card insert statement:", err)
		return allFlashCards, err
	}
	defer rows.Close()

	for rows.Next() {
		var owner string
		var flashCardType string
		var letterPair string
		var memo string
		var image string
		var commutator string
		var tags string
		var lastQuizUnix int64
		var lastDrillUnix int64
		var memoConfidence int
		var commConfidence int
		var drillTimeMs int
		var isPublic int

		rows.Scan(&owner, &flashCardType, &letterPair, &memo, &image, &commutator, &tags, &lastQuizUnix, &lastDrillUnix, &memoConfidence, &commConfidence, &drillTimeMs, &isPublic)

		flashCardFromDb := FlashCard{
			Owner:          owner,
			Type:           flashCardType,
			LetterPair:     letterPair,
			Memo:           memo,
			Image:          image,
			Commutator:     commutator,
			Tags:           tags,
			LastQuizUnix:   lastQuizUnix,
			LastDrillUnix:  lastDrillUnix,
			MemoConfidence: memoConfidence,
			CommConfidence: commConfidence,
			DrillTimeMs:    drillTimeMs,
			IsPublic:       isPublic > 0,
		}

		allFlashCards = append(allFlashCards, flashCardFromDb)
	}

	return allFlashCards, nil
}

func ReadFlashCard(owner string, flashCardType string, letterPair string) (FlashCard, error) {
	db := GetDb()

	query := fmt.Sprintf(`SELECT %s FROM flash_card WHERE owner = ? AND type = ? AND letter_pair = ?`, flashCardSelectColumns)
	selectStatement, err := db.Prepare(query, flashCardType, letterPair)
	if err != nil {
		fmt.Println("error preparing flash card select statement:", err)
		return getDefaultFlashCard(owner, flashCardType, letterPair), err
	}

	rows, err := selectStatement.Query(owner)
	if err != nil {
		fmt.Println("error executing flash card insert statement:", err)
		return getDefaultFlashCard(owner, flashCardType, letterPair), err
	}
	defer rows.Close()

	for rows.Next() {
		var owner string
		var flashCardType string
		var letterPair string
		var memo string
		var image string
		var commutator string
		var tags string
		var lastQuizUnix int64
		var lastDrillUnix int64
		var memoConfidence int
		var commConfidence int
		var drillTimeMs int
		var isPublic int

		rows.Scan(&owner, &flashCardType, &letterPair, &memo, &image, &commutator, &tags, &lastQuizUnix, &lastDrillUnix, &memoConfidence, &commConfidence, &drillTimeMs, &isPublic)

		flashCardFromDb := FlashCard{
			Owner:          owner,
			Type:           flashCardType,
			LetterPair:     letterPair,
			Memo:           memo,
			Image:          image,
			Commutator:     commutator,
			Tags:           tags,
			LastQuizUnix:   lastQuizUnix,
			LastDrillUnix:  lastDrillUnix,
			MemoConfidence: memoConfidence,
			CommConfidence: commConfidence,
			DrillTimeMs:    drillTimeMs,
			IsPublic:       isPublic > 0,
		}

		return flashCardFromDb, nil
	}

	return getDefaultFlashCard(owner, flashCardType, letterPair), err
}
