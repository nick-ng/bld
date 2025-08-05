import type { FlashCard } from "$lib/types";
import { flashCardStore } from "$lib/stores/flash-cards";
import { quizStore, touchCurrentQuiz } from "$lib/stores/quiz";
import { authFetch, joinServerPath, shuffleArray } from "$lib/utils";
import { parseFlashCard } from "$lib/types";

export const putQuiz = async (letterPair: string, formData: FormData) => {
	touchCurrentQuiz();
	// go to next question on next frame
	setTimeout(() => {
		quizStore.update((prevQuiz) => prevQuiz.filter((lp) => lp != letterPair));
	});
	const response = await authFetch(joinServerPath("quiz", letterPair), {
		method: "PUT",
		body: formData
	});
	if (!response) {
		return;
	}

	const responseJson = await response.json();
	const parseResponse = parseFlashCard(responseJson);
	if (parseResponse.isValid) {
		const { data } = parseResponse;
		flashCardStore.update((prevFlashCards) => {
			return {
				...prevFlashCards,
				[data.letterPair]: { ...data, fetchedAtMs: Date.now() }
			};
		});
	} else {
		console.error("wrong", responseJson);
	}
};

export const leitnerDecks: Record<string, string[]> = {};
for (let i = 0; i < 10; i++) {
	leitnerDecks[i.toString()] = [i % 10, (i + 2) % 10, (i + 5) % 10, (i + 9) % 10].map((a) =>
		a.toString(10)
	);
}
export const leitnerSessionToDeckList = (session: number) => {
	let tempSession = session;
	if (session > 9) {
		tempSession = session % 10;
	}

	const deckList: string[] = [];

	for (let i = 0; i < 10; i++) {
		if (leitnerDecks[i.toString()].includes(tempSession.toString())) {
			deckList.push(i.toString());
		}
	}

	return deckList;
};

export const isLastLeitnerSession = (deckId: number | string, session: number) => {
	return leitnerDecks[`${deckId}`]?.[3] === session.toString();
};

export const getLeitnerTag = (
	tagsString: string
): { leitnerDeck: string; leitnerAgeDays: number } => {
	const tempTag = tagsString
		.split(";")
		.map((a) => a.trim())
		.find((t) => t.startsWith("L:"));
	if (!tempTag) {
		return { leitnerDeck: "S", leitnerAgeDays: 0 };
	}

	const tagParts = tempTag.split(":");
	const leitnerDeck = tagParts[1];
	let leitnerAgeDays = 0;
	if (tagParts[1] === "R" && tagParts.length === 3) {
		const cardAge = new Date(`${tagParts[2]}-01`);
		leitnerAgeDays = (Date.now() - cardAge.valueOf()) / (1000 * 60 * 60 * 24);
	}
	return { leitnerDeck, leitnerAgeDays };
};

export const makeLeitnerQuiz = (settings: {
	flashCardArray: FlashCard[];
	minStandBy: number;
	minRetired: number;
	retiredMaxAgeDays: number;
	sessionNumber: number;
}): string[] => {
	const { flashCardArray, sessionNumber, minStandBy, minRetired, retiredMaxAgeDays } = settings;
	const flashCardsWithLeitnerDeck = flashCardArray.map((fc) => ({
		...fc,
		...getLeitnerTag(fc.tags)
	}));
	const deckList = leitnerSessionToDeckList(sessionNumber);

	const quizDeck: string[] = flashCardsWithLeitnerDeck
		.filter((fc) => {
			// all cards in current deck
			if (fc.leitnerDeck === "C") {
				return true;
			}

			// all cards in decks that include the current session
			if (deckList.includes(fc.leitnerDeck)) {
				return true;
			}

			return false;
		})
		.map((fc) => fc.letterPair);

	const standByLetterPairs = flashCardsWithLeitnerDeck
		.filter((fc) => fc.leitnerDeck === "S")
		.sort((a, b) => a.lastQuizUnix - b.lastQuizUnix)
		.map((fc) => fc.letterPair);

	if (standByLetterPairs.length > 0) {
		// if deck is less than double the minimum stand-by size, add one stand-by card
		if (quizDeck.length < minStandBy * 2) {
			const bonusCard = standByLetterPairs.shift();
			if (typeof bonusCard === "string") {
				quizDeck.push(bonusCard);
			}
		}

		// cards from stand-by deck until the minimum stand-by is reached
		if (quizDeck.length < minStandBy) {
			const missingCardCount = minStandBy - quizDeck.length;
			quizDeck.push(...standByLetterPairs.slice(0, missingCardCount));
		}
	}

	if (quizDeck.length < minRetired) {
		const missingCardCount = minRetired - quizDeck.length;
		const retiredDeck = flashCardsWithLeitnerDeck
			.filter((fc) => fc.leitnerDeck === "R" && fc.leitnerAgeDays > retiredMaxAgeDays)
			.sort((a, b) => a.lastQuizUnix - b.lastQuizUnix)
			.map((fc) => fc.letterPair);
		quizDeck.push(...retiredDeck.slice(0, missingCardCount));
	}

	return shuffleArray(quizDeck);
};
