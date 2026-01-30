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
	LastReviewAt time.Time `json:"last_review_at"`
	NextReviewAt time.Time `json:"next_review_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ResponseAlgorithm struct {
	Owner        string    `json:"owner"`
	SpeffzPair   string    `json:"speffz_pair"`
	Buffer       string    `json:"buffer"`
	Algorithm    string    `json:"algorithm"`
	Sm2N         int       `json:"sm2_n"`
	Sm2Ef        float32   `json:"sm2_ef"`
	Sm2I         float32   `json:"sm2_i"`
	DrillTimeMs  int       `json:"drillTimeMs"`
	LastReviewAt time.Time `json:"last_review_at"`
	NextReviewAt time.Time `json:"next_review_at"`
	LastDrillAt  time.Time `json:"last_drill_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

var validMnemonicKeys = []string{
	"owner",
	"speffz_pair",
	"words",
	"image",
	"sm2_n",
	"sm2_ef",
	"sm2_i",
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

func MnemonicsToResponseJsonBytes(mnemonics []database.Mnemonic) ([]byte, error) {
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
			LastReviewAt: mnemonic.LastReviewAt,
			NextReviewAt: mnemonic.NextReviewAt,
			CreatedAt:    mnemonic.CreatedAt,
			UpdatedAt:    mnemonic.UpdatedAt,
		}

		responseMnemonics = append(responseMnemonics, responseMnemonic)
	}

	return json.Marshal(responseMnemonics)
}
