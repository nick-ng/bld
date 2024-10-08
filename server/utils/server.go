package utils

import "net/http"

func AddCorsHeaders(writer http.ResponseWriter) {
	writer.Header().Add("Access-Control-Allow-Origin", "*")
	writer.Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
	writer.Header().Add("Access-Control-Allow-Headers", "x-username,x-password,x-access-token")
	writer.Header().Add("Access-Control-Expose-Headers", "x-access-token")
}

func FirstHeaders(headers http.Header) map[string]string {
	headerMap := map[string]string{}
	for name, headers := range headers {
		if len(headers) > 0 {
			headerMap[name] = headers[len(headers)-1]
		}
	}

	return headerMap
}
