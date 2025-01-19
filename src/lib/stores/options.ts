import { writable } from "svelte/store";
import { browser } from "$app/environment";

import { FLASH_CARD_FILTER_STORE_KEY } from "$lib/constants";

// @todo(nick-ng): change filter criteria "direction"
// it's to do with the buffer piece
const options: { hideNon3Style: boolean; hideNonOP: boolean } = {
	hideNon3Style: false,
	hideNonOP: false
};

let storedFilterString = "";
if (browser) {
	// flash card filter (3-style, old pochman)
	try {
		storedFilterString = localStorage.getItem(FLASH_CARD_FILTER_STORE_KEY) || "";
		if (storedFilterString) {
			options.hideNon3Style = storedFilterString[0] === "t";
			options.hideNonOP = storedFilterString[1] === "t";
		}
	} catch (e) {
		console.error("error while retrieving options", e);
	}
}

export const optionsStore = writable(options);

if (browser) {
	optionsStore.subscribe((newOptions) => {
		// flash card filters
		const newStoredFilterString = [newOptions.hideNon3Style, newOptions.hideNonOP]
			.map((a) => (a ? "t" : "f"))
			.join("");
		if (newStoredFilterString !== storedFilterString) {
			localStorage.setItem(FLASH_CARD_FILTER_STORE_KEY, newStoredFilterString);
			storedFilterString = newStoredFilterString;
		}
	});
}
