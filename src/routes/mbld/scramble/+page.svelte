<script lang="ts">
	import Cube from "cubejs";
	import CubeFace from "$lib/components/cube-face.svelte";

	const cube = new Cube();
	let scrambleCount = $state(8);

	let scrambles: string[] = $state([]);
</script>

<div>
	<div>
		<label
			>Generate Scrambles <input
				class="w-16 px-0.5"
				type="number"
				bind:value={scrambleCount}
			/></label
		><button
			type="button"
			onclick={() => {
				Cube.initSolver();
				const newScrambles: string[] = [];
				for (let i = 0; i < scrambleCount; i++) {
					// @todo(nick-ng): 10 randomise a cube
					const randomCube = Cube.random();
					randomCube.move("x y2");
					const solution = randomCube.solve();
					const scrambleMoves = Cube.inverse(solution)
						.replaceAll("u", "Uw")
						.replaceAll("r", "Rw")
						.replaceAll("f", "Fw")
						.replaceAll("d", "Dw")
						.replaceAll("l", "Lw")
						.replaceAll("b", "Bw");
					newScrambles.push(scrambleMoves);
				}

				scrambles = newScrambles;
			}}>Generate</button
		>
	</div>
	<table>
		<tbody>
			{#each scrambles as scramble, i (`${scramble}`)}
				<tr class={i % 7 === 0 ? "bg-slate-200" : ""}>
					<td class="border border-black p-2 text-right">{i + 1}</td>
					<td class="border border-black p-2">
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
