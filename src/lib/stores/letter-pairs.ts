import type { LetterPair, Mnemonic, Algorithm } from "$lib/types";

import z from "zod";
import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { algorithmSchema, mnemonicSchema } from "$lib/types";
import { authFetch, joinServerPath } from "$lib/utils";

export type LetterPairStoreType = {
	[speffzPair: string]: LetterPair;
};

const letterPairsResponseSchema = z.object({
	algorithms: z.array(algorithmSchema),
	mnemonics: z.array(mnemonicSchema),
});

export const letterPairStore = writable<LetterPairStoreType>({});
export const letterPairStoreStatus = writable<{
	status: string;
	message: string;
	fetchStartMs: number;
	fetchEndMs: number;
}>({ status: "stand-by", message: "stand by", fetchStartMs: 0, fetchEndMs: 0 });

export const fetchLetterPairs = async (): Promise<LetterPairStoreType> => {
	const fetchStartMs = Date.now();
	try {
		letterPairStoreStatus.set({
			status: "loading",
			message: "loading",
			fetchStartMs,
			fetchEndMs: 0,
		});
		const res = await authFetch(joinServerPath("letter-pairs"), {
			cache: "default",
		});

		if (!res) {
			letterPairStoreStatus.set({
				status: "error",
				message: "no response",
				fetchStartMs,
				fetchEndMs: Date.now(),
			});

			return {};
		}

		if (!res.ok && res.status !== 401) {
			const message = `couldn't get letter pairs: ${res.status}, ${res.statusText}`;
			console.warn(message);
			letterPairStoreStatus.set({
				status: "error",
				message,
				fetchStartMs,
				fetchEndMs: Date.now(),
			});

			return {};
		}

		const contentType = res.headers.get("Content-Type")?.toLowerCase();
		if (!contentType?.includes("application/json")) {
			const resText = await res.text();
			console.warn("incorrect letter pair content type:", contentType);
			letterPairStoreStatus.set({
				status: "error",
				message: `incorrect letter pair content type: ${contentType}, instead, got: ${resText}`,
				fetchStartMs,
				fetchEndMs: Date.now(),
			});

			return {};
		}

		const unknownLetterPairs = await res.json();
		const letterPairResult = letterPairsResponseSchema.safeParse(unknownLetterPairs);
		if (!letterPairResult.success) {
			console.error("unexpected response", letterPairResult.error);
			letterPairStoreStatus.set({
				status: "error",
				message: `invalid letter pair response`,
				fetchStartMs,
				fetchEndMs: Date.now(),
			});

			return {};
		}

		const { algorithms, mnemonics } = letterPairResult.data;
		const letterPairs = mnemonics.reduce<Record<string, LetterPair>>((prev, curr) => {
			prev[curr["speffz_pair"]] = { ...curr, algorithms: {} };

			return prev;
		}, {});

		algorithms.forEach((alg) => {
			if (!letterPairs[alg["speffz_pair"]]) {
				letterPairs[alg["speffz_pair"]] = {
					speffz_pair: alg["speffz_pair"],
					words: "",
					image: "",
					sm2_n: 0,
					sm2_ef: 2.5,
					sm2_i: 0,
					last_review_at: new Date(0),
					next_review_at: new Date(),
					algorithms: {},
				};
			}

			letterPairs[alg["speffz_pair"]].algorithms[alg["buffer"]] = alg;
		});

		letterPairStore.set(letterPairs);
		letterPairStoreStatus.set({
			status: "loaded",
			message: "",
			fetchStartMs,
			fetchEndMs: Date.now(),
		});

		return letterPairs;
	} catch (err) {
		console.error("error when fetching letter pairs", err);
		letterPairStoreStatus.set({
			status: `error`,
			message: `error when fetching letter pairs: ${err}`,
			fetchStartMs,
			fetchEndMs: Date.now(),
		});
		return {};
	}
};

if (browser) {
	fetchLetterPairs();
}

export const saveMnemonic = async (partialMnemonic: Partial<Mnemonic>) => {
	// @todo(nick-ng): implement
};

export const saveAlgorithm = async (partialAlgorithm: Partial<Algorithm>) => {
	// @todo(nick-ng): implement
};
