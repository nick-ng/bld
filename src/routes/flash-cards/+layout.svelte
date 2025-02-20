<script lang="ts">
	import type { Snippet } from "svelte";

	import FlashCardsNav from "$lib/components/flash-cards-nav.svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<FlashCardsNav />

<div>
	{@render children?.()}
</div>
