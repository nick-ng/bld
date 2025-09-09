import z from "zod";
import { get } from "svelte/store";
import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
import { fetchFlashCards, flashCardStore, getAllFlashCardsOfType } from "$lib/stores/flash-cards";
import { getLeitnerTag } from "$lib/quiz";
import { shuffleArray } from "$lib/utils";

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
		type: "slow",
		filter: "retired",
		key: "slow-retired-10",
		value: 10,
		label: "Slowest, Retired - 10"
	},
	{
		type: "slow",
		filter: "all",
		key: "slow-10",
		value: 10,
		label: "Slowest - 10"
	},
	...letters.map((l) => ({
		type: "starts-with",
		filter: l,
		key: `$starts-with-${l}`,
		value: 9999,
		label: `Starts with ${l}`
	})),
	{
		type: "random",
		filter: "all",
		key: "random-5",
		value: 5,
		label: "Random 5"
	}
];

export const makeDrillSet = async (key: string, flashCardType: string): Promise<DrillItem[]> => {
	const drillSet = drillSets.find((s) => s.key === key);
	if (!drillSet) {
		return [];
	}

	await fetchFlashCards();
	const flashCards = shuffleArray(getAllFlashCardsOfType(flashCardType, get(flashCardStore)));

	let drillItems: DrillItem[] = [];
	switch (drillSet.type) {
		case "slow": {
			const tempFlashCards =
				drillSet.filter === "retired"
					? flashCards.filter((fc) => getLeitnerTag(fc.tags).leitnerDeck === "R")
					: flashCards;
			tempFlashCards.sort((a, b) => b.drillTimeDs - a.drillTimeDs);

			drillItems = tempFlashCards.slice(0, drillSet.value).map((fc) => ({
				letterPair: fc.letterPair,
				flashCardType,
				quizzed: false,
				send: true,
				timeMs: fc.drillTimeDs
			}));
			break;
		}
		case "random": {
			drillItems = flashCards.slice(0, drillSet.value).map((fc) => ({
				letterPair: fc.letterPair,
				flashCardType,
				quizzed: false,
				send: true,
				timeMs: fc.drillTimeDs
			}));
			break;
		}
		case "starts-with": {
			const matchingFlashCards = flashCards.filter((f) =>
				f.letterPair.toLowerCase().startsWith(drillSet.filter)
			);

			drillItems = matchingFlashCards.map((fc) => ({
				letterPair: fc.letterPair,
				flashCardType,
				quizzed: false,
				send: true,
				timeMs: fc.drillTimeDs
			}));

			break;
		}
		default: {
			// noop
		}
	}

	localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillItems));
	return drillItems;
};
