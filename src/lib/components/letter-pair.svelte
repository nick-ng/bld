<script lang="ts">
	import type { LetterPair as LetterPairType } from "$lib/types";
	import { parseCommutator, simplifyAlgorithm, getBlddbUrl } from "$lib/utils";
	import { authenticationStore } from "$lib/stores/authentication";
	import Image from "$lib/components/image.svelte";
	import Step from "$lib/components/step.svelte";

	interface Props {
		letterPair: LetterPairType;
		quizLeft?: number;
		hideWords?: boolean;
		selectedBuffers: string[];
		hideImage?: boolean;
		isQuiz?: boolean;
		extraClass?: string;
		onQuizEnd?: () => void | Promise<void>;
	}

	let {
		letterPair,
		quizLeft = 0,
		hideWords,
		selectedBuffers,
		hideImage,
		isQuiz,
		onQuizEnd,
		extraClass = "",
	}: Props = $props();
</script>

<div class="mx-auto max-w-prose">
	<div class={`relative flex flex-col items-center gap-1 ${extraClass}`}>
		<div class="m-0 flex flex-row justify-center self-stretch">
			<h2 class="m-0 uppercase">
				{#if !isQuiz && letterPair.is_public && $authenticationStore.isUserAuthenticated}
					👀
				{/if}
				{letterPair.speffz_pair}
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
		{/if}
		{#if !hideWords}
			<div class="max-w-64 truncate text-center text-2xl">
				{letterPair.words}
			</div>
		{/if}
		{#each selectedBuffers as bufferLocation (bufferLocation)}
			{#if getBlddbUrl(letterPair.speffz_pair, bufferLocation)}
				{#if letterPair.algorithms[bufferLocation]?.moves}
					{@const algorithmDetails = parseCommutator(letterPair.algorithms[bufferLocation]?.moves)}
					{@const simplification = simplifyAlgorithm(algorithmDetails.expansion)}
					<details class="text-xl">
						<summary class="text-center"
							>{bufferLocation}: {algorithmDetails.normalisedCommutator}</summary
						>
						<div class="mt-2 text-center leading-none text-balance">
							{#each simplification.original as step, i (`${step.move}${i}`)}
								{i > 0 ? " " : ""}<Step move={step.move} cancellationType={step.type} />
							{/each}
						</div>
						{#if simplification.originalCount > simplification.simplifiedCount}
							<div class="mt-2 text-center leading-none text-balance">
								{#each simplification.simplified as step, i (`${step.move}${i}`)}
									{i > 0 ? " " : ""}<Step move={step.move} cancellationType={step.type} />
								{/each}
							</div>
						{/if}
					</details>
				{:else}
					<div class="text-xl">
						{bufferLocation}: —
					</div>
				{/if}
			{/if}
		{/each}
		{#if !hideImage}
			<Image
				imageUri={letterPair.image}
				alt={`${letterPair.speffz_pair.toUpperCase()} visualisation`}
			/>
		{/if}
	</div>
</div>
