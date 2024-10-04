import type { LetterPair } from "$lib/types";

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { joinServerPath } from "$lib/utils";
import { parseLetterPair } from "$lib/types";

export const letterPairStore = writable<{ [letterPair: string]: LetterPair } | string>("stand-by");

if (browser) {
	const fetchLetterPairs = async () => {
		letterPairStore.set("loading");

		try {
			const res = await fetch(joinServerPath("flash-cards"));
			const letterPairsArray = await res.json();

			if (!Array.isArray(letterPairsArray)) {
				letterPairStore.set("error: unexpected response");
				return;
			}

			const letterPairs: { [letterPair: string]: LetterPair } = {};
			for (let i = 0; i < letterPairsArray.length; i++) {
				const result = parseLetterPair(letterPairsArray[i]);
				if (result.isValid) {
					const letterPair = result.data;
					letterPairs[letterPair.letterPair] = letterPair;
				}
			}

			console.log("letterPairs", letterPairs);
			letterPairStore.set(letterPairs);
		} catch (e) {
			console.error("error when fetching letter pairs", e);
			letterPairStore.set(`error: ${e}`);
		}
	};

	fetchLetterPairs();
}
