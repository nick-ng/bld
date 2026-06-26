<script lang="ts">
	import { page } from "$app/state";
	import QuizHome from "./quiz-home.svelte";
	import SuperMemoQuiz from "./super-memo-quiz.svelte";

	let currentSpeffzPair = $derived(page.url.searchParams.get("sp"));
	let quizCategory = $derived(page.url.searchParams.get("category"));
	let quizSubcategory = $derived(page.url.searchParams.get("subcategory"));
	let unlimited = $derived(page.url.searchParams.get("unlimited") === "yes");
	let old = $derived(page.url.searchParams.get("old"));
</script>

<div class="mx-auto max-w-prose">
	{#if currentSpeffzPair && quizCategory}
		<SuperMemoQuiz
			{currentSpeffzPair}
			category={quizCategory}
			subcategory={quizSubcategory}
			{unlimited}
			old={typeof old === "string" ? parseInt(old, 10) : null}
		/>
	{:else}
		<QuizHome />
	{/if}
</div>
