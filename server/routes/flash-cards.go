package routes

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const USER_IMAGES_DIRECTORY = "user-images"

func getImageFullPath(filename string) (string, error) {
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

	switch req.Method {
	case "POST":
		{
			// @todo(nick-ng): figure out how to read images in form data
			// body, err := io.ReadAll(req.Body)

			// if err != nil {
			// 	fmt.Println("error when processing request", err)
			// 	return
			// }

			file, fileHeader, err := req.FormFile("image")

			if err != nil {
				fmt.Println("error when getting file", err)
				return
			}

			pants := req.FormValue("pants")

			contentType := strings.ToLower(fileHeader.Header.Get("Content-Type"))
			fmt.Println(fileHeader.Header.Get("Content-Type"))

			if !strings.HasPrefix(contentType, "image/") {
				return
			}

			extension := strings.Replace(contentType, "image/", "", 1)

			fmt.Println(pants)

			filePath, err := getImageFullPath(fmt.Sprintf("%s.%s", pants, extension))

			if err != nil {
				fmt.Println("error getting images directory", err)
				return
			}

			buffer := bytes.NewBuffer(nil)

			_, err = io.Copy(buffer, file)

			if err != nil {
				return
			}

			os.WriteFile(filePath, buffer.Bytes(), 0666)
		}
	case "GET":
		fallthrough
	default:
		{
			fmt.Fprintf(writer, "henlo")
		}
	}

	fmt.Fprintf(writer, req.Method)
}
