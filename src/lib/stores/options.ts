import type { Options } from "$lib/types";
import { writable } from "svelte/store";
import localforage from "localforage";

import { browser } from "$app/environment";
import { optionsSchema } from "$lib/types";
import { OPTIONS_STORE_PREFIX } from "$lib/constants";

// @todo(nick-ng): store options on server
export const optionsStore = writable<Options>({
	targetEf: 2.5,
	auto5s: 2,
	auto4s: 7,
	showImagesForAlgs: false,
	chosenBuffers: { UF: true, UFR: true },
	visibleBuffers: { UF: true, UFR: true },
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
				return {
					...prev,
					...parsedOptions.data,
				};
			});
		}
	};

	loadOptions();

	optionsStore.subscribe((newOptions) => {
		optionsForage.setItem(optionsStorageKey, newOptions);
	});
}
