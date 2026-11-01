<script lang="ts">
	import { SvelteDate } from "svelte/reactivity";
	import {
		letterPairStore,
		letterPairStoreStatus,
		fetchAndLoadMnemonicsAndAlgorithms,
	} from "$lib/stores/letter-pairs";
	import { optionsStore, getCardsPerGroupLimit } from "$lib/stores/options";
	import { upperCaseFirst, getTrueKeys } from "$lib/utils";
	import { getQuizKit } from "$lib/quiz";
	import { onMount } from "svelte";
	import QuizCategories from "./quiz-categories.svelte";

	const DAY_MS = 1000 * 60 * 60 * 24;

	const startingPinnedCount = $state($optionsStore.pinnedQuizzes.length);
	let quizCategories = $derived(
		[
			getQuizKit("memo", getTrueKeys($optionsStore.chosenBuffers).join(","), $optionsStore),
			...getTrueKeys($optionsStore.chosenBuffers).map((buf) => {
				const startsWith = $derived(
					Object.values($letterPairStore).reduce((prev, curr) => {
						prev.add(curr.speffz_pair[0]);
						return prev;
					}, new Set())
				);
				return [
					getQuizKit(buf, null, $optionsStore),
					...[...startsWith].map((s) => getQuizKit(buf, `${s}*`, $optionsStore)),
				];
			}),
			getQuizKit("orozco-edges", null, $optionsStore),
			getQuizKit("orozco-corners", null, $optionsStore),
			getQuizKit("UF", "algorithm", $optionsStore),
		]
			.flat()
			.map((c) => {
				return {
					...c,
					all: Object.values($letterPairStore).filter(c.filterFunc),
				};
			})
			.filter((c) => c.all.length > 0)
			.sort((a, b) => a.sortString.localeCompare(b.sortString))
	);
	let cutoffNow = $state(new Date());

	onMount(() => {
		// @todo(nick-ng): refactor this into a shared function
		const today = new SvelteDate();
		today.setHours(5, 0, 0, 0);
		const todayMs = today.valueOf();
		if ($optionsStore.newCardDay + DAY_MS < todayMs) {
			$optionsStore.newCardDay = todayMs;
			$optionsStore.newCardsToday = 0;
		}

		const cutoffUpdateInterval = setInterval(
			() => {
				cutoffNow = new Date();
				const today = new SvelteDate();
				today.setHours(5, 0, 0, 0);
				const todayMs = today.valueOf();
				if ($optionsStore.newCardDay + DAY_MS < todayMs) {
					$optionsStore.newCardDay = todayMs;
					$optionsStore.newCardsToday = 0;
					fetchAndLoadMnemonicsAndAlgorithms();
				}
			},
			1000 * 60 * 30
		); // 30 minutes

		return () => {
			clearInterval(cutoffUpdateInterval);
		};
	});
</script>

<div class="mx-auto max-w-prose">
	{#if $letterPairStoreStatus.status !== "loaded" && $letterPairStoreStatus.status !== "reloading" && $letterPairStoreStatus.status !== "saving"}
		<div class="">{upperCaseFirst($letterPairStoreStatus.message)}</div>
	{:else}
		<div>
			<div class="align-center mt-5 mb-2 flex flex-col items-stretch gap-2">
				<div class="flex flex-row justify-between self-stretch">
					<button
						class={`${$letterPairStoreStatus.status !== "loaded" ? "bg-slate-200" : ""}`}
						disabled={$letterPairStoreStatus.status !== "loaded"}
						onclick={() => {
							if ($letterPairStoreStatus.status !== "loaded") {
								return;
							}

							cutoffNow = new Date();

							fetchAndLoadMnemonicsAndAlgorithms();
							// @todo(nick-ng): refactor this into a shared function
							const today = new SvelteDate();
							today.setHours(5, 0, 0, 0);
							const todayMs = today.valueOf();
							if ($optionsStore.newCardDay + DAY_MS < todayMs) {
								$optionsStore.newCardDay = todayMs;
								$optionsStore.newCardsToday = 0;
							}
						}}>Reload</button
					>
					<button
						onclick={() => {
							if (cutoffNow.getDay() === 0 || cutoffNow.getDay() === 6) {
								return;
							}

							if ($optionsStore.weekendOverrideTimeStampMs < cutoffNow.valueOf()) {
								const endOfToday = new Date();
								endOfToday.setHours(23, 59, 59, 999);
								$optionsStore.weekendOverrideTimeStampMs = endOfToday.valueOf();
							} else {
								$optionsStore.weekendOverrideTimeStampMs = 0;
							}
						}}
						disabled={cutoffNow.getDay() === 0 || cutoffNow.getDay() === 6}
					>
						Limit: {getCardsPerGroupLimit($optionsStore)}
					</button>
				</div>
				{#if startingPinnedCount === 0}
					<QuizCategories quizKits={quizCategories} {cutoffNow} />
				{:else}
					<QuizCategories
						quizKits={quizCategories.filter((a) => {
							const quizId = `${a.category}-${a.subcategory || "*"}`;
							const isPinnedQuiz = $optionsStore.pinnedQuizzes.includes(quizId);

							return isPinnedQuiz;
						})}
						{cutoffNow}
					/>
					<details>
						<summary class="mb-1 text-xl">Other Categories</summary>
						<QuizCategories
							quizKits={quizCategories.filter((a) => {
								const quizId = `${a.category}-${a.subcategory || "*"}`;
								const isPinnedQuiz = $optionsStore.pinnedQuizzes.includes(quizId);

								return !isPinnedQuiz;
							})}
							{cutoffNow}
						/>
					</details>
				{/if}
			</div>
		</div>
	{/if}
</div>
