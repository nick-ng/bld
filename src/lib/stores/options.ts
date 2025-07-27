import { writable } from "svelte/store";

import { SPEFFZ_SAME_PIECES, SPEFFZ_UFR } from "$lib/constants";

// @todo(nick-ng): store options on server
const options: {
	isUserAuthenticated: boolean;
	flashCardTypes: {
		[key: string]: { name: string; samePieces: string[][]; bufferPiece: string[] };
	};
	defaultFlashCardType: string;
} = {
	isUserAuthenticated: false,
	flashCardTypes: {
		corner: {
			name: "Corner",
			samePieces: SPEFFZ_SAME_PIECES,
			bufferPiece: SPEFFZ_UFR
		}
	},
	defaultFlashCardType: "corner"
};

export const optionsStore = writable(options);
