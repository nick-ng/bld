import type { FlashCard } from "$lib/types";
import type { FlashCardStoreType } from "$lib/stores/flash-cards";

import z from "zod";
import { get } from "svelte/store";
import { DRILL_ITEMS_STORE_KEY, SPEFFZ_LETTERS } from "$lib/constants";
import { fetchFlashCards, flashCardStore, getAllFlashCardsOfType } from "$lib/stores/flash-cards";
import { optionsStore } from "$lib/stores/options";
import { getLeitnerTag } from "$lib/quiz";
import { shuffleArray, isTwist, isBuffer, parseCommutator } from "$lib/utils";

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

export const getDrillSets = (flashCardType: string, localFlashCardStore: FlashCardStoreType) => {
	const flashCards = getAllFlashCardsOfType(flashCardType, localFlashCardStore);
	const interchangeFaces = new Set<string>();
	for (let i = 0; i < flashCards.length; i++) {
		const commutator = parseCommutator(flashCards[i].commutator);
		if (commutator.interchange) {
			interchangeFaces.add(commutator.interchange[0]);
		}
	}

	return [
		{
			key: "slow",
			filters: ["retired", "all"],
			defaultSize: 5,
			label: "Slow"
		},
		{
			key: "starts-with",
			filters: SPEFFZ_LETTERS,
			defaultSize: -1,
			label: "Starts with"
		},
		{
			key: "interchange",
			filters: [...interchangeFaces].sort((a, b) => a.localeCompare(b)),
			defaultSize: -1,
			label: "Interchange"
		},
		{ key: "old", filters: ["retired", "all"], defaultSize: 5, label: "Old" },
		{
			key: "random",
			filters: ["retired", "all"],
			defaultSize: 5,
			label: "Random"
		}
	];
};

export const makeDrill = async (
	key: string,
	flashCardType: string,
	filter: string,
	size: number
): Promise<DrillItem[]> => {
	const localFlashCardStore = get(flashCardStore);
	const drillSets = getDrillSets(flashCardType, localFlashCardStore);
	const drillSet = drillSets.find((s) => s.key === key);
	if (!drillSet) {
		return [];
	}

	await fetchFlashCards();
	let flashCards = getAllFlashCardsOfType(flashCardType, localFlashCardStore);
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
					flashCard.letterPair.toLowerCase().startsWith(filter.toLowerCase())
				);
			} else if (drillSet.key === "interchange") {
				possibleFlashCards = flashCards.filter((flashCard) => {
					const commutator = parseCommutator(flashCard.commutator);
					return commutator.interchange.startsWith(filter);
				});
			} else {
				possibleFlashCards = flashCards;
			}
		}
	}

	switch (drillSet.key) {
		case "slow": {
			possibleFlashCards.sort((a, b) => {
				const aRounded = Math.round(a.drillTimeMs / 1000);
				const bRounded = Math.round(b.drillTimeMs / 1000);
				if (aRounded !== bRounded) {
					return bRounded - aRounded;
				}

				return a.commConfidence - b.commConfidence;
			});
			break;
		}
		case "old": {
			possibleFlashCards.sort((a, b) => a.lastQuizUnix - b.lastQuizUnix);
			break;
		}
		case "random":
		default: {
			possibleFlashCards = shuffleArray(possibleFlashCards);
		}
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
			timeMs: fc.drillTimeMs
		}))
	);

	localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillItems));
	return drillItems;
};
