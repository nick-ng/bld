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
		const temp = flatAlgs.find((a) => a.speffz_pair === sp);
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

export function getNextTimeDrillCases(flatAlgs: Algorithm[], previous: string[]) {
	const newAlgs =
		previous.length === 0
			? flatAlgs.filter((a) => a.drill_time_ms < HOUR_MS)
			: flatAlgs.filter((a) => a.drill_time_ms < HOUR_MS && !previous.includes(a.speffz_pair));

	const potentialAlgs: string[] = [];
	// newest first, oldest last
	newAlgs.sort((a, b) => {
		return b.last_drill_at.valueOf() - a.last_drill_at.valueOf();
	});
	for (let i = 0; i < 5; i++) {
		const temp = newAlgs.pop();
		if (!temp) {
			break;
		}

		potentialAlgs.push(temp.speffz_pair);
	}

	// fastest first, slowest last
	newAlgs.sort((a, b) => {
		return a.drill_time_ms - b.drill_time_ms;
	});
	for (let i = 0; i < 5; i++) {
		const temp = newAlgs.pop();
		if (!temp) {
			break;
		}

		potentialAlgs.push(temp.speffz_pair);
	}

	if (potentialAlgs.length === 0) {
		return null;
	}

	const randomIndex = Math.floor(Math.random() * potentialAlgs.length);

	return potentialAlgs[randomIndex];
}

export function getFirstTimeDrillCaseUrl(buf: string, flatAlgs: Algorithm[], durationMs: number) {
	const undrilledAlgs = flatAlgs.filter((a) => a.drill_time_ms >= HOUR_MS);

	if (undrilledAlgs.length > 0) {
		// most recently reviewed last
		undrilledAlgs.sort((a, b) => b.last_review_at.valueOf() - a.last_review_at.valueOf());

		return getDrillUrl({
			buf,
			next: [undrilledAlgs[0].speffz_pair],
			prev: [],
			endS: Math.floor((Date.now() + durationMs) / 1000),
		});
	}

	const firstCase = getNextTimeDrillCases(flatAlgs, []);
	if (firstCase) {
		return getDrillUrl({
			buf,
			next: [firstCase],
			prev: [],
			endS: Math.floor((Date.now() + durationMs) / 1000),
		});
	}

	return "";
}
