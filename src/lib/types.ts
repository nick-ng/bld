import z from "zod";

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
	isPublic: boolean;
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

// @todo(nick-ng): change to zod
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
			isPublic: getFromUnknown("isPublic", false),
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
		isPublic: false,
		lastQuizUnix: 0
	};
};

export const optionsSchema = z.object({
	isUserAuthenticated: z.boolean().optional(),
	flashCardTypes: z.record(
		z.string(),
		z.object({
			name: z.string(),
			samePieces: z.array(z.array(z.string())),
			bufferPiece: z.array(z.string())
		})
	),
	defaultFlashCardType: z.string(),

	leitnerMinReviewStandBy: z.number(),
	leitnerMinReviewRetired: z.number(),
	leitnerRetiredMaxAgeDays: z.number(),
	leitnerSessionNumbers: z.record(z.string(), z.number()),
	leitnerQuizCooldownHours: z.number(),
	leitnerLastQuizUnix: z.record(z.string(), z.number())
});

export type Options = z.infer<typeof optionsSchema>;
