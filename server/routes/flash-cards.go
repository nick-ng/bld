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
	http.HandleFunc("PUT /flash-cards/{letterPair}", handlePutFlashCard)
}

func handleGetFlashCards(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	headerMap := map[string]string{}

	for name, headers := range req.Header {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	haveAccess := utils.CheckCredentials(headerMap["X-Username"], headerMap["X-Password"])
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	allFlashCards, err := database.ReadAllFlashCards("me")
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

	haveAccess := utils.CheckCredentials(headerMap["X-Username"], headerMap["X-Password"])
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
		Type:       "spefz-corners",
		Owner:      "me",
		LetterPair: letterPair,
		Memo:       memo,
		Image:      filename,
		Commutator: commutator,
		Tags:       tags,
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

// func FlashCardsHandler(writer http.ResponseWriter, req *http.Request) {
// 	writer.Header().Add("Access-Control-Allow-Origin", "*")
// 	writer.Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
// 	writer.Header().Add("Access-Control-Allow-Headers", "x-username,x-password")

// 	headerMap := map[string]string{}

// 	for name, headers := range req.Header {
// 		if len(headers) > 0 {
// 			headerMap[name] = headers[len(headers)-1]
// 		}
// 	}

// 	// @todo(nick-ng): authenticate request
// 	fmt.Println("headers", headerMap)
// 	haveAccess := utils.CheckCredentials(headerMap["X-Username"], headerMap["X-Password"])

// 	if !haveAccess {
// 		writer.WriteHeader(http.StatusUnauthorized)
// 		return
// 	}

// 	myRe := regexp.MustCompile(`^\/flash-cards\/?`)
// 	letterPair := myRe.ReplaceAllString(req.RequestURI, "")

// 	switch req.Method {
// 	case "OPTIONS":
// 		{
// 			writer.WriteHeader(http.StatusOK)
// 		}
// 	case "POST":
// 		fallthrough
// 	case "PUT":
// 		{
// 			{
// 				if len(letterPair) == 0 {
// 					letterPair = req.FormValue("letterPair")
// 				}
// 				if len(letterPair) == 0 {
// 					writer.WriteHeader(400)
// 					writer.Write([]byte("no letter pair provided"))
// 					return
// 				}

// 				memo := req.FormValue("memo")
// 				commutator := req.FormValue("commutator")
// 				tags := req.FormValue("tags")
// 				imageUrl := req.FormValue("imageUrl")

// 				imageChanged := false
// 				filename := imageUrl
// 				file, fileHeader, err := req.FormFile("image")
// 				if err == nil {
// 					contentType := strings.ToLower(fileHeader.Header.Get("Content-Type"))
// 					if !strings.HasPrefix(contentType, "image/") {
// 						writer.WriteHeader(http.StatusBadRequest)
// 						fmt.Fprint(writer, "invalid file type")
// 						return
// 					}

// 					extension := strings.Replace(contentType, "image/", "", 1)
// 					filename = fmt.Sprintf("%s.%s", utils.RandomId(), extension)
// 					imageChanged = true
// 					filePath, err := GetImageFullPath(filename)
// 					if err != nil {
// 						writer.WriteHeader(http.StatusInternalServerError)
// 						fmt.Fprintf(writer, "error getting images directory: %s", err)
// 						return
// 					}

// 					buffer := bytes.NewBuffer(nil)
// 					_, err = io.Copy(buffer, file)
// 					if err != nil {
// 						writer.WriteHeader(http.StatusBadRequest)
// 						fmt.Fprintf(writer, "error reading file: %s", err)
// 						return
// 					}

// 					os.WriteFile(filePath, buffer.Bytes(), 0666)
// 				}

// 				flashCard := database.FlashCard{
// 					Type:       "spefz-corners",
// 					Owner:      "me",
// 					LetterPair: letterPair,
// 					Memo:       memo,
// 					Image:      filename,
// 					Commutator: commutator,
// 					Tags:       tags,
// 				}

// 				database.WriteFlashCard(flashCard)

// 				flashCardJsonBytes, err := json.Marshal(flashCard)

// 				if err != nil {
// 					fmt.Fprintf(writer, "error when converting flash card to json string: %s", err)
// 				}

// 				writer.WriteHeader(http.StatusOK)
// 				writer.Write(flashCardJsonBytes)

// 				if imageChanged {
// 					go cleanUpImages()
// 				}
// 			}
// 		}
// 	case "GET":
// 		{
// 			if len(letterPair) == 0 {
// 				allFlashCards, err := database.ReadAllFlashCards("me")

// 				if err != nil {
// 					fmt.Fprintf(writer, "%s", err)
// 					writer.WriteHeader(http.StatusInternalServerError)
// 					return
// 				}

// 				jsonBytes, err := json.Marshal(allFlashCards)

// 				if err != nil {
// 					fmt.Fprintf(writer, "%s", err)
// 					writer.WriteHeader(http.StatusInternalServerError)
// 					return
// 				}

// 				writer.Header().Add("Content-Type", "application/json; charset=utf-8")
// 				writer.WriteHeader(http.StatusOK)
// 				writer.Write(jsonBytes)
// 			}
// 		}
// 	default:
// 		{
// 			writer.WriteHeader(http.StatusMethodNotAllowed)
// 			fmt.Fprintf(writer, "henlo")
// 		}
// 	}
// }
