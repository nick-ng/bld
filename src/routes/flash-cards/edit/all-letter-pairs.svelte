<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import LetterPairChooser from "./letter-pair-chooser.svelte";
	import { FLASH_CARD_FILTER_STORE_KEY } from "$lib/constants";

	let allLetterPairs = [];
	let letterPairFilter = "";
	let hideNon3Style = false;
	let hideNonOP = false;
	let loaded = false;

	const codePointOffset = 97;
	for (let i = 0; i < 24; i++) {
		for (let j = 0; j < 24; j++) {
			const firstLetter = String.fromCodePoint(codePointOffset + i);
			const secondLetter = String.fromCodePoint(codePointOffset + j);
			allLetterPairs.push(`${firstLetter}${secondLetter}`);
		}
	}

	const updateFilterStore = (loaded: boolean, ...args: boolean[]) => {
		if (!loaded) {
			return;
		}

		const stored = args.map((a) => (a ? "t" : "f")).join("");
		localStorage.setItem(FLASH_CARD_FILTER_STORE_KEY, stored);
	};

	$: updateFilterStore(loaded, hideNon3Style, hideNonOP);

	onMount(() => {
		const stored = localStorage.getItem(FLASH_CARD_FILTER_STORE_KEY);
		if (stored) {
			hideNon3Style = stored[0] === "t";
			hideNonOP = stored[1] === "t";
		}
		loaded = true;
	});
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
				<input type="text" autocomplete="off" bind:value={letterPairFilter} />
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
			grid-auto-flow: column dense;
			grid-template-columns: repeat(24, 42px);
			grid-template-rows: repeat(24, 1fr);
		}
	}
</style>
