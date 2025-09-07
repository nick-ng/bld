<script lang="ts">
	import { page } from "$app/state";
	import AllFlashCards from "$lib/components/all-flash-cards.svelte";
	import LetterPairEditor from "./letter-pair-editor.svelte";

	let letterPair = $derived(page.url.searchParams.get("lp"));
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");
</script>

{#if letterPair?.length == 2}
	<LetterPairEditor {letterPair} {flashCardType} />
{:else}
	<AllFlashCards />
{/if}
