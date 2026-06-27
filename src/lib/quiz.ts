import type { LetterPair, Options } from "$lib/types";

import { isSpeffzPairValid } from "$lib/utils";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type QuizLetters = {
	next: LetterPair[];
	retry: LetterPair[];
	old: LetterPair[];
	total: number;
};

export type SMStats = {
	sm2_n: number;
	sm2_ef: number;
	sm2_i: number;
	last_review_at: Date;
	next_review_at: Date;
};

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
	subcategory: string | null,
	options: Options
): {
	category: string;
	subcategory: string | null;
	filterFunc: (lp: LetterPair) => boolean;
	getLastReview: (lp: LetterPair) => Date;
	getNextReview: (lp: LetterPair) => Date;
	getNextLetters: (letterPairs: LetterPair[], now: Date, limit: number) => QuizLetters;
	getSMStats: (lp: LetterPair) => SMStats;
	title: string;
	quizType: "memo" | "alg";
	sortString: string;
} {
	const defaultSMStats: SMStats = {
		sm2_n: 0,
		sm2_ef: 2.5,
		sm2_i: 0,
		last_review_at: new Date(0),
		next_review_at: new Date(0),
	};
	switch (category) {
		case "orozco-edges": {
			const getLastReview = (lp: LetterPair) => lp?.algorithms?.UF?.last_review_at || new Date();
			const getNextReview = (lp: LetterPair) => lp?.algorithms?.UF?.next_review_at || new Date();
			const getSMStats = (lp: LetterPair) => lp.algorithms?.UF || defaultSMStats;
			const filterFunc = (lp: LetterPair) =>
				(lp.speffz_pair.includes("a") || lp.speffz_pair.includes("q")) &&
				lp?.algorithms?.UF?.moves?.length > 2;
			return {
				category,
				subcategory: null,
				filterFunc,
				getLastReview,
				getNextReview,
				getNextLetters: getGetNextLetters(
					filterFunc,
					getLastReview,
					getNextReview,
					getSMStats,
					options
				),
				getSMStats,
				title: "ORZ, Edges",
				quizType: "alg",
				sortString: "zz-orozco-edges",
			};
		}
		case "orozco-corners": {
			const getLastReview = (lp: LetterPair) => lp?.algorithms?.UFR?.last_review_at || new Date();
			const getNextReview = (lp: LetterPair) => lp?.algorithms?.UFR?.next_review_at || new Date();
			const getSMStats = (lp: LetterPair) => lp.algorithms?.UFR || defaultSMStats;
			const filterFunc = (lp: LetterPair) =>
				lp.speffz_pair.includes("b") && lp?.algorithms?.UFR?.moves?.length > 2;
			return {
				category,
				subcategory: null,
				filterFunc,
				getLastReview,
				getNextReview,
				getNextLetters: getGetNextLetters(
					filterFunc,
					getLastReview,
					getNextReview,
					getSMStats,
					options
				),
				getSMStats,
				title: "ORZ, Corners",
				quizType: "alg",
				sortString: "zz-orozco-corners",
			};
		}
		case "UF": {
			const getLastReview = (lp: LetterPair) =>
				lp?.algorithms?.[category]?.last_review_at || new Date();
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
						getLastReview,
						getNextReview,
						getNextLetters: getGetNextLetters(
							filterFunc,
							getLastReview,
							getNextReview,
							getSMStats,
							options
						),
						getSMStats,
						title: `${category} Buf, Algs`,
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
							getLastReview,
							getNextReview,
							getNextLetters: getGetNextLetters(
								filterFunc,
								getLastReview,
								getNextReview,
								getSMStats,
								options
							),
							getSMStats,
							title: `${category} Buf, ${subcategory.toUpperCase()}`,
							quizType: "alg",
							sortString: `${category} Buf, ${subcategory.toUpperCase()}`,
						};
					}
					const filterFunc = (lp: LetterPair) => lp?.algorithms?.[category]?.moves?.length > 2;
					return {
						category,
						subcategory: subcategory || null,
						filterFunc,
						getLastReview,
						getNextReview,
						getNextLetters: getGetNextLetters(
							filterFunc,
							getLastReview,
							getNextReview,
							getSMStats,
							options
						),
						getSMStats,
						title: `${category} Buf`,
						quizType: "alg",
						sortString: `${category} !!`,
					};
				}
			}
		}
		case "UFR": {
			const getLastReview = (lp: LetterPair) =>
				lp?.algorithms?.[category]?.last_review_at || new Date();
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
							getLastReview,
							getNextReview,
							getNextLetters: getGetNextLetters(
								filterFunc,
								getLastReview,
								getNextReview,
								getSMStats,
								options
							),
							getSMStats,
							title: `${category} Buf, ${subcategory.toUpperCase()}`,
							quizType: "alg",
							sortString: `${category} Buf, ${subcategory.toUpperCase()}`,
						};
					}

					const filterFunc = (lp: LetterPair) => lp?.algorithms?.[category]?.moves?.length > 2;
					return {
						category,
						subcategory: subcategory || null,
						filterFunc,
						getLastReview,
						getNextReview,
						getNextLetters: getGetNextLetters(
							filterFunc,
							getLastReview,
							getNextReview,
							getSMStats,
							options
						),
						getSMStats,
						title: `${category} Buf`,
						quizType: "alg",
						sortString: `${category} !!`,
					};
				}
			}
		}
		default: {
			// memo
			const getLastReview = (lp: LetterPair) => lp.last_review_at;
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
						getLastReview,
						getNextReview,
						getNextLetters: getGetNextLetters(
							filterFunc,
							getLastReview,
							getNextReview,
							getSMStats,
							options
						),
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
	getLastReview: (lp: LetterPair) => Date,
	getNextReview: (lp: LetterPair) => Date,
	getSMStats: (lp: LetterPair) => SMStats,
	options: Options
): (letterPairs: LetterPair[], now: Date, limit: number) => QuizLetters {
	return (letterPairs: LetterPair[], now: Date, limit: number) => {
		const sortCache: Record<string, number> = {};
		const filteredLetters = letterPairs
			.filter((lp) => getNextReview(lp) <= now && filterFunc(lp))
			.sort((a, b) => {
				const sm2A = getSMStats(a);
				const sm2B = getSMStats(b);
				if (sm2A.sm2_i === sm2B.sm2_i) {
					// randomise the next review time slightly so they aren't always in the same order
					// store in a cache so the sort works
					if (!sortCache[a.speffz_pair]) {
						sortCache[a.speffz_pair] = Math.random();
					}
					if (!sortCache[b.speffz_pair]) {
						sortCache[b.speffz_pair] = Math.random();
					}
					return sortCache[a.speffz_pair] - sortCache[b.speffz_pair];
				}

				return sm2B.sm2_i - sm2A.sm2_i;
			});

		const nextLetters = filteredLetters.filter((lp) => {
			const smStats = getSMStats(lp);
			// sm2_i = 0.5 if we got the card wrong (Q < 3)
			if (smStats.sm2_i > 0.2 && smStats.sm2_i < 0.8) {
				return false;
			}

			return true;
		});

		const retryLetters = filteredLetters
			.filter((lp) => {
				const smStats = getSMStats(lp);
				// sm2_i = 0.5 if we got the card wrong (Q < 3)
				if (smStats.sm2_i > 0.2 && smStats.sm2_i < 0.8) {
					return true;
				}

				return false;
			})
			.sort((a, b) => {
				return getLastReview(a).valueOf() - getLastReview(b).valueOf();
			});

		const oldLetters = letterPairs
			.filter((lp) => {
				const isOld = Date.now() - getLastReview(lp).valueOf() > options.oldThresholdDays * DAY_MS;
				return isOld && filterFunc(lp);
			})
			.sort((a, b) => {
				return getLastReview(a).valueOf() - getLastReview(b).valueOf();
			});

		if (limit > 0) {
			const quizzedToday = letterPairs.filter(
				(lp) => filterFunc(lp) && getLastReview(lp).valueOf() > getStartOfTodayMs()
			).length;
			if (limit - quizzedToday < 1) {
				return {
					next: [],
					retry: retryLetters,
					old: oldLetters,
					total: retryLetters.length,
				};
			}

			const actualNext = nextLetters.slice(0, limit - quizzedToday);
			return {
				next: actualNext,
				retry: retryLetters,
				old: oldLetters,
				total: actualNext.length + retryLetters.length,
			};
		}

		return {
			next: nextLetters,
			retry: retryLetters,
			old: oldLetters,
			total: nextLetters.length + retryLetters.length,
		};
	};
}

const correctIncrement = DAY_MS; // 1 day in milliseconds
const correctAllowance = 8 * HOUR_MS; // 8 hours in milliseconds
export function superMemo2(userGradeQ: number, input: SMStats, targetEf = -1): SMStats {
	const output = {
		sm2_n: input.sm2_n,
		sm2_ef: input.sm2_ef,
		sm2_i: input.sm2_i,
		last_review_at: new Date(),
		next_review_at: new Date(),
	};
	if (userGradeQ >= 3) {
		if (input.next_review_at > new Date()) {
			// quiz wasn't due yet so don't change any stats. bump next review at and return
			output.next_review_at = new Date(
				Date.now() + output.sm2_i * correctIncrement - correctAllowance
			);

			return output;
		}
		if (input.sm2_n === 0) {
			output.sm2_i = 1;
		} else if (input.sm2_n === 1) {
			output.sm2_i = 2;
		} else if (input.sm2_n === 2) {
			output.sm2_i = 5;
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
		output.sm2_i = 0.5; // hack. if i < 0.2, card is new
	}

	output.sm2_ef = input.sm2_ef + (0.1 - (5 - userGradeQ) * (0.08 + (5 - userGradeQ) * 0.02));
	if (output.sm2_ef < 1.3) {
		output.sm2_ef = 1.3;
	} else if (targetEf > 0 && userGradeQ === 5 && output.sm2_ef < targetEf) {
		// "ease hell" hack
		const bonus = 0.1 * ((output.sm2_ef - 1.3) / (targetEf - 1.3));
		output.sm2_ef = output.sm2_ef + bonus;
	}

	return output;
}

export function getStartOfTodayMs() {
	const today = new Date();
	today.setHours(5, 0, 0, 0);
	const todayMs = today.valueOf();
	return todayMs;
}
