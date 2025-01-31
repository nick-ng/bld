<script lang="ts">
	import { joinServerPath } from "$lib/utils";

	interface Props {
		imageUri?: string;
		alt: string;
	}

	let { imageUri = "", alt }: Props = $props();

	const PADDING_STEP = 2;
	const SIZE_STEP = 10;

	const getImageUrl = (uri: string) => {
		if (uri.startsWith("blob:")) {
			return uri;
		}

		return joinServerPath("images", uri);
	};

	const getEmojiLayers = (emojiString: string) => {
		const separateEmoji = emojiString.replace(/\.emoji$/, "").split(":");
		return separateEmoji.map((emoji, i, arr) => {
			const emojiCharacters = emoji.split("");
			let actualEmoji = "";
			let sizeAdjustment = 0;
			let padBottom = 0;
			let padTop = 0;
			let padLeft = 0;
			let padRight = 0;
			for (let i = 0; i < emojiCharacters.length; i++) {
				const character = emojiCharacters[i];
				switch (character) {
					case "+": {
						sizeAdjustment = sizeAdjustment + SIZE_STEP;
						break;
					}
					case "-": {
						sizeAdjustment = sizeAdjustment - SIZE_STEP;
						break;
					}
					case "^": {
						padBottom = padBottom + PADDING_STEP;
						break;
					}
					case ">": {
						padLeft = padLeft + PADDING_STEP;
						break;
					}
					case "v": {
						padTop = padTop + PADDING_STEP;
						break;
					}
					case "<": {
						padRight = padRight + PADDING_STEP;
						break;
					}
					default: {
						actualEmoji = `${actualEmoji}${character}`;
					}
				}
			}

			return {
				emoji: actualEmoji,
				sizeAdjustment,
				opacity: (arr.length - i) / arr.length,
				padding: [padTop, padRight, padBottom, padLeft]
					.map((p) => `${p * PADDING_STEP}px`)
					.join(" ")
			};
		});
	};
</script>

<div
	class={`flex flex-row justify-center h-64 w-64 ${!imageUri || imageUri.endsWith(".emoji") ? "border-gray-500 border items-center" : "items-stretch"}`}
>
	{#if imageUri.endsWith(".emoji")}
		<div class="relative h-full flex-grow overflow-hidden">
			{#each getEmojiLayers(imageUri) as emojiLayer, i}
				<div
					class="break-keep leading-none absolute left-0 right-0 top-0 bottom-0 m-auto text-9xl flex flex-row justify-center items-center"
					style={`z-index: ${getEmojiLayers(imageUri).length - i}; font-size: ${128 + emojiLayer.sizeAdjustment}px;opacity: ${emojiLayer.opacity};padding: ${emojiLayer.padding};`}
				>
					{emojiLayer.emoji}
				</div>
			{/each}
		</div>
	{:else if imageUri}
		<img class="flex-shrink object-contain" src={getImageUrl(imageUri)} {alt} />
	{:else}
		<span class="text-3xl">No Image</span>
	{/if}
</div>
