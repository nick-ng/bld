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
	"regexp"
	"strings"
)

const USER_IMAGES_DIRECTORY = "user-images"

func cleanUpImages() {
	// go through database and delete any unreferenced photos
}

func GetImageFullPath(filename string) (string, error) {
	err := os.Mkdir(USER_IMAGES_DIRECTORY, 0755)

	if err != nil && !errors.Is(err, fs.ErrExist) {
		fmt.Println(err)
		return "", err
	}

	return filepath.Join(USER_IMAGES_DIRECTORY, filename), nil
}

func FlashCardsHandler(writer http.ResponseWriter, req *http.Request) {
	headerMap := map[string]string{}

	for name, headers := range req.Header {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	// @todo(nick-ng): authenticate request

	writer.Header().Add("Access-Control-Allow-Origin", "*")
	writer.Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")

	myRe := regexp.MustCompile(`^\/flash-cards\/?`)
	letterPair := myRe.ReplaceAllString(req.RequestURI, "")

	switch req.Method {
	case "OPTIONS":
		{
			writer.WriteHeader(http.StatusOK)
		}
	case "POST":
		fallthrough
	case "PUT":
		{
			{
				if len(letterPair) == 0 {
					letterPair = req.FormValue("letterPair")
				}
				if len(letterPair) == 0 {
					writer.WriteHeader(400)
					writer.Write([]byte("no letter pair provided"))
					return
				}
				fmt.Println("requested letterPair", letterPair)

				memo := req.FormValue("memo")
				commutator := req.FormValue("commutator")
				tags := req.FormValue("tags")

				fmt.Println("memo", memo)
				fmt.Println("commutator", commutator)
				fmt.Println("tags", tags)

				filename := ""

				file, fileHeader, err := req.FormFile("image")
				fmt.Println(file)
				if err == nil {
					contentType := strings.ToLower(fileHeader.Header.Get("Content-Type"))
					if !strings.HasPrefix(contentType, "image/") {
						writer.WriteHeader(http.StatusBadRequest)
						fmt.Fprint(writer, "invalid file type")
						return
					}

					extension := strings.Replace(contentType, "image/", "", 1)
					filename = fmt.Sprintf("%s.%s", utils.RandomId(), extension)
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

				// write file name to database before trying to clean up files
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

				go cleanUpImages()
			}
		}
	case "GET":
		{
			if len(letterPair) == 0 {
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
		}
	default:
		{
			writer.WriteHeader(http.StatusMethodNotAllowed)
			fmt.Fprintf(writer, "henlo")
		}
	}
}
