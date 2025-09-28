<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import {
		flashCardStoreStatus,
		fetchFlashCards,
		getAllFlashCardsOfType,
		flashCardStore
	} from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { parseCommutator, sortAlgs, isBuffer, isTwist, summariseFlashCards } from "$lib/utils";
	import { leitnerDecks, getLeitnerTag } from "$lib/quiz";
	import ConfidenceTable from "./confidence-table.svelte";
	import LetterPair from "./letter-pair.svelte";

	const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

	let flashCardType = page.url.searchParams.get("t") || "corner";
	let flashCardTypeInfo = $derived($optionsStore.flashCardTypes[flashCardType]);
	let flashCards = $derived(
		getAllFlashCardsOfType(flashCardType, $flashCardStore).filter(
			(fc) =>
				!isBuffer(fc.letterPair, flashCardTypeInfo.bufferPiece) &&
				!isTwist(fc.letterPair, flashCardTypeInfo.samePieces)
		)
	);
	let leitnerCurrentDeck = $derived(
		flashCards.filter((fc) => {
			const { leitnerDeck } = getLeitnerTag(fc.tags);
			return leitnerDeck === "C";
		})
	);
	let leitnerRetiredDeck = $derived(
		flashCards.filter((fc) => {
			const { leitnerDeck } = getLeitnerTag(fc.tags);
			return leitnerDeck === "R";
		})
	);

	let summary = $derived(summariseFlashCards(flashCards, flashCardTypeInfo));

	onMount(() => {
		if (Date.now() - $flashCardStoreStatus.fetchEndMs > STALE_THRESHOLD_MS) {
			fetchFlashCards();
		}
	});
</script>

<div>
	<div
		class="summary-grid mx-auto grid grid-cols-1 content-center items-start justify-center justify-items-center gap-2 lg:m-0"
	>
		<table class="summary-tables block w-full lg:max-w-lg">
			<thead>
				<tr>
					<td colspan="2" class="p-1 text-left">
						Next Session: {$optionsStore.flashCardTypes[flashCardType].leitnerSession || 0}, Cards
						in Decks: {flashCards.filter((fc) => {
							const { leitnerDeck } = getLeitnerTag(fc.tags);
							return leitnerDeck !== "S" && leitnerDeck !== "R";
						}).length}, Retired Cards: {leitnerRetiredDeck.length}
					</td>
				</tr>
				<tr>
					<th class="text-left whitespace-nowrap">Deck</th>
					<th class="w-full text-left whitespace-nowrap">Letter Pairs</th>
				</tr>
			</thead>
			<tbody
				><tr>
					<td class="p-1 whitespace-nowrap">Current</td>
					<td>
						<div
							class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
						>
							{#each leitnerCurrentDeck.toSorted( (a, b) => a.letterPair.localeCompare( b.letterPair, "en", { sensitivity: "base" } ) ) as flashCard (flashCard.letterPair)}
								<LetterPair letterPair={flashCard.letterPair} cardType={flashCardType} />
							{/each}
							{#if leitnerCurrentDeck.length > 0}
								<span class="p-0.5">({leitnerCurrentDeck.length})</span>
							{/if}
						</div>
					</td>
				</tr>
				{#each ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as deckId (deckId)}
					{@const leitnerDeck = flashCards
						.filter((fc) => {
							const { leitnerDeck } = getLeitnerTag(fc.tags);
							return leitnerDeck === deckId;
						})
						.sort((a, b) =>
							a.letterPair.localeCompare(b.letterPair, "en", { sensitivity: "base" })
						)}
					<tr>
						<td class="p-1 whitespace-nowrap">{leitnerDecks[deckId]?.join("-")}</td>
						<td>
							<div
								class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
							>
								{#each leitnerDeck as flashCard (flashCard.letterPair)}
									<LetterPair letterPair={flashCard.letterPair} cardType={flashCardType} />
								{/each}
								{#if leitnerDeck.length > 0}
									<span class="p-0.5">({leitnerDeck.length})</span>
								{/if}
							</div></td
						>
					</tr>
				{/each}
				<tr>
					<td class="p-1 whitespace-nowrap">Retired</td>
					<td>
						<div
							class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
						>
							{#each leitnerRetiredDeck.toSorted( (a, b) => a.letterPair.localeCompare( b.letterPair, "en", { sensitivity: "base" } ) ) as flashCard (flashCard.letterPair)}
								<LetterPair letterPair={flashCard.letterPair} cardType={flashCardType} />
							{/each}
							{#if leitnerRetiredDeck.length > 0}
								<span class="p-0.5">({leitnerRetiredDeck.length})</span>
							{/if}
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<table class="quiz-history block w-full lg:max-w-lg">
			<thead>
				<tr>
					<th class="w-full text-left whitespace-nowrap">Quiz History</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<div
							class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
						>
							{#each summary.quizAges as quizAge (quizAge.letterPair)}
								{#if !quizAge.isMarker}
									<a href={`/flash-cards?f=${quizAge.letterPair}`} class="p-0.5 uppercase"
										>{quizAge.letterPair}</a
									>
								{:else if !quizAge.hidden}
									<span
										class="dark: mx-0.5 bg-gray-800 p-0.5 text-black text-gray-100 dark:bg-white"
										>{quizAge.letterPair}</span
									>
								{/if}
							{/each}
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<ConfidenceTable
			tableType="Comm"
			missing={summary.missingComms}
			cardType={flashCardType}
			confidences={summary.commConfidences}
			total={summary.total}
		/>
		<ConfidenceTable
			tableType="Memo"
			missing={summary.missingMemos}
			cardType={flashCardType}
			confidences={summary.memoConfidences}
			total={summary.total}
		/>
		<table class="summary-tables block w-full lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-right">Speed</th>
					<th class="w-full text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#each summary.drillSpeedGroups as drillSpeedGroup (drillSpeedGroup.seconds[0])}
					<tr>
						<td class="p-1 text-right whitespace-nowrap"
							>{drillSpeedGroup.seconds[0].toFixed(1)} - {drillSpeedGroup.seconds[1].toFixed(
								1
							)}s</td
						>
						<td>
							<div
								class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
							>
								{#each drillSpeedGroup.letters as letters (letters)}
									<a href={`/flash-cards?f=${letters}`} class="p-0.5 uppercase">{letters}</a>
								{/each}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table class="summary-tables block w-full lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left">Insert</th>
					<th class="w-full text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.keys(summary.inserts).toSorted(sortAlgs) as insert (insert)}
					<tr>
						<td class="p-1 font-mono whitespace-nowrap">{insert}</td>
						<td>
							<div
								class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
							>
								{#each summary.inserts[insert].toSorted() as letterPair (letterPair)}
									<LetterPair {letterPair} cardType={flashCardType} />
								{/each}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table class="summary-tables block w-full lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left">Setup</th>
					<th class="w-full text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.keys(summary.setups).toSorted(sortAlgs) as setup (setup)}
					<tr>
						<td class="p-1 font-mono whitespace-nowrap">{setup}</td>
						<td>
							<div
								class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
							>
								{#each summary.setups[setup].toSorted() as letterPair (letterPair)}
									<LetterPair {letterPair} cardType={flashCardType} />
								{/each}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	@media (min-width: 1024px) {
		.summary-grid {
			grid-template-columns: repeat(2, minmax(0, 512px));
		}
	}

	.quiz-history td,
	.quiz-history th,
	.summary-tables td,
	.summary-tables th {
		border: 1px solid grey;
		line-height: 1;
	}

	.quiz-history th,
	.summary-tables th {
		padding: 4px;
	}
</style>
