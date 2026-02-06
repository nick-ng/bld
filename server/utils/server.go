package utils

import (
	"bld-server/database"
	"fmt"
	"net/http"
	"strings"
)

func AddCorsHeaders(writer http.ResponseWriter) {
	writer.Header().Add("Access-Control-Allow-Origin", "*")
	writer.Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS")
	writer.Header().Add("Access-Control-Allow-Headers", "content-type,x-username,x-password,x-access-token")
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

func AnonymiseFlashCard(flashCard database.FlashCard) database.FlashCard {
	anonymisedFlashCard := database.FlashCard{
		Type:         flashCard.Type,
		Owner:        "demo",
		LetterPair:   flashCard.LetterPair,
		Memo:         strings.ToUpper(fmt.Sprintf("%c___ %c___", flashCard.LetterPair[0], flashCard.LetterPair[1])),
		Image:        "/no-image.png",
		Commutator:   flashCard.Commutator,
		Tags:         flashCard.Tags,
		LastQuizUnix: flashCard.LastQuizUnix,
		Confidence:   flashCard.Confidence,
		IsPublic:     flashCard.IsPublic,
	}

	if flashCard.IsPublic {
		anonymisedFlashCard.Memo = flashCard.Memo
		anonymisedFlashCard.Image = flashCard.Image
	}

	return anonymisedFlashCard
}
