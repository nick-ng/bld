<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import {
		QUIZ_MEMO_CONFIDENCE_STORE_KEY,
		QUIZ_COMM_CONFIDENCE_STORE_KEY,
		QUIZ_OLDEST_STORE_KEY,
		QUIZ_RANDOM_STORE_KEY
	} from "$lib/constants";
	import {
		fetchFlashCards,
		flashCardStore,
		flashCardStoreStatus,
		getFlashCard
	} from "$lib/stores/flash-cards";
	import { quizStore, touchCurrentQuiz } from "$lib/stores/quiz";
	import { optionsStore } from "$lib/stores/options";
	import {
		is3Style,
		isOP,
		upperCaseFirst,
		shuffleArray,
		commutatorDetails,
		isOrozco
	} from "$lib/utils";
	import { sortByLastQuiz, threeStyleCommutators } from "./make-quiz";

	// @todo(nick-ng): move these to the options store
	let customOldest = $state(2);
	let customMemoConfidence = $state(6);
	let customCommConfidence = $state(2);
	let customRandom = $state(2);
	let fixedPairsString = $state($optionsStore.fixedQuiz.join(", "));
	let threeStyle = $derived(threeStyleCommutators(Object.values($flashCardStore), 1, 0));
	let allCount = $derived(Object.values($flashCardStore).length);
	let threeStyleCount = $derived(
		Object.values($flashCardStore).filter((c) => is3Style(c.letterPair)).length
	);
	let orozcoCount = $derived(
		Object.values($flashCardStore).filter(
			(c) => isOrozco(c.letterPair) && c.letterPair[0] !== c.letterPair[1]
		).length
	);
	let oPCount = $derived(Object.values($flashCardStore).filter((c) => isOP(c.letterPair)).length);

	const makeQuiz = async ({
		oldest,
		memoConfidence,
		commConfidence,
		random,
		include3Style,
		includeOP,
		includeOrozco
	}: {
		oldest: number;
		memoConfidence: number;
		commConfidence: number;
		random: number;
		include3Style?: boolean;
		includeOP?: boolean;
		includeOrozco?: boolean;
	}) => {
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

				if (includeOrozco && isOrozco(c.letterPair)) {
					return true;
				}

				return false;
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

		const fixedQuizParams = $page.url.searchParams.get("fq");
		if (fixedQuizParams) {
			const temp = fixedQuizParams.split(",").map((a) => a.trim());
			fixedPairsString = temp.join(", ");
			$optionsStore.fixedQuiz = temp;
		}
	});
</script>

<div class="mx-auto max-w-prose">
	<div class="flex flex-row items-end justify-between">
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
				<li class="mt-1 mb-3 flex flex-row gap-2 lg:mb-0">
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
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={() => {
							makeQuiz({
								commConfidence: customCommConfidence,
								memoConfidence: customMemoConfidence,
								oldest: customOldest,
								random: customRandom,
								include3Style: true,
								includeOP: true,
								includeOrozco: true
							});
						}}
						>All: {customOldest} + {customMemoConfidence} + {customCommConfidence} + {customRandom} =
						{customOldest + customMemoConfidence + customCommConfidence + customRandom} ({allCount})</button
					>
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={() => {
							makeQuiz({
								commConfidence: customCommConfidence,
								memoConfidence: customMemoConfidence,
								oldest: customOldest,
								random: customRandom,
								include3Style: true
							});
						}}
						>3-Style: {customOldest} + {customMemoConfidence} + {customCommConfidence} + {customRandom}
						=
						{customOldest + customMemoConfidence + customCommConfidence + customRandom} ({threeStyleCount})</button
					>
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={() => {
							makeQuiz({
								commConfidence: customCommConfidence,
								memoConfidence: customMemoConfidence,
								oldest: customOldest,
								random: customRandom,
								includeOrozco: true
							});
						}}
						>Orozco: {customOldest} + {customMemoConfidence} + {customCommConfidence} + {customRandom}
						=
						{customOldest + customMemoConfidence + customCommConfidence + customRandom} ({orozcoCount})</button
					>
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={() => {
							makeQuiz({
								commConfidence: customCommConfidence,
								memoConfidence: customMemoConfidence,
								oldest: customOldest,
								random: customRandom,
								includeOP: true
							});
						}}
						>OP: {customOldest} + {customMemoConfidence} + {customCommConfidence} + {customRandom} =
						{customOldest + customMemoConfidence + customCommConfidence + customRandom} ({oPCount})</button
					>
				</li>
				<!-- <li class="mt-1">5 Oldest + 3 Lowest Confidence + 2 Random</li>
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
				</li> -->
				<li class="mt-1">Fixed Quiz</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={async () => {
							const fixedPairs = shuffleArray(threeStyle.lowConfidence)
								.slice(0, 10)
								.map((f) => f.letterPair.toLocaleUpperCase())
								.sort((a, b) => a.localeCompare(b));
							$optionsStore.fixedQuiz = fixedPairs;
							fixedPairsString = fixedPairs.join(", ");
						}}
						>Random Low Confidence ({threeStyle.lowConfidence.length}/{threeStyle.all
							.length})</button
					>
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={async () => {
							const fixedPairs = threeStyle.lowConfidence
								.sort((a, b) => a.letterPair.localeCompare(b.letterPair))
								.slice(0, 10)
								.map((f) => f.letterPair.toLocaleUpperCase());
							$optionsStore.fixedQuiz = fixedPairs;
							fixedPairsString = fixedPairs.join(", ");
						}}
						>Alphabetical Low Confidence ({threeStyle.lowConfidence.length}/{threeStyle.all
							.length})</button
					>
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={async () => {
							const fixedPairs = sortByLastQuiz(threeStyle.lowConfidence)
								.slice(0, 10)
								.map((f) => f.letterPair.toLocaleUpperCase())
								.sort((a, b) => a.localeCompare(b));
							$optionsStore.fixedQuiz = fixedPairs;
							fixedPairsString = fixedPairs.join(", ");
						}}
						>Old Low Confidence ({threeStyle.lowConfidence.length}/{threeStyle.all.length})</button
					>
				</li>
				<li class="mt-1">
					<button
						class="block w-full py-2 text-center text-xl leading-none"
						onclick={async () => {
							const fixedPairs = sortByLastQuiz(Object.values($flashCardStore))
								.filter((a) => is3Style(a.letterPair) && a.letterPair[0] !== a.letterPair[1])
								.slice(0, 10)
								.map((f) => f.letterPair.toLocaleUpperCase())
								.sort((a, b) => a.localeCompare(b));
							$optionsStore.fixedQuiz = fixedPairs;
							fixedPairsString = fixedPairs.join(", ");
						}}>Old Any Pairs</button
					>
				</li>
				<li class="mt-1 flex flex-row">
					<input
						class="block w-full py-2 font-mono text-xl leading-none lg:px-1"
						type="text"
						bind:value={fixedPairsString}
						onblur={() => {
							const fixedPairs = fixedPairsString
								.split(",")
								.map((a) => a.trim().toLocaleUpperCase())
								.filter((a) => a);
							$optionsStore.fixedQuiz = fixedPairs;
						}}
					/>
					<button
						onclick={() => {
							const query = $optionsStore.fixedQuiz.join(",");
							const url = `${location.origin}/quiz?fq=${query}`;
							navigator.clipboard.writeText(url);
						}}>Copy</button
					>
				</li>
				<li class="mt-1">
					<div class="flex w-full flex-row justify-stretch gap-1">
						<button
							class="grow py-2 text-center text-xl leading-none"
							onclick={() => {
								const fixedQuiz = $optionsStore.fixedQuiz
									.map((letterPair) => {
										return {
											letterPair,
											flashCard: getFlashCard(letterPair, $flashCardStore)
										};
									})
									.sort((a, b) => {
										return a.flashCard.lastQuizUnix - b.flashCard.lastQuizUnix;
									})
									.map((a) => a.letterPair.toLocaleLowerCase());

								$quizStore = fixedQuiz;
							}}>Age Order Fixed Quiz</button
						>
						<button
							class="grow py-2 text-center text-xl leading-none"
							onclick={() => {
								const fixedQuiz = $optionsStore.fixedQuiz
									.map((letterPair) => {
										return {
											letterPair,
											flashCard: getFlashCard(letterPair, $flashCardStore),
											r: Math.random()
										};
									})
									.sort((a, b) => {
										return a.r - b.r;
									})
									.map((a) => a.letterPair.toLocaleLowerCase());

								$quizStore = fixedQuiz;
							}}>Random Fixed Quiz</button
						>
					</div>
				</li>
			</ul>
			<details>
				<summary>Commutator Check</summary>
				<table class="border-separate border-spacing-x-2">
					<thead>
						<tr>
							<th class=" text-center">Letter Pair</th>
							<th class="text-left">Commutator</th>
						</tr>
					</thead>
					<tbody>
						{#each $optionsStore.fixedQuiz as letterPair (letterPair)}
							{@const flashCard = getFlashCard(letterPair, $flashCardStore)}
							{#if flashCard}
								<tr>
									<td class="text-center">{letterPair}</td>
									<td class="font-mono"
										>{commutatorDetails(flashCard.commutator).normalisedCommutator}</td
									>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</details>
		</div>
	{/if}
</div>
