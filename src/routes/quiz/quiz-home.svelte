<script lang="ts">
	import { onMount } from "svelte";
	import {
		QUIZ_MEMO_CONFIDENCE_STORE_KEY,
		QUIZ_COMM_CONFIDENCE_STORE_KEY,
		QUIZ_OLDEST_STORE_KEY,
		QUIZ_RANDOM_STORE_KEY
	} from "$lib/constants";
	import { fetchFlashCards, flashCardStore, flashCardStoreStatus } from "$lib/stores/flash-cards";
	import { quizStore, touchCurrentQuiz } from "$lib/stores/quiz";
	import { optionsStore } from "$lib/stores/options";
	import { upperCaseFirst, isBuffer, isTwist } from "$lib/utils";

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
		cardType
	}: {
		oldest: number;
		memoConfidence: number;
		commConfidence: number;
		random: number;
		cardType: string;
	}) => {
		const flashCardsMap = await fetchFlashCards();
		const flashCards = Object.values(flashCardsMap).filter((f) => f.memo);
		const flashCardTypeInfo = $optionsStore.flashCardTypes[cardType];
		if (!flashCardTypeInfo) {
			return;
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

		// oldest
		remainingFlashCards.toSorted((a, b) => a.lastQuizUnix - b.lastQuizUnix);
		quizCards.push(...remainingFlashCards.splice(0, oldest));

		// low memo confidence
		remainingFlashCards.sort(
			(a, b) => a.memoConfidence * 10 + a.random - (b.memoConfidence * 10 + b.random)
		);
		quizCards.push(...remainingFlashCards.splice(0, memoConfidence));

		// low comm confidence
		remainingFlashCards.sort(
			(a, b) => a.commConfidence * 10 + a.random - (b.commConfidence * 10 + b.random)
		);
		quizCards.push(...remainingFlashCards.splice(0, commConfidence));

		// random
		remainingFlashCards.sort((a, b) => a.random - b.random);
		quizCards.push(...remainingFlashCards.splice(0, random));

		const quizLetterPairs = quizCards.sort((a, b) => a.random - b.random).map((c) => c.letterPair);

		$quizStore = quizLetterPairs;
		touchCurrentQuiz();
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
	<div class="flex flex-row items-end justify-center">
		<h1>Quiz</h1>
	</div>
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		<div>
			<div>
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
				<hr class="my-2" />
				{#each Object.keys($optionsStore.flashCardTypes) as flashCardType (flashCardType)}
					{@const cardTypeInfo = $optionsStore.flashCardTypes[flashCardType]}
					<div class="my-1">
						<button
							class="block w-full py-2 text-center text-xl leading-none"
							onclick={() => {
								makeQuiz({
									commConfidence: customCommConfidence,
									memoConfidence: customMemoConfidence,
									oldest: customOldest,
									random: customRandom,
									cardType: flashCardType
								});
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
