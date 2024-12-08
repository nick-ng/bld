<script lang="ts">
	import { onMount } from "svelte";
	import {
		QUIZ_LOW_CONFIDENCE_STORE_KEY,
		QUIZ_OLDEST_STORE_KEY,
		QUIZ_RANDOM_STORE_KEY
	} from "$lib/constants";
	import { fetchFlashCards, flashCardStore, flashCardStoreStatus } from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";
	import { is3Style, isOP, upperCaseFirst } from "$lib/utils";

	let customOldest = 2;
	let customLowConfidence = 6;
	let customRandom = 2;

	const makeQuiz = async (
		oldest: number,
		lowConfidence: number,
		random: number,
		include3Style: boolean,
		includeOP: boolean
	) => {
		const flashCardsMap = await fetchFlashCards();
		const flashCards = Object.values(flashCardsMap).filter((f) => f.memo);
		const remainingFlashCards = flashCards
			.filter((c) => {
				if (include3Style && is3Style(c.letterPair)) {
					return true;
				}

				if (includeOP && isOP(c.letterPair)) {
					return true;
				}

				return is3Style(c.letterPair) && isOP(c.letterPair);
			})
			.map((c) => ({
				...c,
				random: Math.random()
			}));
		const quizCards: typeof remainingFlashCards = [];

		// oldest
		remainingFlashCards.toSorted((a, b) => a.lastQuizUnix - b.lastQuizUnix);
		quizCards.push(...remainingFlashCards.splice(0, oldest));

		// least confidence
		remainingFlashCards.sort(
			(a, b) => a.confidence * 10 + a.random - (b.confidence * 10 + b.random)
		);
		quizCards.push(...remainingFlashCards.splice(0, lowConfidence));

		// random
		remainingFlashCards.sort((a, b) => a.random - b.random);
		quizCards.push(...remainingFlashCards.splice(0, random));

		const quizLetterPairs = quizCards.sort((a, b) => a.random - b.random).map((c) => c.letterPair);

		$quizStore = quizLetterPairs;
	};

	onMount(() => {
		const savedOldest = localStorage.getItem(QUIZ_OLDEST_STORE_KEY);
		if (typeof savedOldest === "string" && !isNaN(parseInt(savedOldest, 10))) {
			customOldest = parseInt(savedOldest, 10);
		}

		const savedLowConfidence = localStorage.getItem(QUIZ_LOW_CONFIDENCE_STORE_KEY);
		if (typeof savedLowConfidence === "string" && !isNaN(parseInt(savedLowConfidence, 10))) {
			customLowConfidence = parseInt(savedLowConfidence, 10);
		}

		const savedRandom = localStorage.getItem(QUIZ_RANDOM_STORE_KEY);
		if (typeof savedRandom === "string" && !isNaN(parseInt(savedRandom, 10))) {
			customRandom = parseInt(savedRandom, 10);
		}
	});
</script>

<div class="max-w-prose mx-auto">
	<div class="flex flex-row justify-between items-end">
		<a href="/flash-cards">Back</a>
		<h1>Quiz</h1>
		<div></div>
	</div>
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		{@const flatFlashCards = Object.values($flashCardStore).filter((f) => f.memo)}
		<div>
			<p>
				<a href="/flash-cards/edit"
					>{flatFlashCards.length} letter pair{flatFlashCards.length === 1 ? "" : "s"}</a
				>
			</p>
			<ul>
				<li class="mt-1 mb-3 lg:mb-0 flex flex-row gap-2">
					<div class="flex-grow">
						<button
							class="block py-2 lg:py-1 w-full"
							type="button"
							on:click={() => {
								customOldest = Math.max(0, customOldest + 1);
								localStorage.setItem(QUIZ_OLDEST_STORE_KEY, `${customOldest}`);
							}}>➕</button
						>
						<div class="px-1 min-w-5 text-center">
							<span class="font-mono">{customOldest}</span> Oldest
						</div>
						<button
							class="block py-2 lg:py-1 w-full"
							type="button"
							on:click={() => {
								customOldest = Math.max(0, customOldest - 1);
								localStorage.setItem(QUIZ_OLDEST_STORE_KEY, `${customOldest}`);
							}}>➖</button
						>
					</div>
					<div class="flex-grow">
						<button
							class="block py-2 lg:py-1 w-full"
							type="button"
							on:click={() => {
								customLowConfidence = Math.max(0, customLowConfidence + 1);
								localStorage.setItem(QUIZ_LOW_CONFIDENCE_STORE_KEY, `${customLowConfidence}`);
							}}>➕</button
						>
						<div class="px-1 min-w-5 text-center">
							<span class="font-mono">{customLowConfidence}</span> Low Confidence
						</div>
						<button
							class="block py-2 lg:py-1 w-full"
							type="button"
							on:click={() => {
								customLowConfidence = Math.max(0, customLowConfidence - 1);
								localStorage.setItem(QUIZ_LOW_CONFIDENCE_STORE_KEY, `${customLowConfidence}`);
							}}>➖</button
						>
					</div>
					<div class="flex-grow">
						<button
							class="block py-2 lg:py-1 w-full"
							type="button"
							on:click={() => {
								customRandom = Math.max(0, customRandom + 1);
								localStorage.setItem(QUIZ_RANDOM_STORE_KEY, `${customRandom}`);
							}}>➕</button
						>
						<div class="px-1 min-w-5 text-center">
							<span class="font-mono">{customRandom}</span> Random
						</div>
						<button
							class="block py-2 lg:py-1 w-full"
							type="button"
							on:click={() => {
								customRandom = Math.max(0, customRandom - 1);
								localStorage.setItem(QUIZ_RANDOM_STORE_KEY, `${customRandom}`);
							}}>➖</button
						>
					</div>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
							makeQuiz(customOldest, customLowConfidence, customRandom, true, true);
						}}
						>All: {customOldest} + {customLowConfidence} + {customRandom} = {customOldest +
							customLowConfidence +
							customRandom}</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
							makeQuiz(customOldest, customLowConfidence, customRandom, true, false);
						}}
						>3-Style: {customOldest} + {customLowConfidence} + {customRandom} = {customOldest +
							customLowConfidence +
							customRandom}</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
							makeQuiz(customOldest, customLowConfidence, customRandom, false, true);
						}}
						>OP: {customOldest} + {customLowConfidence} + {customRandom} = {customOldest +
							customLowConfidence +
							customRandom}</button
					>
				</li>
				<li class="mt-1">5 Oldest + 3 Lowest Confidence + 2 Random</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
							makeQuiz(5, 3, 2, true, true);
						}}>All: 5 + 3 + 2 = 10</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
							makeQuiz(5, 3, 2, true, false);
						}}>3-Style: 5 + 3 + 2 = 10</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
							makeQuiz(5, 3, 2, false, true);
						}}>OP: 5 + 3 + 2 = 10</button
					>
				</li>
			</ul>
		</div>
	{/if}
</div>
