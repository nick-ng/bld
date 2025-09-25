<script lang="ts">
	import { page } from "$app/state";
	import { quizStore, quizTypeStore } from "$lib/stores/quiz";
	import {
		flashCardStoreStatus,
		getFlashCard,
		loadFlashCard,
		flashCardStore
	} from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { updateTags } from "$lib/utils";
	import { putQuiz, isLastLeitnerSession, getLeitnerTag } from "$lib/quiz";
	import FlashCard from "$lib/components/flash-card.svelte";

	let flashCardType = page.url.searchParams.get("t") || "corner";
	let flashCard = $derived(getFlashCard($quizStore[0], flashCardType, $flashCardStore));
	let showAnswer = $state(false);
	let submittingQuizAnswer = $state(false);
	let abortController: AbortController | null = null;
	let memoConfidence = $state(-1);
	let commConfidence = $state(-1);

	const handleLetterPair = (newLetterPair: string) => {
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();
		(async () => {
			const tempFlashCard = await loadFlashCard(
				newLetterPair,
				flashCardType,
				abortController.signal
			);
			abortController = null;

			if (tempFlashCard) {
				memoConfidence = tempFlashCard.memoConfidence;
				commConfidence = tempFlashCard.commConfidence;
			}
		})();
	};

	$effect.pre(() => {
		handleLetterPair($quizStore[0]);
	});

	const handleConfidence = async (newConfidence: number, confidenceType = "memo") => {
		switch (confidenceType) {
			case "comm": {
				commConfidence = newConfidence;
				break;
			}
			case "memo":
			default: {
				memoConfidence = newConfidence;
			}
		}
	};
	const submitConfidence = async (letterPair: string) => {
		const flashCard = getFlashCard(letterPair, flashCardType, $flashCardStore);
		if (!flashCard) {
			return;
		}

		submittingQuizAnswer = true;

		const formData = new FormData();
		formData.set("type", flashCard.type);

		const packedConfidence =
			((flashCard.drillTimeDs * 2) << 4) + (commConfidence << 2) + memoConfidence;
		formData.set("confidence", packedConfidence.toString(10));

		if ($quizTypeStore === "leitner") {
			const sessionNumber = $optionsStore.flashCardTypes[flashCardType].leitnerSession || 0;
			if ($quizStore.length === 1) {
				$optionsStore.flashCardTypes[flashCardType].leitnerLastQuizUnix = Date.now() / 1000;
				$optionsStore.flashCardTypes[flashCardType].leitnerSession = (sessionNumber + 1) % 10;
			}

			if (commConfidence >= 2 && memoConfidence >= 2) {
				const leitnerDeckInfo = getLeitnerTag(flashCard.tags);
				// if last deck, change to L:R:YYYY-MM-DD
				// if expired from retired deck, put back in retired deck
				if (leitnerDeckInfo.leitnerDeck === "S" || leitnerDeckInfo.leitnerDeck === "C") {
					formData.set("tags", updateTags(flashCard.tags, "L:", `L:${sessionNumber}`));
				} else if (
					leitnerDeckInfo.leitnerDeck === "R" ||
					isLastLeitnerSession(leitnerDeckInfo.leitnerDeck, sessionNumber)
				) {
					const now = new Date();
					formData.set(
						"tags",
						updateTags(
							flashCard.tags,
							"L:",
							`L:R:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`
						)
					);
				}
				// one of the three session decks where this session isn't last. do nothing
			} else {
				formData.set("tags", updateTags(flashCard.tags, "L:", "L:C"));
			}
		}

		// reset quiz
		commConfidence = -1;
		memoConfidence = -1;
		showAnswer = false;
		await putQuiz(letterPair, formData);

		submittingQuizAnswer = false;
	};
</script>

<div class="mx-auto max-w-prose">
	{#if $quizStore.length > 0 && $flashCardStoreStatus.status === "loaded"}
		<FlashCard
			letterPair={flashCard.letterPair}
			{flashCardType}
			quizLeft={$quizStore.length}
			showCorners={showAnswer}
			showMemo={showAnswer}
			showCommutator={showAnswer}
			showImage={showAnswer}
			onQuizEnd={() => {
				$quizStore = [];
			}}
			extraClass="min-h-[50vh] lg:min-h-[460px]"
		/>
		{#if showAnswer}
			<div class="absolute bottom-2 left-0 z-1 w-full px-2 lg:relative lg:w-full lg:px-0">
				<table class="mb-2 w-full border-collapse">
					<tbody>
						<tr>
							<td class="w-1 pr-1">Memo</td>
							{#each [0, 1, 2, 3] as confidence (confidence)}
								<td>
									<button
										class={`w-full ${memoConfidence == confidence ? "bg-blue-300 dark:bg-blue-700" : "opaque"}`}
										type="button"
										onclick={() => {
											handleConfidence(confidence, "memo");
										}}>{confidence}</button
									>
								</td>
							{/each}
						</tr>
						<tr>
							<td class="w-1 pr-1">Comm</td>
							{#each [0, 1, 2, 3] as confidence (confidence)}
								<td>
									<button
										class={`w-full ${commConfidence == confidence ? "bg-blue-300 dark:bg-blue-700" : "opaque"}`}
										type="button"
										onclick={() => {
											handleConfidence(confidence, "comm");
										}}>{confidence}</button
									>
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
				<div class="flex flex-row gap-1">
					<a
						class="cannot-hover:py-2 block rounded border border-gray-600 px-2 py-0 text-center dark:border-gray-300"
						style="flex-grow: 2"
						href={`/flash-cards/edit?t=${flashCard.type}&lp=${flashCard.letterPair}`}>Edit</a
					>
					<div style="flex-grow: 1"></div>
					<button
						style="flex-grow: 2"
						disabled={memoConfidence < 0 || commConfidence < 0}
						type="button"
						onclick={(mouseEvent) => {
							mouseEvent.preventDefault();
							submitConfidence(flashCard.letterPair);
						}}>Submit {commConfidence >= 2 && memoConfidence >= 2 ? "⭕" : "❌"}</button
					>
				</div>
			</div>
		{:else}
			<div class="w-full px-2 lg:px-0">
				<button
					class="cannot-hover:py-4 block w-full rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
					disabled={submittingQuizAnswer}
					onclick={() => {
						showAnswer = true;
					}}>Show Answer</button
				>
			</div>
		{/if}
	{:else}
		<div>Loading</div>
	{/if}
</div>
