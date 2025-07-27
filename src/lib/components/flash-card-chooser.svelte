<script lang="ts">
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { isTwist, isBuffer } from "$lib/utils";

	// @todo(nick-ng): parent should decide if the square is blank or not
	interface Props {
		letterPair?: string;
		flashCardType?: string;
	}

	const FULL_RED_UNIX = 60 * 60 * 24 * 90; // 3 months in seconds
	const getAgeColour = (lastQuizUnix?: number) => {
		console.log(letterPair, lastQuizUnix);
		if (typeof lastQuizUnix !== "number") {
			return "#FFFFFF";
		}
		const nowSeconds = Date.now() / 1000;
		const age = nowSeconds - lastQuizUnix;
		const fraction = Math.max(FULL_RED_UNIX - age, 0) / FULL_RED_UNIX;
		const nonYellow = Math.ceil(255 * fraction);
		const rgb = `rgb(255, 255, ${nonYellow})`;
		return rgb;
	};

	let { letterPair = "", flashCardType = "corner" }: Props = $props();
	let flashCard = $derived($flashCardStore[letterPair]);

	const getIndicators = (letterPair: string, store: typeof $flashCardStore) => {
		const letterPairObject = store[letterPair];
		return [
			!letterPairObject?.memo && "#ff0000ff",
			!letterPairObject?.commutator && "#00aa00ff",
			!letterPairObject?.image && "#0000ffff"
		];
	};

	let isHidden = $derived(
		isTwist(letterPair, $optionsStore.flashCardTypes[flashCardType].samePieces) ||
			isBuffer(letterPair, $optionsStore.flashCardTypes[flashCardType].bufferPiece)
	);
</script>

{#if isHidden}
	<div
		class="hidden cursor-not-allowed border border-gray-500 bg-gray-500 p-0 text-center no-underline lg:block"
	>
		<div class="mb-1 p-0 leading-none text-gray-500 uppercase">{letterPair}</div>
		<div class="h-2 px-0.5 pb-0.5"></div>
	</div>
{:else}
	<a
		class={`relative block border border-gray-800 p-0 text-center ${flashCard?.isPublic ? "underline" : "no-underline"}`}
		style={`background-color:${getAgeColour(flashCard?.lastQuizUnix)};`}
		href={`/flash-cards?t=${flashCardType}&lp=${letterPair}`}
	>
		<div class="mb-1 p-0 leading-none uppercase">{letterPair}</div>
		<div class="flex h-2 flex-row justify-center gap-0.5 px-0.5 pb-0.5">
			{#each getIndicators(letterPair, $flashCardStore) as colorHex, i (`${i}-${colorHex}`)}
				<div
					class="block flex-1 rounded-full"
					style={`background-color: ${colorHex || "#ffffff00"};}`}
				></div>
			{/each}
		</div>
	</a>
{/if}
