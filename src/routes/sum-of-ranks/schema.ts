import z from "zod";

export const registrationSchema = z.object({
	id: z.number(),
	user: z.object({
		id: z.number(),
		wca_id: z.string().nullable(),
		name: z.string(),
		gender: z.string(),
		country_iso2: z.string(),
		country: z.object({
			id: z.string(),
			name: z.string(),
			continent_id: z.string(),
			iso2: z.string(),
		}),
		class: z.string(),
	}),
	user_id: z.number(),
	registrant_id: z.number(),
	competing: z.object({
		event_ids: z.array(z.string()),
		comments: z.string().nullable(),
	}),
});

export type Registration = z.infer<typeof registrationSchema>;

export const roundCompetitorSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	registrant_id: z.number(),
	name: z.string(),
	country_iso2: z.string(),
	wca_id: z.string().nullable().optional(),
});

export const roundResultSchema = z.object({
	global_pos: z.number(),
	local_pos: z.number(),
	registration_id: z.number(),
	best: z.number(),
	average: z.number(),
	single_record_tag: z.string().nullable(),
	average_record_tag: z.string().nullable(),
	advancing: z.boolean(),
	last_attempt_entered_at: z.string(),
	advancing_questionable: z.boolean(),
	event_id: z.string(),
	attempts: z.array(
		z.object({
			attempt_number: z.number(),
			value: z.number(),
		})
	),
});

export const roundSchema = z.object({
	id: z.string(),
	format: z.string(),
	timeLimit: z.object({
		centiseconds: z.number(),
		cumulativeRoundIds: z.array(z.string()),
	}),
	scrambleSetCount: z.number(),
	linkedRounds: z.array(z.string()),
	participationRuleset: z.object({
		participationSource: z.object({
			type: z.string(),
		}),
		reservedPlaces: z.number().nullable(),
	}),
	round_id: z.number(),
	competitors: z.array(roundCompetitorSchema),

	results: z.array(roundResultSchema),

	state_hash: z.string(),
	linked_round_ids: z.array(z.string()),
	completed_competitors: z.number(),
});
