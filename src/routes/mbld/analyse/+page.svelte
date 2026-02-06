<script lang="ts">
	import { randomScrambleForEvent } from "cubing/scramble";
	import CubeFace from "$lib/components/cube-face.svelte";
	import { mbldStore } from "$lib/stores/mbld";

	let message = $state("");
	let selectedAttemptIndex = $state(-1);
	let selectedAttempt = $derived($mbldStore[selectedAttemptIndex - 1]);

	let generatedScrambles: string[] = $state([]);
	// @todo(nick-ng): shorten date in <select>
</script>

<div>
	<div class="space-between mb-1 flex flex-row gap-1">
		<select class="px-1" bind:value={selectedAttemptIndex}>
			<option value={-1}>New</option>
			{#each $mbldStore.slice(-20) as mbldAttempt, i (mbldAttempt.date)}
				<option value={i + 1}>{mbldAttempt.date}</option>
			{/each}
		</select>
		<button
			disabled={!selectedAttempt}
			onclick={async () => {
				message = "Please wait";
				await navigator.clipboard.writeText(selectedAttempt?.scrambles.join("\n"));
				message = `${selectedAttempt?.scrambles.length} copied to clipboard`;
			}}>Copy Scrambles</button
		>
		<button
			disabled={!selectedAttempt}
			onclick={async () => {
				message = "Please wait";
				await navigator.clipboard.writeText(JSON.stringify(selectedAttempt, null, 2));
				message = `Attempt copied to clipboard`;
			}}>Copy Attempt</button
		>
		<div>{message}</div>
	</div>
	{#if selectedAttempt}
		<div class="flex flex-row justify-start gap-2">
			<div>
				{#each selectedAttempt.cubes as cube, i (`${i}-cube`)}
					<div>
						<pre>{JSON.stringify(cube, null, 2)}</pre>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
