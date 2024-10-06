<script lang="ts">
	import { goto } from "$app/navigation";
	import LetterPairChooser from "./letter-pair-chooser.svelte";

	let allLetterPairs = [];
	let letterPairFilter = "";
	let hideNonOP = false;
	let hideNon3Style = false;

	const codePointOffset = 97;
	for (let j = 0; j < 24; j++) {
		for (let i = 0; i < 24; i++) {
			const firstLetter = String.fromCodePoint(codePointOffset + i);
			const secondLetter = String.fromCodePoint(codePointOffset + j);
			allLetterPairs.push(`${firstLetter}${secondLetter}`);
		}
	}
</script>

<div class="lg:w-min m-auto">
	<div class="flex flex-row justify-between items-end">
		<a href="/flash-cards">Back</a>
		<h1>Edit Flash Cards</h1>
		<div />
	</div>
	<div class="flex flex-row gap-2">
		<form
			class="mb-1"
			on:submit={(event) => {
				event.preventDefault();

				const trimmedLetterPair = letterPairFilter.trim().toLowerCase();

				if (trimmedLetterPair.length === 2 && allLetterPairs.includes(trimmedLetterPair)) {
					goto(`/flash-cards/edit/${trimmedLetterPair}`);
				}
			}}
		>
			<label class="block"
				>Filter:
				<input type="text" bind:value={letterPairFilter} />
			</label>
		</form>
		<label>Hide Non-3-Style Pairs: <input type="checkbox" bind:checked={hideNon3Style} /></label>
		<label>Hide Non-OP Pairs: <input type="checkbox" bind:checked={hideNonOP} /></label>
	</div>
	<div class="letterPairGrid">
		{#each allLetterPairs.filter((lp) => {
			if (!letterPairFilter.trim()) {
				return true;
			}

			return lp.startsWith(letterPairFilter);
		}) as letterPair}
			<LetterPairChooser {letterPair} {hideNon3Style} {hideNonOP} />
		{/each}
	</div>
</div>

<style>
	.letterPairGrid {
		display: grid;
		justify-content: center;
		grid-template-columns: repeat(auto-fill, 42px);
	}

	@media (min-width: 1024px) {
		.letterPairGrid {
			grid-template-columns: repeat(24, 42px);
		}
	}
</style>
