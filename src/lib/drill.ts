import z from "zod";
import { get } from "svelte/store";
import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
import { fetchFlashCards, flashCardStore, getAllFlashCardsOfType } from "$lib/stores/flash-cards";
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
		type: "random",
		key: "random-5",
		value: 5,
		label: "Random 5"
	},
	...letters.map((l) => ({
		type: "starts-with",
		key: `$starts-with-${l}`,
		value: l,
		label: `Starts with ${l}`
	}))
];

export const makeDrillSet = async (key: string, flashCardType: string): Promise<DrillItem[]> => {
	const drillSet = drillSets.find((s) => s.key === key);
	if (!drillSet) {
		return [];
	}

	await fetchFlashCards();
	const flashCards = shuffleArray(getAllFlashCardsOfType(flashCardType, get(flashCardStore)));

	const value = drillSet.value;
	switch (drillSet.type) {
		case "random": {
			if (typeof value !== "number") {
				console.error("random value must be number");

				return [];
			}

			return flashCards.slice(0, value).map((fc) => ({
				letterPair: fc.letterPair,
				flashCardType,
				quizzed: false,
				send: true,
				timeMs: 25_500 // 255 tenths of a second in milliseconds
			}));
		}
		case "starts-with": {
			if (typeof value !== "string") {
				console.error("starts-with value must be string");

				return [];
			}

			const matchingFlashCards = flashCards.filter((f) =>
				f.letterPair.toLowerCase().startsWith(value.toLowerCase())
			);

			const newDrill = matchingFlashCards.map((fc) => ({
				letterPair: fc.letterPair,
				flashCardType,
				quizzed: false,
				send: true,
				timeMs: 25_500 // 255 tenths of a second in milliseconds
			}));

			localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(newDrill));

			return newDrill;
		}
		default: {
			return [];
		}
	}
};
