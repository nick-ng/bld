package database

import "time"

type FlashCard struct {
	Type         string `json:"type"`
	Owner        string `json:"owner"`
	LetterPair   string `json:"letterPair"`
	Memo         string `json:"memo"`
	Image        string `json:"image"`
	Commutator   string `json:"commutator"`
	Tags         string `json:"tags"`
	LastQuizUnix int64  `json:"lastQuizUnix"`
	Confidence   int    `json:"confidence"`
}

type cacheItem struct {
	FlashCard    FlashCard
	LastAccessed int64
}

var flashCardCache []cacheItem

func WriteFlashCard(flashCard FlashCard) error {
	now := time.Now()

	// 10. check if flash card is already in cache

	// 20. update flash card in cache
	flashCardCache = append(flashCardCache, cacheItem{
		FlashCard:    flashCard,
		LastAccessed: now.Unix(),
	})

	// 30. write updated flash card to drive

	return nil
}

func ReadAllFlashCards(owner string) ([]FlashCard, error) {
	allFlashCards := []FlashCard{}

	for _, cacheItem := range flashCardCache {
		flashCard := cacheItem.FlashCard
		if flashCard.Owner == owner {
			allFlashCards = append(allFlashCards, flashCard)
		}
	}

	return allFlashCards, nil
}

func ReadFlashCard(owner string, letterPair string) (FlashCard, error) {
	allFlashCards, err := ReadAllFlashCards(owner)

	if err != nil {
		return FlashCard{}, err
	}

	for _, flashCard := range allFlashCards {
		if flashCard.LetterPair == letterPair {
			return flashCard, nil
		}
	}

	return FlashCard{
		Type:         "spefz-corners",
		Owner:        owner,
		LetterPair:   letterPair,
		Memo:         "",
		Image:        "",
		Commutator:   "",
		Tags:         "",
		LastQuizUnix: 0,
		Confidence:   0,
	}, nil
}
