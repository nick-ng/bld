import type { FlashCard } from "$lib/types";

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { joinServerPath } from "$lib/utils";
import { parseFlashCard } from "$lib/types";

export const flashCardStore = writable<{ [letterPair: string]: FlashCard } | string>("stand-by");

if (browser) {
	const fetchFlashCards = async () => {
		flashCardStore.set("loading");

		try {
			const res = await fetch(joinServerPath("flash-cards"));
			const flashCardsArray = await res.json();

			if (!Array.isArray(flashCardsArray)) {
				flashCardStore.set("error: unexpected response");
				return;
			}

			const flashCards: { [letterPair: string]: FlashCard } = {};
			for (let i = 0; i < flashCardsArray.length; i++) {
				const result = parseFlashCard(flashCardsArray[i]);
				if (result.isValid) {
					flashCards[result.data.letterPair] = result.data;
				}
			}

			flashCardStore.set(flashCards);
		} catch (e) {
			console.error("error when fetching letter pairs", e);
			flashCardStore.set(`error: ${e}`);
		}
	};

	fetchFlashCards();
}
