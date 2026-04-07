<script lang="ts">
	import type { TwoByTwoAttempt } from "$lib/types";

	import { onMount } from "svelte";
	import { twoByTwoStore } from "$lib/stores/2x2";
	import { formatDate } from "$lib/utils";
	import CubeFace from "$lib/components/cube-face.svelte";

	const drawScrambleSize = 36;

	const bottomLayerOptions = ["Layer", "Bar Front", "Bar Left", "Bar Right", "Bar Back", "No Bar"];
	const ollOptions = ["Sune", "Anti-sune", "Pi", "P (headlights)", "L", "T", "H"];
	const aufOptions = ["No AUF", "U", "U'", "U2"];

	let randomScrambleForEvent: ((event: string) => Promise<string>) | undefined = $state();
	let currentTwoByTwoIndex = $state(0);
	let loadingNewAttempt = $state(false);
	let inspectTimerState = $state("standby");
	let inspectTimerStartMs = $state(0);

	onMount(() => {
		(async () => {
			// @todo(nick-ng): figure out a way to put this file locally
			randomScrambleForEvent = (await import("https://cdn.cubing.net/v0/js/cubing/scramble"))
				.randomScrambleForEvent;
		})();

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key !== " ") {
				return;
			}

			if (
				!$twoByTwoStore[currentTwoByTwoIndex] ||
				$twoByTwoStore[currentTwoByTwoIndex].inspectMs >= 0
			) {
				return;
			}

			if (inspectTimerState === "standby") {
				inspectTimerState = "running";
				inspectTimerStartMs = Date.now();
				return;
			}

			if (inspectTimerState === "running") {
				$twoByTwoStore[currentTwoByTwoIndex].inspectMs = Date.now() - inspectTimerStartMs;
				inspectTimerStartMs = 0;
				inspectTimerState = "standby";

				return;
			}
		};

		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keyup", handleKeyUp);
		};
	});
</script>

<div class="flex flex-row gap-2">
	<div class="flex h-[calc(100vh-34px)] flex-col gap-0.5 overflow-y-scroll">
		{#each $twoByTwoStore as twoByTwo, i (`two-by-two-${twoByTwo.date}-${i}`)}
			<button
				class={`${currentTwoByTwoIndex === i ? "bg-blue-100" : ""}`}
				onclick={() => {
					currentTwoByTwoIndex = i;
				}}
				>{formatDate(twoByTwo.date, true)},
				{twoByTwo.inspectMs >= 0 ? `${(twoByTwo.inspectMs / 1000).toFixed(0)}s` : "-"}</button
			>
		{/each}
	</div>
	<div>
		<h1 class="text-center">2x2 Trainer</h1>
		{#if $twoByTwoStore[currentTwoByTwoIndex]}
			<div class="flex flex-col items-center gap-1">
				<div class="inline-block border border-gray-500 px-2 py-1 text-3xl">
					{$twoByTwoStore[currentTwoByTwoIndex].scramble}
				</div>
				<div class="flex flex-row justify-center gap-1">
					<div class="flex flex-col justify-center">
						<CubeFace
							scramble={$twoByTwoStore[currentTwoByTwoIndex].scramble}
							face="L"
							size={drawScrambleSize}
							twoByTwo
						/>
					</div>
					<div class="flex flex-col justify-center gap-1">
						<CubeFace
							scramble={$twoByTwoStore[currentTwoByTwoIndex].scramble}
							face="U"
							size={drawScrambleSize}
							twoByTwo
						/>
						<CubeFace
							scramble={$twoByTwoStore[currentTwoByTwoIndex].scramble}
							face="F"
							size={drawScrambleSize}
							twoByTwo
						/>
						<CubeFace
							scramble={$twoByTwoStore[currentTwoByTwoIndex].scramble}
							face="D"
							size={drawScrambleSize}
							twoByTwo
						/>
					</div>
					<div class="flex flex-col justify-center">
						<CubeFace
							scramble={$twoByTwoStore[currentTwoByTwoIndex].scramble}
							face="R"
							size={drawScrambleSize}
							twoByTwo
						/>
					</div>
					<div class="flex flex-col justify-center">
						<CubeFace
							scramble={$twoByTwoStore[currentTwoByTwoIndex].scramble}
							face="B"
							size={drawScrambleSize}
							twoByTwo
						/>
					</div>
				</div>
				<table class="table">
					<thead>
						<tr>
							<th></th>
							<th>Guess</th>
							<th>Actual</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Bottom Face Colour</td>
							<td colspan="2">
								<div class="space-around flex flex-row gap-3">
									<label
										><input
											type="radio"
											name="bottomFaceColour"
											value="white"
											bind:group={$twoByTwoStore[currentTwoByTwoIndex].bottomFaceColour}
										/> ⬜</label
									>
									<label
										><input
											type="radio"
											name="bottomFaceColour"
											value="orange"
											bind:group={$twoByTwoStore[currentTwoByTwoIndex].bottomFaceColour}
										/> 🟧</label
									>
									<label
										><input
											type="radio"
											name="bottomFaceColour"
											value="green"
											bind:group={$twoByTwoStore[currentTwoByTwoIndex].bottomFaceColour}
										/> 🟩</label
									>
									<label
										><input
											type="radio"
											name="bottomFaceColour"
											value="red"
											bind:group={$twoByTwoStore[currentTwoByTwoIndex].bottomFaceColour}
										/> 🟥</label
									>
									<label
										><input
											type="radio"
											name="bottomFaceColour"
											value="blue"
											bind:group={$twoByTwoStore[currentTwoByTwoIndex].bottomFaceColour}
										/> 🟦</label
									>
									<label
										><input
											type="radio"
											name="bottomFaceColour"
											value="yellow"
											bind:group={$twoByTwoStore[currentTwoByTwoIndex].bottomFaceColour}
										/> 🟨</label
									>
								</div>
							</td>
						</tr>
						<tr>
							<td>Bottom Layer</td>
							<td>
								<select
									class="w-full px-1"
									bind:value={$twoByTwoStore[currentTwoByTwoIndex].guessBottomLayerResult}
								>
									<option disabled value="">Guess</option>
									{#each bottomLayerOptions as bottomLayerOption (bottomLayerOption)}
										<option value={bottomLayerOption}>{bottomLayerOption}</option>
									{/each}
								</select>
							</td>
							<td>
								<select
									class="w-full px-1"
									bind:value={$twoByTwoStore[currentTwoByTwoIndex].realBottomLayerResult}
								>
									<option disabled value="">Real</option>
									{#each bottomLayerOptions as bottomLayerOption (bottomLayerOption)}
										<option value={bottomLayerOption}>{bottomLayerOption}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td>OLL</td>
							<td>
								<select
									class="w-full px-1"
									bind:value={$twoByTwoStore[currentTwoByTwoIndex].guessOLLCase}
								>
									<option disabled value="">Guess</option>
									{#each ollOptions as ollOption (ollOption)}
										<option value={ollOption}>{ollOption}</option>
									{/each}
								</select>
							</td>
							<td>
								<select
									class="w-full px-1"
									bind:value={$twoByTwoStore[currentTwoByTwoIndex].realOLLCase}
								>
									<option disabled value="">Real</option>
									{#each ollOptions as ollOption (ollOption)}
										<option value={ollOption}>{ollOption}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td>OLL Pre-AUF</td>
							<td>
								<select
									class="w-full px-1"
									bind:value={$twoByTwoStore[currentTwoByTwoIndex].guessOLLPreAuf}
								>
									<option disabled value="">Guess</option>
									{#each aufOptions as aufOption (aufOption)}
										<option value={aufOption}>{aufOption}</option>
									{/each}
								</select>
							</td>
							<td>
								<select
									class="w-full px-1"
									bind:value={$twoByTwoStore[currentTwoByTwoIndex].realOLLPreAuf}
								>
									<option disabled value="">Real</option>
									{#each aufOptions as aufOption (aufOption)}
										<option value={aufOption}>{aufOption}</option>
									{/each}
								</select>
							</td>
						</tr>
					</tbody>
				</table>
				{#if $twoByTwoStore[currentTwoByTwoIndex].inspectMs >= 0}
					<div>
						Inspected in {($twoByTwoStore[currentTwoByTwoIndex].inspectMs / 1000).toFixed(1)} seconds
						<button
							class="inline"
							onclick={() => {
								$twoByTwoStore[currentTwoByTwoIndex].inspectMs = -1;
							}}>Retry</button
						>
					</div>
				{:else if inspectTimerState === "running"}
					<div>Inspecting</div>
				{:else}
					<div>Press Space to start and stop inspection</div>
				{/if}
			</div>
		{/if}
		<button
			disabled={loadingNewAttempt}
			onclick={async () => {
				if (loadingNewAttempt || !randomScrambleForEvent) {
					return;
				}
				loadingNewAttempt = true;

				const newScramble = await randomScrambleForEvent("222");
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
				currentTwoByTwoIndex = 0;
			}}
		>
			New Scramble
		</button>
	</div>
</div>

<style>
	.table td {
		border: 1px solid grey;
		line-height: 1;
		padding: 4px;
	}
</style>
