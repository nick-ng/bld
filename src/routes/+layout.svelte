<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/stores";
	import "../app.css";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	let showNav = $derived(["big-scramble", "clock"].every((a) => $page.route.id !== `/${a}`));
</script>

<svelte:head>
	<title>Blindfolded Cube Resources</title>
</svelte:head>

{#if showNav}
	<div class="mx-2 my-2 flex flex-row items-start gap-2">
		<a
			class="cannot-hover:py-2 block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
			href="/flash-cards">Flash Cards</a
		>
		<a
			class="cannot-hover:py-2 block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
			href="/flash-cards/summary">Summary</a
		>
		<a
			class="cannot-hover:py-2 block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
			href="/quiz">Quiz</a
		>
		<a
			class="cannot-hover:py-2 block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
			href="/corner-drawer">Corner Drawer</a
		>
	</div>
{/if}
<div class={showNav ? "mx-1" : ""}>
	{@render children?.()}
</div>
