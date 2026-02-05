<script lang="ts">
	import { page } from "$app/state";
	import { quizStore } from "$lib/stores/quiz";
	import QuizHome from "./quiz-home.svelte";
	import Quiz from "./quiz.svelte";
	import SuperMemoQuiz from "./super-memo-quiz.svelte";

	let currentSpeffzPair = $derived(page.url.searchParams.get("sp"));
	let quizCategory = $derived(page.url.searchParams.get("category"));
	let quizSubcategory = $derived(page.url.searchParams.get("subcategory"));
	let quizCount = $derived.by(() => {
		const temp = page.url.searchParams.get("quizcount");
		if (typeof temp === "string") {
			return parseInt(temp);
		}

		return null;
	});
</script>

<div class="mx-auto max-w-prose">
	{#if currentSpeffzPair && quizCategory}
		<SuperMemoQuiz
			{currentSpeffzPair}
			category={quizCategory}
			subcategory={quizSubcategory}
			{quizCount}
		/>
	{:else if $quizStore.length > 0}
		<Quiz />
	{:else}
		<QuizHome />
	{/if}
</div>
