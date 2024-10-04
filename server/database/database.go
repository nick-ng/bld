package database

import "time"

type FlashCard struct {
	Type         string
	Owner        string
	LetterPair   string
	Memo         string
	Image        string
	Commutator   string
	Tags         string
	LastQuizUnix int64
	Confidence   int
}

type cacheItem struct {
	FlashCard    FlashCard
	LastAccessed int64
}

var flashCardCache []cacheItem

func WriteFlashCard(flashCard FlashCard) error {
	now := time.Now()

	flashCardCache = append(flashCardCache, cacheItem{
		FlashCard:    flashCard,
		LastAccessed: now.Unix(),
	})

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
