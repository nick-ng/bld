import type { MbldSession } from "$lib/types";

import z from "zod";
import localforage from "localforage";
import { browser } from "$app/environment";
import { writable } from "svelte/store";
import { mbldSessionSchema } from "$lib/types";
import { MBLD_STORE_KEY } from "$lib/constants";

const storeSchema = z.array(mbldSessionSchema);

export const mbldStore = writable<MbldSession[]>([]);

if (browser) {
	const loadMbld = async () => {
		const tempMbld = (await localforage.getItem(MBLD_STORE_KEY)) as string;
		const parsedMbld = storeSchema.safeParse(JSON.parse(tempMbld || ""));
		if (!parsedMbld.success) {
			return;
		}

		mbldStore.set(parsedMbld.data);
	};

	loadMbld();

	mbldStore.subscribe((newMbld) => {
		localforage.setItem(MBLD_STORE_KEY, JSON.stringify(newMbld));
	});
}
