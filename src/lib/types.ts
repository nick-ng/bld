export type FlashCard = {
	letterPair: string;
	type: string; // corner, edge
	memo: string;
	image: string;
	commutator: string;
	confidence: number; // packed commutator and memo confidence. comm = high
	commConfidence: number;
	memoConfidence: number;
	tags: string;
	lastQuizUnix: number;
	fetchedAtMs?: number;
};

export const getPropertyOrDefault =
	(unknown: unknown) =>
	<T>(propertyName: string, defaultValue: T): T => {
		if (!unknown || typeof unknown !== "object" || !(propertyName in unknown)) {
			return defaultValue;
		}

		const value = (unknown as { [k: string]: unknown })[propertyName];
		if (typeof value !== typeof defaultValue) {
			return defaultValue;
		}

		return value as typeof defaultValue;
	};

export const parseFlashCard = (
	unknown: unknown
): { isValid: true; data: FlashCard } | { isValid: false } => {
	if (!unknown || typeof unknown !== "object") {
		return {
			isValid: false
		};
	}

	if (!("letterPair" in unknown && typeof unknown.letterPair === "string")) {
		return {
			isValid: false
		};
	}

	if (!("type" in unknown && typeof unknown.type === "string")) {
		return {
			isValid: false
		};
	}

	if (!("lastQuizUnix" in unknown && typeof unknown.lastQuizUnix === "number")) {
		return {
			isValid: false
		};
	}

	const getFromUnknown = getPropertyOrDefault(unknown);

	const confidence = getFromUnknown("confidence", 0);
	const memoConfidence = confidence & 3;
	let commConfidence = (confidence >> 2) & 3;
	if (unknown.lastQuizUnix < 1737104110) {
		commConfidence = 0;
	}

	return {
		isValid: true,
		data: {
			letterPair: unknown.letterPair,
			type: unknown.type,
			memo: getFromUnknown("memo", ""),
			image: getFromUnknown("image", ""),
			commutator: getFromUnknown("commutator", ""),
			confidence,
			commConfidence,
			memoConfidence,
			tags: getFromUnknown("tags", ""),
			lastQuizUnix: unknown.lastQuizUnix
		}
	};
};

export const defaultFlashCard = (letterPair: string): FlashCard => {
	return {
		letterPair,
		type: "corner",
		memo: "",
		image: "",
		commutator: "",
		confidence: 0,
		commConfidence: -1,
		memoConfidence: -1,
		tags: "",
		lastQuizUnix: 0
	};
};
