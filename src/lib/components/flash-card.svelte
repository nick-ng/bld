<script lang="ts">
	import { defaultFlashCard } from "$lib/types";
	import { upperCaseFirst, commutatorDetails } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus } from "$lib/stores/flash-cards";
	import Corners from "$lib/components/corners.svelte";
	import Image from "$lib/components/image.svelte";

	interface Props {
		letterPair?: string;
		quizLeft?: number;
		quizShowAnswer?: boolean;
		extraClass?: string;
		onQuizEnd?: () => void | Promise<void>;
	}

	let {
		letterPair = "",
		quizLeft = 0,
		quizShowAnswer = true,
		onQuizEnd,
		extraClass = ""
	}: Props = $props();
	let flashCard = $derived($flashCardStore[letterPair] || defaultFlashCard(letterPair));
</script>

<div class="mx-auto max-w-prose">
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="text-center">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		<div class={`relative flex flex-col items-center gap-1 ${extraClass}`}>
			<div class="relative m-0 flex flex-row justify-center self-stretch">
				<h2 class="m-0 uppercase">{flashCard.letterPair}</h2>
				{#if flashCard.letterPair.length === 2 && flashCard.letterPair[0] !== flashCard.letterPair[1]}
					{@const inverseLetterPair = `${flashCard.letterPair[1]}${flashCard.letterPair[0]}`}
					<a
						class="absolute top-0 right-0 bottom-0 my-auto block uppercase"
						href={`/flash-cards?t=${flashCard.type}&lp=${inverseLetterPair}`}>{inverseLetterPair}</a
					>
				{/if}
			</div>
			{#if quizLeft > 0}
				<div class="absolute top-0 left-0 text-left">{quizLeft} left</div>
			{/if}
			{#if typeof onQuizEnd === "function"}
				<button
					class="cannot-hover:py-2 absolute top-0 right-0 block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
					onclick={onQuizEnd}>End Quiz</button
				>
			{/if}
			<Corners letterPair={flashCard.letterPair} />
			{#if quizShowAnswer}
				<div class="text-2xl">{flashCard.memo}</div>
				<div>
					{#if flashCard.commutator}
						<span class="font-mono text-xl">
							{commutatorDetails(flashCard.commutator).normalisedCommutator}
						</span>
					{:else}
						<span class="text-xl"> No Commutator </span>
					{/if}
				</div>
				<Image
					imageUri={flashCard.image}
					alt={`${flashCard.letterPair.toUpperCase()} visualisation`}
				/>
			{/if}
		</div>
	{/if}
</div>
