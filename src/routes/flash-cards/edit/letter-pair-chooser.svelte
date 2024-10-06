<script lang="ts">
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { isTwist, is3Style, isOP } from "$lib/utils";
	export let letterPair = "";
	export let hideNonOP = true;
	export let hideNon3Style = true;

	const getIndicators = (letterPair: string, store: typeof $flashCardStore) => {
		if (typeof store === "string") {
			return ["#ff0000ff", "#00aa00ff", "#0000ffff"];
		}

		const letterPairObject = store[letterPair];
		return [
			!letterPairObject?.memo && "#ff0000ff",
			!letterPairObject?.commutator && "#00aa00ff",
			!letterPairObject?.image && "#0000ffff"
		];
	};

	$: isNotEitherMethod = !isOP(letterPair) && !is3Style(letterPair);
</script>

{#if isTwist(letterPair) || isNotEitherMethod || (hideNon3Style && !is3Style(letterPair)) || (hideNonOP && !isOP(letterPair))}
	<div
		class="bg-gray-500 block text-center no-underline p-0 border border-gray-500 cursor-not-allowed"
	>
		<div class="text-gray-500 uppercase p-0 mb-1 leading-none">{letterPair}</div>
		<div class="h-2 px-0.5 pb-0.5" />
	</div>
{:else}
	<a
		class="relative block bg-white text-center no-underline border p-0 border-gray-800"
		href={`/flash-cards/edit?lp=${letterPair}`}
	>
		<div class="uppercase p-0 mb-1 leading-none">{letterPair}</div>
		<div class="h-2 flex flex-row justify-center gap-0.5 px-0.5 pb-0.5">
			{#each getIndicators(letterPair, $flashCardStore) as colorHex}
				<div
					class="rounded-full block flex-1"
					style={`background-color: ${colorHex || "#ffffff00"};}`}
				></div>
			{/each}
		</div>
	</a>
{/if}
