<script lang="ts">
	import { page } from "$app/stores";
	import AllFlashCards from "$lib/components/all-flash-cards.svelte";
	import LetterPairEditor from "./letter-pair-editor.svelte";

	let letterPair = $derived($page.url.searchParams.get("lp"));
</script>

{#if letterPair?.length == 2}
	<LetterPairEditor {letterPair} />
{:else}
	<AllFlashCards />
{/if}
