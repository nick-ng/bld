<script lang="ts">
	import { mbldSessionSchema } from "$lib/types";
	import { mbldStore } from "$lib/stores/mbld";
	import { formatDate } from "$lib/utils";
	import MbldCube from "./mbld-cube.svelte";
	import VideoPlayer from "$lib/components/video-player.svelte";

	let message = $state("");
	let selectValue = $state(1);
	let selectedIndex = $derived(selectValue - 1);
	let cubesEl: HTMLDivElement | null = $state(null);
	let maxHeight = $state("50vh");
	let seekTo: ((secs: number) => void) | null = $state(null);
	let importScramblesString = $state("");
	let importDateString = $state("");
	let importTimeString = $state("");
	let finalDate = $derived(
		importDateString
			? new Date(`${importDateString}T${importTimeString || "00:00"}:00.000`)
			: new Date()
	);
	let videoUrl = $derived(
		$mbldStore[selectedIndex].local_video_link || $mbldStore[selectedIndex]?.youtube_link
	);
	let importAttemptString = $state("");

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
			<option value={$mbldStore.length === 0 ? 1 : -1}>Import</option>
			{#if $mbldStore.length === 0}
				<option disabled value="">No attempts. Generate or import scrambles.</option>
			{/if}
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
		<button
			onclick={() => {
				selectValue = $mbldStore.length === 0 ? 1 : -1;
			}}
		>
			Import
		</button>
		<a target="_blank" href="https://namisama269.github.io/scramble-finder/">Scramble Finder</a>
		<div>{message}</div>
	</div>
	<div class="flex flex-row justify-start gap-2">
		<div bind:this={cubesEl} class="relative overflow-y-scroll" style={`max-height:${maxHeight};`}>
			{#if $mbldStore[selectedIndex]}
				<table class="border-separate border-spacing-2">
					<tbody>
						<tr>
							<td>Date</td>
							<td>{formatDate($mbldStore[selectedIndex].date)}</td>
						</tr>
						<tr>
							<td>Local Video Link</td>
							<td>
								<input type="text" bind:value={$mbldStore[selectedIndex].local_video_link} />
							</td>
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
									$mbldStore[selectedIndex].cubes[i] = newCube;
								}}
								onSeekRequest={(newSec) => {
									if (seekTo) {
										seekTo(newSec);
									}
								}}
							/>
						{/each}
					</tbody>
				</table>
			{:else}
				{@const newScrambles = importScramblesString
					.split("\n")
					.map((s) => s.trim())
					.filter((s) => s.length > 0)}
				<div class="m-3">
					{#if $mbldStore.length === 0}
						<p>You need to generate and save some MBLD scrambles first.</p>
						<p><a href="/mbld/scramble">Generate scrambles</a></p>
					{/if}
					<h2>Import Scrambles</h2>
					<p>Enter the date of the attempt and paste scrambles then click "Import"</p>
					<div class="flex flex-row gap-2">
						<label>Date: <input class="" type="date" bind:value={importDateString} /></label>
						<label>Time: <input class="" type="time" bind:value={importTimeString} /></label>
						<span class="grow"></span>
						<span>{finalDate.toLocaleString()}</span>
					</div>
					<textarea class="mt-1 h-32 w-full resize-y px-0.5" bind:value={importScramblesString}
					></textarea>
					<button
						type="button"
						disabled={newScrambles.length === 0}
						onclick={() => {
							if (newScrambles.length === 0) {
								return;
							}
							$mbldStore = [
								{
									date: finalDate,
									youtube_link: "",
									offset_s: 0,
									chapters: "",
									time_s: 0,
									scrambles: newScrambles,
									cubes: newScrambles.map(() => ({
										dnf_reason: "",
										exec_start_s: 0,
										is_dnf: false,
										pack: "",
										scramble: "",
									})),
								},
								...$mbldStore,
							];

							importDateString = "";
							importTimeString = "";
							importScramblesString = "";
							selectValue = 1;
						}}>Import</button
					>
					<h2>Import Attempt</h2>
					<textarea class="mt-1 h-32 w-full resize-y px-0.5" bind:value={importAttemptString}
					></textarea>
					<button
						type="button"
						disabled={importAttemptString.length === 0}
						onclick={() => {
							try {
								const unknownAttempt = JSON.parse(importAttemptString);
								const validAttempt = mbldSessionSchema.parse(unknownAttempt);
								$mbldStore = [validAttempt, ...$mbldStore];
								importAttemptString = "";
								selectValue = 1;
							} catch (e) {
								message = `Error importing attempt: ${e}`;
							}
						}}
					>
						Import Attempt
					</button>
				</div>
			{/if}
		</div>
		<div class="grow" style={`max-height:${maxHeight};`}>
			{#if videoUrl}
				<VideoPlayer
					{videoUrl}
					getSeekTo={(newSeekTo) => {
						seekTo = newSeekTo;
					}}
				/>
			{/if}
		</div>
	</div>
</div>
