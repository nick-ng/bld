<script lang="ts">
	import type { LetterPair as LetterPairType } from "$lib/types";

	import { isSpeffzPairValid } from "$lib/utils";

	interface Props {
		letterPair: LetterPairType;
		selectedBuffers: string[];
	}

	let { letterPair, selectedBuffers }: Props = $props();
	let isValid = $derived(isSpeffzPairValid(letterPair.speffz_pair, selectedBuffers));
	let indicators = $derived([
		isValid && !letterPair.words ? "#ff0000ff" : "#ffffff00",
		isValid && !selectedBuffers.every((buf) => letterPair.algorithms[buf]?.moves)
			? "#00aa00ff"
			: "#ffffff00",
		isValid && !letterPair.image ? "#0000ffff" : "#ffffff00",
	]);
</script>

<a
	class={`relative  border p-0 text-center ${!isValid && letterPair.is_public ? "underline" : "no-underline"} ${isValid ? "block border-gray-800" : "hidden cursor-not-allowed border-gray-500 bg-gray-500 lg:block"}`}
	href={`?f=${letterPair.speffz_pair.toUpperCase()}`}
>
	<div class={`mb-1 p-0 leading-none uppercase ${isValid ? "" : "text-gray-500"}`}>
		{letterPair.speffz_pair.toUpperCase()}
	</div>
	<div class="flex h-2 flex-row justify-center gap-0.5 px-0.5 pb-0.5">
		{#each indicators as colorHex, i (`${i}-${colorHex}`)}
			<div class="block flex-1 rounded-full" style={`background-color: ${colorHex};}`}></div>
		{/each}
	</div>
</a>
