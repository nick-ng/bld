<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import {
		QUIZ_MEMO_CONFIDENCE_STORE_KEY,
		QUIZ_COMM_CONFIDENCE_STORE_KEY,
		QUIZ_OLDEST_STORE_KEY,
		QUIZ_RANDOM_STORE_KEY
	} from "$lib/constants";
	import { fetchFlashCards, flashCardStore, flashCardStoreStatus } from "$lib/stores/flash-cards";
	import { quizStore, quizTypeStore, touchCurrentQuiz } from "$lib/stores/quiz";
	import { optionsStore } from "$lib/stores/options";
	import { upperCaseFirst, isBuffer, isTwist } from "$lib/utils";
	import { makeLeitnerQuiz } from "$lib/quiz";

	// @todo(nick-ng): move these to the options store
	let customOldest = $state(2);
	let customMemoConfidence = $state(6);
	let customCommConfidence = $state(2);
	let customRandom = $state(2);
	let nonEmptyFlashCards = $derived(
		Object.values($flashCardStore).filter((f) => f.memo || f.commutator || f.image)
	);
	let allCounts = $derived(
		Object.keys($optionsStore.flashCardTypes).reduce(
			(prev, curr) => {
				const flashCardTypeInfo = $optionsStore.flashCardTypes[curr];
				prev[curr] = nonEmptyFlashCards.filter(
					(f) =>
						!isBuffer(f.letterPair, flashCardTypeInfo.bufferPiece) &&
						!isTwist(f.letterPair, flashCardTypeInfo.samePieces)
				).length;

				return prev;
			},
			{} as { [key: string]: number }
		)
	);

	const makeQuiz = async ({
		oldest,
		memoConfidence,
		commConfidence,
		random,
		cardType,
		randomOldestFactor
	}: {
		oldest: number;
		memoConfidence: number;
		commConfidence: number;
		random: number;
		cardType: string;
		randomOldestFactor: number;
	}) => {
		const flashCardsMap = await fetchFlashCards();
		const flashCards = Object.values(flashCardsMap).filter((f) => f.memo);
		const flashCardTypeInfo = $optionsStore.flashCardTypes[cardType];
		if (!flashCardTypeInfo) {
			return [];
		}
		const remainingFlashCards = flashCards
			.filter((c) => {
				if (isTwist(c.letterPair, flashCardTypeInfo.samePieces)) {
					return false;
				}

				if (isBuffer(c.letterPair, flashCardTypeInfo.bufferPiece)) {
					return false;
				}

				return true;
			})
			.map((c) => ({
				...c,
				random: Math.random()
			}));

		const quizCards: typeof remainingFlashCards = [];

		// low memo confidence
		if (memoConfidence > 0) {
			remainingFlashCards.sort(
				(a, b) => a.memoConfidence + a.random - (b.memoConfidence + b.random)
			);
			quizCards.push(...remainingFlashCards.splice(0, memoConfidence));
		}

		// low comm confidence
		if (commConfidence > 0) {
			remainingFlashCards.sort(
				(a, b) => a.commConfidence + a.random - (b.commConfidence + b.random)
			);
			quizCards.push(...remainingFlashCards.splice(0, commConfidence));
		}

		// random
		if (random > 0) {
			remainingFlashCards.sort((a, b) => a.random - b.random);
			quizCards.push(...remainingFlashCards.splice(0, random));
		}

		// oldest
		if (oldest > 0) {
			remainingFlashCards.sort(
				(a, b) =>
					a.lastQuizUnix +
					a.random * randomOldestFactor -
					(b.lastQuizUnix + b.random * randomOldestFactor)
			);
			quizCards.push(...remainingFlashCards.splice(0, oldest));
		}

		const quizLetterPairs = quizCards.sort((a, b) => a.random - b.random).map((c) => c.letterPair);
		return quizLetterPairs;
	};

	onMount(() => {
		const savedOldest = localStorage.getItem(QUIZ_OLDEST_STORE_KEY);
		if (typeof savedOldest === "string" && !isNaN(parseInt(savedOldest, 10))) {
			customOldest = parseInt(savedOldest, 10);
		}

		const savedMemoConfidence = localStorage.getItem(QUIZ_MEMO_CONFIDENCE_STORE_KEY);
		const parsedMemoConfidence =
			typeof savedMemoConfidence === "string" && parseInt(savedMemoConfidence, 10);
		if (typeof parsedMemoConfidence === "number") {
			customMemoConfidence = parsedMemoConfidence;
		}

		const savedCommConfidence = localStorage.getItem(QUIZ_COMM_CONFIDENCE_STORE_KEY);
		const prasedCommConfidence =
			typeof savedCommConfidence === "string" && parseInt(savedCommConfidence, 10);
		if (typeof prasedCommConfidence === "number") {
			customCommConfidence = prasedCommConfidence;
		}

		const savedRandom = localStorage.getItem(QUIZ_RANDOM_STORE_KEY);
		if (typeof savedRandom === "string" && !isNaN(parseInt(savedRandom, 10))) {
			customRandom = parseInt(savedRandom, 10);
		}
	});
</script>

<div class="mx-auto max-w-prose">
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		<div>
			<div>
				<h2 class="text-center">Leitner Quiz</h2>
				{#each Object.keys($optionsStore.flashCardTypes) as flashCardType (flashCardType)}
					{@const cardTypeInfo = $optionsStore.flashCardTypes[flashCardType]}
					<div class="my-1">
						<button
							class="block w-full py-2 text-center text-xl leading-none"
							onclick={async () => {
								try {
									const flashCardsMap = await fetchFlashCards();
									const flashCards = Object.values(flashCardsMap).filter(
										(f) =>
											f.memo &&
											!isBuffer(f.letterPair, cardTypeInfo.bufferPiece) &&
											!isTwist(f.letterPair, cardTypeInfo.samePieces)
									);
									const quizLetterPairs = await makeLeitnerQuiz({
										flashCardArray: flashCards,
										minStandBy: $optionsStore.leitnerMinReviewStandBy,
										minRetired: $optionsStore.leitnerMinReviewRetired,
										retiredMaxAgeDays: $optionsStore.leitnerRetiredMaxAgeDays,
										sessionNumber: $optionsStore.leitnerSessionNumbers[flashCardType] || 0
									});
									$quizStore = quizLetterPairs;
									$quizTypeStore = "leitner";
									touchCurrentQuiz();
									goto(`/quiz?t=${flashCardType}`);
								} catch (err) {
									console.error("Error when making quiz", err);
								}
							}}>{cardTypeInfo.name} ({allCounts[flashCardType]})</button
						>
					</div>
				{/each}
				<hr />
				<h2 class="text-center">Settings</h2>
				<div class="my-1 flex flex-row gap-2">
					<div class="flex-grow">
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customOldest = Math.max(0, customOldest + 1);
								localStorage.setItem(QUIZ_OLDEST_STORE_KEY, `${customOldest}`);
							}}>➕</button
						>
						<div class="min-w-5 px-1 text-center">
							<span class="font-mono">{customOldest}</span> Oldest
						</div>
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customOldest = Math.max(0, customOldest - 1);
								localStorage.setItem(QUIZ_OLDEST_STORE_KEY, `${customOldest}`);
							}}>➖</button
						>
					</div>
					<div class="flex-grow">
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customMemoConfidence = Math.max(0, customMemoConfidence + 1);
								localStorage.setItem(QUIZ_MEMO_CONFIDENCE_STORE_KEY, `${customMemoConfidence}`);
							}}>➕</button
						>
						<div class="min-w-5 px-1 text-center">
							<span class="font-mono">{customMemoConfidence}</span> Memo Confidence
						</div>
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customMemoConfidence = Math.max(0, customMemoConfidence - 1);
								localStorage.setItem(QUIZ_MEMO_CONFIDENCE_STORE_KEY, `${customMemoConfidence}`);
							}}>➖</button
						>
					</div>
					<div class="flex-grow">
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customCommConfidence = Math.max(0, customCommConfidence + 1);
								localStorage.setItem(QUIZ_COMM_CONFIDENCE_STORE_KEY, `${customCommConfidence}`);
							}}>➕</button
						>
						<div class="min-w-5 px-1 text-center">
							<span class="font-mono">{customCommConfidence}</span> Comm Confidence
						</div>
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customCommConfidence = Math.max(0, customCommConfidence - 1);
								localStorage.setItem(QUIZ_COMM_CONFIDENCE_STORE_KEY, `${customCommConfidence}`);
							}}>➖</button
						>
					</div>
					<div class="flex-grow">
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customRandom = Math.max(0, customRandom + 1);
								localStorage.setItem(QUIZ_RANDOM_STORE_KEY, `${customRandom}`);
							}}>➕</button
						>
						<div class="min-w-5 px-1 text-center">
							<span class="font-mono">{customRandom}</span> Random
						</div>
						<button
							class="block w-full py-2 lg:py-1"
							type="button"
							onclick={() => {
								customRandom = Math.max(0, customRandom - 1);
								localStorage.setItem(QUIZ_RANDOM_STORE_KEY, `${customRandom}`);
							}}>➖</button
						>
					</div>
				</div>
				<h2 class="text-center">Quiz</h2>
				{#each Object.keys($optionsStore.flashCardTypes) as flashCardType (flashCardType)}
					{@const cardTypeInfo = $optionsStore.flashCardTypes[flashCardType]}
					<div class="my-1">
						<button
							class="block w-full py-2 text-center text-xl leading-none"
							onclick={async () => {
								try {
									const quizLetterPairs = await makeQuiz({
										commConfidence: customCommConfidence,
										memoConfidence: customMemoConfidence,
										oldest: customOldest,
										random: customRandom,
										cardType: flashCardType,
										randomOldestFactor: 0
									});
									$quizStore = quizLetterPairs;
									$quizTypeStore = "normal";
									touchCurrentQuiz();
									goto(`/quiz?t=${flashCardType}`);
								} catch (err) {
									console.error("Error when making quiz", err);
								}
							}}
							>{cardTypeInfo.name}: {customOldest} + {customMemoConfidence} + {customCommConfidence}
							+ {customRandom} =
							{customOldest + customMemoConfidence + customCommConfidence + customRandom} ({allCounts[
								flashCardType
							]})</button
						>
					</div>
				{/each}
				<h2 class="text-center">Review</h2>
				{#each Object.keys($optionsStore.flashCardTypes) as flashCardType (flashCardType)}
					{@const cardTypeInfo = $optionsStore.flashCardTypes[flashCardType]}
					<div class="my-1">
						<button
							class="block w-full py-2 text-center text-xl leading-none"
							onclick={async () => {
								try {
									const quizLetterPairs = await makeQuiz({
										commConfidence: customCommConfidence,
										memoConfidence: customMemoConfidence,
										oldest: customOldest,
										random: customRandom,
										cardType: flashCardType,
										randomOldestFactor: 60 * 60 * 24 * 7 // 1 week in seconds
									});
									const url = `/flash-cards?t=${flashCardType}&f=${quizLetterPairs.join("+")}`;
									goto(url);
								} catch (err) {
									console.error("Error when making study list", err);
								}
							}}
							>{cardTypeInfo.name}: {customOldest} + {customMemoConfidence} + {customCommConfidence}
							+ {customRandom} =
							{customOldest + customMemoConfidence + customCommConfidence + customRandom} ({allCounts[
								flashCardType
							]})</button
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
