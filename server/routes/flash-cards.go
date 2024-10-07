package routes

import (
	"bld-server/database"
	"bld-server/utils"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
)

const USER_IMAGES_DIRECTORY = "user-images"

func cleanUpImages() {
	dirEntries, err := os.ReadDir(USER_IMAGES_DIRECTORY)

	if err != nil {
		fmt.Println(err)
		return
	}

	var imagesInDb []string
	for _, flashCard := range database.FlashCardData {
		if len(flashCard.Image) > 0 {
			imagesInDb = append(imagesInDb, flashCard.Image)
		}
	}

	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()

		if !slices.Contains(imagesInDb, filename) {
			fullPath := filepath.Join(USER_IMAGES_DIRECTORY, filename)
			err := os.Remove(fullPath)

			if err != nil {
				fmt.Println("error when deleting unnecessary image:", err)
			}
		}
	}
}

func GetImageFullPath(filename string) (string, error) {
	err := os.Mkdir(USER_IMAGES_DIRECTORY, 0755)

	if err != nil && !errors.Is(err, fs.ErrExist) {
		fmt.Println(err)
		return "", err
	}

	return filepath.Join(USER_IMAGES_DIRECTORY, filename), nil
}

func AddFlashCardsRoutes() {
	http.HandleFunc("GET /flash-cards", handleGetFlashCards)
	http.HandleFunc("GET /flash-cards/{letterPair}", handleGetFlashCard)
	http.HandleFunc("PUT /flash-cards/{letterPair}", handlePutFlashCard)
}

func handleGetFlashCard(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	headerMap := map[string]string{}

	for name, headers := range req.Header {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	haveAccess, authenticatedUsername := utils.CheckCredentials(headerMap["X-Username"], headerMap["X-Password"])
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	letterPair := req.PathValue("letterPair")
	flashCardType := req.URL.Query().Get("type")

	if len(flashCardType) == 0 {
		flashCardType = "corner"
	}

	flashCard, err := database.ReadFlashCard(authenticatedUsername, flashCardType, letterPair)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonBytes, err := json.Marshal(flashCard)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(http.StatusOK)
	writer.Write(jsonBytes)
}

func handleGetFlashCards(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	headerMap := map[string]string{}

	for name, headers := range req.Header {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	haveAccess, authenticatedUsername := utils.CheckCredentials(headerMap["X-Username"], headerMap["X-Password"])
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	allFlashCards, err := database.ReadAllFlashCards(authenticatedUsername)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonBytes, err := json.Marshal(allFlashCards)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(http.StatusOK)
	writer.Write(jsonBytes)
}

func handlePutFlashCard(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	headerMap := map[string]string{}

	for name, headers := range req.Header {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	haveAccess, authenticatedUsername := utils.CheckCredentials(headerMap["X-Username"], headerMap["X-Password"])
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	letterPair := req.PathValue("letterPair")

	if len(letterPair) == 0 {
		writer.WriteHeader(400)
		writer.Write([]byte("no letter pair provided"))
		return
	}

	memo := req.FormValue("memo")
	commutator := req.FormValue("commutator")
	tags := req.FormValue("tags")
	imageUrl := req.FormValue("imageUrl")
	lastQuizUnixString := req.FormValue("lastQuizUnix")
	confidenceString := req.FormValue("confidence")

	lastQuizUnix, err := strconv.ParseInt(lastQuizUnixString, 10, 64)
	if err != nil {
		lastQuizUnix = 0
	}

	confidence, err := strconv.ParseInt(confidenceString, 10, 0)
	if err != nil {
		confidence = 0
	}

	imageChanged := false
	filename := imageUrl
	file, fileHeader, err := req.FormFile("image")
	if err == nil {
		contentType := strings.ToLower(fileHeader.Header.Get("Content-Type"))
		if !strings.HasPrefix(contentType, "image/") {
			writer.WriteHeader(http.StatusBadRequest)
			fmt.Fprint(writer, "invalid file type")
			return
		}

		extension := strings.Replace(contentType, "image/", "", 1)
		filename = fmt.Sprintf("%s.%s", utils.RandomId(), extension)
		imageChanged = true
		filePath, err := GetImageFullPath(filename)
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(writer, "error getting images directory: %s", err)
			return
		}

		buffer := bytes.NewBuffer(nil)
		_, err = io.Copy(buffer, file)
		if err != nil {
			writer.WriteHeader(http.StatusBadRequest)
			fmt.Fprintf(writer, "error reading file: %s", err)
			return
		}

		os.WriteFile(filePath, buffer.Bytes(), 0666)
	}

	flashCard := database.FlashCard{
		Type:         "spefz-corners",
		Owner:        authenticatedUsername,
		LetterPair:   letterPair,
		Memo:         memo,
		Image:        filename,
		Commutator:   commutator,
		Tags:         tags,
		LastQuizUnix: lastQuizUnix,
		Confidence:   int(confidence),
	}

	database.WriteFlashCard(flashCard)

	flashCardJsonBytes, err := json.Marshal(flashCard)

	if err != nil {
		fmt.Fprintf(writer, "error when converting flash card to json string: %s", err)
	}

	writer.WriteHeader(http.StatusOK)
	writer.Write(flashCardJsonBytes)

	if imageChanged {
		go cleanUpImages()
	}

}
