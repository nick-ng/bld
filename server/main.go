package main

import (
	"bld-server/routes"
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
	case "POST":
		{
			fmt.Println("root, post")
			// @todo(nick-ng): figure out how to read images in form data
			// body, err := io.ReadAll(req.Body)

			// if err != nil {
			// 	fmt.Println("error when processing request", err)
			// 	return
			// }

			// fmt.Println(string(body))
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

func corsHandler(writer http.ResponseWriter, req *http.Request) {
	fmt.Println("Hi")
}

func main() {
	http.HandleFunc("OPTIONS ", corsHandler)
	http.HandleFunc("/flash-cards", routes.FlashCardsHandler)
	http.HandleFunc("/flash-cards/", routes.FlashCardsHandler)
	http.HandleFunc("/images/{filename}", routes.ImagesCardsHandler)
	http.HandleFunc("/images/", routes.ImagesCardsHandler)
	http.HandleFunc("/", rootHandler)

	http.ListenAndServe(":27945", nil)
}
