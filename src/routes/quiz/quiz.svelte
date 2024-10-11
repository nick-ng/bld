<script lang="ts">
	import { quizStore } from "$lib/stores/quiz";
	import { flashCardStore, flashCardStoreStatus, loadFlashCard } from "$lib/stores/flash-cards";
	import { authFetch, joinServerPath, commutatorDetails } from "$lib/utils";
	import Corners from "$lib/components/corners.svelte";
	import { parseFlashCard } from "$lib/types";
	import Image from "$lib/components/image.svelte";

	let showAnswer = false;
	let handlingConfidence = false;
	let abortController: AbortController | null = null;

	const handleLetterPair = (newLetterPair: string) => {
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();
		(async () => {
			await loadFlashCard(newLetterPair, abortController.signal);
			abortController = null;
		})();
	};

	$: handleLetterPair($quizStore[0]);

	const handleConfidence = async (letterPair: string, newConfidence: number) => {
		const flashCard = $flashCardStore[letterPair];
		if (!flashCard) {
			return;
		}

		handlingConfidence = true;

		const formData = new FormData();
		formData.set("type", flashCard.type);
		formData.set("confidence", newConfidence.toString(10));

		// go to the next question before updating
		showAnswer = false;
		// wait for next frame before going to the next question
		setTimeout(() => {
			$quizStore = $quizStore.filter((lp) => lp != letterPair);
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
			$flashCardStore[parseResponse.data.letterPair] = { ...data, fetchedAtMs: Date.now() };
		} else {
			console.error("wrong", responseJson);
		}

		handlingConfidence = false;
	};
</script>

<div class="max-w-prose mx-auto">
	{#if $quizStore.length > 0 && $flashCardStoreStatus.status === "loaded"}
		{@const flashCard = $flashCardStore[$quizStore[0]]}
		<div class="flex flex-col items-center min-h-[460px] gap-1">
			<h2 class="uppercase m-0">{flashCard.letterPair}</h2>
			<Corners letterPair={flashCard.letterPair} />
			{#if showAnswer}
				<div class="text-2xl">{flashCard.memo}</div>
				<Image
					imageUri={flashCard.image}
					alt={`${flashCard.letterPair.toUpperCase()} visualisation`}
				/>
				{#if flashCard.commutator}
					<div class="text-xl font-mono">
						{commutatorDetails(flashCard.commutator).normalisedCommutator}
					</div>
				{/if}
			{/if}
		</div>
		<div class="absolute bottom-2 left-0 px-2 w-full lg:w-full lg:relative lg:px-0">
			<div class="text-left">{$quizStore.length} left</div>
			{#if showAnswer}
				<div class="flex flex-row gap-1">
					<a
						class="button-default text-center"
						style="flex-grow: 2"
						href={`/flash-cards/edit?lp=${flashCard.letterPair}`}>Edit</a
					>
					<div style="flex-grow: 1" />
					{#each [0, 1, 2, 3] as confidence}
						<button
							style="flex-grow: 2"
							disabled={handlingConfidence}
							on:click={() => {
								handleConfidence(flashCard.letterPair, confidence);
							}}>{confidence}</button
						>
					{/each}
				</div>
			{:else}
				<button
					class="button-default w-full"
					disabled={handlingConfidence}
					on:click={() => {
						showAnswer = true;
					}}>Show Answer</button
				>
			{/if}
		</div>
	{:else}
		<div>Something went wrong.</div>
	{/if}
</div>
