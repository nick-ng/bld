<script lang="ts">
	import { onMount } from "svelte";
	import { flashCardSchema } from "$lib/types";
	import {
		joinServerPath,
		upperCaseFirst,
		authFetch,
		getOperatingSystem,
		cornerSpeffzToLocation
	} from "$lib/utils";
	import {
		getFlashCard,
		flashCardStoreStatus,
		loadFlashCard,
		fetchFlashCards,
		updateFlashCard,
		flashCardStore
	} from "$lib/stores/flash-cards";
	import Corners from "$lib/components/corners.svelte";
	import Image from "$lib/components/image.svelte";

	interface Props {
		letterPair: string;
		flashCardType: string;
	}

	let { letterPair, flashCardType }: Props = $props();

	let files: FileList | null = $state(null);
	let fileInputEl: HTMLInputElement | null = $state(null);
	let formDirty = $state(false);
	let currentMemo = $state("");
	let currentCommutator = $state("");
	let currentTags = $state("");
	let currentIsPublic = $state(false);
	let currentEmoji = $state("");
	let currentImageUrl = $state("");
	let imageUrl = $state("");
	let isImageEmoji = $state(false);

	const getEmojiShortcut = () => {
		switch (getOperatingSystem()) {
			case "win": {
				return "Win + . or Win + ;";
			}
			case "mac": {
				return "Control + Command + Space";
			}
			default: {
				return "Enter an Emoji";
			}
		}
	};

	const onFlashCardStoreUpdate = async () => {
		if (!formDirty) {
			await fetchFlashCards();
			const flashCard = getFlashCard(letterPair, flashCardType, $flashCardStore);
			currentMemo = flashCard.memo;
			currentCommutator = flashCard.commutator;
			currentTags = flashCard.tags;
			currentIsPublic = flashCard.isPublic;
			imageUrl = flashCard.image;
			if (flashCard.image.endsWith(".emoji")) {
				isImageEmoji = true;
				currentEmoji = flashCard.image.replace(/\.emoji$/, "");
			} else {
				currentImageUrl = flashCard.image;
			}
		}
	};

	$effect(() => {
		onFlashCardStoreUpdate();
	});

	const getImageUrl = (f: FileList | null, imageUrl: string) => {
		if (imageUrl.endsWith(".emoji")) {
			return imageUrl;
		}

		if (f && f.length > 0) {
			return window.URL.createObjectURL(f[0]);
		}

		return imageUrl;
	};

	const resetForm = () => {
		onFlashCardStoreUpdate();
		if (fileInputEl) {
			fileInputEl.value = "";
			files = null;
		}
	};

	onMount(() => {
		const myAc = new AbortController();
		let fetchComplete = false;
		(async () => {
			await loadFlashCard(letterPair, flashCardType, myAc.signal);
			fetchComplete = true;
		})();

		return () => {
			if (!fetchComplete) {
				myAc.abort();
			}
		};
	});
</script>

<div class="mx-auto max-w-prose">
	<h2 class="text-center uppercase">{letterPair}</h2>
	<div class="mb-1 text-center">
		<Corners {letterPair} />
	</div>
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="text-center">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		<form
			onsubmit={async (event) => {
				event.preventDefault();

				formDirty = false;

				// @todo(nick-ng): you can just do `new FormData(event.currentTarget)`?
				const formData = new FormData();
				const children = [...event.currentTarget];
				for (let i = 0; i < children.length; i++) {
					const formInput = children[i];

					if (formInput instanceof HTMLInputElement) {
						const formInputName = formInput.getAttribute("name");
						const formInputType = formInput.getAttribute("type");
						if (!formInputName || !formInputType) {
							continue;
						}

						switch (formInput.getAttribute("type")) {
							case "file": {
								const fileList = formInput.files;
								if (!fileList) {
									break;
								}

								const file = fileList[fileList.length - 1];
								if (!file) {
									break;
								}

								formData.set(formInputName, file);
								break;
							}
							case "checkbox": {
								formData.set(formInputName, formInput.checked ? "1" : "0");
								break;
							}
							default: {
								formData.set(formInputName, formInput.value);
							}
						}
					}
				}

				const response = await authFetch(joinServerPath("flash-cards", letterPair), {
					method: "PUT",
					body: formData
				});
				if (!response) {
					return;
				}

				const responseJson = await response.json();
				const parseResponse = flashCardSchema.safeParse(responseJson);
				if (parseResponse.success) {
					const { data } = parseResponse;
					updateFlashCard(data);

					history.back();
				} else {
					console.error("wrong", responseJson);
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
								class="w-full"
								type="text"
								autocomplete="off"
								name="memo"
								bind:value={currentMemo}
								onchange={() => {
									formDirty = true;
								}}
							/></td
						>
					</tr>
					<tr>
						<td class="text-right"
							><a
								href={`https://v2.blddb.net/corner?position=${cornerSpeffzToLocation(`c${letterPair}`).join("-")}&mode=manmade`}
								target="pux_bld_blddb_comm">Commutator</a
							>
						</td>
						<td
							><input
								class="w-full"
								type="text"
								autocomplete="off"
								name="commutator"
								bind:value={currentCommutator}
								onchange={() => {
									formDirty = true;
								}}
							/></td
						>
					</tr>
					<tr>
						<td class="text-right"
							><button
								type="button"
								class="cannot-hover:py-2 ml-auto block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
								onclick={() => {
									formDirty = true;
									if (isImageEmoji) {
										isImageEmoji = false;
										imageUrl = currentImageUrl;
									} else {
										isImageEmoji = true;
										imageUrl = `${currentEmoji}.emoji`;
									}
								}}
							>
								{#if isImageEmoji}
									<div>Emoji</div>
									<div class="line-through">Image</div>
								{:else}
									<div>Image</div>
									<div class="line-through">Emoji</div>
								{/if}
							</button>
						</td>
						<td>
							<input type="hidden" name="imageUrl" value={imageUrl} />
							{#if isImageEmoji}
								<input
									class="w-full"
									type="text"
									id={`${letterPair}-image`}
									placeholder={getEmojiShortcut()}
									autocomplete="off"
									name="emoji"
									value={currentEmoji}
									oninput={(event) => {
										formDirty = true;

										currentEmoji = event.currentTarget.value;
										imageUrl = `${currentEmoji}.emoji`;
									}}
								/>
							{:else}
								<input
									class="max-w-64"
									type="file"
									id={`${letterPair}-image`}
									name="image"
									alt="Choose Image"
									accept="image/*"
									bind:this={fileInputEl}
									bind:files
									onchange={() => {
										formDirty = true;
									}}
								/>
							{/if}
							<label for={`${letterPair}-image`} class="mx-auto mt-0.5 block">
								<Image
									imageUri={getImageUrl(files, imageUrl)}
									alt={`${letterPair.toUpperCase()} visualisation`}
								/>
							</label>
						</td>
					</tr>
					<tr>
						<td class="text-right">Tags</td>
						<td
							><input
								class="w-full"
								type="text"
								autocomplete="off"
								name="tags"
								bind:value={currentTags}
								onchange={() => {
									formDirty = true;
								}}
							/></td
						>
					</tr>
					<tr class={currentIsPublic ? "font-bold text-red-800 dark:text-red-200" : ""}
						><td class="text-right"
							><label for="isPublicCheckbox"
								>{#if currentIsPublic}👀{/if}
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
									bind:checked={currentIsPublic}
									onchange={() => {
										formDirty = true;
									}}
								/>
								{#if currentIsPublic}👀{/if}</label
							></td
						>
					</tr></tbody
				>
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
						if (formDirty) {
							formDirty = false;
							resetForm();
						}
					}}>Reset</button
				>
				<button class="flex-grow">Save</button>
			</div>
			<details class="can-hover:block hidden">
				<summary>Debug</summary>
				<pre>{JSON.stringify(
						getFlashCard(letterPair, flashCardType, $flashCardStore),
						null,
						2
					)}</pre>
			</details>
		</form>
	{/if}
</div>

<style>
	table.flash-card-editor td {
		vertical-align: top;
	}
</style>
