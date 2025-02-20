<script lang="ts">
	import type { FlashCard } from "$lib/types";

	import { commutatorDetails } from "$lib/utils";
	import Corners from "$lib/components/corners.svelte";
	import Image from "$lib/components/image.svelte";

	interface Props {
		flashCard: FlashCard;
	}

	let { flashCard }: Props = $props();
</script>

<div class="flex flex-col items-center min-h-[460px] gap-1 relative">
	<h2 class="uppercase m-0">{flashCard.letterPair}</h2>
	<Corners letterPair={flashCard.letterPair} />
	<div class="text-2xl">{flashCard.memo}</div>
	<Image imageUri={flashCard.image} alt={`${flashCard.letterPair.toUpperCase()} visualisation`} />
	{#if flashCard.commutator}
		<div>
			<span class="text-xl font-mono"
				>{commutatorDetails(flashCard.commutator).normalisedCommutator}</span
			>
			<a
				href={`https://blddb.net/corner.html?letter-pair=c${flashCard.letterPair}`}
				target="pux_blddb_corner_comm">blddb.net</a
			>
		</div>
	{/if}
	{#if flashCard.tags}
		<div>{flashCard.tags}</div>
	{/if}
</div>
