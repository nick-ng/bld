package utils

import (
	"bld-server/database"
	"encoding/json"
	"time"
)

type ResponseMnemonic struct {
	Owner        string    `json:"owner"`
	SpeffzPair   string    `json:"speffz_pair"`
	Words        *string   `json:"words"`
	Image        *string   `json:"image"`
	Sm2N         int       `json:"sm2_n"`
	Sm2Ef        float32   `json:"sm2_ef"`
	Sm2I         float32   `json:"sm2_i"`
	IsPublic     bool      `json:"is_public"`
	LastReviewAt time.Time `json:"last_review_at"`
	NextReviewAt time.Time `json:"next_review_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ResponseAlgorithm struct {
	Owner        string    `json:"owner"`
	SpeffzPair   string    `json:"speffz_pair"`
	Buffer       string    `json:"buffer"`
	Moves        string    `json:"moves"`
	Sm2N         int       `json:"sm2_n"`
	Sm2Ef        float32   `json:"sm2_ef"`
	Sm2I         float32   `json:"sm2_i"`
	DrillTimeMs  int       `json:"drill_time_ms"`
	LastDrillAt  time.Time `json:"last_drill_at"`
	LastReviewAt time.Time `json:"last_review_at"`
	NextReviewAt time.Time `json:"next_review_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CombinedMnemonicsAlgorithms struct {
	Mnemonics  []ResponseMnemonic  `json:"mnemonics"`
	Algorithms []ResponseAlgorithm `json:"algorithms"`
}

var validMnemonicKeys = []string{
	"owner",
	"speffz_pair",
	"words",
	"image",
	"sm2_n",
	"sm2_ef",
	"sm2_i",
	"is_public",
	"last_review_at",
	"next_review_at",
}

var validAlgorithmKeys = []string{
	"owner",
	"speffz_pair",
	"buffer",
	"algorithm",
	"sm2_n",
	"sm2_ef",
	"sm2_i",
	"drill_time_ms",
	"last_drill_at",
	"last_review_at",
	"next_review_at",
}

func MakePartialMnemonic(partialMnemonic map[string]any) (map[string]any, string) {
	validMnemonic := map[string]any{}
	speffzPair := ""
	for _, k := range validMnemonicKeys {
		v, ok := partialMnemonic[k]
		if ok {
			validMnemonic[k] = v
			if k == "speffz_pair" {
				switch vv := v.(type) {
				case string:
					{
						speffzPair = vv
					}
				}
			}
		}
	}

	return validMnemonic, speffzPair
}

func convertMnemonics(mnemonics []database.Mnemonic) []ResponseMnemonic {
	responseMnemonics := []ResponseMnemonic{}
	for _, mnemonic := range mnemonics {
		responseMnemonic := ResponseMnemonic{
			Owner:        mnemonic.Owner,
			SpeffzPair:   mnemonic.SpeffzPair,
			Words:        mnemonic.Words,
			Image:        mnemonic.Image,
			Sm2N:         mnemonic.Sm2N,
			Sm2Ef:        mnemonic.Sm2Ef,
			Sm2I:         mnemonic.Sm2I,
			IsPublic:     mnemonic.IsPublic,
			LastReviewAt: mnemonic.LastReviewAt,
			NextReviewAt: mnemonic.NextReviewAt,
			CreatedAt:    mnemonic.CreatedAt,
			UpdatedAt:    mnemonic.UpdatedAt,
		}

		responseMnemonics = append(responseMnemonics, responseMnemonic)
	}

	return responseMnemonics
}

func MnemonicsToResponseJsonBytes(mnemonics []database.Mnemonic) ([]byte, error) {
	responseMnemonics := convertMnemonics(mnemonics)

	jsonB, err := json.Marshal(responseMnemonics)

	return jsonB, err
}

func MakePartialAlgorithm(partialAlgorithm map[string]any) (map[string]any, string, string) {
	validAlgorithm := map[string]any{}
	speffzPair := ""
	bufferLocation := ""
	for _, k := range validAlgorithmKeys {
		v, ok := partialAlgorithm[k]
		if ok {
			validAlgorithm[k] = v
			switch k {
			case "speffz_pair":
				{
					switch vv := v.(type) {
					case string:
						{
							speffzPair = vv
						}
					}
				}
			case "buffer":
				{
					switch vv := v.(type) {
					case string:
						{
							bufferLocation = vv
						}
					}

				}
			}
		}
	}

	return validAlgorithm, speffzPair, bufferLocation
}

func convertAlgorithms(algorithms []database.Algorithm) []ResponseAlgorithm {
	responseAlgorithms := []ResponseAlgorithm{}
	for _, algorithm := range algorithms {
		responseAlgorithm := ResponseAlgorithm{
			Owner:        algorithm.Owner,
			SpeffzPair:   algorithm.SpeffzPair,
			Buffer:       algorithm.Buffer,
			Moves:        algorithm.Moves,
			Sm2N:         algorithm.Sm2N,
			Sm2Ef:        algorithm.Sm2Ef,
			Sm2I:         algorithm.Sm2I,
			DrillTimeMs:  algorithm.DrillTimeMs,
			LastDrillAt:  algorithm.LastDrillAt,
			LastReviewAt: algorithm.LastReviewAt,
			NextReviewAt: algorithm.NextReviewAt,
			CreatedAt:    algorithm.CreatedAt,
			UpdatedAt:    algorithm.UpdatedAt,
		}

		responseAlgorithms = append(responseAlgorithms, responseAlgorithm)
	}

	return responseAlgorithms
}

func AlgorithmsToResponseJsonBytes(algorithms []database.Algorithm) ([]byte, error) {
	responseAlgorithms := convertAlgorithms(algorithms)

	jsonB, err := json.Marshal(responseAlgorithms)

	return jsonB, err
}

func MnemonicsAndAlgorithmsResponseJsonBytes(mnemonics []database.Mnemonic, algorithms []database.Algorithm) ([]byte, error) {
	responseMnemonics := convertMnemonics(mnemonics)
	responseAlgorithms := convertAlgorithms(algorithms)

	combinedResponse := CombinedMnemonicsAlgorithms{
		Mnemonics:  responseMnemonics,
		Algorithms: responseAlgorithms,
	}
	jsonB, err := json.Marshal(combinedResponse)

	return jsonB, err
}
