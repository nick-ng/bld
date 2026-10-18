import type { Registration } from "./schema";

import z from "zod";
import { registrationSchema, roundSchema } from "./schema";

function getApiUrl(baseUrl: string) {
	return baseUrl.replace("worldcubeassociation.org/", "worldcubeassociation.org/api/v1/");
}

export async function fetchRegistrations(baseUrl: string | null) {
	if (typeof baseUrl !== "string") {
		return {};
	}
	const endpointUrl = `${getApiUrl(baseUrl)}/registrations`;

	const res = await fetch(endpointUrl);
	if (res.ok && res.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
		const unknown = await res.json();
		const temp = z.array(registrationSchema).parse(unknown);
		return temp.reduce<{ [id: number]: Registration }>((prev, curr) => {
			prev[curr.id] = curr;

			return prev;
		}, {});
	}

	return {};
}

// @todo(nick-ng): /live/ routes only available for integrated live results.
// @todo(nick-ng): need to use WCA Live's GraphQL endpoint to fetch results.
export async function fetchRound(baseUrl: string | null, roundId: string) {
	if (typeof baseUrl !== "string") {
		return {};
	}
	const endpointUrl = `${getApiUrl(baseUrl)}/live/rounds/${roundId}`;

	const res = await fetch(endpointUrl);
	if (res.ok && res.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
		const unknown = await res.json();
		const temp = roundSchema.parse(unknown);
		return temp;
	}

	return {};
}
