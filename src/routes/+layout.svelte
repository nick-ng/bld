<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';

	$: isClock = $page.route.id === '/clock';
</script>

{#if !isClock}
	<div class="flex flex-row mx-2 my-2 gap-2">
		<a class="button-default" href="/op-corners">Old Pochman Corners</a>
		<a class="button-default" href="/corner-drawer">Corner Drawer</a>
		<a class="button-default" href="/anki-stuff">Anki Stuff</a>
	</div>
{/if}
<div class={isClock ? '' : 'mx-1'}>
	<slot />
</div>
