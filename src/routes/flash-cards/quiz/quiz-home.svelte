<script lang="ts">
	import type { FlashCard } from "$lib/types";

	import { flashCardStore } from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";

	const makeQuiz = (
		flashCards: FlashCard[],
		oldest: number,
		lowConfidence: number,
		random: number
	): string[] => {
		const remainingFlashCards = flashCards.map((c) => ({
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

		return quizLetterPairs;
	};
</script>

<div class="max-w-prose mx-auto">
	<div class="flex flex-row justify-between items-end">
		<a href="/flash-cards">Back</a>
		<h1>Quiz</h1>
		<div />
	</div>
	{#if typeof $flashCardStore === "string"}
		<div class="">{$flashCardStore}</div>
	{:else}
		{@const flatFlashCards = Object.values($flashCardStore)}
		<div>
			<p>
				<a href="/flash-cards/edit"
					>{flatFlashCards.length} letter pair{flatFlashCards.length === 1 ? "" : "s"}</a
				>
			</p>
			<ul>
				<li>
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							$quizStore = makeQuiz(flatFlashCards, 10, 5, 5);
						}}>10 Oldest + 5 Lowest Confidence + 5 Random</button
					>
				</li>
			</ul>
		</div>
	{/if}
</div>
