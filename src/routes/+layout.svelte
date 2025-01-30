<script lang="ts">
	import { page } from "$app/stores";
	import "../app.css";

	$: showNav = ["big-scramble", "clock"].every((a) => $page.route.id !== `/${a}`);
</script>

<svelte:head>
	<title>Blindfolded Cube Resources</title>
</svelte:head>

{#if showNav}
	<div class="flex flex-row items-start mx-2 my-2 gap-2">
		<a
			class="rounded border border-gray-600 px-2 py-0 dark:border-gray-300 cannot-hover:py-2 block"
			href="/flash-cards">Flash Cards</a
		>
		<a
			class="rounded border border-gray-600 px-2 py-0 dark:border-gray-300 cannot-hover:py-2 block"
			href="/quiz">Quiz</a
		>
		<a
			class="rounded border border-gray-600 px-2 py-0 dark:border-gray-300 cannot-hover:py-2 block"
			href="/corner-drawer">Corner Drawer</a
		>
	</div>
{/if}
<div class={showNav ? "mx-1" : ""}>
	<slot />
</div>
