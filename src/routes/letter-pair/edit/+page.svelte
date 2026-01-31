<script lang="ts">
	import type { Algorithm, Mnemonic } from "$lib/types";
	import { page } from "$app/state";
	import { getDefaultMnemonic } from "$lib/types";
	import {
		letterPairStore,
		letterPairStoreStatus,
		saveAlgorithm,
		saveMnemonic,
	} from "$lib/stores/letter-pairs";

	let chosenSpeffzPair = $derived(page.url.searchParams.get("sp") || "");
	let letterPair = $derived(
		$letterPairStore[chosenSpeffzPair] || {
			...getDefaultMnemonic(chosenSpeffzPair),
			algorithms: {},
		}
	);
	let mnemonicChanges = $state<Partial<Mnemonic>>({});
	let algorithmsChanges = $state<Partial<Record<string, Algorithm>>>({});
	let isDirty = $derived(
		Object.keys(mnemonicChanges).length > 0 || Object.keys(algorithmsChanges).length > 0
	);
</script>

<div class="mx-auto max-w-prose">
	<h2 class="text-center uppercase">{letterPair.speffz_pair}{isDirty ? " [+]" : ""}</h2>
	{#if $letterPairStoreStatus.status !== "loaded"}
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
					const pendingChanges = Object.values(algorithmsChanges).map((newAlg) => {
						if (!newAlg || Object.keys(newAlg).length === 0) {
							return;
						}

						return saveAlgorithm(mnemonicChanges);
					});
					if (Object.keys(mnemonicChanges).length > 0) {
						pendingChanges.push(saveMnemonic(mnemonicChanges));
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
						<td
							><input
								class="inline-block w-full"
								type="text"
								autocomplete="off"
								name="memo"
								bind:value={
									() => mnemonicChanges.words ?? letterPair.words,
									(newWords) => {
										mnemonicChanges.words = newWords;
									}
								}
							/><button class="inline-block" type="button">X</button></td
						>
					</tr>

					<tr class={letterPair.is_public ? "font-bold text-red-800 dark:text-red-200" : ""}
						><td class="text-right"
							><label for="isPublicCheckbox"
								>{#if mnemonicChanges.is_public ?? letterPair.is_public}👀{/if}
								Public</label
							></td
						>
						<td
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
		</form>
	{/if}
</div>
