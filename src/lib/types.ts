import z from "zod";

export const flashCardSchema = z.object({
	letterPair: z.string(),
	type: z.string(), // corner, edge, etc.
	memo: z.string(),
	image: z.string(),
	commutator: z.string(),
	commConfidence: z.number(),
	memoConfidence: z.number(),
	drillTimeMs: z.number(),
	tags: z.string(),
	lastQuizUnix: z.number(),
	lastDrillUnix: z.number(),
	isPublic: z.boolean()
});

export type FlashCard = z.infer<typeof flashCardSchema>;
const getPropertyOrDefault =
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

export const defaultFlashCard = (letterPair: string, cardType: string = "corner"): FlashCard => {
	return {
		letterPair,
		type: cardType,
		memo: "",
		image: "",
		commutator: "",
		commConfidence: 0,
		memoConfidence: 0,
		drillTimeMs: 5000,
		tags: "",
		isPublic: false,
		lastQuizUnix: 0,
		lastDrillUnix: 0
	};
};

export const optionsSchema = z.object({
	isUserAuthenticated: z.boolean().optional(),
	flashCardTypes: z.record(
		z.string(),
		z.object({
			name: z.string(),
			samePieces: z.array(z.array(z.string())),
			bufferPiece: z.array(z.string()),
			leitnerSession: z.number().optional(),
			leitnerLastQuizUnix: z.number().optional()
		})
	),
	defaultFlashCardType: z.string(),

	leitnerMinReviewStandBy: z.number(),
	leitnerMinReviewRetired: z.number(),
	leitnerRetiredMaxAgeDays: z.number(),
	leitnerSessionNumbers: z.record(z.string(), z.number()).optional(),
	leitnerQuizCooldownHours: z.number(),
	leitnerLastQuizUnix: z.record(z.string(), z.number()).optional(),
	leitnerBonusStandby: z.number().optional(),
	leitnerBonusRetired: z.number().optional()
});

export type Options = z.infer<typeof optionsSchema>;
