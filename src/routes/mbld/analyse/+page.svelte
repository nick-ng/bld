<script lang="ts">
	import Youtube from "$lib/components/youtube.svelte";
	import { mbldStore } from "$lib/stores/mbld";
	import { getVideoId, formatDate } from "$lib/utils";
	import MbldCube from "./mbld-cube.svelte";

	let message = $state("");
	let selectValue = $state(1);
	let selectedIndex = $derived(selectValue - 1);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let player: any = $state(null);
	let cubesEl: HTMLDivElement | null = $state(null);
	let maxHeight = $state("50vh");

	$effect(() => {
		setTimeout(() => {
			if (cubesEl && maxHeight === "50vh") {
				maxHeight = `calc(100vh - ${cubesEl.getBoundingClientRect().top}px)`;
			}
		}, 10);
	});
</script>

<div>
	<div class="space-between mb-1 flex flex-row gap-1">
		<select class="px-1" bind:value={selectValue}>
			{#each $mbldStore.slice(-20) as mbldAttempt, i (mbldAttempt.date)}
				<option value={i + 1}>{formatDate(mbldAttempt.date)}</option>
			{/each}
		</select>
		<button
			disabled={!$mbldStore[selectedIndex]}
			onclick={async () => {
				message = "Please wait";
				await navigator.clipboard.writeText(JSON.stringify($mbldStore[selectedIndex], null, 2));
				message = `Attempt copied to clipboard`;
			}}>Copy Attempt</button
		>
		<button
			disabled={!$mbldStore[selectedIndex]}
			onclick={async () => {
				message = "Please wait";
				await navigator.clipboard.writeText($mbldStore[selectedIndex]?.scrambles.join("\n"));
				message = `${$mbldStore[selectedIndex]?.scrambles.length} scrambles copied to clipboard`;
			}}>Copy Scrambles</button
		>
		<a target="_blank" href="https://namisama269.github.io/scramble-finder/">Scramble Finder</a>
		<div>{message}</div>
	</div>
	<div class="flex flex-row justify-start gap-2">
		<div bind:this={cubesEl} style={`max-height:${maxHeight};`} class="relative overflow-y-scroll">
			{#if $mbldStore[selectedIndex]}
				<table class="sticky border-separate border-spacing-2">
					<tbody>
						<tr>
							<td>Date</td>
							<td>{formatDate($mbldStore[selectedIndex].date)}</td>
						</tr>
						<tr>
							<td>YouTube Link</td>
							<td>
								<input type="text" bind:value={$mbldStore[selectedIndex].youtube_link} />
							</td>
						</tr>
					</tbody>
				</table>
				<table class="w-full border-separate border-spacing-x-2 border-spacing-y-0.5">
					<tbody>
						{#each $mbldStore[selectedIndex].cubes as cube, i (`${i}-cube`)}
							<MbldCube
								index={i}
								{cube}
								onSave={(newCube) => {
									console.log("new cube", newCube);
									$mbldStore[selectedIndex].cubes[i] = newCube;
								}}
								onSeekRequest={(newSec) => {
									if (player) {
										player.seekTo(newSec, true);
									}
								}}
							/>
						{/each}
					</tbody>
				</table>
			{:else if $mbldStore.length === 0}
				<div class="m-3">
					<p>You need to generate and save some MBLD scrambles first.</p>
					<p><a href="/mbld/scramble">Generate scrambles</a></p>
				</div>
			{/if}
		</div>
		<div class="max-h-[70vh] grow">
			{#if $mbldStore[selectedIndex]?.youtube_link}
				{#key $mbldStore[selectedIndex]?.youtube_link}
					<Youtube
						bind:player
						initialVideoId={getVideoId($mbldStore[selectedIndex]?.youtube_link || "").id}
					/>
				{/key}
			{/if}
		</div>
	</div>
</div>
