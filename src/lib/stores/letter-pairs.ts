import type { LetterPair, Mnemonic, Algorithm } from "$lib/types";

import z from "zod";
import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { algorithmSchema, mnemonicSchema } from "$lib/types";
import { authFetch, joinServerPath } from "$lib/utils";

// @todo(nick-ng): use storage events to keep different tabs synced https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event

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

// @todo(nick-ng): should these load methods take unknown input and do the schema parsing?
export const loadMnemonics = (newMemos: Mnemonic[]) => {
	letterPairStore.update((letterPairs) => {
		newMemos.forEach((memo) => {
			if (letterPairs[memo["speffz_pair"]]) {
				letterPairs[memo["speffz_pair"]] = {
					...letterPairs[memo["speffz_pair"]],
					...memo,
				};
			} else {
				letterPairs[memo["speffz_pair"]] = {
					algorithms: {},
					...memo,
				};
			}
		});

		return letterPairs;
	});
};

export const loadAlgorithms = (newAlgs: Algorithm[]) => {
	letterPairStore.update((letterPairs) => {
		newAlgs.forEach((alg) => {
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

		return letterPairs;
	});
};

const fetchAndLoadMnemonics = async (): Promise<void> => {
	let keepGoing = true;
	let offset = 0;
	for (let i = 0; i < 20; i++) {
		if (!keepGoing) {
			return;
		}

		try {
			const res = await authFetch(`${joinServerPath("mnemonic")}?offset=${offset}`);
			const unknownMnemonics = await res.json();
			const parseRes = mnemonicSaveResponseSchema.safeParse(unknownMnemonics);
			if (!parseRes.success) {
				console.error("error: unexpected mnemonic response", parseRes.error);
				keepGoing = false;
				break;
			}

			// @todo(nick-ng): put data into session storage
			loadMnemonics(parseRes.data);
			if (parseRes.data.length < 50) {
				// done
				keepGoing = false;
			}

			offset = offset + parseRes.data.length;
		} catch (err) {
			console.error("error when fetching mnemonics", err);
			keepGoing = false;
			break;
		}
	}

	if (keepGoing) {
		alert("Not enough loops to load all mnemonics");
	}
};

const fetchAndLoadAlgorithms = async (): Promise<void> => {
	let keepGoing = true;
	let offset = 0;
	for (let i = 0; i < 100; i++) {
		if (!keepGoing) {
			break;
		}

		try {
			const res = await authFetch(`${joinServerPath("algorithm")}?offset=${offset}`);
			const unknownMnemonics = await res.json();
			const parseRes = algorithmSaveResponseSchema.safeParse(unknownMnemonics);
			if (!parseRes.success) {
				console.error("error: unexpected algorithm response", parseRes.error);
				keepGoing = false;
				break;
			}

			// @todo(nick-ng): put data into session storage
			loadAlgorithms(parseRes.data);
			if (parseRes.data.length < 50) {
				// done
				keepGoing = false;
			}

			offset = offset + parseRes.data.length;
		} catch (err) {
			console.error("error when fetching algorithms", err);
			keepGoing = false;
			break;
		}
	}

	if (keepGoing) {
		alert("Not enough loops to load all algorithms");
	}
};

if (browser) {
	(async () => {
		await fetchAndLoadMnemonics();
		await fetchAndLoadAlgorithms();
	})();
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

		// @todo(nick-ng): put data into session storage
		loadMnemonics(newMnemonics.data);

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

		// @todo(nick-ng): put data into session storage
		loadAlgorithms(newAlgorithm.data);

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
