<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';

	$: showNav = ['big-scramble', 'clock'].every((a) => $page.route.id !== `/${a}`);
</script>

{#if showNav}
	<div class="flex flex-row mx-2 my-2 gap-2">
		<a class="button-default" href="/flash-cards">Flash Cards</a>
		<a class="button-default" href="/corner-drawer">Corner Drawer</a>
		<a class="button-default" href="/anki-stuff">Anki Stuff</a>
	</div>
{/if}
<div class={showNav ? 'mx-1' : ''}>
	<slot />
</div>
