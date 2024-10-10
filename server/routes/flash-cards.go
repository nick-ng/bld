package routes

import (
	"bld-server/database"
	"bld-server/utils"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/color"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"io/fs"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"time"

	"golang.org/x/image/draw"
)

const USER_IMAGES_DIRECTORY = "user-images"

func cleanUpImages() {
	dirEntries, err := os.ReadDir(USER_IMAGES_DIRECTORY)

	if err != nil {
		fmt.Println(err)
		return
	}

	var imagesInDb []string
	for _, flashCard := range database.FlashCardData {
		if len(flashCard.Image) > 0 {
			imagesInDb = append(imagesInDb, flashCard.Image)
		}
	}

	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()

		if !slices.Contains(imagesInDb, filename) {
			fullPath := filepath.Join(USER_IMAGES_DIRECTORY, filename)
			err := os.Remove(fullPath)
			if err != nil {
				fmt.Println("error when deleting unnecessary image:", err)
			}
		}
	}
}

func GetImageFullPath(filename string) (string, error) {
	err := os.Mkdir(USER_IMAGES_DIRECTORY, 0755)

	if err != nil && !errors.Is(err, fs.ErrExist) {
		fmt.Println(err)
		return "", err
	}

	return filepath.Join(USER_IMAGES_DIRECTORY, filename), nil
}

func AddFlashCardsRoutes() {
	http.HandleFunc("GET /flash-cards", handleGetFlashCards)
	http.HandleFunc("GET /flash-cards/{letterPair}", handleGetFlashCard)
	http.HandleFunc("PUT /flash-cards/{letterPair}", handlePutFlashCard)
	http.HandleFunc("PUT /quiz/{letterPair}", handlePutQuizAnswer)
}

func handleGetFlashCard(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	writer.Header().Add("X-Access-Token", accessToken)

	letterPair := req.PathValue("letterPair")
	flashCardType := req.URL.Query().Get("type")

	if len(flashCardType) == 0 {
		flashCardType = "corner"
	}

	flashCard, err := database.ReadFlashCard(authenticatedUsername, flashCardType, letterPair)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonBytes, err := json.Marshal(flashCard)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.WriteHeader(http.StatusOK)
	writer.Write(jsonBytes)
}

func handleGetFlashCards(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	writer.Header().Add("X-Access-Token", accessToken)

	allFlashCards, err := database.ReadAllFlashCards(authenticatedUsername)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonBytes, err := json.Marshal(allFlashCards)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.WriteHeader(http.StatusOK)
	writer.Write(jsonBytes)
}

func handlePutFlashCard(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	writer.Header().Add("X-Access-Token", accessToken)

	letterPair := req.PathValue("letterPair")
	if len(letterPair) == 0 {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("no letter pair provided"))
		return
	}

	memo := req.FormValue("memo")
	commutator := req.FormValue("commutator")
	tags := req.FormValue("tags")
	imageUrl := req.FormValue("imageUrl")
	lastQuizUnixString := req.FormValue("lastQuizUnix")
	confidenceString := req.FormValue("confidence")

	lastQuizUnix, err := strconv.ParseInt(lastQuizUnixString, 10, 64)
	if err != nil {
		lastQuizUnix = 0
	}

	confidence, err := strconv.ParseInt(confidenceString, 10, 0)
	if err != nil {
		confidence = 0
	}

	imageChanged := false
	filename := imageUrl
	err = req.ParseMultipartForm(32 << 20)
	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		writer.Write([]byte(err.Error()))
		return
	}
	file, fileHeader, err := req.FormFile("image")
	if err == nil {
		mediaType, _, err := mime.ParseMediaType(fileHeader.Header.Get("Content-Type"))
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(writer, "error reading media type: %s", err)
			return
		}

		if mediaType != "image/jpeg" && mediaType != "image/png" && mediaType != "media/gif" {
			writer.WriteHeader(http.StatusBadRequest)
			fmt.Fprint(writer, "invalid file type")
			return
		}

		filename = fmt.Sprintf("%s.jpg", utils.RandomId())
		imageChanged = true
		filePath, err := GetImageFullPath(filename)
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(writer, "error getting images directory: %s", err)
			return
		}

		originalImage, _, err := image.Decode(file)
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(writer, "error decoding image: %s", err)
			return
		}

		// this is replacing any transparency in a png with grey not just resize
		originalBounds := originalImage.Bounds()
		if originalBounds.Dx() > 0 && originalBounds.Dy() > 0 {
			originalDx := float64(originalBounds.Dx())
			originalDy := float64(originalBounds.Dy())
			xScale := float64(256) / originalDx
			yScale := float64(256) / originalDy
			scale := min(1, max(xScale, yScale))

			newMaxX := originalBounds.Min.X + int(originalDx*scale)
			newMaxY := originalBounds.Min.Y + int(originalDy*scale)
			resizedImage := image.NewRGBA(image.Rect(originalBounds.Min.X, originalBounds.Min.Y, newMaxX, newMaxY))

			grey := color.RGBA{255, 255, 255, 255}

			draw.Draw(resizedImage, resizedImage.Bounds(), &image.Uniform{grey}, image.Point{resizedImage.Bounds().Min.X, resizedImage.Bounds().Min.Y}, draw.Src)

			draw.BiLinear.Scale(resizedImage, resizedImage.Rect, originalImage, originalBounds, draw.Over, nil)

			jpegBuffer := bytes.NewBuffer(nil)
			err = jpeg.Encode(jpegBuffer, resizedImage, &jpeg.Options{
				Quality: 95,
			})
			if err != nil {
				writer.WriteHeader(http.StatusInternalServerError)
				fmt.Fprintf(writer, "error encoding jpeg: %s", err)
				return
			}

			os.WriteFile(filePath, jpegBuffer.Bytes(), 0666)
		}
	}

	flashCard := database.FlashCard{
		Type:         "corner",
		Owner:        authenticatedUsername,
		LetterPair:   letterPair,
		Memo:         memo,
		Image:        filename,
		Commutator:   commutator,
		Tags:         tags,
		LastQuizUnix: lastQuizUnix,
		Confidence:   int(confidence),
	}

	database.WriteFlashCard(flashCard)

	flashCardJsonBytes, err := json.Marshal(flashCard)
	if err != nil {
		fmt.Fprintf(writer, "error when converting flash card to json string: %s", err)
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.WriteHeader(http.StatusOK)
	writer.Write(flashCardJsonBytes)

	if imageChanged {
		go cleanUpImages()
	}

}

func handlePutQuizAnswer(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	writer.Header().Add("X-Access-Token", accessToken)

	letterPair := req.PathValue("letterPair")
	if len(letterPair) == 0 {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("no letter pair provided"))
		return
	}

	confidenceString := req.FormValue("confidence")
	confidence, err := strconv.ParseInt(confidenceString, 10, 0)
	if err != nil {
		confidence = 0
	}

	lastQuizUnix := time.Now().Unix()

	flashCard, err := database.ReadFlashCard(authenticatedUsername, "corner", letterPair)

	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte(err.Error()))
		return
	}

	flashCard.LastQuizUnix = lastQuizUnix
	flashCard.Confidence = int(confidence)

	database.WriteFlashCard(flashCard)

	flashCardJsonBytes, err := json.Marshal(flashCard)
	if err != nil {
		fmt.Fprintf(writer, "error when converting flash card to json string: %s", err)
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.WriteHeader(http.StatusOK)
	writer.Write(flashCardJsonBytes)
}
