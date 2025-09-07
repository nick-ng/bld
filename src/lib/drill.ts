import z from "zod";
import { get } from "svelte/store";
import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
import { fetchFlashCards, flashCardStore } from "$lib/stores/flash-cards";
import { shuffleArray } from "$lib/utils";

const drillItemSchema = z.object({
	letterPair: z.string(),
	quizzed: z.boolean(),
	timeMs: z.number(),
	skipped: z.boolean()
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
	...letters.map((l) => ({
		type: "starts-with",
		key: `$starts-with-${l}`,
		value: l,
		label: `Starts with ${l}`
	}))
];

export const makeDrillSet = async (key: string): Promise<DrillItem[]> => {
	const drillSet = drillSets.find((s) => s.key === key);
	if (!drillSet) {
		return [];
	}

	await fetchFlashCards();
	const flashCards = get(flashCardStore);

	switch (drillSet.type) {
		case "starts-with": {
			const matchingFlashCards = Object.values(flashCards).filter((f) =>
				f.letterPair.toLowerCase().startsWith(drillSet.value.toLowerCase())
			);

			const newDrill = shuffleArray(
				matchingFlashCards.map((fc) => ({
					letterPair: fc.letterPair,
					quizzed: false,
					timeMs: 25_500, // 255 tenths of a second in milliseconds
					skipped: true
				}))
			);

			localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(newDrill));

			return newDrill;
		}
		default: {
			return [];
		}
	}
};
