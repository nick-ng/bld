<script lang="ts">
	import { randomScrambleForEvent } from "cubing/scramble";
	import CubeFace from "$lib/components/cube-face.svelte";
	import { mbldStore } from "$lib/stores/mbld";
	import { formatDate } from "$lib/utils";

	let scrambleCount = $state(8);
	let message = $state("");
	let selectedAttempt = $state(-1);

	let generatedScrambles: string[] = $state([]);
	let scrambles = $derived(
		selectedAttempt === -1 ? generatedScrambles : $mbldStore[selectedAttempt - 1]?.scrambles
	);
	const previewSize = 24;
</script>

<div>
	<div class="space-between mb-1 flex flex-row gap-1">
		<select class="px-1" bind:value={selectedAttempt}>
			<option value={-1}>New</option>
			<option disabled value="">Newer attempts at the top</option>
			{#each $mbldStore.slice(-20) as mbldAttempt, i (mbldAttempt.date)}
				<option value={i + 1}>{formatDate(mbldAttempt.date)}</option>
			{/each}
		</select>
		{#if selectedAttempt === -1}
			<label>Scrambles <input class="w-16 px-0.5" type="number" bind:value={scrambleCount} /></label
			><button
				class="inline-block"
				type="button"
				disabled={selectedAttempt !== -1}
				onclick={async () => {
					if (selectedAttempt !== -1) {
						return;
					}

					const newScrambles: string[] = [];
					message = `Generating scramble 1/${scrambleCount}`;
					for (let i = 0; i < scrambleCount; i++) {
						message = `Generating scramble ${i + 1}/${scrambleCount}`;
						const alg = await randomScrambleForEvent("333bf");
						newScrambles.push(alg.toString());
					}

					generatedScrambles = newScrambles;
					message = `Generated ${scrambleCount} scrambles`;
				}}>Generate</button
			>
		{:else}
			<button
				disabled={!selectedAttempt}
				onclick={async () => {
					message = "Please wait";
					await navigator.clipboard.writeText(scrambles.join("\n"));
					message = `${scrambles.length} copied to clipboard`;
				}}>Copy Scrambles</button
			>
		{/if}
		<div>{message}</div>
	</div>
	<div class="mb-3 flex flex-col items-center">
		{#if scrambles.length > 0 && selectedAttempt === -1}
			<button
				class="mb-1"
				type="button"
				onclick={() => {
					$mbldStore = [
						{
							date: new Date(),
							youtube_link: "",
							offset_s: 0,
							chapters: "",
							time_s: 0,
							scrambles: generatedScrambles,
							cubes: generatedScrambles.map(() => ({
								dnf_reason: "",
								exec_start_s: 0,
								is_dnf: false,
								pack: "",
								scramble: "",
							})),
						},
						...$mbldStore,
					];

					selectedAttempt = 1;
				}}>Save</button
			>
		{/if}
		<table>
			<tbody>
				{#each scrambles as scramble, i (`${scramble}`)}
					{#if i % 7 === 0}
						<tr class="bg-slate-200">
							<td class="border border-black px-2 text-right">#</td>
							<td class="border border-black px-2">Scramble</td>
							<td class="border border-black px-2">Draw Scramble</td>
						</tr>
					{/if}
					<tr>
						<td class="border border-black px-2 text-right">{i + 1}</td>
						<td class="border border-black px-2">
							<div class="grid grid-cols-9 gap-2">
								{#each scramble.split(" ") as move, i (`${move}-${i}`)}
									<div>{move}</div>
								{/each}
							</div>
						</td>
						<td class="border border-black p-2">
							<div class="flex flex-row gap-3">
								<CubeFace {scramble} face="L" size={previewSize} />
								<CubeFace {scramble} face="F" size={previewSize} />
								<CubeFace {scramble} face="R" size={previewSize} />
							</div></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if scrambles.length > 0 && selectedAttempt === -1}
			<button
				class="mt-1"
				type="button"
				onclick={() => {
					$mbldStore = [
						{
							date: new Date(),
							youtube_link: "",
							chapters: "",
							offset_s: 0,
							time_s: 0,
							scrambles: generatedScrambles,
							cubes: generatedScrambles.map(() => ({
								dnf_reason: "",
								exec_start_s: 0,
								is_dnf: false,
								pack: "",
								scramble: "",
							})),
						},
						...$mbldStore,
					];

					selectedAttempt = 1;
				}}>Save</button
			>
		{/if}
	</div>
</div>
