<script lang="ts">
	import { defaultFlashCard } from "$lib/types";
	import { upperCaseFirst, parseCommutator, simplifyAlgorithm } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import Corners from "$lib/components/corners.svelte";
	import Image from "$lib/components/image.svelte";
	import Step from "./step.svelte";

	interface Props {
		letterPair?: string;
		quizLeft?: number;
		quizShowAnswer?: boolean;
		extraClass?: string;
		onQuizEnd?: () => void | Promise<void>;
		showInverseLink?: boolean;
		flashCardType?: string;
	}

	let {
		letterPair = "",
		quizLeft = 0,
		quizShowAnswer = true,
		onQuizEnd,
		extraClass = "",
		showInverseLink = false,
		flashCardType: cardType = "corner"
	}: Props = $props();
	let flashCard = $derived($flashCardStore[letterPair] || defaultFlashCard(letterPair, cardType));
</script>

<div class="mx-auto max-w-prose">
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="text-center">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		<div class={`relative flex flex-col items-center gap-1 ${extraClass}`}>
			<div class="m-0 flex flex-row justify-center self-stretch">
				<h2 class="m-0 uppercase">
					{#if quizShowAnswer && flashCard.isPublic && $optionsStore.isUserAuthenticated}
						👀
					{/if}
					{flashCard.letterPair}
				</h2>
			</div>
			{#if quizLeft > 0}
				<div class="absolute top-0 left-0 text-left">{quizLeft} left</div>
			{/if}
			{#if typeof onQuizEnd === "function"}
				<button
					class="cannot-hover:py-2 absolute top-0 right-0 block rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
					onclick={onQuizEnd}>End Quiz</button
				>
			{:else if showInverseLink && flashCard.letterPair.length === 2 && flashCard.letterPair[0] !== flashCard.letterPair[1]}
				{@const inverseLetterPair = `${flashCard.letterPair[1]}${flashCard.letterPair[0]}`}
				<a
					class="cannot-hover:py-2 absolute top-0 right-0 block rounded border border-gray-600 px-2 py-0 uppercase dark:border-gray-300"
					href={`/flash-cards?t=${flashCard.type}&f=${inverseLetterPair}`}>{inverseLetterPair}</a
				>
			{/if}
			<Corners letterPair={flashCard.letterPair} />
			{#if quizShowAnswer}
				<div class="max-w-64 truncate text-center text-2xl">
					{flashCard.memo}
				</div>
				<div class="text-xl">
					{#if flashCard.commutator}
						{@const commutatorDetails = parseCommutator(flashCard.commutator)}
						{@const simplification = simplifyAlgorithm(commutatorDetails.expansion)}
						<details>
							<summary class="text-center">{commutatorDetails.normalisedCommutator}</summary>
							<div class="text-center">
								{#each simplification.original as step, i (`${step.move}${i}`)}
									{#if i > 0}&nbsp;{/if}<Step move={step.move} cancellationType={step.type} />
								{/each}
							</div>
							<div class="text-center">{simplification.simplified}</div>
						</details>
					{:else}
						<span> No Commutator </span>
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
