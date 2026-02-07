<script lang="ts">
	import Youtube from "$lib/components/youtube.svelte";
	import { mbldStore } from "$lib/stores/mbld";
	import { getVideoId, hhmmssToSeconds, secondsToHhmmss, formatDate } from "$lib/utils";
	import MbldCube from "./mbld-cube.svelte";

	let message = $state("");
	let selectValue = $state(-1);
	let selectedIndex = $derived(selectValue - 1);
	let player: any = $state(null);
</script>

<div>
	<div class="space-between mb-1 flex flex-row gap-1">
		<select class="px-1" bind:value={selectValue}>
			<option value={-1}>New</option>
			{#each $mbldStore.slice(-20) as mbldAttempt, i (mbldAttempt.date)}
				<option value={i + 1}>{formatDate(mbldAttempt.date)}</option>
			{/each}
		</select>
		<button
			disabled={!$mbldStore[selectedIndex]}
			onclick={async () => {
				message = "Please wait";
				await navigator.clipboard.writeText($mbldStore[selectedIndex]?.scrambles.join("\n"));
				message = `${$mbldStore[selectedIndex]?.scrambles.length} copied to clipboard`;
			}}>Copy Scrambles</button
		>
		<button
			disabled={!$mbldStore[selectedIndex]}
			onclick={async () => {
				message = "Please wait";
				await navigator.clipboard.writeText(JSON.stringify($mbldStore[selectedIndex], null, 2));
				message = `Attempt copied to clipboard`;
			}}>Copy Attempt</button
		>
		<div>{message}</div>
	</div>
	{#if $mbldStore[selectedIndex]}
		<div class="flex flex-row justify-start gap-2">
			<div>
				<table class="border-separate border-spacing-2">
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
				{#each $mbldStore[selectedIndex].cubes as cube, i (`${i}-cube`)}
					<MbldCube
						{cube}
						onSave={(newCube) => {
							console.log("new cube", newCube);
						}}
						onSeekRequest={(newSec) => {
							console.log("newSec", newSec);
						}}
					/>
				{/each}
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
	{/if}
</div>
