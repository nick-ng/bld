<script lang="ts">
	import type { TwoByTwoAttempt } from "$lib/types";

	import { onMount } from "svelte";
	import { twoByTwoStore } from "$lib/stores/2x2";
	import { formatDate } from "$lib/utils";

	let randomScrambleForEvent: ((event: string) => Promise<string>) | undefined = $state();
	let currentTwoByTwo = $state(0);
	let loadingNewAttempt = $state(false);

	onMount(async () => {
		// @todo(nick-ng): figure out a way to put this file locally
		randomScrambleForEvent = (await import("https://cdn.cubing.net/v0/js/cubing/scramble"))
			.randomScrambleForEvent;
	});
</script>

<div class="flex flex-row gap-2">
	<div>
		{#each $twoByTwoStore as twoByTwo, i (`two-by-two-${twoByTwo.date}-${i}`)}
			<button
				class={`${currentTwoByTwo === i ? "bg-blue-100" : ""}`}
				onclick={() => {
					currentTwoByTwo = i;
				}}>{formatDate(twoByTwo.date, true)}</button
			>
		{/each}
	</div>
	<div>
		<h1>2x2 Trainer</h1>
		{#if $twoByTwoStore[currentTwoByTwo]}
			<div>Hello</div>
			<pre>{JSON.stringify($twoByTwoStore[currentTwoByTwo], null, 2)}</pre>
		{/if}
		<button
			disabled={loadingNewAttempt}
			onclick={async () => {
				if (loadingNewAttempt || !randomScrambleForEvent) {
					return;
				}
				loadingNewAttempt = true;
				console.log("hello");

				const newScramble = await randomScrambleForEvent("222");
				console.log("newScramble", newScramble);
				const newAttempt: TwoByTwoAttempt = {
					date: new Date(),
					bottomFaceColour: "",
					guessBottomLayerMoves: "",
					guessBottomLayerResult: "",
					realBottomLayerMoves: "",
					realBottomLayerResult: "",
					guessOLLCase: "",
					guessOLLPreAuf: "",
					realOLLCase: "",
					realOLLPreAuf: "",
					inspect: "",
					inspectMs: -1,
					scramble: newScramble.toString(),
				};

				$twoByTwoStore = [newAttempt, ...$twoByTwoStore];

				loadingNewAttempt = false;
				currentTwoByTwo = 0;
			}}
		>
			New Scramble
		</button>
	</div>
</div>
