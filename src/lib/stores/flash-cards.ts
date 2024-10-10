import type { FlashCard } from "$lib/types";

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { authFetch, joinServerPath } from "$lib/utils";
import { parseFlashCard } from "$lib/types";

export const flashCardStore = writable<{ [letterPair: string]: FlashCard }>({});
export const flashCardStoreStatus = writable<string>("stand-by");

export const fetchFlashCards = async (cache: RequestCache = "default") => {
	try {
		flashCardStoreStatus.set("loading");
		const res = await authFetch(joinServerPath("flash-cards"), {
			cache
		});
		if (!res) {
			return {};
		}

		if (!res.ok) {
			console.warn("couldn't get flash cards because:", res.status, res.statusText);
			flashCardStoreStatus.set(`couldn't get flash cards because:${res.status}, ${res.statusText}`);
			return {};
		}

		const flashCardsArray = await res.json();
		if (!Array.isArray(flashCardsArray)) {
			flashCardStoreStatus.set("error: unexpected response");
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
		flashCardStoreStatus.set("loaded");

		return flashCards;
	} catch (e) {
		console.error("error when fetching letter pairs", e);
		flashCardStoreStatus.set(`error: ${e}`);
	}

	return {};
};

if (browser) {
	fetchFlashCards("no-store");
}

export const loadFlashCard = async (
	letterPair: string,
	afterLoad: (flashCard: FlashCard) => void | Promise<void>,
	abortSignal?: AbortSignal
) => {
	if (!letterPair) {
		return;
	}

	try {
		const res = await authFetch(joinServerPath("flash-cards", letterPair), {
			cache: "no-store",
			signal: abortSignal
		});
		if (!res || !res.ok) {
			return;
		}

		const resJson = await res.json();
		const parseResult = parseFlashCard(resJson);
		if (parseResult.isValid) {
			afterLoad(parseResult.data);

			return parseResult.data;
		}
	} catch (e) {
		console.error("e", e);
	}
};
