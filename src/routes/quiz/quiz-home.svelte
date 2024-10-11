<script lang="ts">
	import { fetchFlashCards, flashCardStore, flashCardStoreStatus } from "$lib/stores/flash-cards";
	import { quizStore } from "$lib/stores/quiz";
	import { is3Style, isOP, upperCaseFirst } from "$lib/utils";

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
</script>

<div class="max-w-prose mx-auto">
	<div class="flex flex-row justify-between items-end">
		<a href="/flash-cards">Back</a>
		<h1>Quiz</h1>
		<div />
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
				<li class="mt-1">10 Oldest + 5 Lowest Confidence + 5 Random</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							makeQuiz(10, 5, 5, true, true);
						}}>All: 10/5/5</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							makeQuiz(10, 5, 5, true, false);
						}}>3-Style: 10/5/5</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							makeQuiz(10, 5, 5, false, true);
						}}>OP: 10/5/5</button
					>
				</li>
				<li class="mt-1">5 Oldest + 3 Lowest Confidence + 2 Random</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							makeQuiz(5, 3, 2, true, true);
						}}>All: 5/3/2</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							makeQuiz(5, 3, 2, true, false);
						}}>3-Style: 5/3/2</button
					>
				</li>
				<li class="mt-1">
					<button
						class="w-full block text-xl leading-none py-2 button-default text-center"
						on:click={() => {
							makeQuiz(5, 3, 2, false, true);
						}}>OP: 5/3/2</button
					>
				</li>
			</ul>
		</div>
	{/if}
</div>
