<script lang="ts">
	import type { LetterPair, Algorithm, Mnemonic } from "$lib/types";
	import { letterPairStoreStatus, saveAlgorithm, saveMnemonic } from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import { getTrueKeys } from "$lib/utils";
	import ImageEditor from "./image-editor.svelte";

	interface Props {
		letterPair: LetterPair;
	}

	let { letterPair }: Props = $props();

	let mnemonicChanges = $state<Partial<Mnemonic>>({});
	let algorithmsChanges = $state<Record<string, Partial<Algorithm>>>({});
	let isDirty = $derived(
		Object.keys(mnemonicChanges).length > 0 || Object.keys(algorithmsChanges).length > 0
	);
	let titleText = $derived.by(() => {
		if (isDirty) {
			return `${letterPair.speffz_pair} [+]`;
		}

		if ($letterPairStoreStatus.status === "saving") {
			return `${letterPair.speffz_pair}...`;
		}

		return letterPair.speffz_pair;
	});
</script>

<div class="mx-auto max-w-prose">
	<h2 class="text-center uppercase">{titleText}</h2>
	{#if $letterPairStoreStatus.status !== "loaded" && $letterPairStoreStatus.status !== "saving"}
		<div>{$letterPairStoreStatus.message}</div>
	{:else}
		<form
			onsubmit={async (event) => {
				event.preventDefault();
				if (!isDirty) {
					history.back();
					return;
				}
				try {
					const pendingChanges = Object.entries(algorithmsChanges).map(async ([buf, newAlg]) => {
						if (!newAlg || Object.keys(newAlg).length === 0) {
							return;
						}

						const r = await saveAlgorithm({
							speffz_pair: letterPair.speffz_pair,
							buffer: buf,
							...newAlg,
						});
						if (typeof r === "string") {
							return r;
						}

						algorithmsChanges[buf] = {};
					});
					if (Object.keys(mnemonicChanges).length > 0) {
						pendingChanges.push(
							(async () => {
								const r = await saveMnemonic({
									speffz_pair: letterPair.speffz_pair,
									...mnemonicChanges,
								});
								if (typeof r === "string") {
									return r;
								}

								mnemonicChanges = {};
							})()
						);
					}
					const saveResult = await Promise.all(pendingChanges);
					if (saveResult.some((r) => typeof r === "string")) {
						// @todo(nick-ng): handle error saving changes
					}
				} catch (err) {
					// @todo(nick-ng): handle error saving changes
				}
			}}
		>
			<table class="flash-card-editor mx-auto border-separate border-spacing-x-1">
				<tbody>
					<tr>
						<td class="text-right"
							><a href="https://bestsiteever.net/colpi/" target="pux_bld_colpi">Memo</a></td
						>
						<td class="flex flex-row"
							><input
								class={`shrink ${typeof mnemonicChanges.words === "string" ? "rounded-r-none border-r-0" : ""}`}
								type="text"
								autocomplete="off"
								name="memo"
								bind:value={
									() => mnemonicChanges.words ?? letterPair.words,
									(newWords) => {
										mnemonicChanges.words = newWords;
									}
								}
							/><button
								class={`${typeof mnemonicChanges.words === "string" ? "" : "opacity-0"} rounded-l-none border-gray-300 dark:border-gray-500`}
								type="button"
								onclick={() => {
									delete mnemonicChanges.words;
								}}>X</button
							></td
						>
					</tr>
					{#each getTrueKeys($optionsStore.chosenBuffers) as bufferLocation (bufferLocation)}
						<tr><td>{bufferLocation}</td><td>todo: make algorithm editor</td></tr>
					{/each}
					<ImageEditor
						speffzPair={letterPair.speffz_pair}
						imageUri={mnemonicChanges.image ?? letterPair.image}
						imageChanged={(newUri) => {
							mnemonicChanges.image = newUri;
						}}
					/>
					<tr
						><td class="text-right"><label for="isPublicCheckbox">Public</label></td>
						<td
							class={`px-1 ${(mnemonicChanges.is_public ?? letterPair.is_public) ? "bg-red-800" : ""}`}
							><label class="inline-block w-full" for="isPublicCheckbox"
								><input
									class=""
									type="checkbox"
									name="isPublic"
									id="isPublicCheckbox"
									checked={mnemonicChanges.is_public ?? letterPair.is_public}
									onchange={() => {
										mnemonicChanges.is_public = !(
											mnemonicChanges.is_public ?? letterPair.is_public
										);
									}}
								/>
								{#if mnemonicChanges.is_public ?? letterPair.is_public}👀{/if}</label
							></td
						>
					</tr>
				</tbody>
			</table>
			<div class="mt-1 flex w-full flex-row justify-between gap-8">
				<button
					class="flex-grow"
					type="button"
					onclick={() => {
						history.back();
					}}>Back</button
				>
				<button
					class="flex-grow"
					type="button"
					onclick={() => {
						mnemonicChanges = {};
					}}>Reset</button
				>
				<button class="flex-grow" disabled={Object.keys(mnemonicChanges).length === 0}>Save</button>
			</div>
			<details class="can-hover:block hidden">
				<summary>Debug</summary>
				<pre>{JSON.stringify(letterPair, null, 2)}</pre>
			</details>
		</form>
	{/if}
</div>
