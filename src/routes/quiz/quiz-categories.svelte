<script lang="ts">
	import type { LetterPairStoreType } from "$lib/stores/letter-pairs";
	import { getQuizKit, getQuizUrl } from "$lib/quiz";
	import { letterPairStore } from "$lib/stores/letter-pairs";
	import { optionsStore, getCardsPerGroupLimit } from "$lib/stores/options";

	interface Props {
		quizKits: (ReturnType<typeof getQuizKit> & { all: LetterPairStoreType[number][] })[];
		cutoffNow: Date;
	}

	let { quizKits, cutoffNow }: Props = $props();
</script>

<div class="align-center flex flex-col items-end gap-2">
	{#each quizKits as quizKit (`${quizKit.category}-${quizKit.subcategory || "*"}`)}
		{@const quizId = `${quizKit.category}-${quizKit.subcategory || "*"}`}
		{@const isPinnedQuiz = $optionsStore.pinnedQuizzes.includes(quizId)}
		{@const letters = quizKit.getNextLetters(
			Object.values($letterPairStore),
			cutoffNow,
			getCardsPerGroupLimit($optionsStore)
		)}
		{@const unlimitedLetters = quizKit.getNextLetters(
			Object.values($letterPairStore),
			cutoffNow,
			-1
		)}
		<div
			class={`${
				quizKit.category !== "memo" && quizKit.subcategory ? "w-9/10" : "w-full"
			} group relative flex flex-row gap-1`}
			style={`order: ${(letters.total === 0 ? 15 : 10) - (isPinnedQuiz ? 10 : 0)};`}
		>
			<a
				class={`${letters.old.length === 0 ? "bg-emerald-100" : ""} like-button block py-2 text-center text-xl leading-none`}
				href={getQuizUrl(quizKit.category, quizKit.subcategory, letters, false, true)}
			>
				🔕
			</a>
			{#if quizKit.all.length > $optionsStore.cardsPerGroupPerDay}
				<a
					class={`${unlimitedLetters.total === 0 ? "bg-emerald-100" : ""} like-button block py-2 text-center text-xl leading-none`}
					href={getQuizUrl(quizKit.category, quizKit.subcategory, unlimitedLetters, true, false)}
				>
					♾️
				</a>
			{/if}
			<a
				class={`${letters.total === 0 ? "bg-emerald-100" : ""} like-button block grow py-2 text-center text-xl leading-none`}
				href={getQuizUrl(quizKit.category, quizKit.subcategory, letters, false, false)}
			>
				{quizKit.title}
				{unlimitedLetters.total} ({quizKit.all.length})
			</a>
			<details class="hidden lg:block">
				<summary class="like-button py-2">🔍</summary>
				<div
					class="like-button absolute top-[calc(100%+0.25rem)] right-0 z-1 bg-white p-2 text-left uppercase"
				>
					{quizKit.all
						.map((a) => a.speffz_pair)
						.sort()
						.join(", ")}
				</div>
			</details>
			<button
				type="button"
				class={`${isPinnedQuiz ? "bg-blue-100" : ""}`}
				onclick={() => {
					if (isPinnedQuiz) {
						$optionsStore.pinnedQuizzes = $optionsStore.pinnedQuizzes.filter((q) => q !== quizId);
					} else {
						$optionsStore.pinnedQuizzes = [...$optionsStore.pinnedQuizzes, quizId];
					}
				}}
			>
				📌
			</button>
		</div>
	{/each}
</div>
