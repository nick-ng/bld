<script lang="ts">
	import { quizStore } from "$lib/stores/quiz";
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { addCredentialsToHeaders, joinServerPath } from "$lib/utils";
	import Corners from "$lib/components/corners.svelte";
	import { parseFlashCard } from "$lib/types";

	let showAnswer = false;
	let handlingConfidence = false;

	const handleConfidence = async (letterPair: string, newConfidence: number) => {
		if (typeof $flashCardStore === "string") {
			return;
		}

		const flashCard = $flashCardStore[letterPair];
		if (!flashCard) {
			return;
		}

		handlingConfidence = true;

		const formData = new FormData();
		formData.set("imageUrl", flashCard.image);
		formData.set("memo", flashCard.memo);
		formData.set("commutator", flashCard.commutator);
		formData.set("tags", flashCard.tags);
		formData.set("lastQuizUnix", Math.floor(Date.now() / 1000).toString(10));
		formData.set("confidence", newConfidence.toString(10));

		const { headers, isValid } = addCredentialsToHeaders();
		if (!isValid) {
			return;
		}

		const response = await fetch(joinServerPath("flash-cards", letterPair), {
			method: "PUT",
			headers,
			body: formData
		});
		const responseJson = await response.json();
		const parseResponse = parseFlashCard(responseJson);
		if (parseResponse.isValid) {
			$flashCardStore[parseResponse.data.letterPair] = parseResponse.data;
		} else {
			console.error("wrong", responseJson);
		}

		// finish the quiz anyway even if you the response fails
		showAnswer = false;
		$quizStore = $quizStore.filter((lp) => lp != letterPair);
		handlingConfidence = false;
	};
</script>

<div class="max-w-prose mx-auto">
	{#if $quizStore.length > 0 && typeof $flashCardStore !== "string"}
		{@const flashCard = $flashCardStore[$quizStore[0]]}
		<div class="flex flex-col items-center min-h-[455px] gap-1">
			<h2 class="uppercase m-0">{flashCard.letterPair}</h2>
			<Corners letterPair={flashCard.letterPair} />
			{#if showAnswer}
				<div class="text-lg">{flashCard.memo}</div>
				<div class="h-64 w-64 border border-gray-500">
					{#if flashCard.image}
						<img
							class="object-contain"
							src={joinServerPath("images", flashCard.image)}
							alt={`${flashCard.letterPair.toUpperCase()} visualisation`}
						/>
					{:else}
						<div class="h-full w-full flex items-center justify-center text-3xl">No Image</div>
					{/if}
				</div>
				{#if flashCard.commutator}
					<div class="text-lg">{flashCard.commutator}</div>
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
					{#each [0, 1, 2, 3, 4, 5] as confidence}
						<button
							style="flex-grow: 2"
							on:click={() => {
								handleConfidence(flashCard.letterPair, confidence);
							}}
							disabled={handlingConfidence}>{confidence}</button
						>
					{/each}
				</div>
			{:else}
				<button
					class="button-default w-full"
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
