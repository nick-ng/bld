package routes

import (
	"bld-server/database"
	"bld-server/utils"
	"fmt"
	"net/http"
	"time"
)

func AddLetterPairsRoutes() {
	// http.HandleFunc("GET /letter-pair", handleGetAllLetterPairs)
	http.HandleFunc("POST /migrate-letter-pairs", handleMigrateLetterPairs)
}

// func handleGetAllLetterPairs(writer http.ResponseWriter, req *http.Request) {
// 	utils.AddCorsHeaders(writer)
//
// 	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
// 	if !haveAccess {
// @todo(nick-ng): only show default user's letter pairs if no user provided
// 		authenticatedUsername = utils.GetDefaultUser()
// 	} else {
// 		writer.Header().Add("X-Access-Token", accessToken)
// 	}
// }

func handleMigrateLetterPairs(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		authenticatedUsername = utils.GetDefaultUser()
	} else {
		writer.Header().Add("X-Access-Token", accessToken)
	}

	migrationStart := time.Now()

	allFlashCards, err := database.ReadAllFlashCards(authenticatedUsername)
	if err != nil {
		fmt.Fprintf(writer, "%s", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	for _, flashCard := range allFlashCards {
		newMnemonic := database.Mnemonic{
			Owner:        authenticatedUsername,
			SpeffzPair:   flashCard.LetterPair,
			Words:        &flashCard.Memo,
			Image:        &flashCard.Image,
			Sm2N:         0,
			Sm2Ef:        2.5,
			Sm2I:         0,
			LastReviewAt: time.Unix(flashCard.LastQuizUnix, 0),
			NextReviewAt: time.Now(),
		}
		err := database.PutMnemonic(newMnemonic)
		if err != nil {
			fmt.Println("error putting mnemonic")
			writer.Write(fmt.Appendf(
				[]byte{},
				"error migrating flash card to mnemonic for %s %s",
				flashCard.LetterPair,
				err,
			))
			return
		}

		if len(flashCard.Commutator) > 2 {
			newAlgorithm := database.Algorithm{
				Owner:        authenticatedUsername,
				SpeffzPair:   flashCard.LetterPair,
				Buffer:       "UFR",
				Algorithm:    flashCard.Commutator,
				Sm2N:         0,
				Sm2Ef:        2.5,
				Sm2I:         0,
				LastReviewAt: time.Unix(flashCard.LastQuizUnix, 0),
				LastDrillAt:  time.Unix(flashCard.LastDrillUnix, 0),
				NextReviewAt: time.Now(),
			}
			err := database.PutAlgorithm(newAlgorithm)
			if err != nil {
				fmt.Println("error putting algorithm")
				writer.Write(fmt.Appendf(
					[]byte{},
					"error migrating flash card to algorithm for %s %s",
					flashCard.LetterPair,
					err,
				))
				return
			}
		}
	}

	writer.Write(fmt.Appendf(
		[]byte{},
		"migration ran from %s to %s",
		migrationStart,
		time.Now(),
	))
}
