package routes

import (
	"bld-server/database"
	"bld-server/utils"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

func AddLetterPairsRoutes() {
	http.HandleFunc("GET /letter-pairs", handleGetAllLetterPairs)
	http.HandleFunc("POST /migrate-letter-pairs", handleMigrateLetterPairs)
	http.HandleFunc("GET /mnemonic", handleGetMnemonics)
	http.HandleFunc("POST /mnemonic", handleUpdateMnemonic)
	http.HandleFunc("PATCH /mnemonic", handleUpdateMnemonic)
	http.HandleFunc("GET /algorithm", handleGetAlgorithms)
	http.HandleFunc("POST /algorithm", handleUpdateAlgorithm)
	http.HandleFunc("PATCH /algorithm", handleUpdateAlgorithm)
}

func handleGetAllLetterPairs(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		authenticatedUsername = utils.GetDefaultUser()
	} else {
		writer.Header().Add("X-Access-Token", accessToken)
	}

	mnemonics, mnemonicsErr := database.GetAllMnemonics(authenticatedUsername)
	algorithms, algorithmsErr := database.GetAllAlgorithms(authenticatedUsername)
	if mnemonicsErr != nil || algorithmsErr != nil {
		slog.Error("error getting all mnemonics/algorithms",
			"user", authenticatedUsername,
			"haveAccess", haveAccess,
			"mnemonicsErr", mnemonicsErr,
			"algorithmsErr", algorithmsErr,
		)

		writer.WriteHeader(http.StatusInternalServerError)
		writer.Write([]byte("error: couldn't get data"))
		return
	}

	if !haveAccess {
		emptyString := ""
		for i := range mnemonics {
			if !mnemonics[i].IsPublic {
				mnemonics[i].Words = &emptyString
				mnemonics[i].Image = &emptyString
			}
		}
	}

	jsonBytes, err := utils.MnemonicsAndAlgorithmsResponseJsonBytes(mnemonics, algorithms)
	if err != nil {
		slog.Error("error converting mnemonics and algorithms",
			"user", authenticatedUsername,
			"haveAccess", haveAccess,
			"err", err,
		)
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.Write(jsonBytes)
}

func handleGetMnemonics(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		writer.Header().Add("X-Access-Token", accessToken)
	}

	offset := 0
	searchParams := req.URL.Query()
	offsetStrings, ok := searchParams["offset"]
	if ok {
		offsetString := offsetStrings[0]
		offsetA, err := strconv.ParseInt(offsetString, 10, 0)
		if err == nil {
			offset = int(offsetA)
		}
	}

	mnemonics, err := database.GetSomeMnemonics(authenticatedUsername, 50, offset)
	if err != nil {
		slog.Error("error getting mnemonics",
			"user", authenticatedUsername,
			"haveAccess", haveAccess,
			"err", err,
		)

		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonBytes, err := utils.MnemonicsToResponseJsonBytes(mnemonics)
	if err != nil {
		slog.Error("error converting mnemonics to json",
			"user", authenticatedUsername,
			"haveAccess", haveAccess,
			"err", err,
		)
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.Write(jsonBytes)
}

func handleUpdateMnemonic(writer http.ResponseWriter, req *http.Request) {
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

	isPost := req.Method == http.MethodPost
	updatedMnemonics, err := database.UpdateMnemonic(authenticatedUsername, speffzPair, partialMnemonic, isPost)
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

func handleGetAlgorithms(writer http.ResponseWriter, req *http.Request) {
	utils.AddCorsHeaders(writer)

	haveAccess, authenticatedUsername, accessToken := utils.CheckCredentials(req.Header)
	if !haveAccess {
		authenticatedUsername = utils.GetDefaultUser()
	} else {
		writer.Header().Add("X-Access-Token", accessToken)
	}

	offset := 0
	searchParams := req.URL.Query()
	offsetStrings, ok := searchParams["offset"]
	if ok {
		offsetString := offsetStrings[0]
		offsetA, err := strconv.ParseInt(offsetString, 10, 0)
		if err == nil {
			offset = int(offsetA)
		}
	}

	algorithms, err := database.GetSomeAlgorithms(authenticatedUsername, 50, offset)
	if err != nil {
		slog.Error("error getting algorithms",
			"user", authenticatedUsername,
			"haveAccess", haveAccess,
			"err", err,
		)

		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonBytes, err := utils.AlgorithmsToResponseJsonBytes(algorithms)
	if err != nil {
		slog.Error("error converting algorithms to json",
			"user", authenticatedUsername,
			"haveAccess", haveAccess,
			"err", err,
		)
	}

	writer.Header().Add("Content-Type", "application/json; charset=utf-8")
	writer.Header().Add("Cache-Control", "no-store")
	writer.Write(jsonBytes)
}

func handleUpdateAlgorithm(writer http.ResponseWriter, req *http.Request) {
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

	isPost := req.Method == http.MethodPost
	updatedAlgorithms, err := database.UpdateAlgorithm(authenticatedUsername, speffzPair, bufferLocation, partialAlgorithm, isPost)
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
		partialMnemonic := map[string]any{
			"owner":       authenticatedUsername,
			"speffz_pair": flashCard.LetterPair,
			"words":       &flashCard.Memo,
			"image":       &flashCard.Image,
			"is_public":   flashCard.IsPublic,
		}

		_, err := database.UpdateMnemonic(
			authenticatedUsername,
			flashCard.LetterPair,
			partialMnemonic,
			true,
		)
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
			partialAlgorithm := map[string]any{
				"owner":       authenticatedUsername,
				"speffz_pair": flashCard.LetterPair,
				"buffer":      "UFR",
				"moves":       flashCard.Commutator,
			}
			_, err := database.UpdateAlgorithm(
				authenticatedUsername,
				flashCard.LetterPair,
				"UFR",
				partialAlgorithm,
				true,
			)
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
