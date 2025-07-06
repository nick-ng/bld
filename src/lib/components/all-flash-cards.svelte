<script lang="ts">
	import { goto } from "$app/navigation";
	import LetterPairChooser from "./flash-card-chooser.svelte";
	import { optionsStore } from "$lib/stores/options";
	import { getAllLetterPairs } from "$lib/utils";

	const allLetterPairs = getAllLetterPairs(true);
	let letterPairFilter = $state("");
</script>

<div class="lg:w-min m-auto">
	<div class="flex flex-row justify-center items-end">
		<h1>Corner Flash Cards</h1>
	</div>
	<div class="flex flex-row gap-2">
		<form
			class="mb-1"
			onsubmit={(event) => {
				event.preventDefault();

				const trimmedLetterPair = letterPairFilter.trim().toLowerCase();

				if (trimmedLetterPair.length === 2 && allLetterPairs.includes(trimmedLetterPair)) {
					goto(`/flash-cards/edit/${trimmedLetterPair}`);
				}
			}}
		>
			<label class="block"
				>Filter:
				<input type="text" autocomplete="off" bind:value={letterPairFilter} />
			</label>
		</form>
		<label
			>Hide Non-3-Style Pairs: <input
				type="checkbox"
				bind:checked={$optionsStore.hideNon3Style}
			/></label
		>
		<label
			>Hide Non-OP Pairs: <input type="checkbox" bind:checked={$optionsStore.hideNonOP} /></label
		>
	</div>
	<div class="letterPairGrid">
		{#each allLetterPairs.filter((lp) => {
			if (!letterPairFilter.trim()) {
				return true;
			}

			return lp.startsWith(letterPairFilter);
		}) as letterPair (letterPair)}
			<LetterPairChooser
				{letterPair}
				hideNon3Style={$optionsStore.hideNon3Style}
				hideNonOP={$optionsStore.hideNonOP}
			/>
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
			grid-auto-flow: column dense;
			grid-template-columns: repeat(24, 42px);
			grid-template-rows: repeat(24, 1fr);
		}
	}
</style>
