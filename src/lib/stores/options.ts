import type { Options } from "$lib/types";
import { writable } from "svelte/store";
import localforage from "localforage";

import { browser } from "$app/environment";
import { optionsSchema } from "$lib/types";
import { SPEFFZ_SAME_PIECES, SPEFFZ_UFR, OPTIONS_STORE_PREFIX } from "$lib/constants";

// @todo(nick-ng): store options on server
const options: Options = {
	isUserAuthenticated: false,
	flashCardTypes: {
		corner: {
			name: "Corner",
			samePieces: SPEFFZ_SAME_PIECES,
			bufferPiece: SPEFFZ_UFR
		}
	},
	defaultFlashCardType: "corner",
	leitnerMinReviewStandBy: 10,
	leitnerMinReviewRetired: 5,
	leitnerRetiredMaxAgeDays: 60,
	leitnerSessionNumbers: { corner: 0 },
	leitnerQuizCooldownHours: 12,
	leitnerLastQuizUnix: { corner: 0 }
};

export const optionsStore = writable(options);

const optionsStorageKey = `${OPTIONS_STORE_PREFIX}_ALL`;

if (browser) {
	const optionsForage = localforage.createInstance({ name: `${OPTIONS_STORE_PREFIX}_INDEXDB` });
	const loadOptions = async () => {
		const tempOptions = await optionsForage.getItem(optionsStorageKey);

		const parsedOptions = optionsSchema.safeParse(tempOptions);

		if (parsedOptions.success) {
			optionsStore.update((prev) => {
				return { ...prev, ...parsedOptions.data };
			});
		}
	};

	loadOptions();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	optionsStore.subscribe(({ isUserAuthenticated, ...newOptions }) => {
		optionsForage.setItem(optionsStorageKey, newOptions);
	});
}
