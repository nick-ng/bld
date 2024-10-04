package routes

import (
	"bld-server/utils"
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

const USER_IMAGES_DIRECTORY = "user-images"

func slowRoll() {
	for i := 0; i < 10; i++ {
		time.Sleep(5 * time.Second)
		fmt.Println(i)
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
				myRe := regexp.MustCompile(`\/flash-cards\/?`)
				letterPair := myRe.ReplaceAllString(req.RequestURI, "")
				if len(letterPair) == 0 {
					letterPair = req.FormValue("letterPair")
				}
				if len(letterPair) == 0 {
					writer.WriteHeader(400)
					writer.Write([]byte("no letter pair provided"))
					return
				}

				fmt.Println("requested letterPair", letterPair)

				file, fileHeader, err := req.FormFile("image")

				if err != nil {
					writer.WriteHeader(http.StatusBadRequest)
					fmt.Fprintf(writer, "no file provided: %s", err.Error())
					return
				}

				contentType := strings.ToLower(fileHeader.Header.Get("Content-Type"))
				if !strings.HasPrefix(contentType, "image/") {
					writer.WriteHeader(http.StatusBadRequest)
					fmt.Fprint(writer, "invalid file type")
					return
				}

				extension := strings.Replace(contentType, "image/", "", 1)

				filename := fmt.Sprintf("%s.%s", utils.RandomId(), extension)

				filePath, err := GetImageFullPath(filename)

				if err != nil {
					writer.WriteHeader(http.StatusInternalServerError)
					fmt.Fprintf(writer, "error getting images directory: %s", err.Error())
					return
				}

				buffer := bytes.NewBuffer(nil)

				_, err = io.Copy(buffer, file)

				if err != nil {
					return
				}

				// write file name to database before trying to clean up files

				os.WriteFile(filePath, buffer.Bytes(), 0666)

				writer.WriteHeader(http.StatusOK)
				writer.Write([]byte("henlo"))

				go slowRoll()
			}
		}
	case "GET":
		fallthrough
	default:
		{
			fmt.Fprintf(writer, "henlo")
			writer.WriteHeader(http.StatusMethodNotAllowed)
		}
	}
}
