<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import {
		fetchFlashCards,
		flashCardStoreStatus,
		getAllFlashCardsOfType,
		flashCardStore,
	} from "$lib/stores/flash-cards";
	import { quizStore, quizTypeStore, touchCurrentQuiz } from "$lib/stores/quiz";
	import { optionsStore } from "$lib/stores/options";
	import { upperCaseFirst, isBuffer, isTwist, daysAgo } from "$lib/utils";
	import { makeLeitnerQuiz, getLeitnerTag } from "$lib/quiz";
	import DrillMaker from "$lib/components/drill-maker.svelte";

	let flashCardType = page.url.searchParams.get("t") || "corner";
	// @todo(nick-ng): move these to the options store
	let nonEmptyFlashCards = $derived(
		getAllFlashCardsOfType(flashCardType, $flashCardStore).filter(
			(f) => f.memo || f.commutator || f.image
		)
	);
	let allCounts = $derived(
		Object.keys($optionsStore.flashCardTypes).reduce(
			(prev, curr) => {
				const flashCardTypeInfo = $optionsStore.flashCardTypes[curr];
				const allFlashCards = nonEmptyFlashCards.filter(
					(f) =>
						!isBuffer(f.letterPair, flashCardTypeInfo.bufferPiece) &&
						!isTwist(f.letterPair, flashCardTypeInfo.samePieces)
				);
				const retiredCardsCount = allFlashCards.filter(
					(fc) => getLeitnerTag(fc.tags).leitnerDeck === "R"
				).length;

				prev[curr] = `${retiredCardsCount}/${allFlashCards.length}`;

				return prev;
			},
			{} as { [key: string]: string }
		)
	);
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
									const quizLetterPairs = makeLeitnerQuiz({
										flashCardArray: flashCards,
										minStandBy: $optionsStore.leitnerMinReviewStandBy,
										minRetired: $optionsStore.leitnerMinReviewRetired,
										retiredMaxAgeDays: $optionsStore.leitnerRetiredMaxAgeDays,
										sessionNumber: $optionsStore.flashCardTypes[flashCardType].leitnerSession || 0,
									});
									$quizStore = quizLetterPairs;
									$quizTypeStore = "leitner";
									touchCurrentQuiz();
									goto(`/quiz?t=${flashCardType}`);
								} catch (err) {
									console.error("Error when making quiz", err);
								}
							}}
							>{cardTypeInfo.name},
							{allCounts[flashCardType]}, {daysAgo(
								new Date((cardTypeInfo.leitnerLastQuizUnix || 0) * 1000)
							)}</button
						>
					</div>
				{/each}
				<hr />
				<h2 class="text-center">Drill</h2>
				<DrillMaker
					onMakeDrill={() => {
						goto("/drill");
					}}
				/>
			</div>
		</div>
	{/if}
</div>
