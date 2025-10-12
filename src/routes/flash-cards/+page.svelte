<script lang="ts">
	import { page } from "$app/state";
	import FlashCard from "$lib/components/flash-card.svelte";
	import AllFlashCards from "$lib/components/all-flash-cards.svelte";

	let letterPair = $derived(page.url.searchParams.get("lp"));
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");
</script>

{#if typeof letterPair === "string" && letterPair.length === 2}
	<FlashCard
		{letterPair}
		{flashCardType}
		showCorners
		showMemo
		showCommutator
		showImage
		showInverseLink
	/>
	<div class="mx-auto mt-1 flex max-w-prose flex-row justify-between gap-8">
		<button
			class="flex-grow"
			onclick={() => {
				history.back();
			}}>Back</button
		>
		<a
			class="like-button block flex-grow"
			href={`/flash-cards/edit?t=${flashCardType}&lp=${letterPair}`}>Edit</a
		>
	</div>
{:else}
	<AllFlashCards />
{/if}
