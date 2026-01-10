package main

import (
	"bld-server/database"
	"bld-server/routes"
	"bld-server/utils"
	"context"
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
	ctx := context.Background()
	// get the db to run the migration
	database.GetDb(&ctx)

	routes.AddMiscRoutes()
	routes.AddFlashCardsRoutes()
	routes.AddImageRoutes()
	http.HandleFunc("OPTIONS /", optionsHandler)
	http.HandleFunc("/", rootHandler)

	fmt.Println("server is running")
	err := http.ListenAndServe(":27945", nil)
	if err != nil {
		fmt.Println(err)
	}
}
