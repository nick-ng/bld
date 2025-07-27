<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/state";
	import { optionsStore } from "$lib/stores/options";
	import "../app.css";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	let showNav = $derived(["big-scramble", "clock"].every((a) => page.route.id !== `/${a}`));
	let currentFlashCardType = $derived(
		page.url.searchParams.get("t") || $optionsStore.defaultFlashCardType
	);
</script>

<svelte:head>
	<title>Blindfolded Cube Resources</title>
</svelte:head>

{#if showNav}
	<div class="mx-2 my-2 flex flex-row items-start gap-2">
		<a class="like-button" href={`/flash-cards?t=${currentFlashCardType}`}>Browse</a>
		<a class="like-button" href="/quiz">Study</a>
		<a class="like-button" href="/flash-cards/summary">Summary</a>
	</div>
{/if}
<div class={showNav ? "mx-1" : ""}>
	{@render children?.()}
</div>
