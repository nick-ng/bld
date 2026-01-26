package repositories

import "bld-server/database"

type Flashcard struct {
	Owner       string                        `json:"owner"`
	SpeffzPair  string                        `json:"speffz_pair"`
	Mnemonic    database.Mnemonic             `json:"mnemonic"`
	Commutators map[string]database.Algorithm `json:"commutators"`
}

func GetAllFlashcardsForUser(user string) ([]Flashcard, error) {
	mnemonics, err := database.GetAllMnemonicsForOwner(user)
	if err != nil {
		return nil, err
	}

	flashcards := []Flashcard{}
	for _, mnemonic := range mnemonics {
		commutators := map[string]database.Algorithm{}
		// @todo(nick-ng): populate commutators map

		flashcard := Flashcard{
			Owner:       mnemonic.Owner,
			SpeffzPair:  mnemonic.SpeffzPair,
			Mnemonic:    mnemonic,
			Commutators: commutators,
		}

		flashcards = append(flashcards, flashcard)
	}

	return flashcards, nil
}
