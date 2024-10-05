export type FlashCard = {
	letterPair: string;
	type: string; // spefz-corners, chinese-edges, custom-edges, etc.
	memo: string;
	image: string;
	commutator: string;
	confidence: number; // 0 - 5. 0 = don't know, 5 = fully remember
	tags: string;
	lastQuizUnix: number;
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

	return {
		isValid: true,
		data: {
			letterPair: unknown.letterPair,
			type: unknown.type,
			memo: getFromUnknown("memo", ""),
			image: getFromUnknown("image", ""),
			commutator: getFromUnknown("commutator", ""),
			confidence: getFromUnknown("confidence", 0),
			tags: getFromUnknown("tags", ""),
			lastQuizUnix: unknown.lastQuizUnix
		}
	};
};
