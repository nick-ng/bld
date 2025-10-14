<script lang="ts">
	import type { DrillItem } from "$lib/drill";

	import { onMount } from "svelte";
	import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
	import { getDrillItems } from "$lib/drill";
	import FlashCard from "$lib/components/flash-card.svelte";
	import DrillMaker from "$lib/components/drill-maker.svelte";
	import DrillSummary from "./drill-summary.svelte";

	const holdTimeMs = 300;

	// @todo(nick-ng): make drill aware of flash card type
	let drillLetters = $state<DrillItem[]>([]);
	// @todo(nick-ng): save these to local storage
	let showCorners = $state(false);
	let showMemo = $state(true);
	let showImage = $state(true);
	let drillIndex = $state(0);
	let quizState = $state("stand-by"); // stand-by, ready, timing, review
	let pressedAtMs = $state(Date.now());
	let timerStartMs = $state(0);
	let timerStopMs = $state(0);
	let drillLeft = $derived(drillLetters.filter((dl) => !dl.quizzed).length);

	const onButtonDown = () => {
		if (quizState === "stand-by" || (quizState === "review" && drillLeft > 0)) {
			quizState = "ready";
			pressedAtMs = Date.now();
		} else if (quizState === "timing") {
			timerStopMs = Date.now();
			drillLetters[drillIndex].quizzed = true;
			drillLetters[drillIndex].timeMs = timerStopMs - timerStartMs;
			localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));
		}
	};

	const onButtonUp = () => {
		if (quizState === "ready") {
			if (Date.now() - pressedAtMs >= holdTimeMs) {
				drillIndex = drillLetters.findIndex((dl) => !dl.quizzed);
				quizState = "timing";
				timerStartMs = Date.now();
			} else {
				quizState = "stand-by";
			}
		} else if (quizState === "timing") {
			quizState = "review";
		}
	};

	onMount(() => {
		drillLetters = getDrillItems();
		drillIndex = 0;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === " ") {
				onButtonDown();

				return;
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === " ") {
				onButtonUp();

				return;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	});
</script>

<div class="flex flex-col justify-between lg:flex-row">
	<div class="hidden lg:block">
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
			</tbody>
		</table>
	</div>
	<div class="basis-prose lg:flex lg:flex-row lg:justify-center lg:gap-2">
		{#if drillLetters.length === 0}
			<div>No drill in progress</div>
		{/if}
		{#if drillLetters.length > 0 && drillLetters.every((dl) => dl.quizzed)}
			<DrillSummary
				{drillLetters}
				afterSubmit={(newQuizState, newDrillLetters) => {
					quizState = newQuizState;
					if (newDrillLetters) {
						drillLetters = newDrillLetters;
					}
				}}
			/>
		{/if}
		<div>
			{#if drillLeft > 0 && drillLetters[drillIndex]?.letterPair && quizState === "review"}
				<div class="flex flex-row items-center justify-center gap-2">
					<label class="like-button"
						><input type="checkbox" bind:checked={drillLetters[drillIndex].send} /> OK</label
					>
					<button
						class="inline-block"
						type="button"
						onclick={() => {
							quizState = "stand-by";
						}}
						><span class="hidden lg:inline">Next (space)</span><span class="lg:hidden">Next</span
						></button
					>
				</div>
			{/if}
			{#if (quizState === "timing" || quizState === "review") && drillLetters[drillIndex]?.letterPair}
				<FlashCard
					letterPair={drillLetters[drillIndex].letterPair}
					flashCardType={drillLetters[drillIndex].flashCardType}
					showCorners={quizState === "review"}
					{showMemo}
					showCommutator={quizState === "review"}
					{showImage}
					extraClass={quizState === "timing" ? "hidden lg:block" : ""}
				/>
				{#if quizState !== "timing"}
					<div class="text-center">
						Took {drillLetters[drillIndex].timeMs / 1000}s
					</div>
				{/if}
			{/if}
			{#if quizState !== "review" && drillLeft > 0}
				<div class="self-stretch lg:hidden">
					<button
						type="button"
						class="timer-button mb-1 w-full"
						ontouchstart={onButtonDown}
						ontouchend={onButtonUp}
					>
						{#if quizState === "timing" && drillLetters[drillIndex]?.letterPair}
							<FlashCard
								letterPair={drillLetters[drillIndex].letterPair}
								flashCardType={drillLetters[drillIndex].flashCardType}
								showCorners={false}
								{showMemo}
								showCommutator={false}
								{showImage}
							/>
						{:else}
							Hold for {holdTimeMs / 1000} seconds then release
						{/if}
					</button>
				</div>
			{/if}
			{#if quizState !== "timing" && drillLeft > 0}
				<div class="hidden text-center lg:block">
					<p>Hold space for {holdTimeMs / 1000} seconds then release</p>
				</div>
				<div class={`${quizState === "ready" ? "border" : ""} relative h-4`}>
					<div
						class={`${quizState === "ready" ? "animate" : ""} absolute top-0 left-0 h-full bg-red-500`}
						style={`animation-duration: ${holdTimeMs + 5}ms;`}
					></div>
				</div>
			{/if}
			{#if quizState !== "timing" && quizState !== "ready" && drillLetters.some((dl) => !dl.quizzed)}
				<button
					class="mx-auto"
					onclick={() => {
						for (let i = 0; i < drillLetters.length; i++) {
							if (drillLetters[i].quizzed) {
								continue;
							}

							drillLetters[i].quizzed = true;
							drillLetters[i].send = false;
							drillLetters[i].timeMs = -1;
						}

						localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));
					}}
					>End Drill {drillLetters.filter((dl) => dl.quizzed).length}/{drillLetters.length}</button
				>
			{/if}
		</div>
	</div>
	<DrillMaker
		extraClass="hidden lg:block"
		onMakeDrill={(newDrillLetters) => {
			drillLetters = newDrillLetters;
			quizState = "stand-by";
		}}
	/>
</div>

<style>
	.timer-button {
		height: calc(80vh - 38px - 16px - 20px);
	}

	@keyframes bar-grow {
		0% {
			background-color: #ff0000;
			width: 0;
		}

		99.99% {
			background-color: #ff0000;
			width: 99.99%;
		}

		100% {
			background-color: #00ff00;
			width: 100%;
		}
	}

	.animate {
		animation-name: bar-grow;
		animation-timing-function: linear;
		animation-iteration-count: 1;
		animation-fill-mode: forwards;
	}
</style>
