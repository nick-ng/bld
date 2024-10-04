package routes

import (
	"fmt"
	"net/http"
	"os"
	"strings"
)

func ImagesCardsHandler(writer http.ResponseWriter, req *http.Request) {
	writer.Header().Add("Access-Control-Allow-Origin", "*")
	writer.Header().Add("Access-Control-Allow-Methods", "GET, OPTIONS")

	switch req.Method {
	case "OPTIONS":
		{
			writer.WriteHeader(http.StatusOK)
		}
	case "GET":
		fallthrough
	default:
		{
			// @todo(nick-ng): pre-signed urls for retrieving images?
			requestUri := strings.Replace(req.RequestURI, "/images/", "", 1)
			fullPath, err := GetImageFullPath(requestUri)

			if err != nil {
				writer.WriteHeader(http.StatusInternalServerError)
				return
			}

			image, err := os.ReadFile(fullPath)

			if err != nil {
				writer.WriteHeader(http.StatusNotFound)
				fmt.Fprint(writer, err.Error())
				return
			}

			// now := time.Now()
			// expiryDate := now.Add(time.Hour * 24 * 3)
			// writer.Header().Add("Expires", expiryDate.Format("Mon, 2 Jan 2006 15:04:05 MST"))

			// 604800 seconds = 7 days
			writer.Header().Add("Cache-control", "max-age=604800")
			writer.WriteHeader(http.StatusOK)
			writer.Write(image)
		}
	}
}
