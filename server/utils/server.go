package utils

import "net/http"

func AddCorsHeaders(writer http.ResponseWriter) {
	writer.Header().Add("Access-Control-Allow-Origin", "*")
	writer.Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
	writer.Header().Add("Access-Control-Allow-Headers", "x-username,x-password")
}
