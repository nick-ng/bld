import z from "zod";
import { CORNER_POSITIONS, EDGE_POSITIONS } from "$lib/constants";

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
	isPublic: z.boolean(),
});

export type FlashCard = z.infer<typeof flashCardSchema>;

const dateOrDateStringSchema = z.preprocess((u) => {
	if (typeof u === "string") {
		return new Date(u);
	}

	return u;
}, z.date());

const stringOrEmptyString = z.preprocess((u) => {
	if (!u) {
		return "";
	}

	return u;
}, z.string());

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
		lastDrillUnix: 0,
	};
};

export const algorithmSchema = z.object({
	speffz_pair: z.string(),
	buffer: z.string(),
	moves: stringOrEmptyString,
	sm2_n: z.number(),
	sm2_ef: z.number(),
	sm2_i: z.number(),
	drill_time_ms: z.number(),
	last_drill_at: dateOrDateStringSchema,
	last_review_at: dateOrDateStringSchema,
	next_review_at: dateOrDateStringSchema,
});

export type Algorithm = z.infer<typeof algorithmSchema>;

export const getDefaultAlgorithm = (speffzPair: string, buffer: string): Algorithm => {
	return {
		speffz_pair: speffzPair,
		buffer,
		moves: "",
		sm2_n: 0,
		sm2_ef: 2.5,
		sm2_i: 0,
		drill_time_ms: 20_000,
		last_drill_at: new Date(0),
		last_review_at: new Date(0),
		next_review_at: new Date(),
	};
};

export const mnemonicSchema = z.object({
	speffz_pair: z.string(),
	words: stringOrEmptyString,
	image: stringOrEmptyString,
	sm2_n: z.number(),
	sm2_ef: z.number(),
	sm2_i: z.number(),
	is_public: z.boolean(),
	last_review_at: dateOrDateStringSchema,
	next_review_at: dateOrDateStringSchema,
});

export type Mnemonic = z.infer<typeof mnemonicSchema>;

export const getDefaultMnemonic = (speffzPair: string): Mnemonic => {
	return {
		speffz_pair: speffzPair,
		words: "",
		image: "",
		sm2_n: 0,
		sm2_ef: 2.5,
		sm2_i: 0,
		is_public: false,
		last_review_at: new Date(0),
		next_review_at: new Date(),
	};
};

export const letterPairSchema = z.intersection(
	mnemonicSchema,
	z.object({
		algorithms: z.record(z.string(), algorithmSchema),
	})
);

export type LetterPair = z.infer<typeof letterPairSchema>;

const positionsSchema = z.literal([...CORNER_POSITIONS, ...EDGE_POSITIONS]);

export const optionsSchema = z.object({
	flashCardTypes: z.record(
		z.string(),
		z.object({
			name: z.string(),
			samePieces: z.array(z.array(z.string())),
			bufferPiece: z.array(z.string()),
			leitnerSession: z.number().optional(),
			leitnerLastQuizUnix: z.number().optional(),
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
	leitnerBonusRetired: z.number().optional(),
	chosenBuffers: z.record(positionsSchema, z.boolean()).optional().default({ UF: true, UFR: true }),
	visibleBuffers: z
		.record(positionsSchema, z.boolean())
		.optional()
		.default({ UF: true, UFR: true }),
});

export type Options = z.infer<typeof optionsSchema>;

export const authenticationOptionsSchema = z.object({
	isUserAuthenticated: z.boolean(),
	isGuest: z.boolean(),
	username: z.string(),
	password: z.string(),
	accessToken: z.string(),
	accessTokenExpiry: z.number(),
	isAuthenticating: z.boolean(),
});

export type AuthenticationOptions = z.infer<typeof authenticationOptionsSchema>;
