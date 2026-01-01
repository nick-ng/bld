import type { Options } from "$lib/types";
import { writable } from "svelte/store";
import localforage from "localforage";

import { browser } from "$app/environment";
import { optionsSchema } from "$lib/types";
import { OPTIONS_STORE_PREFIX, SPEFFZ_CORNER_SAME_PIECES, SPEFFZ_CORNER_UFR } from "$lib/constants";

// @todo(nick-ng): store options on server
export const optionsStore = writable<Options>({
	isUserAuthenticated: false,
	flashCardTypes: {
		corner: {
			name: "Corner",
			samePieces: SPEFFZ_CORNER_SAME_PIECES,
			bufferPiece: SPEFFZ_CORNER_UFR,
			leitnerSession: 0,
			leitnerLastQuizUnix: 0,
		},
	},
	defaultFlashCardType: "corner",
	leitnerMinReviewStandBy: 10,
	leitnerMinReviewRetired: 5,
	leitnerRetiredMaxAgeDays: 60,
	leitnerQuizCooldownHours: 12,
	leitnerBonusStandby: 2,
	leitnerBonusRetired: 2,
	flashCardVisibility: {
		corners: true,
		m2edges: true,
	},
});

const optionsStorageKey = `${OPTIONS_STORE_PREFIX}_ALL`;

if (browser) {
	const optionsForage = localforage.createInstance({
		name: `${OPTIONS_STORE_PREFIX}_INDEXDB`,
	});
	const loadOptions = async () => {
		const tempOptions = await optionsForage.getItem(optionsStorageKey);

		const parsedOptions = optionsSchema.safeParse(tempOptions);

		if (parsedOptions.success) {
			optionsStore.update((prev) => {
				const { leitnerSessionNumbers, leitnerLastQuizUnix, ...newOptions } = {
					...prev,
					...parsedOptions.data,
				};
				// @todo(nick-ng): remove migration code later
				if (leitnerSessionNumbers) {
					// migrate from old option schema
					Object.keys(leitnerSessionNumbers).forEach((key) => {
						if (typeof newOptions.flashCardTypes[key]?.leitnerSession === "number") {
							// already migrated
							return;
						}

						newOptions.flashCardTypes[key].leitnerSession = leitnerSessionNumbers?.[key] || 0;
						newOptions.flashCardTypes[key].leitnerLastQuizUnix = leitnerLastQuizUnix?.[key] || 0;
					});
				}
				return newOptions;
			});
		}
	};

	loadOptions();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	optionsStore.subscribe(({ isUserAuthenticated, ...newOptions }) => {
		optionsForage.setItem(optionsStorageKey, newOptions);
	});
}
