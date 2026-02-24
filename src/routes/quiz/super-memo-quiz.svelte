<script lang="ts">
	import { onMount } from "svelte";
	import { SvelteDate, SvelteURLSearchParams } from "svelte/reactivity";
	import { goto } from "$app/navigation";
	import { getVisibleFlashCardComponents, getQuizKit, superMemo2 } from "$lib/quiz";
	import { letterPairStore, saveAlgorithm, saveMnemonic } from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import LetterPair from "$lib/components/letter-pair.svelte";
	import { msToLargestTime } from "$lib/utils";

	interface Props {
		currentSpeffzPair: string;
		category: string; // e.g. "Memo", "UF", "UFR"
		subcategory: string | null; // default is all e.g. "q", "algs"
	}

	const DAY_MS = 1000 * 60 * 60 * 24;

	let { currentSpeffzPair, category, subcategory }: Props = $props();
	let { title, quizType, getSMStats, getNextLetters, filterFunc, getNextReview } = $derived(
		getQuizKit(category, subcategory)
	);
	let hideAnswer = $state(true);
	let selectedGradeQ = $state(-1);
	let currentLetterPair = $derived($letterPairStore[currentSpeffzPair]);
	let nextLetters = $derived(
		getNextLetters(Object.values($letterPairStore)).filter((l) => {
			if ($optionsStore.newCardsToday < $optionsStore.maxNewCardsPerDay) {
				return true;
			}

			return getSMStats(l).sm2_i > 0.2;
		})
	);
	let isSubmitting = $state(false);
	let questionStartMs = $state(Date.now());

	const submitQuiz = async (stopAfter: boolean = false) => {
		if (hideAnswer || selectedGradeQ < 0) {
			return;
		}
		isSubmitting = true;

		let buffer = category;
		if (category === "orozco-edges") {
			buffer = "UF";
		} else if (category === "orozco-corners") {
			buffer = "UFR";
		}

		questionStartMs = Date.now();

		const sMStats = getSMStats(currentLetterPair);
		const newSMStats = superMemo2(selectedGradeQ, sMStats, $optionsStore.targetEf);
		switch (quizType) {
			case "alg": {
				await saveAlgorithm(
					{
						speffz_pair: currentSpeffzPair,
						buffer,
						...newSMStats,
					},
					true
				);
				break;
			}
			case "memo": {
				await saveMnemonic(
					{
						speffz_pair: currentSpeffzPair,
						...newSMStats,
					},
					true
				);
				break;
			}
			default: {
				console.error("unexpected quiz type");
				isSubmitting = false;
				return;
			}
		}

		// @todo(nick-ng): refactor this into a shared function
		const today = new SvelteDate();
		today.setHours(5, 0, 0, 0);
		const todayMs = today.valueOf();
		if ($optionsStore.newCardDay + DAY_MS < todayMs) {
			$optionsStore.newCardDay = todayMs;
			$optionsStore.newCardsToday = 0;
		}

		if (sMStats.sm2_i < 0.2) {
			$optionsStore.newCardsToday = $optionsStore.newCardsToday + 1;
		}

		isSubmitting = false;
		if (stopAfter) {
			selectedGradeQ = -1;
			goto("/quiz");
			return;
		}

		if (nextLetters.length === 0) {
			const lettersInSet = Object.values($letterPairStore)
				.filter((l) => {
					if (!filterFunc(l)) {
						return false;
					}

					if ($optionsStore.newCardsToday < $optionsStore.maxNewCardsPerDay) {
						return true;
					}

					return getSMStats(l).sm2_i > 0.2;
				})

				.sort((a, b) => {
					return getNextReview(a).valueOf() - getNextReview(b).valueOf();
				});

			// @todo(nick-ng): figure out if a new card will be available first
			const untilNext = getNextReview(lettersInSet[0]).valueOf() - Date.now();
			alert(`All done! Next card in ${msToLargestTime(untilNext)}`);
			goto("/quiz");
			return;
		}

		hideAnswer = true;
		selectedGradeQ = -1;
		setTimeout(() => {
			const searchParams = new SvelteURLSearchParams(location.search);
			searchParams.set("sp", nextLetters[0].speffz_pair);
			goto(`/quiz?${searchParams.toString()}`);
		}, 0);
	};

	onMount(() => {
		const handleKeypress = (event: KeyboardEvent) => {
			switch (event.key) {
				case "1": {
					selectedGradeQ = 0;
					break;
				}
				case "2": {
					selectedGradeQ = 1;
					break;
				}
				case "3": {
					selectedGradeQ = 2;
					break;
				}
				case "4": {
					selectedGradeQ = 3;
					break;
				}
				case "5": {
					selectedGradeQ = 4;
					break;
				}
				case "6": {
					selectedGradeQ = 5;
					break;
				}
				case " ": {
					hideAnswer = false;
					break;
				}
				case "Enter": {
					submitQuiz(false);
					break;
				}
				default: {
					console.info("unhandled key pressed", event.key);
				}
			}
		};

		document.addEventListener("keypress", handleKeypress);

		return () => {
			document.removeEventListener("keypress", handleKeypress);
		};
	});
</script>

<div class="mx-auto max-w-prose">
	{#if nextLetters.length === 0}
		<div>All done! Back to <a href="/quiz">Quiz</a></div>
	{:else}
		<div class="relative">
			<div class="absolute top-0 left-0 grid grid-cols-2 gap-x-1">
				<div>Left:</div>
				<div>
					{nextLetters.length}
				</div>
			</div>
			<h3 class="text-center">Quiz: {title}</h3>
			<div class="absolute top-0 right-0"><a class="like-button" href="/quiz">End Quiz</a></div>
		</div>
		{#if currentLetterPair}
			{@const visibleComponents = getVisibleFlashCardComponents(
				category,
				hideAnswer,
				$optionsStore
			)}
			<LetterPair
				letterPair={currentLetterPair}
				selectedBuffers={visibleComponents.selectedBuffers}
				hideWords={visibleComponents.hideWords}
				hideImage={visibleComponents.hideImage}
				isQuiz
			/>
		{:else}
			<h3>Loading...</h3>
		{/if}
		<div
			class="cannot-hover:absolute cannot-hover:bottom-6 cannot-hover:left-0 cannot-hover:px-2 z-1 mt-1 flex w-full flex-col"
		>
			{#if !hideAnswer}
				{#if selectedGradeQ >= 0}
					<div class="mx-1 mb-3 flex flex-row gap-1">
						<button
							class={`grow ${isSubmitting ? "bg-slate-200" : "bg-white"}`}
							type="button"
							disabled={isSubmitting || selectedGradeQ < 0}
							onclick={async (mouseEvent) => {
								mouseEvent.preventDefault();

								await submitQuiz(true);
							}}
						>
							Done
						</button>
						<button
							class={`grow ${isSubmitting ? "bg-slate-200" : "bg-white"}`}
							type="button"
							disabled={isSubmitting || selectedGradeQ < 0}
							onclick={async (mouseEvent) => {
								mouseEvent.preventDefault();

								await submitQuiz(false);
							}}
						>
							Submit
						</button>
					</div>
				{/if}
				<table class="mb-3 w-full border-collapse border-separate border-spacing-1">
					<tbody>
						<tr>
							{#each [{ label: "Nothing", q: 0 }, { label: "Familiar", q: 1 }, { label: "3", q: 2 }] as grade (grade.q)}
								<td>
									<button
										class={`w-full ${selectedGradeQ == grade.q ? "bg-blue-300 dark:bg-blue-700" : "opaque"}`}
										type="button"
										onclick={() => {
											selectedGradeQ = grade.q;
										}}
									>
										❌ {grade.label}
									</button>
								</td>
							{/each}
						</tr>
						<tr>
							{#each [{ label: "Effort", q: 3 }, { label: "Hesitation", q: 4 }, { label: "Perfect", q: 5 }] as grade (grade.q)}
								<td>
									<button
										class={`w-full ${selectedGradeQ == grade.q ? "bg-blue-300 dark:bg-blue-700" : "opaque"}`}
										type="button"
										onclick={() => {
											selectedGradeQ = grade.q;
										}}
									>
										⭕ {grade.label}
									</button>
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			{/if}
			<div class="mx-1">
				<button
					class="block w-full rounded border border-gray-600 px-2 dark:border-gray-300"
					disabled={!hideAnswer}
					onclick={() => {
						hideAnswer = false;
						const answerTimeMs = Date.now() - questionStartMs;
						if (answerTimeMs < ($optionsStore.auto5s || 2) * 1000) {
							selectedGradeQ = 5;
						} else if (answerTimeMs < ($optionsStore.auto4s || 7) * 1000) {
							selectedGradeQ = 4;
						}
					}}>Show Answer</button
				>
			</div>
		</div>
	{/if}
	<details class="can-hover:block hidden">
		<summary>Debug</summary>
		<pre>{JSON.stringify(currentLetterPair, null, 2)}</pre>
	</details>
</div>
