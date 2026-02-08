import type { FlashCard, LetterPair } from "$lib/types";

import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { updateFlashCard } from "$lib/stores/flash-cards";
import { optionsStore } from "$lib/stores/options";
import { quizStore, touchCurrentQuiz } from "$lib/stores/quiz";
import { authFetch, isSpeffzPairValid, joinServerPath, shuffleArray } from "$lib/utils";
import { flashCardSchema } from "$lib/types";

export const patchQuiz = async (letterPair: string, formData: FormData, skipRedirect = false) => {
	touchCurrentQuiz();
	// go to next question on next frame
	setTimeout(() => {
		let redirect = false;
		quizStore.update((prevQuiz) => {
			const nextQuiz = prevQuiz.filter((lp) => lp != letterPair);

			if (!skipRedirect && nextQuiz.length === 0) {
				redirect = true;
			}

			return nextQuiz;
		});

		if (redirect) {
			goto("/flash-cards/summary");
		}
	});
	const response = await authFetch(joinServerPath("quiz", letterPair), {
		method: "PATCH",
		body: formData,
	});
	if (!response) {
		return;
	}

	const responseJson = await response.json();
	const parsedResponse = flashCardSchema.safeParse(responseJson);
	if (parsedResponse.success) {
		updateFlashCard(parsedResponse.data);
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
		const cardDateParts = tagParts[2].split("-");
		if (cardDateParts.length < 3) {
			cardDateParts.push("28");
		}
		const cardAge = new Date(cardDateParts.join("-"));
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
		...getLeitnerTag(fc.tags),
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
		.sort((a, b) => {
			if (a.memoConfidence !== b.memoConfidence) {
				return a.memoConfidence - b.memoConfidence;
			}

			return a.lastQuizUnix - b.lastQuizUnix;
		});
	const oldRetiredCards = flashCardsWithLeitnerDeck
		.sort((a, b) => {
			return a.lastQuizUnix - b.lastQuizUnix;
		})
		.filter(
			(fc) =>
				fc.leitnerDeck === "R" &&
				(fc.lastQuizUnix < Date.now() / 1000 - 60 * 60 * 24 * 10 || fc.leitnerAgeDays >= 10)
		);

	if (standByLetterPairs.length > 0) {
		// if deck is less than double the minimum stand-by size, add one stand-by card and one card that has been retired for over 10 days
		if (quizDeck.length < minStandBy * 2) {
			const options = get(optionsStore);
			for (let i = 0; i < (options.leitnerBonusStandby || 0); i++) {
				const bonusCard = standByLetterPairs.shift();
				if (bonusCard) {
					quizDeck.push(bonusCard.letterPair);
				} else {
					break;
				}
			}

			for (let i = 0; i < (options.leitnerBonusRetired || 0); i++) {
				const bonusRetiredCard = oldRetiredCards.shift();
				if (bonusRetiredCard) {
					quizDeck.push(bonusRetiredCard.letterPair);
				} else {
					break;
				}
			}
		}

		// cards from stand-by deck until the minimum stand-by is reached
		if (quizDeck.length < minStandBy) {
			const missingCardCount = minStandBy - quizDeck.length;
			quizDeck.push(...standByLetterPairs.slice(0, missingCardCount).map((fc) => fc.letterPair));
		}
	}

	if (quizDeck.length < minRetired) {
		const missingCardCount = minRetired - quizDeck.length;
		const retiredDeck = oldRetiredCards
			.filter((fc) => fc.leitnerDeck === "R" && fc.leitnerAgeDays > retiredMaxAgeDays)
			.map((fc) => fc.letterPair);
		quizDeck.push(...retiredDeck.slice(0, missingCardCount));
	}

	return shuffleArray(quizDeck);
};

export function getVisibleFlashCardComponents(
	category: string,
	hideAnswer: boolean
): {
	hideWords: boolean;
	hideImage: boolean;
	selectedBuffers: string[];
} {
	switch (category) {
		case "memo": {
			return {
				hideWords: hideAnswer,
				hideImage: hideAnswer,
				selectedBuffers: [],
			};
		}
		default: {
			return {
				hideWords: false,
				hideImage: false,
				selectedBuffers: hideAnswer ? [] : [category],
			};
		}
	}
}

export function getQuizKit(
	category: string,
	subcategory?: string | null
): {
	filterFunc: (lp: LetterPair) => boolean;
	getNextReview: (lp: LetterPair) => Date;
	getNextLetters: (letterPairs: LetterPair[], randH?: number) => LetterPair[];
	getSMStats: (lp: LetterPair) => { sm2_n: number; sm2_ef: number; sm2_i: number };
	title: string;
	quizType: "memo" | "alg";
} {
	const defaultSMStats = { sm2_n: 0, sm2_ef: 2.5, sm2_i: 0 };
	switch (category) {
		case "UF": {
			switch (subcategory) {
				case "orozco": {
					const filterFunc = (lp: LetterPair) =>
						(lp.speffz_pair.includes("a") || lp.speffz_pair.includes("q")) &&
						lp?.algorithms?.UF?.moves?.length > 2;
					const getNextReview = (lp: LetterPair) =>
						lp?.algorithms?.UF?.next_review_at || new Date();
					return {
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats: (lp) => lp.algorithms?.UF || defaultSMStats,
						title: "UF BU Orozco",
						quizType: "alg",
					};
				}
				default: {
					const filterFunc = (lp: LetterPair) => lp?.algorithms?.UF?.moves?.length > 2;
					const getNextReview = (lp: LetterPair) =>
						lp?.algorithms?.UF?.next_review_at || new Date();
					return {
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats: (lp) => lp.algorithms?.UF || defaultSMStats,
						title: "UF Buffer",
						quizType: "alg",
					};
				}
			}
		}
		case "UFR": {
			switch (subcategory) {
				default: {
					const filterFunc = (lp: LetterPair) => lp?.algorithms?.UFR?.moves?.length > 2;
					const getNextReview = (lp: LetterPair) =>
						lp?.algorithms?.UFR?.next_review_at || new Date();
					return {
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats: (lp) => lp.algorithms?.UF || defaultSMStats,
						title: "UFR Buffer",
						quizType: "alg",
					};
				}
			}
		}
		default: {
			// memo
			switch (subcategory) {
				default: {
					// subcategory is buffers separated by ,
					const buffers = (subcategory || "").split(",");
					const filterFunc = (lp: LetterPair) =>
						(lp.words.length > 0 || lp.image.length > 0) &&
						isSpeffzPairValid(lp.speffz_pair, buffers);
					const getNextReview = (lp: LetterPair) => lp.next_review_at;
					return {
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats: (lp) => lp || defaultSMStats,
						title: "Images",
						quizType: "memo",
					};
				}
			}
		}
	}
}

export function getGetNextLetters(
	filterFunc: (lp: LetterPair) => boolean,
	getNextReview: (lp: LetterPair) => Date
): (letterPairs: LetterPair[], randH?: number) => LetterPair[] {
	return (letterPairs: LetterPair[], randH = 3) => {
		const now = new Date();
		const sortCache: Record<string, number> = {};
		const possibleCards = letterPairs
			.filter((lp) => getNextReview(lp) <= now && filterFunc(lp))
			.sort((a, b) => {
				// randomise the next review time slightly so they aren't always in the same order
				// store in a cache so the sort works
				if (!sortCache[a.speffz_pair]) {
					sortCache[a.speffz_pair] =
						getNextReview(a).valueOf() + Math.random() * randH * 3_600_000 + 1;
				}
				if (!sortCache[b.speffz_pair]) {
					sortCache[b.speffz_pair] =
						getNextReview(b).valueOf() + Math.random() * randH * 3_600_000 + 1;
				}
				return sortCache[a.speffz_pair] - sortCache[b.speffz_pair];
			});

		return possibleCards;
	};
}

const correctIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const correctAllowance = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const incorrectIncrement = 2 * 60 * 1000; // 2 minutes in milliseconds
export function superMemo2(
	userGradeQ: number,
	input: { sm2_n: number; sm2_ef: number; sm2_i: number }
): { sm2_n: number; sm2_ef: number; sm2_i: number; last_review_at: Date; next_review_at: Date } {
	const output = {
		sm2_n: input.sm2_n,
		sm2_ef: input.sm2_ef,
		sm2_i: input.sm2_i,
		last_review_at: new Date(),
		next_review_at: new Date(Date.now() + incorrectIncrement),
	};
	if (userGradeQ >= 3) {
		if (input.sm2_n === 0) {
			output.sm2_i = 1;
		} else if (input.sm2_n === 1) {
			output.sm2_i = 6;
		} else {
			output.sm2_i = Math.round(input.sm2_i * input.sm2_ef);
		}

		// 1 day per sm2_i minus 8 hours so you don't have to do the quiz at the exact time and it doesn't become later and later
		output.next_review_at = new Date(
			Date.now() + output.sm2_i * correctIncrement - correctAllowance
		);
	} else {
		output.sm2_n = 0;
		output.sm2_i = 1;
	}

	output.sm2_ef = input.sm2_ef + (0.1 - (5 - userGradeQ) * (0.08 + (5 - userGradeQ) * 0.02));
	if (output.sm2_ef < 1.3) {
		output.sm2_ef = 1.3;
	}

	return output;
}
