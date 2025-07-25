package utils

import (
	"bld-server/database"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const ACCESS_TOKEN_TTL_SECONDS = 5 * 60 * 60 // 5 hours
var defaultUser = ""

type UserLogin struct {
	Username     string `json:"username"`
	PasswordHash string `json:"passwordHash"`
}

type AccessTokenRecord struct {
	AccessToken string
	ExpiryUnix  int64
	Username    string
}

var ActiveAccessTokens = map[string]AccessTokenRecord{}

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

func pruneExpiredAccessTokens() {
	nowUnix := time.Now().Unix()
	var keysToDelete []string
	for key, accessTokenRecord := range ActiveAccessTokens {
		if accessTokenRecord.ExpiryUnix < nowUnix {
			keysToDelete = append(keysToDelete, key)
		}
	}

	for _, key := range keysToDelete {
		delete(ActiveAccessTokens, key)
	}
}

func getUserList() ([]UserLogin, error) {
	userListPath := filepath.Join(database.USER_DATA_DIRECTORY, "users.json")
	userListBytes, err := os.ReadFile(userListPath)

	if err != nil {
		fmt.Println("error when reading users.json", err)
		return nil, err
	}

	userList := []UserLogin{}

	err = json.Unmarshal(userListBytes, &userList)

	if err != nil {
		fmt.Println("error when parsing users.json")
		return nil, err
	}

	defaultUser = userList[0].Username

	return userList, nil
}

func GetDefaultUser() string {
	if len(defaultUser) == 0 {
		getUserList()
	}

	return defaultUser
}

// Returns if the authentication is successful, the authenticated username,
// and the access token they should use
func CheckCredentials(headers http.Header) (bool, string, string) {
	nowUnix := time.Now().Unix()

	accessTokenHeaders, ok := headers["X-Access-Token"]
	if ok && len(accessTokenHeaders) > 0 {
		requestAccessToken := accessTokenHeaders[len(accessTokenHeaders)-1]
		cachedToken, ok := ActiveAccessTokens[requestAccessToken]
		if ok && cachedToken.ExpiryUnix > nowUnix {
			return true, cachedToken.Username, cachedToken.AccessToken
		}

		pruneExpiredAccessTokens()
	}

	usernameHeaders, ok := headers["X-Username"]
	if !ok || len(usernameHeaders) == 0 {
		return false, "", ""
	}
	username := usernameHeaders[len(usernameHeaders)-1]

	passwordHeaders, ok := headers["X-Password"]
	if !ok || len(passwordHeaders) == 0 {
		return false, "", ""
	}
	password := passwordHeaders[len(passwordHeaders)-1]

	userList, err := getUserList()
	if err != nil {
		return false, "", ""
	}

	for _, user := range userList {
		if user.Username != username {
			continue
		}

		err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
		if err != nil {
			fmt.Println("error when parsing getting users")
			return false, "", ""
		}

		expiryUnix := nowUnix + ACCESS_TOKEN_TTL_SECONDS
		randomString := RandomId()
		newAccessToken := fmt.Sprintf("%d:%s", expiryUnix, randomString)

		ActiveAccessTokens[newAccessToken] = AccessTokenRecord{
			AccessToken: newAccessToken,
			ExpiryUnix:  expiryUnix,
			Username:    user.Username,
		}

		return true, user.Username, newAccessToken
	}

	return false, "", ""
}
