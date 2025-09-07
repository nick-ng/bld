<script lang="ts">
	import type { DrillItem } from "$lib/drill";

	import { onMount } from "svelte";
	import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
	import { getDrillItems } from "$lib/drill";
	import FlashCard from "$lib/components/flash-card.svelte";
	import DrillMaker from "$lib/components/drill-maker.svelte";

	// @todo(nick-ng): make drill aware of flash card type
	let drillLetters = $state<DrillItem[]>([]);
	// @todo(nick-ng): save these to local storage
	let showCorners = $state(false);
	let showMemo = $state(false);
	let showImage = $state(false);
	let spaceIsAccept = $state(false);
	let drillIndex = $derived.by(() => {
		if (drillLetters.length === 0) {
			return 0;
		}

		return drillLetters.findIndex((dl) => !dl.quizzed);
	});
	let quizState = $state("stand-by"); // stand-by, ready, timing, review
	let pressedAtMs = $state(Date.now());
	let timerStartMs = $state(0);
	let timerStopMs = $state(0);
	const holdTimeMs = 300;

	const skipDrillResult = (index: number) => {
		if (index < 0 || !drillLetters[index]) {
			return;
		}

		drillLetters[index].quizzed = true;
		drillLetters[index].skipped = true;
		drillLetters[index].timeMs = timerStopMs - timerStartMs;
		localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));
	};

	const acceptDrillResult = (index: number) => {
		if (index < 0) {
			return;
		}

		drillLetters[index].quizzed = true;
		drillLetters[index].skipped = false;
		drillLetters[index].timeMs = timerStopMs - timerStartMs;
		localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));
	};

	onMount(() => {
		drillLetters = getDrillItems();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== " ") {
				return;
			}

			if (event.shiftKey) {
				if (quizState === "review") {
					if (spaceIsAccept) {
						acceptDrillResult(drillIndex);
					} else {
						skipDrillResult(drillIndex);
					}

					quizState = "stand-by";
					pressedAtMs = Date.now();
				}

				return;
			}

			if (quizState === "stand-by") {
				quizState = "ready";
				pressedAtMs = Date.now();
			} else if (quizState === "timing") {
				quizState = "review";
				timerStopMs = Date.now();
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
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
						acceptDrillResult(drillIndex);
						quizState = "stand-by";
						break;
					}
					case "s": {
						console.log("skip");
						skipDrillResult(drillIndex);
						quizState = "stand-by";
						break;
					}
				}
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

<div class="flex justify-between">
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
			<div>
				<table>
					<thead>
						<tr>
							<th class="border border-gray-500 px-1 text-left">Letter Pair</th>
							<th class="border border-gray-500 px-1 text-right">Time (s)</th>
						</tr>
					</thead>
					<tbody>
						{#each drillLetters as drillLetter (drillLetter.letterPair)}
							<tr>
								<td class="border border-gray-500 px-1 text-left uppercase"
									>{drillLetter.letterPair}</td
								>
								<td class="border border-gray-500 px-1 text-right"
									>{(drillLetter.timeMs / 1000).toFixed(1)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if quizState === "timing" || quizState === "review"}
			<FlashCard
				letterPair={drillLetters[drillIndex].letterPair}
				flashCardType="corner"
				showCorners={quizState === "review"}
				quizShowAnswer={quizState === "review"}
			/>
		{:else}
			<div>
				<p>Hold space for 0.5 seconds then release</p>
				<p>{drillLetters.filter((d) => !d.quizzed).length} left</p>
				<div class={`${quizState === "ready" ? "border" : ""} relative h-4`}>
					<div
						class={`${quizState === "ready" ? "animate" : ""} absolute top-0 left-0 h-full bg-red-500`}
					></div>
				</div>
			</div>
		{/if}
		{#if quizState === "review"}
			{@const timerElapsedMs = timerStopMs - timerStartMs}
			<div class="flex flex-col items-center">
				<div class="text-xl">Took {(timerElapsedMs / 1000).toFixed(1)}s</div>
				<div class="flex flex-row gap-2">
					<button
						type="button"
						onclick={() => {
							acceptDrillResult(drillIndex);
							quizState = "stand-by";
						}}>Accept (Shift + A)</button
					>
					<button
						type="button"
						onclick={() => {
							skipDrillResult(drillIndex);
							quizState = "stand-by";
						}}>Skip (Shift + S)</button
					>
				</div>
			</div>
		{/if}
	</div>
	<DrillMaker
		onMakeDrill={(newDrillLetters) => {
			drillLetters = newDrillLetters;
		}}
	/>
</div>

<style>
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
		animation-duration: 305ms;
		animation-name: bar-grow;
		animation-timing-function: linear;
		animation-iteration-count: 1;
		animation-fill-mode: forwards;
	}
</style>
