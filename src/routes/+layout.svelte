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
		<a class="button-default" href="/flash-cards">Flash Cards</a>
		<a class="button-default" href="/corner-drawer">Corner Drawer</a>
		<a class="button-default" href="/anki-stuff">Anki Stuff</a>
		<div class="flex-grow" />
		<div class="text-xs">v0.5</div>
	</div>
{/if}
<div class={showNav ? "mx-1" : ""}>
	<slot />
</div>
