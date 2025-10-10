<script lang="ts">
	import type { DrillItem } from "$lib/drill";

	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
	import { fetchFlashCards, getFlashCard, flashCardStore } from "$lib/stores/flash-cards";
	import { getDrillItems } from "$lib/drill";
	import { patchQuiz } from "$lib/quiz";
	import { parseCommutator } from "$lib/utils";
	import FlashCard from "$lib/components/flash-card.svelte";
	import DrillMaker from "$lib/components/drill-maker.svelte";

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
	let drillWeight = $state(0.7);
	let actualDrillWeight = $derived(Math.max(0.0001, Math.min(1, drillWeight)));

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
			<div class="border border-gray-300 p-2 text-center dark:border-gray-500">
				<table class="w-full">
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
							<th class="border border-gray-500 px-1 text-center" colspan="3">Letter Pair</th>
						</tr>
					</thead>
					<tbody>
						{#each drillLetters as drillLetter (drillLetter.letterPair)}
							{@const flashCard = getFlashCard(
								drillLetter.letterPair,
								drillLetter.flashCardType,
								$flashCardStore
							)}
							<tr>
								<td class="border border-gray-500 px-1 text-center"
									><input type="checkbox" bind:checked={drillLetter.send} /></td
								>
								<td class="border border-gray-500 px-1 text-center"
									><span class="uppercase">{drillLetter.letterPair}</span>
									<span>{parseCommutator(flashCard.commutator).normalisedCommutator}</span></td
								>
								<td class="border border-gray-500 px-1 text-right"
									>{(drillLetter.timeMs / 1000).toFixed(1)}</td
								>
								<td class="border border-gray-500 px-1 text-right"
									>{(flashCard.drillTimeMs / 1000).toFixed(0)}→{(
										Math.min(flashCard.drillTimeMs / 1000, drillLetter.timeMs / 1000) *
											actualDrillWeight +
										Math.max(flashCard.drillTimeMs / 1000, drillLetter.timeMs / 1000) *
											(1 - actualDrillWeight)
									).toFixed(0)}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="mt-2 flex flex-row items-stretch gap-2">
					<input class="block w-16 text-right" type="number" bind:value={drillWeight} step={0.1} />
					<button
						class="grow"
						type="button"
						onclick={async () => {
							if (drillLetters.some((dl) => dl.send)) {
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

										const drillTimeMs = drillLetter.timeMs;
										const adjustedDrillTimeMs =
											Math.min(drillTimeMs, flashCard.drillTimeMs) * actualDrillWeight +
											Math.max(drillTimeMs, flashCard.drillTimeMs) * (1 - actualDrillWeight);

										let newCommConfidence = flashCard.commConfidence;
										if (drillLetter.timeMs < 15000) {
											newCommConfidence = 2; // if comm confidence was more than 2, reduce to 2
										} else if (drillLetter.timeMs < 5000) {
											newCommConfidence = 3;
										}

										const formData = new FormData();
										formData.set("type", drillLetter.flashCardType);
										formData.set("drillTimeMs", adjustedDrillTimeMs.toFixed(0));
										return patchQuiz(drillLetter.letterPair, formData, true);
									})
								);
							}

							drillLetters = [];
							localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));

							goto("/flash-cards/summary");
						}}>{drillLetters.every((dl) => !dl.send) ? "End Quiz" : "Send"}</button
					>
				</div>
			</div>
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
				<div class={`text-center ${quizState === "timing" ? "hidden lg:block" : ""}`}>
					Took {drillLetters[drillIndex].timeMs / 1000}s
				</div>
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
					<p>{drillLetters.filter((dl) => !dl.quizzed).length} left</p>
				</div>
				<div class={`${quizState === "ready" ? "border" : ""} relative h-4`}>
					<div
						class={`${quizState === "ready" ? "animate" : ""} absolute top-0 left-0 h-full bg-red-500`}
						style={`animation-duration: ${holdTimeMs + 5}ms;`}
					></div>
				</div>
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
