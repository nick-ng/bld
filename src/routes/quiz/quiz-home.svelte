<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import {
		QUIZ_LOW_CONFIDENCE_STORE_KEY,
		QUIZ_OLDEST_STORE_KEY,
		QUIZ_RANDOM_STORE_KEY
	} from "$lib/constants";
	import {
		fetchFlashCards,
		flashCardStore,
		flashCardStoreStatus,
		getFlashCard
	} from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";
	import { optionsStore } from "$lib/stores/options";
	import { is3Style, isOP, upperCaseFirst, shuffleArray, commutatorDetails } from "$lib/utils";
	import { commConfidenceQuiz, sortByLastQuiz } from "./make-quiz";

	// @todo(nick-ng): separate memo confidence and commutator confidence.
	let customOldest = 2;
	let customLowConfidence = 6;
	let customRandom = 2;
	let fixedPairsString = $optionsStore.fixedQuiz.join(", ");

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

		const fixedQuizParams = $page.url.searchParams.get("fq");
		if (fixedQuizParams) {
			const temp = fixedQuizParams.split(",").map((a) => a.trim());
			fixedPairsString = temp.join(", ");
			$optionsStore.fixedQuiz = temp;
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
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={async () => {
							const temp = commConfidenceQuiz(Object.values($flashCardStore), 1, 0);

							const fixedPairs = shuffleArray(temp)
								.slice(0, 10)
								.map((f) => f.letterPair.toLocaleUpperCase())
								.sort((a, b) => a.localeCompare(b));
							$optionsStore.fixedQuiz = fixedPairs;
							fixedPairsString = fixedPairs.join(", ");
						}}>Random Low Confidence Pairs</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={async () => {
							const temp = commConfidenceQuiz(Object.values($flashCardStore), 1, 0);

							const fixedPairs = sortByLastQuiz(temp)
								.slice(0, 10)
								.map((f) => f.letterPair.toLocaleUpperCase())
								.sort((a, b) => a.localeCompare(b));
							$optionsStore.fixedQuiz = fixedPairs;
							fixedPairsString = fixedPairs.join(", ");
						}}>Old Low Confidence Pairs</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={async () => {
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
						class="w-full block text-xl leading-none lg:px-1 py-2 font-mono"
						type="text"
						bind:value={fixedPairsString}
						on:blur={() => {
							const fixedPairs = fixedPairsString
								.split(",")
								.map((a) => a.trim().toLocaleUpperCase())
								.filter((a) => a);
							$optionsStore.fixedQuiz = fixedPairs;
						}}
					/>
					<button
						on:click={() => {
							const query = $optionsStore.fixedQuiz.join(",");
							const url = `${location.origin}/quiz?fq=${query}`;
							navigator.clipboard.writeText(url);
						}}>Copy</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 text-center"
						on:click={() => {
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
						}}>Start Fixed Quiz</button
					>
				</li>
			</ul>
			<details>
				<summary>Commutator Check</summary>
				<table class="border-spacing-x-2 border-separate">
					<thead>
						<tr>
							<th class=" text-center">Letter Pair</th>
							<th class="text-left">Commutator</th>
						</tr>
					</thead>
					<tbody>
						{#each $optionsStore.fixedQuiz as letterPair}
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
