import { flashCardStore } from "$lib/stores/flash-cards";
import { quizStore } from "$lib/stores/quiz";
import { authFetch } from "$lib/utils";
import { parseFlashCard } from "$lib/types";

export const putQuiz = async (letterPair: string, formData: FormData) => {
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

const leitnerDecks: number[][] = [];
for (let i = 0; i < 10; i++) {
	leitnerDecks.push([i % 10, (i + 2) % 10, (i + 5) % 10, (i + 9) % 10]);
}
export const leitnerSessionToDeckList = (session: number) => {
	let tempSession = session;
	if (session > 9) {
		tempSession = session % 10;
	}

	const deckList: number[] = [];

	for (let i = 0; i < leitnerDecks.length; i++) {
		if (leitnerDecks[i].includes(i)) {
			deckList.push(i);
		}
	}

	return deckList;
};

export const isLastLeitnerSession = (deck: number[], session: number) => {
	return deck[deck.length - 1] === session;
};
