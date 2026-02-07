<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { getVisibleFlashCardComponents, getQuizKit, superMemo2 } from "$lib/quiz";
	import { letterPairStore, saveAlgorithm, saveMnemonic } from "$lib/stores/letter-pairs";
	import LetterPair from "$lib/components/letter-pair.svelte";

	interface Props {
		currentSpeffzPair: string;
		category: string; // e.g. "Memo", "UF", "UFR"
		subcategory: string | null; // default is all e.g. "q", "algs"
		quizCount: number | null;
	}

	let { currentSpeffzPair, category, subcategory, quizCount }: Props = $props();
	let { title, quizType, getSMStats, getNextLetters } = $derived(getQuizKit(category, subcategory));
	let hideAnswer = $state(true);
	let visibleComponents = $derived(getVisibleFlashCardComponents(category, hideAnswer));
	let selectedGradeQ = $state(-1);
	let currentLetterPair = $derived($letterPairStore[currentSpeffzPair]);
	let nextLetters = $derived(getNextLetters(Object.values($letterPairStore)));
	let isSubmitting = $state(false);

	const submitQuiz = async (stopAfter: boolean = false) => {
		if (selectedGradeQ < 0) {
			return;
		}

		const newSMStats = superMemo2(selectedGradeQ, getSMStats(currentLetterPair));
		switch (quizType) {
			case "alg": {
				await saveAlgorithm({
					speffz_pair: currentSpeffzPair,
					buffer: category,
					...newSMStats,
				});
				break;
			}
			case "memo": {
				await saveMnemonic({
					speffz_pair: currentSpeffzPair,
					...newSMStats,
				});
				break;
			}
			default: {
				console.error("unexpected quiz type");
				return;
			}
		}

		if (stopAfter) {
			selectedGradeQ = -1;
			goto("/quiz");
			return;
		}

		const freshNextLetters = getNextLetters(Object.values($letterPairStore));
		const nextLetter = freshNextLetters.shift();
		const nextQuizCount = (quizCount || 0) + 1;
		if (!nextLetter) {
			alert(`All done! Reviewed ${nextQuizCount} cards`);
			goto("/quiz");
			return;
		}

		hideAnswer = true;
		selectedGradeQ = -1;
		setTimeout(() => {
			const searchParams = new URLSearchParams(location.search);
			searchParams.set("sp", nextLetter.speffz_pair);
			searchParams.set("quizcount", nextQuizCount.toString());
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
				<div>Done:</div>
				<div>
					{quizCount || 0}
				</div>
				<div>Left:</div>
				<div>
					{nextLetters.length}
				</div>
			</div>
			<h3 class="text-center">Quiz: {title}</h3>
			<div class="absolute top-0 right-0"><a class="like-button" href="/quiz">End Quiz</a></div>
		</div>
		{#if currentLetterPair}
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
			class="cannot-hover:absolute cannot-hover:bottom-8 cannot-hover:left-0 cannot-hover:px-2 z-1 mt-1 flex w-full flex-col"
		>
			{#if !hideAnswer}
				<table class="mb-3 w-full border-collapse border-separate border-spacing-1">
					<tbody>
						<tr>
							{#each [{ label: "Nothing", q: 0 }, { label: "Familiar", q: 1 }, { label: "Easy", q: 2 }] as grade (grade.q)}
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
				<div class="mx-1 flex flex-row gap-1">
					<button
						class={`grow ${isSubmitting ? "bg-slate-200" : ""}`}
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
						class={`grow ${isSubmitting ? "bg-slate-200" : ""}`}
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
			{:else}
				<div class="">
					<button
						class="block w-full rounded border border-gray-600 px-2 dark:border-gray-300"
						onclick={() => {
							hideAnswer = false;
						}}>Show Answer</button
					>
				</div>
			{/if}
		</div>
	{/if}
	<details class="can-hover:block hidden">
		<summary>Debug</summary>
		<pre>{JSON.stringify(currentLetterPair, null, 2)}</pre>
	</details>
</div>
