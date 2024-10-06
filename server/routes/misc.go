package routes

import (
	"bld-server/utils"
	"io"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func AddMiscRoutes() {
	http.HandleFunc("POST /misc/hash-password", hashPasswordRoute)
}

func hashPasswordRoute(writer http.ResponseWriter, req *http.Request) {
	passwordBytes, err := io.ReadAll(req.Body)

	if err != nil || len(passwordBytes) == 0 {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("you need to provide a password"))
		return
	}

	if len(passwordBytes) > 71 {
		passwordBytes = utils.ShortenPassword(passwordBytes)
	}

	hashedPasswordBytes, err := bcrypt.GenerateFromPassword(passwordBytes, 10)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("could not hash password"))
	}

	writer.Write(hashedPasswordBytes)
}
