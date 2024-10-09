<script lang="ts">
	import { parseFlashCard, defaultFlashCard } from "$lib/types";
	import { joinServerPath, upperCaseFirst, authFetch, getOperatingSystem } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus, loadFlashCard } from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";
	import Corners from "$lib/components/corners.svelte";
	import { goto } from "$app/navigation";
	import Image from "$lib/components/image.svelte";

	export let letterPair: string = "";

	let files: FileList | null;
	let fileInputEl: HTMLInputElement | null = null;
	let formDirty = false;
	let currentMemo = "";
	let currentCommutator = "";
	let currentTags = "";
	let currentEmoji = "";
	let currentImageUrl = "";
	let imageUrl = "";
	let isImageEmoji = false;

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

	$: loadFlashCard(letterPair, (loadedFlashCard) => {
		console.log("hi", Date.now());
		$flashCardStore[loadedFlashCard.letterPair] = loadedFlashCard;
	});
	$: onFlashCardStoreUpdate($flashCardStore);

	const getImageUrl = (f: FileList | null, imageUrl: string) => {
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
</script>

<div class="max-w-prose mx-auto">
	<a href={$quizStore.length > 0 ? "/flash-cards/quiz" : "/flash-cards/edit"}>Back</a>
	<h2 class="uppercase text-center">{letterPair}</h2>
	<div class="text-center mb-1">
		<Corners {letterPair} />
	</div>
	{#if $flashCardStoreStatus !== "loaded"}
		<div class="text-center">{upperCaseFirst($flashCardStoreStatus)}...</div>
	{:else}
		<form
			on:submit={async (event) => {
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
					$flashCardStore[parseResponse.data.letterPair] = parseResponse.data;

					const backUrl = $quizStore.length > 0 ? "/flash-cards/quiz" : "/flash-cards/edit";
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
			<table class="flash-card-editor border-separate border-spacing-x-0.5 mx-auto">
				<tbody>
					<tr>
						<td class="text-right">Memo</td>
						<td
							><input
								class="w-full"
								type="text"
								name="memo"
								bind:value={currentMemo}
								on:change={() => {
									formDirty = true;
								}}
							/></td
						>
					</tr>
					<tr>
						<td class="text-right">Commutator</td>
						<td
							><input
								class="w-full"
								type="text"
								name="commutator"
								bind:value={currentCommutator}
								on:change={() => {
									formDirty = true;
								}}
							/></td
						>
					</tr>
					<tr>
						<td class="text-right"
							><button
								type="button"
								class="button-default ml-auto"
								on:click={() => {
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
								<div>{getEmojiShortcut()}</div>
								<input
									class="mx-auto mt-0.5 block h-64 w-64 border border-gray-500 text-center text-9xl"
									type="text"
									name="emoji"
									value={currentEmoji}
									on:change={(event) => {
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
									on:change={() => {
										formDirty = true;
									}}
								/>
								<label for={`${letterPair}-image`} class="mx-auto mt-0.5 block">
									<Image
										imageUri={getImageUrl(files, imageUrl)}
										alt={`${letterPair.toUpperCase()} visualisation`}
									/>
								</label>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="text-right">Tags</td>
						<td
							><input
								class="w-full"
								type="text"
								name="tags"
								bind:value={currentTags}
								on:change={() => {
									formDirty = true;
								}}
							/></td
						>
					</tr>
				</tbody>
			</table>
			<div class="w-full flex flex-row justify-between">
				<button
					type="button"
					on:click={() => {
						if (formDirty) {
							formDirty = false;
							resetForm();
						}
					}}>Reset</button
				>
				<button class="button-default">Submit</button>
			</div>
		</form>
	{/if}
</div>

<style>
	table.flash-card-editor td {
		vertical-align: top;
	}
</style>
