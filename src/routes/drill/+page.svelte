<script lang="ts">
	import type { DrillItem } from "$lib/drill";

	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
	import { fetchFlashCards, getFlashCard, flashCardStore } from "$lib/stores/flash-cards";
	import { getDrillItems } from "$lib/drill";
	import { putQuiz } from "$lib/quiz";
	import FlashCard from "$lib/components/flash-card.svelte";
	import DrillMaker from "$lib/components/drill-maker.svelte";

	const holdTimeMs = 300;

	// @todo(nick-ng): make drill aware of flash card type
	let drillLetters = $state<DrillItem[]>([]);
	// @todo(nick-ng): save these to local storage
	let showCorners = $state(false);
	let showMemo = $state(false);
	let showImage = $state(false);
	let drillIndex = $state(0);
	let quizState = $state("stand-by"); // stand-by, ready, timing, review
	let pressedAtMs = $state(Date.now());
	let timerStartMs = $state(0);
	let timerStopMs = $state(0);
	let drillLeft = $derived(drillLetters.filter((dl) => !dl.quizzed).length);

	onMount(() => {
		drillLetters = getDrillItems();
		drillIndex = 0;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== " ") {
				return;
			}

			if (quizState === "stand-by" || quizState === "review") {
				quizState = "ready";
				pressedAtMs = Date.now();
			} else if (quizState === "timing") {
				timerStopMs = Date.now();
				drillLetters[drillIndex].quizzed = true;
				drillLetters[drillIndex].timeMs = timerStopMs - timerStartMs;
				localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key !== " ") {
				return;
			}

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
			</tbody>
		</table>
	</div>
	<div class="basis-prose">
		{#if drillLetters.length === 0}
			<div>No drill in progress</div>
		{/if}
		{#if drillLetters.length > 0 && drillLetters.every((dl) => dl.quizzed)}
			<div class="text-center">
				<table>
					<thead>
						<tr>
							<th class="border border-gray-500 px-1 text-center"
								><input
									type="checkbox"
									checked={drillLetters.every((dl) => dl.send)}
									onclick={() => {
										if (drillLetters.every((dl) => dl.send)) {
											drillLetters.forEach((dl) => {
												dl.send = false;
											});
										} else {
											drillLetters.forEach((dl) => {
												dl.send = true;
											});
										}
									}}
								/></th
							>
							<th class="border border-gray-500 px-1 text-left">Letter Pair</th>
							<th class="border border-gray-500 px-1 text-right">Time (s)</th>
						</tr>
					</thead>
					<tbody>
						{#each drillLetters as drillLetter (drillLetter.letterPair)}
							<tr>
								<td class="border border-gray-500 px-1 text-center"
									><input type="checkbox" bind:checked={drillLetter.send} /></td
								>
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
				<button
					type="button"
					disabled={drillLetters.every((dl) => !dl.send)}
					onclick={async () => {
						await fetchFlashCards();

						await Promise.all(
							drillLetters.map((drillLetter) => {
								if (!drillLetter.send) {
									return;
								}

								const flashCard = getFlashCard(
									drillLetter.letterPair,
									drillLetter.flashCardType,
									$flashCardStore
								);

								let drillTimeDs = drillLetter.timeMs / 100;
								if (drillTimeDs < flashCard.drillTimeDs) {
									drillTimeDs = 0.5 * drillTimeDs + 0.5 * flashCard.drillTimeDs;
								}

								let newCommConfidence = flashCard.commConfidence;
								if (drillLetter.timeMs < 15000) {
									newCommConfidence = 2; // if comm confidence was more than 2, reduce to 2
								} else if (drillLetter.timeMs < 5000) {
									newCommConfidence = 3;
								}

								const drillConfidence = Math.min(255, Math.round(drillTimeDs / 2));
								const packedConfidence =
									(drillConfidence << 4) + (newCommConfidence << 2) + flashCard.memoConfidence;

								const formData = new FormData();
								formData.set("type", drillLetter.flashCardType);
								formData.set("confidence", packedConfidence.toString(10));
								return putQuiz(drillLetter.letterPair, formData, true);
							})
						);

						drillLetters = [];
						localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));

						goto("/flash-cards/summary");
					}}>Send</button
				>
			</div>
		{/if}
		{#if drillLetters[drillIndex]?.letterPair && (quizState === "timing" || quizState === "review")}
			<FlashCard
				letterPair={drillLetters[drillIndex].letterPair}
				flashCardType={drillLetters[drillIndex].flashCardType}
				showCorners={quizState === "review"}
				quizShowAnswer={quizState === "review"}
			/>
			<div class="text-center">Took {drillLetters[drillIndex].timeMs / 1000}s</div>
		{/if}
		{#if quizState !== "timing" && drillLeft > 0}
			<div class="text-center">
				<p>Hold space for {holdTimeMs / 1000} seconds then release</p>
				<p>{drillLetters.filter((dl) => !dl.quizzed).length} left</p>
				<div class={`${quizState === "ready" ? "border" : ""} relative h-4`}>
					<div
						class={`${quizState === "ready" ? "animate" : ""} absolute top-0 left-0 h-full bg-red-500`}
					></div>
				</div>
			</div>
		{/if}
		{#if drillLeft > 0 && drillLetters[drillIndex]?.letterPair && quizState === "review"}
			<div class="flex flex-row justify-center gap-2">
				<button
					class="inline-block"
					type="button"
					onclick={() => {
						drillLetters[drillIndex].send = false;
						quizState = "stand-by";
					}}>Not OK</button
				><button
					class="inline-block"
					type="button"
					onclick={() => {
						quizState = "stand-by";
					}}>OK (spacebar)</button
				>
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
