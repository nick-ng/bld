<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { USERNAME_STORE_KEY } from "$lib/constants";
	import { flashCardStore } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { getAllLetterPairs, arrayToCsvRow } from "$lib/utils";
	import FlashCardChooser from "./flash-card-chooser.svelte";
	import FlashCard from "./flash-card.svelte";

	const allLetterPairs = getAllLetterPairs(true);
	let letterPairFilter = $state(page.url.searchParams.get("filter") || "");
	let processedLetterPairFilter = $derived.by(() => {
		const lowerCaseFilter = letterPairFilter.toLowerCase().replaceAll(/[^a-z ]/g, " ");

		if (lowerCaseFilter.length === 2) {
			return [lowerCaseFilter, `${lowerCaseFilter[1]}${lowerCaseFilter[0]}`];
		}

		if (lowerCaseFilter.includes(" ")) {
			const tempFilter = lowerCaseFilter.split(" ").filter((a) => a);
			const outputFilter = [];
			for (let i = 0; i < tempFilter.length; i++) {
				switch (tempFilter[i].length) {
					case 1: {
						outputFilter.push(`${tempFilter[i]}${tempFilter[i]}`);
						break;
					}
					case 2: {
						outputFilter.push(tempFilter[i]);
						break;
					}
					default: {
						outputFilter.push(...tempFilter[i].split(""));
					}
				}
			}

			return outputFilter;
		}

		return lowerCaseFilter.split("");
	});
	let filteredLetterPairs = $derived(
		letterPairFilter && processedLetterPairFilter.every((lp) => lp.length === 2)
			? processedLetterPairFilter
			: allLetterPairs.filter((lp) => {
					if (processedLetterPairFilter.length < 1) {
						return true;
					}

					if (processedLetterPairFilter.length === 1) {
						return lp.includes(processedLetterPairFilter[0]);
					}

					return (
						processedLetterPairFilter.includes(lp[0]) && processedLetterPairFilter.includes(lp[1])
					);
				})
	);
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");
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
			<label class="inline-block"
				>Filter:
				<input type="text" autocomplete="off" bind:value={letterPairFilter} />
			</label><button
				class="inline-block"
				type="button"
				onclick={() => {
					letterPairFilter = "";
				}}>Clear Filter</button
			>
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
	{#if filteredLetterPairs.length <= 10}<div class="flashCards">
			{#each filteredLetterPairs as letterPair (letterPair)}
				<div class="w-68 rounded border border-gray-300 p-2 dark:border-gray-500">
					<FlashCard {letterPair} />
				</div>
			{/each}
		</div>{:else}
		<div
			class={["letterPairGrid", !letterPairFilter && "letterPairGridColumns"]
				.filter((a) => a)
				.join(" ")}
		>
			{#each filteredLetterPairs as letterPair (letterPair)}
				<FlashCardChooser
					{letterPair}
					hideNon3Style={$optionsStore.hideNon3Style}
					hideNonOP={$optionsStore.hideNonOP}
					{flashCardType}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.flashCards {
		width: max-content;
		max-width: 90vw;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
	}

	.letterPairGrid {
		display: grid;
		justify-content: center;
		grid-template-columns: repeat(auto-fill, 42px);
	}

	@media (min-width: 1024px) {
		.letterPairGrid {
			grid-template-columns: repeat(24, 42px);
			grid-template-rows: repeat(24, 1fr);
		}

		.letterPairGridColumns {
			grid-auto-flow: column dense;
		}
	}
</style>
