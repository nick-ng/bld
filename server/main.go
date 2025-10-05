package main

import (
	"bld-server/database"
	"bld-server/routes"
	"bld-server/utils"
	"fmt"
	"net/http"
)

func rootHandler(writer http.ResponseWriter, req *http.Request) {
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
	// get the db singleton and close it when main returns
	db := database.GetDb()
	defer db.Close()

	routes.AddMiscRoutes()
	routes.AddFlashCardsRoutes()
	routes.AddImageRoutes()
	http.HandleFunc("OPTIONS /", optionsHandler)
	http.HandleFunc("/", rootHandler)

	fmt.Println("server is running")
	http.ListenAndServe(":27945", nil)
}
