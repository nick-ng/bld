<script lang="ts">
	import { quizStore, touchCurrentQuiz } from "$lib/stores/quiz";
	import {
		flashCardStore,
		flashCardStoreStatus,
		getFlashCard,
		loadFlashCard
	} from "$lib/stores/flash-cards";
	import { authFetch, joinServerPath } from "$lib/utils";
	import FlashCard from "$lib/components/flash-card.svelte";
	import { parseFlashCard } from "$lib/types";

	let flashCard = $derived($flashCardStore[$quizStore[0].toLocaleLowerCase()]);
	let showAnswer = $state(false);
	let submittingConfidence = $state(false);
	let abortController: AbortController | null = null;
	let memoConfidence = $state(-1);
	let commConfidence = $state(-1);

	const handleLetterPair = (newLetterPair: string) => {
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();
		(async () => {
			const tempFlashCard = await loadFlashCard(newLetterPair, abortController.signal);
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
		const flashCard = getFlashCard(letterPair, $flashCardStore);
		if (!flashCard) {
			return;
		}

		submittingConfidence = true;

		const formData = new FormData();
		formData.set("type", flashCard.type);

		const packedConfidence = (commConfidence << 2) + memoConfidence;
		formData.set("confidence", packedConfidence.toString(10));
		commConfidence = -1;
		memoConfidence = -1;

		// go to the next question before updating
		showAnswer = false;
		// wait for next frame before going to the next question
		setTimeout(() => {
			$quizStore = $quizStore.filter((lp) => lp != letterPair);
			touchCurrentQuiz();
		}, 0);

		const response = await authFetch(joinServerPath("quiz", letterPair), {
			method: "PUT",
			body: formData
		});
		if (!response) {
			return;
		}

		const responseJson = await response.json();
		const parseResponse = parseFlashCard(responseJson);
		if (parseResponse.isValid) {
			const { data } = parseResponse;
			$flashCardStore[parseResponse.data.letterPair.toLocaleLowerCase()] = {
				...data,
				fetchedAtMs: Date.now()
			};
		} else {
			console.error("wrong", responseJson);
		}

		submittingConfidence = false;
	};
</script>

<div class="mx-auto max-w-prose">
	{#if $quizStore.length > 0 && $flashCardStoreStatus.status === "loaded"}
		<FlashCard
			letterPair={flashCard.letterPair}
			quizLeft={$quizStore.length}
			quizShowAnswer={showAnswer}
			onQuizEnd={() => {
				$quizStore = [];
			}}
			extraClass="min-h-[460px]"
		/>
		<div class="absolute bottom-2 left-0 w-full px-2 lg:relative lg:w-full lg:px-0">
			{#if showAnswer}
				<table class="mb-2 w-full border-collapse">
					<tbody>
						<tr>
							<td class="w-1 pr-1">Memo</td>
							{#each [0, 1, 2, 3] as confidence (confidence)}
								<td>
									<button
										class={`w-full ${memoConfidence == confidence ? "bg-blue-300 dark:bg-blue-700" : ""}`}
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
										class={`w-full ${commConfidence == confidence ? "bg-blue-300 dark:bg-blue-700" : ""}`}
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
						onclick={(mouseEvent) => {
							mouseEvent.preventDefault();
							submitConfidence(flashCard.letterPair);
						}}>Submit</button
					>
				</div>
			{:else}
				<button
					class="cannot-hover:py-2 block w-full rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
					disabled={submittingConfidence}
					onclick={() => {
						showAnswer = true;
					}}>Show Answer</button
				>
			{/if}
		</div>
	{:else}
		<div>Loading</div>
	{/if}
</div>
