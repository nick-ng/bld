<script lang="ts">
	import { authFetch, getOperatingSystem, joinServerPath } from "$lib/utils";
	import Image from "$lib/components/image.svelte";

	interface Props {
		speffzPair: string;
		imageUri: string;
		imageChanged: (newImageUri: string) => void | Promise<void>;
	}

	let { speffzPair, imageUri, imageChanged }: Props = $props();
	let isImageEmoji = $derived(imageUri.endsWith(".emoji"));
	let previousEmoji = $state(".emoji");
	let previousImage = $state("");
	let emojiShortcut = $state("Enter an Emoji");
	switch (getOperatingSystem()) {
		case "win": {
			emojiShortcut = "Win + . or Win + ;";
			break;
		}
		case "mac": {
			emojiShortcut = "Control + Command + Space";
			break;
		}
	}
</script>

<tr>
	<td class="text-right align-top">
		<button
			type="button"
			class="cannot-hover:py-2 ml-auto block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
			onclick={() => {
				if (isImageEmoji) {
					previousEmoji = imageUri;
					imageChanged(previousImage);
				} else {
					previousImage = imageUri;
					imageChanged(previousEmoji);
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
		{#if isImageEmoji}
			<input
				class="w-full px-0.5"
				type="text"
				id={`${speffzPair}-image`}
				placeholder={emojiShortcut}
				autocomplete="off"
				name="emoji"
				value={imageUri.replace(/\.emoji$/, "")}
				oninput={(event) => {
					// @todo(nick-ng): use 2 argument bind:value style?
					imageChanged(`${event.currentTarget.value}.emoji`);
				}}
			/>
		{:else}
			<input
				class="max-w-64"
				type="file"
				id={`${speffzPair}-image`}
				name="image"
				alt="Choose Image"
				accept="image/*"
				onchange={async (event) => {
					const imageForm = new FormData();
					if (!event.currentTarget.files) {
						return;
					}

					const file = event.currentTarget.files[event.currentTarget.files.length - 1];
					if (!file) {
						return;
					}

					imageForm.set("image", file);
					const response = await authFetch(joinServerPath("images", speffzPair), {
						method: "POST",
						body: imageForm,
					});
					const resText = await response.text();
					imageChanged(resText);
				}}
			/>
		{/if}
		<label for={`${speffzPair}-image`} class="mx-auto mt-0.5 block">
			<Image {imageUri} alt={`${speffzPair.toUpperCase()} visualisation`} />
		</label>
	</td>
</tr>
