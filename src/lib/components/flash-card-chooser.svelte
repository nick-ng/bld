<script lang="ts">
	import type { FlashCard as FlashCardType } from "$lib/types";
	import { flashCardStore, getFlashCard } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { authenticationStore } from "$lib/stores/authentication";
	import { isTwist, isBuffer } from "$lib/utils";

	interface Props {
		flashCard: FlashCardType | null;
	}

	const fullColour = 60 * 60 * 24 * $optionsStore.leitnerRetiredMaxAgeDays;
	const getAgeColour = (lastUnix?: number) => {
		if (typeof lastUnix !== "number" || $authenticationStore.isGuest) {
			return "#FFFFFF";
		}
		const nowSeconds = Date.now() / 1000;
		const age = nowSeconds - lastUnix;
		const fraction = Math.max(fullColour - age, 0) / fullColour;
		const blue = Math.ceil(255 * fraction);
		const green = 230 + Math.ceil(25 * fraction);
		const rgb = `rgb(255, ${green}, ${blue})`;
		return rgb;
	};

	let { flashCard }: Props = $props();
	let indicators = $derived([
		!flashCard?.memo ? "#ff0000ff" : "#ffffff00",
		!flashCard?.commutator ? "#00aa00ff" : "#ffffff00",
		!flashCard?.image ? "#0000ffff" : "#ffffff00",
	]);
</script>

{#if !flashCard}
	<div
		class="hidden cursor-not-allowed border border-gray-500 bg-gray-500 p-0 text-center no-underline lg:block"
	>
		<div class="mb-1 p-0 leading-none text-gray-500 uppercase">__</div>
		<div class="h-2 px-0.5 pb-0.5"></div>
	</div>
{:else}
	<a
		class={`relative block border border-gray-800 p-0 text-center ${flashCard?.isPublic ? "underline" : "no-underline"}`}
		style={`background-color:${getAgeColour(flashCard?.lastDrillUnix)};`}
		href={`/flash-cards?t=${flashCard.type}&f=${flashCard.letterPair.toUpperCase()}`}
	>
		<div class="mb-1 p-0 leading-none uppercase">{flashCard.letterPair.toUpperCase()}</div>
		<div class="flex h-2 flex-row justify-center gap-0.5 px-0.5 pb-0.5">
			{#each indicators as colorHex, i (`${i}-${colorHex}`)}
				<div class="block flex-1 rounded-full" style={`background-color: ${colorHex};}`}></div>
			{/each}
		</div>
	</a>
{/if}
