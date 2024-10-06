<script lang="ts">
	import { parseFlashCard, defaultFlashCard } from "$lib/types";
	import { joinServerPath, upperCaseFirst, addCredentialsToHeaders } from "$lib/utils";
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";
	import Corners from "$lib/components/corners.svelte";
	import { goto } from "$app/navigation";

	export let letterPair: string = "";

	let files: FileList | null;
	let fileInputEl: HTMLInputElement | null = null;
	let status = "stand-by";
	let formDirty = false;
	let currentMemo = "";
	let currentCommutator = "";
	let currentTags = "";
	let imageUrl = "";

	const onFlashCardStoreUpdate = (store: typeof $flashCardStore) => {
		if (typeof store === "string") {
			status = store;
		} else {
			status = "loaded";

			if (!formDirty) {
				const flashCard = store[letterPair] || defaultFlashCard(letterPair);
				currentMemo = flashCard.memo;
				currentCommutator = flashCard.commutator;
				currentTags = flashCard.tags;
				imageUrl = flashCard.image;
			}
		}
	};

	$: onFlashCardStoreUpdate($flashCardStore);

	const getImageUrl = (f: FileList | null, imageUrl: string) => {
		if (f && f.length > 0) {
			return window.URL.createObjectURL(f[0]);
		}

		if (imageUrl) {
			return joinServerPath("images", imageUrl);
		}

		return "";
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
	{#if status !== "loaded"}
		<div class="text-center">{upperCaseFirst(status)}...</div>
	{:else}
		<form
			on:submit={async (event) => {
				event.preventDefault();

				if (typeof $flashCardStore === "string") {
					return;
				}

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

				const { headers, isValid } = addCredentialsToHeaders();
				if (!isValid) {
					return;
				}

				const response = await fetch(joinServerPath("flash-cards", letterPair), {
					method: "PUT",
					headers,
					body: formData
				});
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
			<input type="hidden" name="imageUrl" value={imageUrl} />
			{#if typeof $flashCardStore !== "string" && currentMemo === $flashCardStore[letterPair].memo && currentCommutator === $flashCardStore[letterPair].commutator}
				<input type="hidden" name="lastQuizUnix" value={$flashCardStore[letterPair].lastQuizUnix} />
				<input type="hidden" name="confidence" value={$flashCardStore[letterPair].confidence} />
			{:else}
				<input type="hidden" name="lastQuizUnix" value={0} />
				<input type="hidden" name="confidence" value={0} />
			{/if}
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
						<td class="text-right">Image</td>
						<td>
							<input
								class="w-full"
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
							<label
								for={`${letterPair}-image`}
								class="mx-auto mt-0.5 block h-64 w-64 border border-gray-500"
							>
								{#if getImageUrl(files, imageUrl)}
									<img
										class="object-contain"
										src={getImageUrl(files, imageUrl)}
										alt={`${letterPair.toUpperCase()} visualisation`}
									/>
								{:else}
									<div class="h-full w-full flex items-center justify-center text-3xl">
										No Image
									</div>
								{/if}
							</label>
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
