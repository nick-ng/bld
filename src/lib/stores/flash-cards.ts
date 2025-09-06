import type { FlashCard } from "$lib/types";

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { authFetch, joinServerPath } from "$lib/utils";
import { defaultFlashCard, parseFlashCard } from "$lib/types";

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export type FlashCardStoreType = {
	[letterPair: string]: FlashCard & { fetchedAtMs: number };
};

export const flashCardStore = writable<FlashCardStoreType>({});
export const flashCardStoreStatus = writable<{
	status: string;
	message: string;
	fetchStartMs: number;
	fetchEndMs: number;
}>({ status: "stand-by", message: "stand by", fetchStartMs: 0, fetchEndMs: 0 });

export const fetchFlashCards = async (
	cache: RequestCache = "default"
): Promise<FlashCardStoreType> => {
	const fetchStartMs = Date.now();
	try {
		flashCardStoreStatus.set({
			status: "loading",
			message: "loading",
			fetchStartMs,
			fetchEndMs: 0
		});
		const res = await authFetch(joinServerPath("flash-cards"), {
			cache
		});

		if (!res) {
			return {};
		}

		if (!res.ok && res.status !== 401) {
			console.warn("couldn't get flash cards because:", res.status, res.statusText);
			flashCardStoreStatus.set({
				status: `error`,
				message: `couldn't get flash cards because ${res.status}, ${res.statusText}`,
				fetchStartMs,
				fetchEndMs: Date.now()
			});
			return {};
		}

		const flashCardsArray = await res.json();
		if (!Array.isArray(flashCardsArray)) {
			flashCardStoreStatus.set({
				status: "error",
				message: "didn't receive an array",
				fetchStartMs,
				fetchEndMs: Date.now()
			});
			return {};
		}

		const flashCards: FlashCardStoreType = {};
		const nowMs = Date.now();
		for (let i = 0; i < flashCardsArray.length; i++) {
			const result = parseFlashCard(flashCardsArray[i]);
			if (result.isValid) {
				flashCards[result.data.letterPair] = {
					...result.data,
					fetchedAtMs: nowMs
				};
			}
		}

		flashCardStore.set(flashCards);
		flashCardStoreStatus.set({
			status: "loaded",
			message: "loaded",
			fetchStartMs,
			fetchEndMs: Date.now()
		});

		return flashCards;
	} catch (e) {
		console.error("error when fetching letter pairs", e);
		flashCardStoreStatus.set({
			status: `error`,
			message: `error when fetching letter pairs: ${e}`,
			fetchStartMs,
			fetchEndMs: Date.now()
		});
	}

	return {};
};

if (browser) {
	fetchFlashCards("no-store");
}

let currentFlashCards: FlashCardStoreType = {};
flashCardStore.subscribe((newFlashCards) => {
	currentFlashCards = newFlashCards;
});

export const loadFlashCard = async (letterPair: string, abortSignal?: AbortSignal) => {
	if (!letterPair) {
		return defaultFlashCard(letterPair);
	}

	const flashCard = currentFlashCards[letterPair];
	if (flashCard && Date.now() - flashCard.fetchedAtMs < MAX_AGE_MS) {
		return flashCard;
	}

	try {
		const res = await authFetch(joinServerPath("flash-cards", letterPair), {
			cache: "no-store",
			signal: abortSignal
		});
		if (!res || !res.ok) {
			return flashCard;
		}

		const resJson = await res.json();
		const parseResult = parseFlashCard(resJson);
		if (parseResult.isValid) {
			const { data } = parseResult;
			flashCardStore.update((previous) => {
				previous[data.letterPair] = { ...data, fetchedAtMs: Date.now() };
				return previous;
			});

			return parseResult.data;
		}
	} catch (e) {
		console.error("e", e);
	}
};

export const getFlashCard = (letterPair: string, flashCardMap: FlashCardStoreType): FlashCard => {
	const temp = flashCardMap[letterPair.toLocaleLowerCase()];

	if (temp) {
		return temp;
	}

	return {
		commConfidence: 0,
		commutator: "",
		confidence: 0,
		image: "",
		lastQuizUnix: 0,
		letterPair,
		memo: "",
		memoConfidence: 0,
		tags: "",
		isPublic: false,
		type: "corner"
	};
};
