<script lang="ts">
	import { onMount } from "svelte";
	import { goto, replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import { USERNAME_STORE_KEY } from "$lib/constants";
	import { getFlashCard, getAllFlashCardsOfType, flashCardStore } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import {
		arrayToCsvRow,
		is3styleCorner,
		isM2Edge,
		parseCommutator,
		simplifyAlgorithm,
	} from "$lib/utils";
	import FlashCardChooser from "./flash-card-chooser.svelte";
	import FlashCard from "./flash-card.svelte";
	import Step from "$lib/components/step.svelte";

	// eslint-disable-next-line svelte/prefer-writable-derived
	let letterPairFilter = $state(page.url.searchParams.get("f") || "");
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");
	let filterInputElement = $derived<HTMLInputElement | null>(null);
	let allLetterPairs = $derived.by(() => {
		const tempLetterPairs: string[] = [];
		for (let letter0 = 0; letter0 < 24; letter0++) {
			for (let letter1 = 0; letter1 < 24; letter1++) {
				const letterPair = `${String.fromCharCode(97 + letter0)}${String.fromCharCode(97 + letter1)}`;
				tempLetterPairs.push(letterPair);
			}
		}

		return tempLetterPairs;
	});

	let processedLetterPairFilter = $derived.by(() => {
		const lowerCaseFilter = letterPairFilter
			.toLowerCase()
			.replaceAll(/[^a-z ]/g, " ")
			.replaceAll(/[yz]/g, "x");

		if (lowerCaseFilter.length === 2) {
			if (lowerCaseFilter[0] === lowerCaseFilter[1]) {
				return [lowerCaseFilter];
			}
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
			? processedLetterPairFilter.filter((lp) => {
					if ($optionsStore.flashCardVisibility.corners && is3styleCorner(lp)) {
						return true;
					}

					if ($optionsStore.flashCardVisibility.m2edges && isM2Edge(lp)) {
						return true;
					}

					return false;
				})
			: allLetterPairs.filter((lp) => {
					if (processedLetterPairFilter.length < 1) {
						return true;
					}

					if (processedLetterPairFilter.length === 1 && processedLetterPairFilter[0] !== lp[0]) {
						return false;
					}

					if (!lp.includes(processedLetterPairFilter[0])) {
						return false;
					}

					if (processedLetterPairFilter.length > 1 && !processedLetterPairFilter.includes(lp[1])) {
						return false;
					}

					if ($optionsStore.flashCardVisibility.corners && is3styleCorner(lp)) {
						return true;
					}

					if ($optionsStore.flashCardVisibility.m2edges && isM2Edge(lp)) {
						return true;
					}

					return false;
				})
	);
	let filteredCommutators = $derived(
		filteredLetterPairs.map((lp) => getFlashCard(lp, flashCardType, $flashCardStore))
	);
	const now = new Date();
	const formattedDate = [
		now.getFullYear(),
		(now.getMonth() + 1).toString().padStart(2, "0"),
		now.getDate().toString().padStart(2, "0"),
	].join("");
	const owner = localStorage.getItem(USERNAME_STORE_KEY) || "user";
	let flashCardCsv = $derived(
		getAllFlashCardsOfType(flashCardType, $flashCardStore)
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
					fc.lastQuizUnix.toString(),
				]);
			})
			.join("\n")
	);

	$effect(() => {
		letterPairFilter = page.url.searchParams.get("f") || "";
	});

	onMount(() => {
		const focusFilterInput = (event: KeyboardEvent) => {
			if (event.key !== ":") {
				return;
			}

			filterInputElement?.focus();
			filterInputElement?.select();
		};

		document.addEventListener("keypress", focusFilterInput);

		return () => {
			document.removeEventListener("keypress", focusFilterInput);
		};
	});
</script>

<div class="m-auto lg:w-min">
	<div class="flex flex-row items-end justify-center">
		<h1>Flash Cards</h1>
	</div>
	<div class="mb-1 flex flex-row items-center gap-2">
		<div class="flex min-w-1/2 flex-row">
			<input
				class="shrink grow"
				type="text"
				autocomplete="off"
				bind:this={filterInputElement}
				bind:value={
					() => letterPairFilter,
					(newLetterPairFilter) => {
						letterPairFilter = newLetterPairFilter
							.replaceAll(/,/g, " ")
							.replaceAll(/[^a-z ()]/gi, "")
							.replaceAll(/ +/g, " ")
							.toUpperCase();
						page.url.searchParams.set("f", letterPairFilter);
						replaceState(`/flash-cards?${page.url.searchParams.toString()}`, page.state);
					}
				}
				placeholder="Filter Flash Cards"
			/><button
				class="inline-block"
				type="button"
				onclick={() => {
					page.url.searchParams.delete("f");
					goto(`/flash-cards?${page.url.searchParams.toString()}`);
				}}>Clear</button
			>
		</div>
		<label class="whitespace-nowrap">
			<input type="checkbox" bind:checked={$optionsStore.flashCardVisibility.corners} />
			Corners
		</label>
		<label class="whitespace-nowrap">
			<input type="checkbox" bind:checked={$optionsStore.flashCardVisibility.m2edges} />
			M2 Edges
		</label>
		<div class="grow-1"></div>
		<a
			class="hidden rounded border border-gray-600 px-2 py-0 whitespace-nowrap lg:inline dark:border-gray-300"
			href={`data:text/csv;charset=utf-8,${encodeURIComponent(flashCardCsv)}`}
			download={`v2-${formattedDate}-000000-log.csv`}>Export Flash Cards</a
		>
	</div>
	{#if filteredLetterPairs.length === 0}
		<div class="w-prose max-w-full">
			No flash cards match the filter "{letterPairFilter}"
		</div>
	{:else if filteredLetterPairs.length <= 25}
		<div class="flashCards lg:min-w-120">
			{#each filteredLetterPairs as letterPair, i (`${letterPair}-${i}`)}
				<div
					class="flex w-68 flex-col justify-between rounded border border-gray-300 dark:border-gray-500"
				>
					<FlashCard
						{letterPair}
						{flashCardType}
						showCorners
						showMemo
						showCommutator
						showImage
						extraClass="mx-2"
					/>
					<a
						class="block self-stretch border-t border-gray-300 text-center dark:border-gray-500"
						href={`/flash-cards/edit?t=${flashCardType}&lp=${letterPair}`}>Edit</a
					>
				</div>
			{/each}
		</div>
		{#if filteredCommutators.every((a) => a?.commutator)}
			{@const simplification = simplifyAlgorithm(
				filteredCommutators.map((c) => parseCommutator(c.commutator).expansion).join(" ")
			)}
			<div class="text-xl">
				<div class="mt-2 text-center leading-none text-balance">
					{#each simplification.original as step, i (`${step.move}-${i}`)}
						{i > 0 ? " " : ""}<Step move={step.move} cancellationType={step.type} />
					{/each}
				</div>
				{#if simplification.originalCount > simplification.simplifiedCount}
					<div class="mt-2 text-center leading-none text-balance">
						{#each simplification.simplified as step, i (`${step.move}-${i}`)}
							{i > 0 ? " " : ""}<Step move={step.move} cancellationType={step.type} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{:else}
		<div
			class={["letterPairGrid", !letterPairFilter && "letterPairGridColumns"]
				.filter((a) => a)
				.join(" ")}
		>
			{#each filteredLetterPairs as letterPair, i (`${letterPair}-${i}`)}
				{@const flashCard = getFlashCard(letterPair, "corner", $flashCardStore)}
				{#if $optionsStore.flashCardVisibility.corners && is3styleCorner(letterPair)}
					<FlashCardChooser flashCard={flashCard || null} />
				{:else if $optionsStore.flashCardVisibility.m2edges && isM2Edge(letterPair)}
					<FlashCardChooser flashCard={flashCard || null} />
				{:else}
					<FlashCardChooser flashCard={null} />
				{/if}
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
