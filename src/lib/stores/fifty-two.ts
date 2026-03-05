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
	recalling: false,
	done: false,
});

if (browser) {
	const loadFiftyTwo = async (callback: () => Promise<void> | void) => {
		const tempFiftyTwo = await localforage.getItem(FIFTY_TWO_STORE_KEY);
		if (typeof tempFiftyTwo === "string") {
			const parsedFiftyTwo = fiftyTwoSchema.safeParse(JSON.parse(tempFiftyTwo));
			if (parsedFiftyTwo.success) {
				fiftyTwoStore.set({ ...parsedFiftyTwo.data, isLoaded: true });
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
