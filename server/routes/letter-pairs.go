package routes

import (
	"bld-server/database"
	"bld-server/utils"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

func AddLetterPairsRoutes() {
	// http.HandleFunc("GET /letter-pair", handleGetAllLetterPairs)
	http.HandleFunc("POST /migrate-letter-pairs", handleMigrateLetterPairs)
	http.HandleFunc("PATCH /mnemonic", handlePatchMnemonic)
	http.HandleFunc("PATCH /algorithm", handlePatchAlgorithm)
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

func handlePatchMnemonic(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		writer.Header().Add("X-Access-Token", accessToken)
	}

	var tempMnemonic map[string]any
	err := json.NewDecoder(req.Body).Decode(&tempMnemonic)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	partialMnemonic, speffzPair := utils.MakePartialMnemonic(tempMnemonic)

	if len(speffzPair) != 2 {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("error: invalid speffz_pair"))
		return
	}

	updatedMnemonics, err := database.UpdateMnemonic(authenticatedUsername, speffzPair, partialMnemonic)
	if err != nil {
		slog.Error("error updating mnemonic",
			"user", authenticatedUsername,
			"speffzPair", speffzPair,
			"err", "err",
		)
	}

	if updatedMnemonics == nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	} else if len(updatedMnemonics) == 0 {
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte("mnemonic not found"))
		return
	}

	jsonBytes, err := utils.MnemonicsToResponseJsonBytes(updatedMnemonics)
	if err != nil {
		slog.Error("error updating mnemonic",
			"user", authenticatedUsername,
			"speffzPair", speffzPair,
			"err", "err",
		)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.Write(jsonBytes)
}

func handlePatchAlgorithm(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		writer.Header().Add("X-Access-Token", accessToken)
	}

	var tempAlgorithm map[string]any
	err := json.NewDecoder(req.Body).Decode(&tempAlgorithm)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	partialAlgorithm, speffzPair, bufferLocation := utils.MakePartialAlgorithm(tempAlgorithm)

	if len(speffzPair) != 2 {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("error: invalid speffz_pair"))
		return
	}

	updatedAlgorithms, err := database.UpdateAlgorithm(authenticatedUsername, speffzPair, bufferLocation, partialAlgorithm)
	if err != nil {
		slog.Error("error updating algorithm",
			"user", authenticatedUsername,
			"speffzPair", speffzPair,
			"buffer", bufferLocation,
			"err", "err",
		)
	}

	if updatedAlgorithms == nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	} else if len(updatedAlgorithms) == 0 {
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte("algorithm not found"))
		return
	}

	jsonBytes, err := utils.AlgorithmsToResponseJsonBytes(updatedAlgorithms)
	if err != nil {
		slog.Error("error updating algorithm",
			"user", authenticatedUsername,
			"speffzPair", speffzPair,
			"buffer", bufferLocation,
			"err", "err",
		)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.Write(jsonBytes)
}

func handleMigrateLetterPairs(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
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
