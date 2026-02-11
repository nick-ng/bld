<script lang="ts">
	import { page } from "$app/state";
	import QuizHome from "./quiz-home.svelte";
	import SuperMemoQuiz from "./super-memo-quiz.svelte";

	let currentSpeffzPair = $derived(page.url.searchParams.get("sp"));
	let quizCategory = $derived(page.url.searchParams.get("category"));
	let quizSubcategory = $derived(page.url.searchParams.get("subcategory"));
</script>

<div class="mx-auto max-w-prose">
	{#if currentSpeffzPair && quizCategory}
		<SuperMemoQuiz {currentSpeffzPair} category={quizCategory} subcategory={quizSubcategory} />
	{:else}
		<QuizHome />
	{/if}
</div>
