<script lang="ts">
	import { page } from "$app/state";
	import { quizStore } from "$lib/stores/quiz";
	import QuizHome from "./quiz-home.svelte";
	import Quiz from "./quiz.svelte";
	import SuperMemoQuiz from "./super-memo-quiz.svelte";

	let currentSpeffzPair = page.url.searchParams.get("sp");
	let quizCategory = page.url.searchParams.get("category");
	let quizSubcategory = page.url.searchParams.get("subcategory");
</script>

<div class="mx-auto max-w-prose">
	{#if currentSpeffzPair && quizCategory}
		<SuperMemoQuiz {currentSpeffzPair} category={quizCategory} subcategory={quizSubcategory} />
	{:else if $quizStore.length > 0}
		<Quiz />
	{:else}
		<QuizHome />
	{/if}
</div>
