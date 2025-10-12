import type { FlashCard } from "$lib/types";
import type { FlashCardStoreType } from "$lib/stores/flash-cards";

import z from "zod";
import { get } from "svelte/store";
import { DRILL_ITEMS_STORE_KEY, SPEFFZ_LETTERS } from "$lib/constants";
import { flashCardStore, getAllFlashCardsOfType } from "$lib/stores/flash-cards";
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

export const getDrillSets = (
	flashCardType: string,
	localFlashCardStore: FlashCardStoreType
): {
	key: string;
	filters: string[];
	defaultSize: number;
	label: string;
}[] => {
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
			filters: ["all", "retired"],
			defaultSize: 5,
			label: "Slow"
		},
		{ key: "old", filters: ["all", "retired"], defaultSize: 5, label: "Old" },
		{
			key: "starts-with",
			filters: SPEFFZ_LETTERS,
			defaultSize: -1,
			label: "Starts with"
		},
		{
			key: "insert",
			filters: ["3-move", "4-move", "full-domino", "half-domino"],
			defaultSize: -1,
			label: "Insert type"
		},
		{
			key: "interchange",
			filters: [...interchangeFaces].sort((a, b) => a.localeCompare(b)),
			defaultSize: -1,
			label: "Interchange"
		},
		{
			key: "random",
			filters: ["all", "retired"],
			defaultSize: 5,
			label: "Random"
		}
	];
};

export const makeDrill = (
	key: string,
	flashCardType: string,
	filter: string,
	size: number
): DrillItem[] => {
	const localFlashCardStore = get(flashCardStore);
	const drillSets = getDrillSets(flashCardType, localFlashCardStore);
	const drillSet = drillSets.find((s) => s.key === key);
	if (!drillSet) {
		return [];
	}

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
			switch (drillSet.key) {
				case "starts-with": {
					possibleFlashCards = flashCards.filter((flashCard) =>
						flashCard.letterPair.toLowerCase().startsWith(filter.toLowerCase())
					);
					break;
				}
				case "interchange": {
					possibleFlashCards = flashCards.filter((flashCard) => {
						const commutator = parseCommutator(flashCard.commutator);
						return commutator.interchange.startsWith(filter);
					});
					break;
				}
				case "insert": {
					possibleFlashCards = flashCards.filter((flashCard) => {
						const commutator = parseCommutator(flashCard.commutator);
						switch (filter) {
							case "3-move": {
								return commutator.insertLength === 3;
							}
							case "4-move": {
								return commutator.insertLength === 4;
							}
							case "full-domino": {
								const withoutPrime = commutator.insert.replaceAll("'", "");
								return withoutPrime === "R2 U R2 U R2" || withoutPrime === "R2 D R2 D R2";
							}
							case "half-domino": {
								const withoutPrime = commutator.insert.replaceAll("'", "");
								return withoutPrime === "R D R U R D R" || withoutPrime === "R U R D R U R";
							}
						}

						return commutator.interchange.startsWith(filter);
					});
					break;
				}
				default: {
					possibleFlashCards = flashCards;
				}
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
			possibleFlashCards.sort((a, b) => a.lastDrillUnix - b.lastDrillUnix);
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
