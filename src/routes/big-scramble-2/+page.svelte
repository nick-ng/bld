<script lang="ts">
	import BigScramblePage from '$lib/components/big-scramble-page.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const STORAGE_KEY = 'PUX_BLD_BIG_SCRAMBLE';
	let scramble = '';

	onMount(() => {
		const newScramble = $page.url.searchParams.get('scramble');

		const updateScramble = (event: StorageEvent) => {
			if (typeof event.newValue === 'string') {
				scramble = event.newValue;
			}
		};

		let updateScrambleListenerSet = false;

		if (newScramble) {
			localStorage.setItem(STORAGE_KEY, newScramble);
		} else {
			scramble = localStorage.getItem(STORAGE_KEY) || '';

			addEventListener('storage', updateScramble);
		}

		return () => {
			if (updateScrambleListenerSet) {
				removeEventListener('storage', updateScramble);
			}
		};
	});
</script>

<svelte:head>
	<title>Blindfolded Cube Resources - Big Scramble</title>
</svelte:head>

{#if scramble}
	<BigScramblePage {scramble} />
{:else}
	<div class="blank"></div>
{/if}

<style>
	.blank {
		width: 100vw;
		height: 100vh;
		background-color: black;
	}
</style>
