import type { FlashCard } from "$lib/types";

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
		return c.commConfidence >= minCommConfidence && c.commConfidence <= maxCommConfidence;
	});

	return temp;
};
