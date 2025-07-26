import { writable } from "svelte/store";
import { browser } from "$app/environment";

import {
	FLASH_CARD_FILTER_STORE_KEY,
	FIXED_QUIZ_STORE_KEY,
	SPEFFZ_SAME_PIECES,
	SPEFFZ_UFR
} from "$lib/constants";

// @todo(nick-ng): change filter criteria "direction"
// it's to do with the buffer piece
const options: {
	hideNon3Style: boolean;
	hideNonOP: boolean;
	fixedQuiz: string[];
	isUserAuthenticated: boolean;
	flashCardTypes: {
		[key: string]: { name: string; samePieces: string[][]; bufferPiece: string[] };
	};
} = {
	hideNon3Style: false,
	hideNonOP: false,
	fixedQuiz: [],
	isUserAuthenticated: false,
	flashCardTypes: {
		corner: {
			name: "Corner",
			samePieces: SPEFFZ_SAME_PIECES,
			bufferPiece: SPEFFZ_UFR
		}
	}
};

let storedFilterString = "";
let storedFixedQuizString = "";
if (browser) {
	// flash card filter (3-style, old pochman)
	try {
		storedFilterString = localStorage.getItem(FLASH_CARD_FILTER_STORE_KEY) || "";
		if (storedFilterString) {
			options.hideNon3Style = storedFilterString[0] === "t";
			options.hideNonOP = storedFilterString[1] === "t";
		}

		storedFixedQuizString = localStorage.getItem(FIXED_QUIZ_STORE_KEY) || "";
		if (storedFixedQuizString) {
			options.fixedQuiz = storedFixedQuizString.split(",").map((l) => l.trim());
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

		const newFixedQuizString = newOptions.fixedQuiz.join(",");
		if (newFixedQuizString != storedFixedQuizString) {
			localStorage.setItem(FIXED_QUIZ_STORE_KEY, newFixedQuizString);
			storedFixedQuizString = newFixedQuizString;
		}
	});
}
