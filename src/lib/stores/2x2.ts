import type { TwoByTwoAttempt } from "$lib/types";

import z from "zod";
import { browser } from "$app/environment";
import { writable } from "svelte/store";
import { twoByTwoAttemptSchema } from "$lib/types";
import { TWO_BY_TWO_STORE_KEY } from "$lib/constants";

const storeSchema = z.array(twoByTwoAttemptSchema);

export const twoByTwoStore = writable<TwoByTwoAttempt[]>([]);

if (browser) {
	const loadTwoByTwo = () => {
		try {
			const tempTwoByTwo = localStorage.getItem(TWO_BY_TWO_STORE_KEY);
			if (!tempTwoByTwo) {
				return;
			}

			const parsedTwoByTwo = storeSchema.parse(JSON.parse(tempTwoByTwo));
			twoByTwoStore.set(parsedTwoByTwo);
		} catch (e) {
			console.error("error loading 2x2 sessions", e);
		}
	};

	loadTwoByTwo();

	let debounceId: ReturnType<typeof setTimeout> | null = null;
	twoByTwoStore.subscribe((newTwoByTwo) => {
		if (typeof debounceId === "number") {
			clearTimeout(debounceId);
		}

		debounceId = setTimeout(() => {
			localStorage.setItem(TWO_BY_TWO_STORE_KEY, JSON.stringify(newTwoByTwo));
		}, 100);
	});
}
