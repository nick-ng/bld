<script lang="ts">
	import { goto } from "$app/navigation";
	import { USERNAME_STORE_KEY } from "$lib/constants";
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { getAllLetterPairs, arrayToCsvRow } from "$lib/utils";
	import LetterPairChooser from "./flash-card-chooser.svelte";

	const allLetterPairs = getAllLetterPairs(true);
	let letterPairFilter = $state("");
	const now = new Date();
	const formattedDate = [
		now.getFullYear(),
		(now.getMonth() + 1).toString().padStart(2, "0"),
		now.getDate().toString().padStart(2, "0")
	].join("");
	const owner = localStorage.getItem(USERNAME_STORE_KEY) || "user";
	let flashCardCsv = $derived(
		Object.values($flashCardStore)
			.sort((a, b) => a.letterPair.localeCompare(b.letterPair))
			.map((fc) => {
				return arrayToCsvRow([
					owner,
					fc.letterPair,
					fc.memo,
					fc.image,
					fc.commutator,
					fc.tags,
					fc.type,
					`${fc.commConfidence * 4 + fc.memoConfidence}`,
					fc.isPublic ? "1" : "0",
					fc.lastQuizUnix.toString()
				]);
			})
			.join("\n")
	);
</script>

<div class="m-auto lg:w-min">
	<div class="flex flex-row items-end justify-center">
		<h1>Corner Flash Cards</h1>
	</div>
	<div class="mb-1 flex flex-row items-center gap-2">
		<form
			onsubmit={(event) => {
				event.preventDefault();

				const trimmedLetterPair = letterPairFilter.trim().toLowerCase();

				if (trimmedLetterPair.length === 2 && allLetterPairs.includes(trimmedLetterPair)) {
					goto(`/flash-cards?lp=${trimmedLetterPair}`);
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
		<div class="grow-1"></div>
		<a
			class="hidden rounded border border-gray-600 px-2 py-0 lg:inline dark:border-gray-300"
			href={`data:text/csv;charset=utf-8,${encodeURIComponent(flashCardCsv)}`}
			download={`v2-${formattedDate}-000000-log.csv`}>Export Flash Cards</a
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
