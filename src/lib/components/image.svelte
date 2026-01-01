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
		if (uri.startsWith("blob:") || uri.startsWith("/")) {
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
					.join(" "),
			};
		});
	};
</script>

<div
	class={`flex h-64 w-64 flex-row justify-center ${!imageUri || imageUri.endsWith(".emoji") ? "items-center" : "items-stretch"}`}
>
	{#if imageUri.endsWith(".emoji")}
		<div class="relative h-full flex-grow overflow-hidden">
			{#each getEmojiLayers(imageUri) as emojiLayer, i (`${i}-${emojiLayer.emoji}-${emojiLayer.padding}`)}
				<div
					class="absolute top-0 right-0 bottom-0 left-0 m-auto flex flex-row items-center justify-center text-9xl leading-none break-keep"
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
