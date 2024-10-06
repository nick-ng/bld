package routes

import (
	"bld-server/utils"
	"fmt"
	"net/http"
	"os"
)

func AddImageRoutes() {
	http.HandleFunc("GET /images/{filename}", handleGetImage)
}

func handleGetImage(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	// @todo(nick-ng): pre-signed urls for retrieving images?
	filename := req.PathValue("filename")
	fullPath, err := GetImageFullPath(filename)

	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	imageBytes, err := os.ReadFile(fullPath)
	if err != nil {
		writer.WriteHeader(http.StatusNotFound)
		fmt.Fprint(writer, err.Error())
		return
	}

	writer.Header().Add("Cache-control", "max-age=604800") // 604800 = 7 days
	writer.WriteHeader(http.StatusOK)
	writer.Write(imageBytes)
}
