<script lang="ts">
	import type { DrillItem } from "$lib/drill";
	import { onMount } from "svelte";
	import { getDrillItems, drillSets, makeDrillSet } from "$lib/drill";
	import FlashCard from "$lib/components/flash-card.svelte";

	// @todo(nick-ng): save these to localstorage
	let drillLetters = $state<DrillItem[]>([]);
	let showCorners = $state(false);
	let showMemo = $state(false);
	let showImage = $state(false);
	let spaceIsAccept = $state(false);
	let drillSetKey = $state("none");
	let drillIndex = $derived.by(() => {
		if (drillLetters.length === 0) {
			return 0;
		}

		return drillLetters.findIndex((dl) => !dl.quizzed);
	});
	let mainArea = $state<HTMLElement | null>(null);
	let quizState = $state("stand-by"); // stand-by, ready, timing, review
	let pressedAtMs = $state(Date.now());
	let timerStartMs = $state(0);
	let timerStopMs = $state(0);
	const holdTimeMs = 500;

	const skipDrillResult = () => {
		drillLetters[drillIndex].quizzed = true;
		drillLetters[drillIndex].skipped = true;
	};

	const acceptDrillResult = () => {
		// @todo(nick-ng): update drill time
		drillLetters[drillIndex].quizzed = true;
		drillLetters[drillIndex].skipped = false;
		drillLetters[drillIndex].timeMs = timerStopMs - timerStartMs;
	};

	onMount(() => {
		drillLetters = getDrillItems();
	});
</script>

<div
	class="flex justify-between"
	role="button"
	tabindex="0"
	bind:this={mainArea}
	onkeydown={(event) => {
		if (event.key !== " ") {
			return;
		}

		if (quizState === "review") {
			quizState = "ready";
			pressedAtMs = Date.now();
			if (spaceIsAccept) {
				acceptDrillResult();
			} else {
				skipDrillResult();
			}
		} else if (quizState === "stand-by") {
			quizState = "ready";
			pressedAtMs = Date.now();
		} else if (quizState === "timing") {
			quizState = "review";
			timerStopMs = Date.now();
		}
	}}
	onkeyup={(event) => {
		if (quizState === "ready") {
			if (Date.now() - pressedAtMs >= holdTimeMs) {
				quizState = "timing";
				timerStartMs = Date.now();
			} else {
				quizState = "stand-by";
			}
		} else if (quizState === "review" && event.shiftKey) {
			switch (event.key.toLowerCase()) {
				case "a": {
					console.log("accept");
					acceptDrillResult();
					quizState = "stand-by";
					break;
				}
				case "s": {
					console.log("skip");
					skipDrillResult();
					quizState = "stand-by";
					break;
				}
			}
		}
	}}
>
	<div>
		<table>
			<tbody>
				<tr>
					<td>
						<label for="drill-corners-visibility">Corners</label>
					</td>
					<td>
						<input
							class="ml-2"
							type="checkbox"
							id="drill-corners-visibility"
							bind:checked={showCorners}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="drill-memo-visibility">Memo</label>
					</td>
					<td>
						<input
							class="ml-2"
							type="checkbox"
							id="drill-memo-visibility"
							bind:checked={showMemo}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="drill-image-visibility">Image</label>
					</td>
					<td>
						<input
							class="ml-2"
							type="checkbox"
							id="drill-image-visibility"
							bind:checked={showImage}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="drill-space-action">Space Accepts</label>
					</td>
					<td>
						<input
							class="ml-2"
							type="checkbox"
							id="drill-space-action"
							bind:checked={spaceIsAccept}
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="basis-prose mx-auto">
		{#if drillLetters.length === 0}
			<div>No drill in progress</div>
		{:else if drillIndex < 0}
			<!-- @todo(nick-ng): review drill then flash cards -->
			<div>Review drill results</div>
		{:else if quizState === "timing" || quizState === "review"}
			<FlashCard
				letterPair={drillLetters[drillIndex].letterPair}
				flashCardType="corner"
				showCorners={quizState === "review"}
				quizShowAnswer={quizState === "review"}
			/>
		{:else}
			<div>Hold space for 0.5 seconds then release</div>
		{/if}
		{#if quizState === "review"}
			{@const timerElapsedMs = timerStopMs - timerStartMs}
			<div class="flex flex-col items-center">
				<div class="text-xl">Took {(timerElapsedMs / 1000).toFixed(1)}s</div>
				<div class="flex flex-row gap-2">
					<button
						type="button"
						onclick={() => {
							acceptDrillResult();
							quizState = "stand-by";
							if (mainArea) {
								mainArea.focus();
							}
						}}>Accept (Shift + A)</button
					>
					<button
						type="button"
						onclick={() => {
							skipDrillResult();
							quizState = "stand-by";
							if (mainArea) {
								mainArea.focus();
							}
						}}>Skip (Shift + S)</button
					>
				</div>
			</div>
		{/if}
	</div>
	<div class="flex flex-col gap-1">
		<label
			>Drill Set: <select class="" bind:value={drillSetKey}>
				<option value="none">Choose a set</option>
				{#each drillSets as drillSet (drillSet.key)}
					<option value={drillSet.key}>{drillSet.label}</option>
				{/each}
			</select>
		</label>
		<button
			type="button"
			onclick={async () => {
				drillLetters = await makeDrillSet(drillSetKey);
				console.log("mainArea", mainArea);
				if (mainArea) {
					mainArea.focus();
				}
			}}>Start Drill</button
		>
	</div>
</div>
