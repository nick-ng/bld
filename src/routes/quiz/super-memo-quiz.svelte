<script lang="ts">
	import { getVisibleFlashCardComponents, getNextLetters } from "$lib/quiz";
	import { letterPairStore } from "$lib/stores/letter-pairs";
	import LetterPair from "$lib/components/letter-pair.svelte";

	interface Props {
		currentSpeffzPair: string;
		category: string; // e.g. "Memo", "UF", "UFR"
		subcategory?: string | null; // default is all e.g. "q", "algs"
	}

	let { currentSpeffzPair, category, subcategory }: Props = $props();
	let hideAnswer = $state(true);
	let visibleComponents = $derived(getVisibleFlashCardComponents(category, hideAnswer));
	let selectedGradeQ = $state(-1);
	let currentLetterPair = $derived($letterPairStore[currentSpeffzPair]);
</script>

<div class="mx-auto max-w-prose">
	<div>{currentSpeffzPair}</div>
	<div>{category}</div>
	<div>{subcategory}</div>
	<pre>{JSON.stringify(visibleComponents, null, 2)}</pre>
	{#if currentLetterPair}
		<LetterPair
			letterPair={$letterPairStore[currentSpeffzPair]}
			selectedBuffers={visibleComponents.selectedBuffers}
			hideWords={visibleComponents.hideWords}
			hideImage={visibleComponents.hideImage}
			onQuizEnd={() => {}}
			isQuiz
		/>
	{/if}
	{#if !hideAnswer}
		<div class="absolute bottom-3 left-0 z-1 w-full px-2 lg:relative lg:w-full lg:px-0">
			<table class="mb-2 w-full border-collapse border-separate border-spacing-1">
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
		</div>
	{:else}
		<div class="w-full px-2 lg:px-0">
			<button
				class="cannot-hover:py-4 block w-full rounded border border-gray-600 px-2 py-0 dark:border-gray-300"
				onclick={() => {
					hideAnswer = false;
				}}>Show Answer</button
			>
		</div>
	{/if}
</div>
