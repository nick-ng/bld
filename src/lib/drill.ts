import type { FlashCard } from "$lib/types";

import z from "zod";
import { get } from "svelte/store";
import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
import { fetchFlashCards, flashCardStore, getAllFlashCardsOfType } from "$lib/stores/flash-cards";
import { optionsStore } from "$lib/stores/options";
import { getLeitnerTag } from "$lib/quiz";
import { shuffleArray, isTwist, isBuffer } from "$lib/utils";

const drillItemSchema = z.object({
	letterPair: z.string(),
	flashCardType: z.string(),
	quizzed: z.boolean(),
	send: z.boolean(),
	timeMs: z.number()
});

export type DrillItem = z.infer<typeof drillItemSchema>;

const drillItemsSchema = z.array(drillItemSchema);

export const getDrillItems = (): DrillItem[] => {
	try {
		const drillItemsString = localStorage.getItem(DRILL_ITEMS_STORE_KEY);
		if (!drillItemsString) {
			return [];
		}

		const unknown = JSON.parse(drillItemsString);
		const result = drillItemsSchema.safeParse(unknown);
		if (result.success) {
			return result.data;
		}
	} catch (e) {
		console.info("error parsing stored drill items", e);
	}

	return [];
};

const letters = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X"
];

export const drillSets = [
	{
		key: "slow",
		filters: ["all", "retired"],
		defaultSize: 10,
		label: "Slow"
	},
	{
		key: "starts-with",
		filters: letters,
		defaultSize: 0,
		label: "Starts with"
	},
	{
		key: "random",
		filters: ["all", "retired"],
		defaultSize: 10,
		label: "Random"
	}
];

export const makeDrillSet = async (
	key: string,
	flashCardType: string,
	filter: string,
	size: number
): Promise<DrillItem[]> => {
	const drillSet = drillSets.find((s) => s.key === key);
	if (!drillSet) {
		return [];
	}

	await fetchFlashCards();
	let flashCards = getAllFlashCardsOfType(flashCardType, get(flashCardStore));
	const options = get(optionsStore);
	const typeInfo = options.flashCardTypes[flashCardType];
	if (typeInfo) {
		flashCards = flashCards.filter((fc) => {
			if (isTwist(fc.letterPair, typeInfo.samePieces)) {
				return false;
			}

			if (isBuffer(fc.letterPair, typeInfo.bufferPiece)) {
				return false;
			}

			return true;
		});
	}

	let possibleFlashCards: FlashCard[] = [];
	let selectedFlashCards: FlashCard[] = [];
	// filter possible flash cards
	switch (filter) {
		case "all": {
			possibleFlashCards = flashCards;
			break;
		}
		case "retired": {
			possibleFlashCards = flashCards.filter((fc) => getLeitnerTag(fc.tags).leitnerDeck === "R");
			break;
		}
		default: {
			if (drillSet.key === "starts-with") {
				possibleFlashCards = flashCards.filter((flashCard) =>
					flashCard.letterPair.startsWith(filter)
				);
			} else {
				possibleFlashCards = flashCards;
			}
		}
	}
	if (drillSet.key === "random") {
		possibleFlashCards = shuffleArray(possibleFlashCards);
	}

	if (drillSet.defaultSize <= 0) {
		selectedFlashCards = possibleFlashCards;
	} else {
		selectedFlashCards = possibleFlashCards.slice(0, size);
	}

	const drillItems = shuffleArray(
		selectedFlashCards.map((fc) => ({
			letterPair: fc.letterPair,
			flashCardType,
			quizzed: false,
			send: true,
			timeMs: fc.drillTimeDs
		}))
	);

	localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillItems));
	return drillItems;
};
