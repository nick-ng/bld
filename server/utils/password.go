package utils

import (
	"bld-server/database"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/crypto/bcrypt"
)

type UserLogin struct {
	Username     string `json:"username"`
	PasswordHash string `json:"passwordHash"`
}

// bcrypt can only handle 72 byte passwords
func ShortenPassword(passwordBytes []byte) []byte {
	h := sha256.New()
	h.Write(passwordBytes)
	newPasswordBytes := h.Sum(nil)

	// @todo(nick-ng): does this actually help?
	index := 0
	for len(newPasswordBytes) < 71 {
		newPasswordBytes = append(newPasswordBytes, passwordBytes[index])
		index++
	}

	return newPasswordBytes
}

func CheckCredentials(username string, password string) bool {
	userListPath := filepath.Join(database.USER_DATA_DIRECTORY, "users.json")
	userListBytes, err := os.ReadFile(userListPath)

	if err != nil {
		fmt.Println("error when reading users.json", err)
		return false
	}

	userList := []UserLogin{}

	err = json.Unmarshal(userListBytes, &userList)

	if err != nil {
		fmt.Println("error when parsing users.json")
		return false
	}

	for _, user := range userList {
		if user.Username != username {
			continue
		}

		err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))

		return err == nil
	}

	return false
}
