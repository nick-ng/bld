<script lang="ts">
	import Cube from "cubejs";
	import { mbldStore } from "$lib/stores/mbld";

	interface Props {
		scramble: string;
		size: number;
		face: string;
	}

	const cubeFaceRange = (face: string) => {
		switch (face.toUpperCase()) {
			case "U": {
				return [0, 9];
			}
			case "R": {
				return [9, 18];
			}
			case "F": {
				return [18, 27];
			}
			case "D": {
				return [27, 36];
			}
			case "L": {
				return [36, 45];
			}
			case "B": {
				return [45, 54];
			}
			default: {
				return [0, 0];
			}
		}
	};

	let { scramble, size, face }: Props = $props();
	const cube = new Cube();
	//
	// U...UR...RF...FD...DL...LB...B
	let cubeFacesString = $derived.by(() => {
		cube.identity();
		cube.move(
			scramble
				.replaceAll("Uw", "u")
				.replaceAll("Rw", "r")
				.replaceAll("Fw", "f")
				.replaceAll("Dw", "d")
				.replaceAll("Lw", "l")
				.replaceAll("Bw", "b")
		);
		return cube.asString();
	});
</script>

<div class="grid grid-cols-3 place-content-center justify-center gap-0.5">
	{#each cubeFacesString.slice(cubeFaceRange(face)[0], cubeFaceRange(face)[1]) as cubeFace, i (`${face}-${i}`)}
		<div
			class={`flex items-center justify-center font-bold ${cubeFace.toLowerCase()} border border-black`}
			style={`width:${size}px;height:${size}px;`}
		>
			{#if i === 4}
				{face.toUpperCase()}
			{/if}
		</div>
	{/each}
</div>

<style>
	.b {
		color: #ffffff;
		background-color: #0000ff;
	}

	.d {
		color: #000000;
		background-color: #ffff00;
	}

	.f {
		color: #000000;
		background-color: #00dc00;
	}

	.l {
		color: #000000;
		background-color: #ff9933;
	}

	.r {
		color: #ffffff;
		background-color: #ff0000;
	}

	.u {
		color: #000000;
		background-color: #ffffff;
	}
</style>
