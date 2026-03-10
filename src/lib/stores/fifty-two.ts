import type { FiftyTwo } from "$lib/types";

import { writable } from "svelte/store";
import localforage from "localforage";
import { browser } from "$app/environment";
import { fiftyTwoSchema } from "$lib/types";
import { FIFTY_TWO_STORE_KEY } from "$lib/constants";

export const fiftyTwoStore = writable<FiftyTwo & { isLoaded: boolean }>({
	deck: [],
	recall: [],
	currentIndex: 0,
	history: [],
	isLoaded: false,
	recallStartMs: 0,
	memoStartMs: 0,
	doneMs: 0,
	state: "standby",
});

if (browser) {
	const loadFiftyTwo = async (callback: () => Promise<void> | void) => {
		const tempFiftyTwo = await localforage.getItem(FIFTY_TWO_STORE_KEY);
		if (typeof tempFiftyTwo === "string") {
			const parsedFiftyTwo = fiftyTwoSchema.safeParse(JSON.parse(tempFiftyTwo));
			if (parsedFiftyTwo.success) {
				fiftyTwoStore.set({ ...parsedFiftyTwo.data, isLoaded: true });
				callback();
				return;
			}
		}

		fiftyTwoStore.update((prev) => ({ ...prev, isLoaded: true }));
		callback();
	};

	loadFiftyTwo(() => {
		fiftyTwoStore.subscribe((newFiftyTwo) => {
			localforage.setItem(FIFTY_TWO_STORE_KEY, JSON.stringify(newFiftyTwo));
		});
	});
}
