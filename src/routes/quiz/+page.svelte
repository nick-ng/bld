<script lang="ts">
	import { quizStore } from "$lib/stores/quiz";
	import QuizHome from "./quiz-home.svelte";
	import Quiz from "./quiz.svelte";
</script>

<div class="mx-auto max-w-prose">
	{#if $quizStore.length === 0}
		<QuizHome />
	{:else}
		<Quiz />
	{/if}
</div>
