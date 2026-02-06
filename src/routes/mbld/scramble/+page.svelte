<script lang="ts">
	import CubeFace from "$lib/components/cube-face.svelte";
	import { randomScrambleForEvent } from "cubing/scramble";

	let scrambleCount = $state(8);

	let scrambles: string[] = $state([]);
</script>

<div>
	<div class="mb-1">
		<label>Scrambles <input class="w-16 px-0.5" type="number" bind:value={scrambleCount} /></label
		><button
			class="inline-block"
			type="button"
			onclick={async () => {
				const newScrambles: string[] = [];
				for (let i = 0; i < scrambleCount; i++) {
					const alg = await randomScrambleForEvent("333bf");
					newScrambles.push(alg.toString());
				}

				scrambles = newScrambles;
			}}>Generate</button
		>
	</div>
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
						<div class="flex flex-row gap-1">
							<CubeFace {scramble} face={"L"} size={32} />
							<CubeFace {scramble} face={"F"} size={32} />
							<CubeFace {scramble} face={"R"} size={32} />
						</div></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
