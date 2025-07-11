<script lang="ts">
	import { parseFlashCard, defaultFlashCard } from "$lib/types";
	import { joinServerPath, upperCaseFirst, authFetch, getOperatingSystem } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus, loadFlashCard } from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";
	import Corners from "$lib/components/corners.svelte";
	import { goto } from "$app/navigation";
	import Image from "$lib/components/image.svelte";
	import { onMount } from "svelte";

	interface Props {
		letterPair?: string;
	}

	let { letterPair = "" }: Props = $props();

	let files: FileList | null = $state(null);
	let fileInputEl: HTMLInputElement | null = $state(null);
	let formDirty = $state(false);
	let currentMemo = $state("");
	let currentCommutator = $state("");
	let currentTags = $state("");
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

	const flashCardOrDefault = (store: typeof $flashCardStore, letterPair: string) => {
		return store[letterPair] || defaultFlashCard(letterPair);
	};

	const onFlashCardStoreUpdate = (store: typeof $flashCardStore) => {
		if (!formDirty) {
			const flashCard = flashCardOrDefault(store, letterPair);
			currentMemo = flashCard.memo;
			currentCommutator = flashCard.commutator;
			currentTags = flashCard.tags;
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
		onFlashCardStoreUpdate($flashCardStore);
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
		onFlashCardStoreUpdate($flashCardStore);
		if (fileInputEl) {
			fileInputEl.value = "";
			files = null;
		}
	};

	onMount(() => {
		const myAc = new AbortController();
		let fetchComplete = false;
		(async () => {
			await loadFlashCard(letterPair, myAc.signal);
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
	<a href={$quizStore.length > 0 ? "/quiz" : "/flash-cards"}>Back</a>
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
				const parseResponse = parseFlashCard(responseJson);
				if (parseResponse.isValid) {
					const { data } = parseResponse;
					$flashCardStore[parseResponse.data.letterPair] = { ...data, fetchedAtMs: Date.now() };

					const backUrl = $quizStore.length > 0 ? "/quiz" : "/flash-cards?lp=${letterPair}";
					$quizStore = $quizStore.filter((lp) => lp != letterPair);

					goto(backUrl);
				} else {
					console.error("wrong", responseJson);
				}
			}}
		>
			<input
				type="hidden"
				name="lastQuizUnix"
				value={flashCardOrDefault($flashCardStore, letterPair).lastQuizUnix}
			/>
			<input
				type="hidden"
				name="confidence"
				value={flashCardOrDefault($flashCardStore, letterPair).confidence}
			/>
			<table class="flash-card-editor mx-auto border-separate border-spacing-x-0.5">
				<tbody>
					<tr>
						<td class="text-right">Memo</td>
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
							><a href="https://v2.blddb.net/corner?mode=manmade" target="pux_blddb_corner_comm"
								>Commutator</a
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
				</tbody>
			</table>
			<div class="mt-1 flex w-full flex-row justify-between gap-8">
				<a
					class="cannot-hover:py-2 block flex-grow rounded border border-gray-600 px-2 py-0 text-center dark:border-gray-300"
					href={$quizStore.length > 0 ? "/quiz" : "/flash-cards?lp=${letterPair}"}>Back</a
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
		</form>
	{/if}
</div>

<style>
	table.flash-card-editor td {
		vertical-align: top;
	}
</style>
