package routes

import (
	"bld-server/utils"
	"bytes"
	"fmt"
	"image"
	"image/color"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"mime"
	"net/http"
	"os"

	"golang.org/x/image/draw"
)

func AddImageRoutes() {
	http.HandleFunc("GET /images/{filename}", handleGetImage)
	http.HandleFunc("POST /images/{speffz_pair}", handlePostImage)
}

func handleGetImage(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	// @todo(nick-ng): pre-signed urls for retrieving images?
	// @todo(nick-ng): use cookies?
	filename := req.PathValue("filename")
	fullPath, err := GetImageFullPath(filename)

	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	imageBytes, err := os.ReadFile(fullPath)
	if err != nil {
		writer.WriteHeader(http.StatusNotFound)
		fmt.Fprint(writer, err.Error())
		return
	}

	writer.Header().Add("Cache-control", "max-age=604800") // 604800 = 7 days
	writer.WriteHeader(http.StatusOK)
	writer.Write(imageBytes)
}

// @todo(nick-ng): clean up unused images
func handlePostImage(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	writer.Header().Add("X-Access-Token", accessToken)

	speffzPair := req.PathValue("speffz_pair")
	if len(speffzPair) != 2 {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("no speffz pair provided"))
		return
	}

	err := req.ParseMultipartForm(32 << 20)
	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		writer.Write([]byte(err.Error()))
		return
	}
	file, fileHeader, err := req.FormFile("image")
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(writer, "invalid file type")
		return
	}

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

	filename := fmt.Sprintf("%s_%s_%s.jpg", authenticatedUsername, speffzPair, utils.RandomId0(2))
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

		err = os.WriteFile(filePath, jpegBuffer.Bytes(), 0666)
		if err != nil {
			writer.WriteHeader(http.StatusInternalServerError)
		}
	}

	fmt.Fprint(writer, filename)
}
