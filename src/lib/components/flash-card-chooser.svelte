<script lang="ts">
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { isTwist, is3Style, isOP } from "$lib/utils";

	interface Props {
		letterPair?: string;
		hideNonOP?: boolean;
		hideNon3Style?: boolean;
	}

	let { letterPair = "", hideNonOP = true, hideNon3Style = true }: Props = $props();

	const getIndicators = (letterPair: string, store: typeof $flashCardStore) => {
		const letterPairObject = store[letterPair];
		return [
			!letterPairObject?.memo && "#ff0000ff",
			!letterPairObject?.commutator && "#00aa00ff",
			!letterPairObject?.image && "#0000ffff"
		];
	};

	let isNotEitherMethod = $derived(!isOP(letterPair) && !is3Style(letterPair));
</script>

{#if isTwist(letterPair) || isNotEitherMethod || (hideNon3Style && !is3Style(letterPair)) || (hideNonOP && !isOP(letterPair))}
	<div
		class="hidden cursor-not-allowed border border-gray-500 bg-gray-500 p-0 text-center no-underline lg:block"
	>
		<div class="mb-1 p-0 leading-none text-gray-500 uppercase">{letterPair}</div>
		<div class="h-2 px-0.5 pb-0.5"></div>
	</div>
{:else}
	<a
		class="relative block border border-gray-800 bg-white p-0 text-center no-underline"
		href={`/flash-cards?lp=${letterPair}`}
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
