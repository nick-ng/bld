import type { FlashCard } from "$lib/types";
import { is3Style } from "$lib/utils";

export const sortByLastQuiz = (flashCards: FlashCard[]) => {
	const temp = flashCards.sort((a, b) => {
		return a.lastQuizUnix - b.lastQuizUnix;
	});

	return temp;
};

export const commConfidenceQuiz = (
	flashCards: FlashCard[],
	maxCommConfidence: number,
	minCommConfidence: number = 0
) => {
	const temp = flashCards.filter((c) => {
		// parity isn't a commutator
		if (c.letterPair[0] === c.letterPair[1]) {
			return false;
		}

		if (!is3Style(c.letterPair)) {
			return false;
		}

		return c.commConfidence >= minCommConfidence && c.commConfidence <= maxCommConfidence;
	});

	return temp;
};

export const threeStyleCommutators = (
	flashCards: FlashCard[],
	maxCommConfidence: number,
	minCommConfidence: number = 0
) => {
	const allThreeStyleComms = flashCards.filter((c) => {
		// parity isn't a commutator
		return c.letterPair[0] !== c.letterPair[1] && is3Style(c.letterPair);
	});

	const lowConfidence3StyleComms = allThreeStyleComms.filter((c) => {
		return c.commConfidence >= minCommConfidence && c.commConfidence <= maxCommConfidence;
	});

	return {
		all: allThreeStyleComms,
		lowConfidence: lowConfidence3StyleComms
	};
};
