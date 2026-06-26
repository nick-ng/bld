<script lang="ts">
	import type { QuizLetters } from "$lib/quiz";

	import { SvelteDate, SvelteURLSearchParams } from "svelte/reactivity";
	import {
		letterPairStore,
		letterPairStoreStatus,
		fetchAndLoadMnemonicsAndAlgorithms,
	} from "$lib/stores/letter-pairs";
	import { optionsStore, getCardsPerGroupLimit } from "$lib/stores/options";
	import { upperCaseFirst, getTrueKeys } from "$lib/utils";
	import { getQuizKit } from "$lib/quiz";
	import { onMount } from "svelte";

	const DAY_MS = 1000 * 60 * 60 * 24;

	let quizCategories = $derived(
		[
			getQuizKit("memo", getTrueKeys($optionsStore.chosenBuffers).join(",")),
			...getTrueKeys($optionsStore.chosenBuffers).map((buf) => {
				const startsWith = $derived(
					Object.values($letterPairStore).reduce((prev, curr) => {
						prev.add(curr.speffz_pair[0]);
						return prev;
					}, new Set())
				);
				return [getQuizKit(buf, null), ...[...startsWith].map((s) => getQuizKit(buf, `${s}*`))];
			}),
			getQuizKit("orozco-edges", null),
			getQuizKit("orozco-corners", null),
			getQuizKit("UF", "algorithm"),
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

	const getQuizUrl = (
		category: string,
		subcategory: string | null,
		letters: QuizLetters,
		unlimited: boolean,
		old: boolean
	) => {
		if (letters.total === 0 && !old) {
			return "";
		}

		const searchParams = new SvelteURLSearchParams();
		searchParams.set("sp", letters.next[0]?.speffz_pair || letters.retry[0]?.speffz_pair);
		searchParams.set("category", category);
		if (subcategory) {
			searchParams.set("subcategory", subcategory);
		}
		if (unlimited) {
			searchParams.set("unlimited", "yes");
		}
		if (old && letters.old[0]?.speffz_pair) {
			searchParams.set("old", "5");
			searchParams.set("sp", letters.old[0].speffz_pair);
		}

		return `/quiz?${searchParams.toString()}`;
	};

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
			<div class="align-center mt-5 mb-2 flex flex-col items-end gap-2">
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
				{#each quizCategories as quizCategory (`${quizCategory.category}-${quizCategory.subcategory || "*"}`)}
					{@const quizKit = getQuizKit(quizCategory.category, quizCategory.subcategory)}
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
							quizCategory.category !== "memo" && quizCategory.subcategory ? "w-9/10" : "w-full"
						} group relative flex flex-row gap-1`}
						style={`order: ${(letters.total === 0 ? 15 : 10) - (isPinnedQuiz ? 10 : 0)};`}
					>
						<a
							class={`${letters.old.length === 0 ? "bg-emerald-100" : ""} like-button block py-2 text-center text-xl leading-none`}
							href={getQuizUrl(
								quizCategory.category,
								quizCategory.subcategory,
								letters,
								false,
								true
							)}
						>
							🧓
						</a>
						{#if quizCategory.all.length > $optionsStore.cardsPerGroupPerDay}
							<a
								class={`${unlimitedLetters.total === 0 ? "bg-emerald-100" : ""} like-button block py-2 text-center text-xl leading-none`}
								href={getQuizUrl(
									quizCategory.category,
									quizCategory.subcategory,
									unlimitedLetters,
									true,
									false
								)}
							>
								♾️
							</a>
						{/if}
						<a
							class={`${letters.total === 0 ? "bg-emerald-100" : ""} like-button block grow py-2 text-center text-xl leading-none`}
							href={getQuizUrl(
								quizCategory.category,
								quizCategory.subcategory,
								letters,
								false,
								false
							)}
						>
							{quizKit.title} ({unlimitedLetters.total}/{quizCategory.all.length})
						</a>
						<details class="hidden lg:block">
							<summary class="like-button py-2">🔍</summary>
							<div
								class="like-button absolute top-[calc(100%+0.25rem)] right-0 z-1 bg-white p-2 text-left uppercase"
							>
								{quizCategory.all
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
									$optionsStore.pinnedQuizzes = $optionsStore.pinnedQuizzes.filter(
										(q) => q !== quizId
									);
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
		</div>
	{/if}
</div>
