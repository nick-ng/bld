import type { FlashCard } from "$lib/types";

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { authFetch, joinServerPath } from "$lib/utils";
import { parseFlashCard } from "$lib/types";

export const flashCardStore = writable<{ [letterPair: string]: FlashCard } | string>("stand-by");

export const fetchFlashCards = async () => {
	try {
		const res = await authFetch(joinServerPath("flash-cards"));
		if (!res) {
			return {};
		}

		if (!res.ok) {
			console.warn("couldn't get flash cards because:", res.status, res.statusText);
			return {};
		}

		const flashCardsArray = await res.json();
		if (!Array.isArray(flashCardsArray)) {
			flashCardStore.set("error: unexpected response");
			return {};
		}

		const flashCards: { [letterPair: string]: FlashCard } = {};
		const nowMs = Date.now();
		for (let i = 0; i < flashCardsArray.length; i++) {
			const result = parseFlashCard(flashCardsArray[i]);
			if (result.isValid) {
				flashCards[result.data.letterPair] = { ...result.data, fetchedAtMs: nowMs };
			}
		}

		flashCardStore.set(flashCards);

		return flashCards;
	} catch (e) {
		console.error("error when fetching letter pairs", e);
		flashCardStore.set(`error: ${e}`);
	}

	return {};
};

if (browser) {
	flashCardStore.set("loading");
	fetchFlashCards();
}
