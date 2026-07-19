<script lang="ts">
	import type { Algorithm } from "$lib/types";
	import { fetchAlgorithms, saveAlgorithm } from "$lib/stores/letter-pairs";

	const HOUR_MS = 1000 * 60 * 60;

	let algorithms: Algorithm[] = $state([]);
	let isFetching = $state(false);
	let resetProgress = $state(0);
</script>

<div>
	<h4>Reset Drill</h4>
	<div>Algorithm count: {algorithms.length}</div>
	<div>Algorithms reset: {resetProgress}</div>
	<div>
		<button
			type="button"
			onclick={async () => {
				isFetching = true;
				resetProgress = 0;
				algorithms = await fetchAlgorithms();
				isFetching = false;
			}}
		>
			{#if isFetching}
				Fetching...
			{:else}
				Fetch Algorithms
			{/if}
		</button>
		<button
			type="button"
			onclick={async () => {
				if (!confirm("Really reset all drill times to 1 hour?")) {
					return;
				}

				for (let i = 0; i < algorithms.length; i++) {
					await saveAlgorithm({
						speffz_pair: algorithms[i].speffz_pair,
						buffer: algorithms[i].buffer,
						drill_time_ms: HOUR_MS,
					});
					resetProgress = i + 1;
				}
			}}
		>
			Reset Drill Times
		</button>
	</div>
</div>
