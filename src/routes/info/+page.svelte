<script lang="ts">
	import { letterPairStore } from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import NoInverse from "./no-inverse.svelte";

	let buffers = $derived(
		Object.entries($optionsStore.chosenBuffers)
			.filter((ent) => ent[1])
			.map((ent) => ent[0])
	);
</script>

<div
	class="mx-auto grid justify-center gap-2"
	style={`grid-template-columns: repeat(${buffers.length},1fr);`}
>
	{#each buffers as buffer (buffer)}
		<div>
			<h3>{buffer}</h3>
			<NoInverse {buffer} letterPairs={Object.values($letterPairStore)} />
		</div>
	{/each}
</div>
