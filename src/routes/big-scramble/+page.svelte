<script lang="ts">
	import BigScramblePage from '$lib/components/big-scramble-page.svelte';
	import { onMount } from 'svelte';

	let scramble = "L2 U L2 F2 R U' B' D R D' B2 U F2 D' F2 U' F2 D2 Rw Uw'";

	onMount(() => {
		const handleEvent = (event: MessageEvent) => {
			if (typeof event.data !== 'string') {
				return;
			}

			scramble = event.data;
		};

		window.addEventListener('message', handleEvent, false);

		return () => {
			window.removeEventListener('message', handleEvent);
		};
	});
</script>

<svelte:head>
	<title>Blindfolded Cube Resources - Big Scramble</title>
</svelte:head>

<BigScramblePage {scramble} />
