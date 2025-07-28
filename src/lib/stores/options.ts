import { writable } from "svelte/store";

import { browser } from "$app/environment";
import { SPEFFZ_SAME_PIECES, SPEFFZ_UFR, OPTIONS_STORE_PREFIX } from "$lib/constants";

type Options = {
	isUserAuthenticated: boolean;
	flashCardTypes: {
		[key: string]: { name: string; samePieces: string[][]; bufferPiece: string[] };
	};
	defaultFlashCardType: string;
	leitnerMinReviewStandBy: number;
	leitnerMinReviewRetired: number;
	leitnerRetiredMaxAgeDays: number;
	leitnerSessionNumber: number;
	leitnerQuizCooldownHours: number;
};

const storedOptionTypes: Array<keyof Options> = [
	"defaultFlashCardType",
	"flashCardTypes",
	"leitnerMinReviewStandBy",
	"leitnerMinReviewRetired",
	"leitnerRetiredMaxAgeDays",
	"leitnerSessionNumber",
	"leitnerQuizCooldownHours"
];

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
	leitnerSessionNumber: 0,
	leitnerQuizCooldownHours: 12
};

export const optionsStore = writable(options);

const getOptionKey = (currentKey: keyof Options) => {
	return `${OPTIONS_STORE_PREFIX}_${currentKey}`.toUpperCase();
};

const loadJson = (currentKey: keyof Options, defaultValue: any) => {
	try {
		const storedValue = localStorage.getItem(getOptionKey(currentKey));
		if (storedValue) {
			return JSON.parse(storedValue);
		}
	} catch (err) {
		console.error(`error when loading ${currentKey}`, err);
	}

	return defaultValue;
};

const loadInt = (currentKey: keyof Options, defaultValue: number) => {
	const storedValue = localStorage.getItem(getOptionKey(currentKey));
	if (typeof storedValue === "string") {
		const parsedValue = parseInt(storedValue, 10);

		if (!isNaN(parsedValue)) {
			return parsedValue;
		}
	}

	return defaultValue;
};

const loadString = (currentKey: keyof Options, defaultValue: string) => {
	const storedValue = localStorage.getItem(getOptionKey(currentKey));
	if (typeof storedValue === "string") {
		return storedValue;
	}

	return defaultValue;
};

if (browser) {
	options.flashCardTypes = loadJson("flashCardTypes", options.flashCardTypes);
	options.defaultFlashCardType = loadString("defaultFlashCardType", options.defaultFlashCardType);
	options.leitnerMinReviewStandBy = loadInt(
		"leitnerMinReviewStandBy",
		options.leitnerMinReviewStandBy
	);
	options.leitnerMinReviewRetired = loadInt(
		"leitnerRetiredMaxAgeDays",
		options.leitnerMinReviewRetired
	);
	options.leitnerRetiredMaxAgeDays = loadInt(
		"leitnerRetiredMaxAgeDays",
		options.leitnerRetiredMaxAgeDays
	);
	options.leitnerSessionNumber = loadInt("leitnerSessionNumber", options.leitnerSessionNumber);
	options.leitnerQuizCooldownHours = loadInt(
		"leitnerQuizCooldownHours",
		options.leitnerQuizCooldownHours
	);

	optionsStore.update((prev) => {
		return { ...prev, ...options };
	});

	optionsStore.subscribe((newOptions) => {
		storedOptionTypes.forEach((currentKey) => {
			switch (typeof newOptions[currentKey]) {
				case "object": {
					localStorage.setItem(getOptionKey(currentKey), JSON.stringify(newOptions[currentKey]));
					break;
				}
				default: {
					localStorage.setItem(getOptionKey(currentKey), `${newOptions[currentKey]}`);
				}
			}
		});
	});
}
