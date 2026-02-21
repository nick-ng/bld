import type { LetterPair, Options } from "$lib/types";

import { isSpeffzPairValid } from "$lib/utils";

export function getVisibleFlashCardComponents(
	category: string,
	hideAnswer: boolean,
	options: Options
): {
	hideWords: boolean;
	hideImage: boolean;
	selectedBuffers: string[];
} {
	switch (category) {
		case "memo": {
			return {
				hideWords: hideAnswer,
				hideImage: hideAnswer,
				selectedBuffers: [],
			};
		}
		default: {
			return {
				hideWords: !options.showImagesForAlgs,
				hideImage: !options.showImagesForAlgs,
				selectedBuffers: hideAnswer ? [] : [category],
			};
		}
	}
}

export function getQuizKit(
	category: string,
	subcategory?: string | null
): {
	category: string;
	subcategory: string | null;
	filterFunc: (lp: LetterPair) => boolean;
	getNextReview: (lp: LetterPair) => Date;
	getNextLetters: (letterPairs: LetterPair[], randH?: number) => LetterPair[];
	getSMStats: (lp: LetterPair) => { sm2_n: number; sm2_ef: number; sm2_i: number };
	title: string;
	quizType: "memo" | "alg";
	sortString: string;
} {
	const defaultSMStats = { sm2_n: 0, sm2_ef: 2.5, sm2_i: 0 };
	switch (category) {
		case "orozco-edges": {
			const getNextReview = (lp: LetterPair) => lp?.algorithms?.UF?.next_review_at || new Date();
			const getSMStats = (lp: LetterPair) => lp.algorithms?.UF || defaultSMStats;
			const filterFunc = (lp: LetterPair) =>
				(lp.speffz_pair.includes("a") || lp.speffz_pair.includes("q")) &&
				lp?.algorithms?.UF?.moves?.length > 2;
			return {
				category,
				subcategory: null,
				filterFunc,
				getNextReview,
				getNextLetters: getGetNextLetters(filterFunc, getNextReview),
				getSMStats,
				title: "Orozco, Edges",
				quizType: "alg",
				sortString: "zz-orozco-edges",
			};
		}
		case "orozco-corners": {
			const getNextReview = (lp: LetterPair) => lp?.algorithms?.UFR?.next_review_at || new Date();
			const getSMStats = (lp: LetterPair) => lp.algorithms?.UFR || defaultSMStats;
			const filterFunc = (lp: LetterPair) =>
				lp.speffz_pair.includes("b") && lp?.algorithms?.UFR?.moves?.length > 2;
			return {
				category,
				subcategory: null,
				filterFunc,
				getNextReview,
				getNextLetters: getGetNextLetters(filterFunc, getNextReview),
				getSMStats,
				title: "Orozco, Corners",
				quizType: "alg",
				sortString: "zz-orozco-corners",
			};
		}
		case "UF": {
			const getNextReview = (lp: LetterPair) =>
				lp?.algorithms?.[category]?.next_review_at || new Date();
			const getSMStats = (lp: LetterPair) => lp.algorithms?.[category] || defaultSMStats;
			switch (subcategory) {
				case "algorithm": {
					const filterFunc = (lp: LetterPair) =>
						lp?.algorithms?.UF?.moves?.length > 2 &&
						!(
							lp?.algorithms?.[category]?.moves?.includes(",") ||
							lp?.algorithms?.[category]?.moves?.includes("/")
						);
					return {
						category,
						subcategory: subcategory || null,
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats,
						title: `${category} Buffer, Algorithms`,
						quizType: "alg",
						sortString: "UF !algorithms",
					};
				}
				default: {
					if (subcategory?.length === 2 && subcategory.includes("*")) {
						// starts with/ends with auto subcategory
						const startsWith = subcategory[1] === "*";
						const filterFunc = (lp: LetterPair) =>
							(startsWith
								? lp.speffz_pair.startsWith(subcategory[0])
								: lp.speffz_pair.endsWith(subcategory[1])) &&
							lp?.algorithms?.[category]?.moves?.length > 2;
						return {
							category,
							subcategory: subcategory || null,
							filterFunc,
							getNextReview,
							getNextLetters: getGetNextLetters(filterFunc, getNextReview),
							getSMStats,
							title: `${category} Buffer, ${subcategory.toUpperCase()}`,
							quizType: "alg",
							sortString: `${category} Buffer, ${subcategory.toUpperCase()}`,
						};
					}
					const filterFunc = (lp: LetterPair) => lp?.algorithms?.[category]?.moves?.length > 2;
					return {
						category,
						subcategory: subcategory || null,
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats,
						title: `${category} Buffer`,
						quizType: "alg",
						sortString: `${category} !!`,
					};
				}
			}
		}
		case "UFR": {
			const getNextReview = (lp: LetterPair) =>
				lp?.algorithms?.[category]?.next_review_at || new Date();
			const getSMStats = (lp: LetterPair) => lp.algorithms?.[category] || defaultSMStats;
			switch (subcategory) {
				default: {
					if (subcategory?.length === 2 && subcategory.includes("*")) {
						// starts with/ends with auto subcategory
						const startsWith = subcategory[1] === "*";
						const filterFunc = (lp: LetterPair) =>
							(startsWith
								? lp.speffz_pair.startsWith(subcategory[0])
								: lp.speffz_pair.endsWith(subcategory[1])) &&
							lp?.algorithms?.[category]?.moves?.length > 2;
						return {
							category,
							subcategory: subcategory || null,
							filterFunc,
							getNextReview,
							getNextLetters: getGetNextLetters(filterFunc, getNextReview),
							getSMStats,
							title: `${category} Buffer, ${subcategory.toUpperCase()}`,
							quizType: "alg",
							sortString: `${category} Buffer, ${subcategory.toUpperCase()}`,
						};
					}

					const filterFunc = (lp: LetterPair) => lp?.algorithms?.[category]?.moves?.length > 2;
					return {
						category,
						subcategory: subcategory || null,
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats,
						title: `${category} Buffer`,
						quizType: "alg",
						sortString: `${category} !!`,
					};
				}
			}
		}
		default: {
			// memo
			const getNextReview = (lp: LetterPair) => lp.next_review_at;
			const getSMStats = (lp: LetterPair) => lp || defaultSMStats;
			switch (subcategory) {
				default: {
					// subcategory is buffers separated by ,
					const buffers = (subcategory || "").split(",");
					const filterFunc = (lp: LetterPair) =>
						(lp.words.length > 0 || lp.image.length > 0) &&
						isSpeffzPairValid(lp.speffz_pair, buffers);
					return {
						category,
						subcategory: subcategory || null,
						filterFunc,
						getNextReview,
						getNextLetters: getGetNextLetters(filterFunc, getNextReview),
						getSMStats,
						title: "Images",
						quizType: "memo",
						sortString: "!Images",
					};
				}
			}
		}
	}
}

export function getGetNextLetters(
	filterFunc: (lp: LetterPair) => boolean,
	getNextReview: (lp: LetterPair) => Date
): (letterPairs: LetterPair[], randH?: number) => LetterPair[] {
	return (letterPairs: LetterPair[], randH = 3) => {
		const now = new Date();
		const sortCache: Record<string, number> = {};
		const possibleCards = letterPairs
			.filter((lp) => getNextReview(lp) <= now && filterFunc(lp))
			.sort((a, b) => {
				// randomise the next review time slightly so they aren't always in the same order
				// store in a cache so the sort works
				if (!sortCache[a.speffz_pair]) {
					sortCache[a.speffz_pair] =
						getNextReview(a).valueOf() + Math.random() * randH * 3_600_000 + 1;
				}
				if (!sortCache[b.speffz_pair]) {
					sortCache[b.speffz_pair] =
						getNextReview(b).valueOf() + Math.random() * randH * 3_600_000 + 1;
				}
				return sortCache[a.speffz_pair] - sortCache[b.speffz_pair];
			});

		return possibleCards;
	};
}

const correctIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const correctAllowance = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
export function superMemo2(
	userGradeQ: number,
	input: { sm2_n: number; sm2_ef: number; sm2_i: number },
	targetEf = -1
): { sm2_n: number; sm2_ef: number; sm2_i: number; last_review_at: Date; next_review_at: Date } {
	const output = {
		sm2_n: input.sm2_n,
		sm2_ef: input.sm2_ef,
		sm2_i: input.sm2_i,
		last_review_at: new Date(),
		next_review_at: new Date(),
	};
	if (userGradeQ >= 3) {
		if (input.sm2_n === 0) {
			output.sm2_i = 1;
		} else if (input.sm2_n === 1) {
			output.sm2_i = 6;
		} else {
			output.sm2_i = Math.round(input.sm2_i * input.sm2_ef);
		}

		output.sm2_n = Math.round(input.sm2_n + 1);
		// 1 day per sm2_i minus 8 hours so you don't have to do the quiz at the exact time and it doesn't become later and later
		output.next_review_at = new Date(
			Date.now() + output.sm2_i * correctIncrement - correctAllowance
		);
	} else {
		output.sm2_n = 0;
		output.sm2_i = 1;
	}

	output.sm2_ef = input.sm2_ef + (0.1 - (5 - userGradeQ) * (0.08 + (5 - userGradeQ) * 0.02));
	if (output.sm2_ef < 1.3) {
		output.sm2_ef = 1.3;
	} else if (targetEf > 0 && userGradeQ === 5 && output.sm2_ef < targetEf) {
		const bonus = 0.1 * ((output.sm2_ef - 1.3) / (targetEf - 1.3));
		output.sm2_ef = output.sm2_ef + bonus;
	}

	return output;
}
