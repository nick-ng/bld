package main

import (
	"bld-server/routes"
	"bld-server/utils"
	"fmt"
	"net/http"
)

func rootHandler(writer http.ResponseWriter, req *http.Request) {
	headerMap := map[string]string{}

	for name, headers := range req.Header {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	fmt.Println(headerMap["X-Pants"])

	switch req.Method {
	case "GET":
		{
			writer.Write([]byte("nothing here"))
		}
	default:
		{
			writer.WriteHeader(http.StatusMethodNotAllowed)
			writer.Write([]byte("nothing here"))
		}
	}
}

func optionsHandler(writer http.ResponseWriter, _ *http.Request) {
	utils.AddCorsHeaders(writer)
	writer.WriteHeader(http.StatusOK)
}

func main() {
	// @todo(nick-ng): change handlers to use "METHOD /route/{param}"
	// see: https://go.dev/blog/routing-enhancements
	routes.AddMiscRoutes()
	routes.AddFlashCardsRoutes()
	http.HandleFunc("GET /images/{filename}", routes.ImagesCardsHandler)
	http.HandleFunc("GET /images/", routes.ImagesCardsHandler)
	http.HandleFunc("OPTIONS /", optionsHandler)
	http.HandleFunc("/", rootHandler)

	http.ListenAndServe(":27945", nil)
}
