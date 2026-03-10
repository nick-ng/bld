import type { Options } from "$lib/types";

import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { optionsSchema } from "$lib/types";
import { OPTIONS_STORE_PREFIX } from "$lib/constants";

// @todo(nick-ng): store options on server
export const optionsStore = writable<Options>({
	targetEf: 2.5,
	auto5s: 5,
	auto4s: 20,
	showImagesForAlgs: false,
	chosenBuffers: { UF: true, UFR: true },
	visibleBuffers: { UF: true, UFR: true },
	pinnedQuizzes: [],
	maxNewCardsPerDay: 50,
	newCardsToday: 0,
	newCardDay: 0,
});

const optionsStorageKey = `${OPTIONS_STORE_PREFIX}_ALL`;

if (browser) {
	const loadOptions = async () => {
		const tempOptionsString = localStorage.getItem(optionsStorageKey);
		if (tempOptionsString) {
			try {
				const unknownOptions = JSON.parse(tempOptionsString);
				const parsedOptions = optionsSchema.safeParse(unknownOptions);
				if (parsedOptions.success) {
					optionsStore.update((prev) => {
						return {
							...prev,
							...parsedOptions.data,
						};
					});
				}
			} catch (e) {
				console.error("error loading options", e);
			}
		}
	};

	loadOptions();

	optionsStore.subscribe((newOptions) => {
		localStorage.setItem(optionsStorageKey, JSON.stringify(newOptions));
	});
}
