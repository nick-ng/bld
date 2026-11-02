import type { Algorithm, Options } from "$lib/types";

export const MINUTE_MS = 1000 * 60;
export const HOUR_MS = MINUTE_MS * 60;

type GetDrillUrlOptions = {
	buf: string;
	next: string[];
	prev: string[];
	endS?: number;
};
export function getDrillUrl(options: GetDrillUrlOptions) {
	const searchParams = new URLSearchParams({
		buf: options.buf,
		n: options.next.join(" "),
		p: options.prev.join(" "),
	});

	if (typeof options.endS === "number") {
		searchParams.append("e", options.endS.toFixed(0));
	}

	return `/drill2?${searchParams.toString()}`;
}

export function getFullMoves(
	options: Options,
	flatAlgs: (Algorithm & { fullMoves: string })[],
	speffzLetterPairs: string[]
) {
	const commsSoFar = speffzLetterPairs.map((sp) => {
		const temp = flatAlgs.find((a) => a.speffz_pair.toLowerCase() === sp.toLowerCase());
		if (!temp) {
			return "";
		}

		return temp.fullMoves;
	});

	const allMoves = [options.solveOrientationPreMoves, ...commsSoFar].join(" ");

	return allMoves;
}

/**
 * Returns the end drill time in milliseconds or null if it's not a timed drill
 */
export function parseDrillEndTime(endSecondsString: string | null) {
	if (typeof endSecondsString !== "string") {
		return null;
	}

	const tempSeconds = parseInt(endSecondsString, 10);
	if (isNaN(tempSeconds)) {
		return null;
	}

	return tempSeconds * 1000;
}

/**
 * "fixed" for non-timed drills
 * returns "in progress", "over", "fixed"
 */
export function getTimeDrillStatus(endSecondsString: string | null) {
	console.log("endSecondsString", endSecondsString);
	const drillEndTime = parseDrillEndTime(endSecondsString);
	if (typeof drillEndTime !== "number") {
		return "fixed";
	}

	if (drillEndTime < Date.now()) {
		return "over";
	}

	return "in progress";
}

const SLOW_THRESHOLD = 0.9; // fraction of slowest drill time that can be chosen for next case
export function getNextTimeDrillCases(flatAlgs: Algorithm[], previous: string[], options: Options) {
	const potentialAlgs: string[] = [];
	const undrilledAlgs: Algorithm[] = [];
	const drilledAlgs: Algorithm[] = [];
	for (let i = 0; i < flatAlgs.length; i++) {
		if (previous.length === 0 || !previous.includes(flatAlgs[i].speffz_pair)) {
			if (flatAlgs[i].drill_time_ms < HOUR_MS) {
				drilledAlgs.push(flatAlgs[i]);
			} else {
				undrilledAlgs.push(flatAlgs[i]);
			}
		}
	}

	// fastest first, slowest last
	drilledAlgs.sort((a, b) => {
		return getDecayedDrillTime(a) - getDecayedDrillTime(b);
	});
	const slowest = drilledAlgs.pop();
	const slowestDecayedDrillTimeMs = getDecayedDrillTime(slowest);
	if (slowest && slowestDecayedDrillTimeMs > options.drillTarget * 1000) {
		potentialAlgs.push(slowest.speffz_pair);
		// up to 6 cases within
		for (let i = 0; i < 5; i++) {
			const temp = drilledAlgs.pop();
			if (!temp) {
				break;
			}

			if (getDecayedDrillTime(temp) < options.drillTarget * 1000) {
				break;
			}

			if (getDecayedDrillTime(temp) < slowestDecayedDrillTimeMs * SLOW_THRESHOLD) {
				break;
			}

			potentialAlgs.push(temp.speffz_pair);
		}
	}

	// most recently reviewed last
	undrilledAlgs.sort((a, b) => {
		return b.last_review_at.valueOf() - a.last_review_at.valueOf();
	});

	const potentialUndrilled: string[] = [];
	for (let i = 0; i < 5; i++) {
		const temp = undrilledAlgs.pop();
		if (!temp) {
			break;
		}

		potentialUndrilled.push(temp.speffz_pair);
	}

	if (potentialUndrilled.length >= 1) {
		const copiesCount = Math.max(1, potentialAlgs.length / potentialUndrilled.length);
		for (let i = 0; i < copiesCount; i++) {
			potentialAlgs.push(...potentialUndrilled);
		}
	}

	if (potentialAlgs.length === 0) {
		// most recently drilled last
		// make new copy because drilledAlgs will be missing the slowest alg
		const copiedAlgs = [...flatAlgs].sort(
			(a, b) => b.last_drill_at.valueOf() - a.last_drill_at.valueOf()
		);

		const oldest = copiedAlgs.pop();
		if (!oldest) {
			return null;
		}

		potentialAlgs.push(oldest.speffz_pair);

		for (let i = 0; i < 5; i++) {
			const temp = copiedAlgs.pop();
			if (!temp) {
				break;
			}

			// if temp's timestamp is greater than oldest's timestamp + 48 hours, break
			if (temp.last_drill_at.valueOf() > oldest.last_drill_at.valueOf() + 48 * HOUR_MS) {
				break;
			}

			potentialAlgs.push(temp.speffz_pair);
		}
	}

	const randomIndex = Math.floor(Math.random() * potentialAlgs.length);

	return potentialAlgs[randomIndex];
}

export function getFirstTimeDrillCaseUrl(
	buf: string,
	flatAlgs: Algorithm[],
	options: Options,
	durationMs: number
) {
	const firstCase = getNextTimeDrillCases(flatAlgs, [], options);
	if (!firstCase) {
		return "";
	}

	return getDrillUrl({
		buf,
		next: [firstCase],
		prev: [],
		endS: Math.floor((Date.now() + durationMs) / 1000),
	});
}

const DAYS_PER_MS = 30 / 10; // 30 days per 0.01 s
function getDecayedDrillTime(alg: Algorithm | undefined): number {
	if (!alg) {
		return 0;
	}
	const ageDays = (Date.now() - alg.last_drill_at.valueOf()) / (1000 * 60 * 60 * 24);
	const extraMs = Math.floor(ageDays / DAYS_PER_MS);

	return alg.drill_time_ms + extraMs;
}

const NEW_TIME_WEIGHT = 0.6;
export function getNewDrillTime(
	oldDrillTimeMs: number,
	newDrillTimeMs: number,
	correct: boolean,
	options: Options
) {
	if (!correct) {
		const baseWrongDrillTimeMs = Math.max(oldDrillTimeMs, newDrillTimeMs);
		if (baseWrongDrillTimeMs < options.drillTarget * 1000) {
			return options.drillTarget * 1000 * 1.01;
		}

		return Math.min(Math.round(baseWrongDrillTimeMs * 1.1), baseWrongDrillTimeMs + 2000, HOUR_MS);
	}

	return Math.min(
		Math.round(newDrillTimeMs * NEW_TIME_WEIGHT + oldDrillTimeMs * (1 - NEW_TIME_WEIGHT)),
		newDrillTimeMs * 2
	);
}
