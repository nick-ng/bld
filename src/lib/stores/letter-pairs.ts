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

const mnemonicSaveResponseSchema = z.array(mnemonicSchema);
const algorithmSaveResponseSchema = z.array(algorithmSchema);

export const letterPairStore = writable<LetterPairStoreType>({});
export const letterPairStoreStatus = writable<{
	status: "empty" | "loading" | "loaded" | "saving" | "error";
	source: string;
	message: string;
	fetchStartMs: number;
	fetchEndMs: number;
}>({ status: "empty", source: "empty", message: "stand by", fetchStartMs: 0, fetchEndMs: 0 });

export const fetchLetterPairs = async (): Promise<LetterPairStoreType> => {
	try {
		letterPairStoreStatus.update((prev) => ({
			...prev,
			status: "loading",
			message: "Loading",
			fetchStartMs: Date.now(),
			fetchEndMs: 0,
		}));
		const res = await authFetch(joinServerPath("letter-pairs"), {
			cache: "default",
		});

		if (!res) {
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "No response",
				fetchEndMs: Date.now(),
			}));

			return {};
		}

		if (!res.ok && res.status !== 401) {
			const message = `Couldn't get letter pairs: ${res.status}, ${res.statusText}`;
			console.warn(message);
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message,
				fetchEndMs: Date.now(),
			}));

			return {};
		}

		const contentType = res.headers.get("Content-Type")?.toLowerCase();
		if (!contentType?.includes("application/json")) {
			const resText = await res.text();
			console.warn("Incorrect letter pair content type:", contentType);
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: `Incorrect letter pair content type: ${contentType}, instead, got: ${resText}`,
				fetchEndMs: Date.now(),
			}));

			return {};
		}

		const unknownLetterPairs = await res.json();
		const letterPairResult = letterPairsResponseSchema.safeParse(unknownLetterPairs);
		if (!letterPairResult.success) {
			console.error("unexpected response", letterPairResult.error);
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: `Invalid letter pair response`,
				fetchEndMs: Date.now(),
			}));

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
					is_public: false,
					last_review_at: new Date(0),
					next_review_at: new Date(),
					algorithms: {},
				};
			}

			letterPairs[alg["speffz_pair"]].algorithms[alg["buffer"]] = alg;
		});

		letterPairStore.set(letterPairs);
		letterPairStoreStatus.update((prev) => ({
			...prev,
			status: "loaded",
			source: "kerver",
			message: "",
			fetchEndMs: Date.now(),
		}));

		return letterPairs;
	} catch (err) {
		console.error("error when fetching letter pairs", err);
		letterPairStoreStatus.update((prev) => ({
			...prev,
			status: "error",
			message: `Error when fetching letter pairs: ${err}`,
			fetchEndMs: Date.now(),
		}));
		return {};
	}
};

if (browser) {
	fetchLetterPairs();
}

export const saveMnemonic = async (
	partialMnemonic: Partial<Mnemonic> & { speffz_pair: string }
): Promise<string | void> => {
	letterPairStoreStatus.update((prev) => ({
		...prev,
		status: "saving",
		source: "cache",
		message: "",
		fetchStartMs: Date.now(),
	}));
	try {
		const res = await authFetch(joinServerPath("/mnemonic"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(partialMnemonic),
		});

		if (!res || !res.ok) {
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "Error",
				fetchEndMs: Date.now(),
			}));
			return partialMnemonic.speffz_pair;
		}

		const contentType = res.headers.get("Content-Type")?.toLowerCase();
		if (!contentType?.includes("application/json")) {
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "Error, unexpected content type",
				fetchEndMs: Date.now(),
			}));
			return partialMnemonic.speffz_pair;
		}

		const unknownMnemonic = await res.json();
		const newMnemonics = mnemonicSaveResponseSchema.safeParse(unknownMnemonic);
		if (!newMnemonics.success) {
			console.error("error, unexpected response when saving mnemonic", newMnemonics.error);
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "Error, unexpected response when saving mnemonic",
				fetchEndMs: Date.now(),
			}));
			return partialMnemonic.speffz_pair;
		}

		newMnemonics.data.forEach((mem) => {
			letterPairStore.update((prev) => {
				prev[mem.speffz_pair] = { ...prev[mem.speffz_pair], ...mem };
				return prev;
			});
		});
		letterPairStoreStatus.update((prev) => ({
			...prev,
			status: "loaded",
			source: "server",
			message: "",
			fetchEndMs: Date.now(),
		}));
	} catch (err) {
		console.error("error saving mnemonic", err);

		return partialMnemonic.speffz_pair;
	}
};

export const saveAlgorithm = async (
	partialAlgorithm: Partial<Algorithm> & { speffz_pair: string; buffer: string }
): Promise<string | void> => {
	const algId = `${partialAlgorithm.buffer}:${partialAlgorithm.speffz_pair}`;
	letterPairStoreStatus.update((prev) => ({
		...prev,
		status: "saving",
		source: "cache",
		message: "",
		fetchStartMs: Date.now(),
	}));
	try {
		const res = await authFetch(joinServerPath("/algorithm"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(partialAlgorithm),
		});

		if (!res || !res.ok) {
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "Error",
				fetchEndMs: Date.now(),
			}));
			return algId;
		}

		const contentType = res.headers.get("Content-Type")?.toLowerCase();
		if (!contentType?.includes("application/json")) {
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "Error, unexpected content type",
				fetchEndMs: Date.now(),
			}));
			return algId;
		}

		const unknownAlgorithm = await res.json();
		const newAlgorithm = algorithmSaveResponseSchema.safeParse(unknownAlgorithm);
		if (!newAlgorithm.success) {
			console.error("error, unexpected response when saving algorithm", newAlgorithm.error);
			letterPairStoreStatus.update((prev) => ({
				...prev,
				status: "error",
				message: "Error, unexpected response when saving algorithm",
				fetchEndMs: Date.now(),
			}));
			return algId;
		}

		newAlgorithm.data.forEach((alg) => {
			letterPairStore.update((prev) => {
				if (!prev[alg.speffz_pair]) {
					prev[alg.speffz_pair] = {
						speffz_pair: alg.speffz_pair,
						words: "",
						image: "",
						sm2_n: 0,
						sm2_ef: 2.5,
						sm2_i: 0,
						is_public: false,
						last_review_at: new Date(0),
						next_review_at: new Date(),
						algorithms: { [alg.buffer]: alg },
					};
				} else {
					prev[alg.speffz_pair].algorithms[alg.buffer] = alg;
				}

				return prev;
			});
		});
		letterPairStoreStatus.update((prev) => ({
			...prev,
			status: "loaded",
			source: "server",
			message: "",
			fetchEndMs: Date.now(),
		}));
	} catch (err) {
		console.error("error saving mnemonic", err);
		return algId;
	}
};
