<script lang="ts">
	import type { FlashCardStoreType } from "$lib/stores/flash-cards";

	import { onMount } from "svelte";
	import { flashCardStore, flashCardStoreStatus, fetchFlashCards } from "$lib/stores/flash-cards";
	import { optionsStore } from "$lib/stores/options";
	import { parseCommutator, sortAlgs, isBuffer, isTwist } from "$lib/utils";
	import { leitnerDecks, getLeitnerTag } from "$lib/quiz";
	import ConfidenceTable from "./confidence-table.svelte";
	import LetterPair from "./letter-pair.svelte";

	const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
	const HOUR_MS = 60 * 60 * 1000;
	const DAY_MS = 24 * HOUR_MS;
	const WEEK_MS = 7 * DAY_MS;
	const MONTH_MS = 30 * DAY_MS;
	const YEAR_MS = 365 * DAY_MS;

	const flashCardType = "corner";
	let flashCardTypeInfo = $derived($optionsStore.flashCardTypes[flashCardType]);
	let leitnerCurrentDeck = $derived(
		Object.values($flashCardStore).filter((fc) => {
			const { leitnerDeck } = getLeitnerTag(fc.tags);
			return leitnerDeck === "C";
		})
	);
	let leitnerRetiredDeck = $derived(
		Object.values($flashCardStore).filter((fc) => {
			const { leitnerDeck } = getLeitnerTag(fc.tags);
			return leitnerDeck === "R";
		})
	);

	const summariseFlashCards = (flashCards: FlashCardStoreType) => {
		const inserts: { [insert: string]: string[] } = {};
		const interchanges: { [interchange: string]: string[] } = {};
		const setups: { [setup: string]: string[] } = {};
		const memoConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
		const commConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
		const missingComms: string[] = [];
		const missingMemos: string[] = [];
		const quizAges: {
			letterPair: string;
			lastQuizUnix: number;
			hidden?: boolean;
			isMarker?: boolean;
		}[] = Object.values(flashCards)
			.filter(
				(fc) =>
					!isBuffer(fc.letterPair, flashCardTypeInfo.bufferPiece) &&
					!isTwist(fc.letterPair, flashCardTypeInfo.samePieces)
			)
			.sort((a, b) => b.lastQuizUnix - a.lastQuizUnix);
		if (quizAges.length > 0) {
			const nowMs = Date.now();
			const newest = quizAges[0].lastQuizUnix;
			const newestDate = new Date(newest * 1000);
			const oldest = quizAges[quizAges.length - 1].lastQuizUnix;
			const oldestDate = new Date(oldest * 1000);
			const historyMarkers = [
				{ label: "1 Year", unixTimestamp: (nowMs - YEAR_MS) / 1000 },
				{ label: "6 Months", unixTimestamp: (nowMs - 6 * MONTH_MS) / 1000 },
				{ label: "1 Month", unixTimestamp: (nowMs - MONTH_MS) / 1000 },
				{ label: "1 Week", unixTimestamp: (nowMs - WEEK_MS) / 1000 },
				{ label: "1 Day", unixTimestamp: (nowMs - DAY_MS) / 1000 },
				{ label: "1 Hour", unixTimestamp: (nowMs - HOUR_MS) / 1000 }
			];
			for (let i = 0; i < historyMarkers.length; i++) {
				if (oldest < historyMarkers[i].unixTimestamp && newest > historyMarkers[i].unixTimestamp) {
					quizAges.push({
						lastQuizUnix: historyMarkers[i].unixTimestamp,
						letterPair: historyMarkers[i].label,
						isMarker: true
					});
				}
			}
			quizAges.push({
				lastQuizUnix: oldest - 1,
				letterPair: `${oldestDate.getFullYear()}-${(oldestDate.getMonth() + 1).toString().padStart(2, "0")}-${oldestDate.getDate().toString().padStart(2, "0")}`,
				isMarker: true
			});
			if (newest * 1000 > nowMs - DAY_MS) {
				quizAges.push({
					lastQuizUnix: quizAges[0].lastQuizUnix + 1,
					letterPair: `${newestDate.getHours()}:${newestDate.getMinutes().toString().padStart(2, "0")}`,
					isMarker: true
				});
			} else {
				quizAges.push({
					lastQuizUnix: newest + 1,
					letterPair: `${newestDate.getFullYear()}-${(newestDate.getMonth() + 1).toString().padStart(2, "0")}-${newestDate.getDate().toString().padStart(2, "0")}`,
					isMarker: true
				});
			}

			quizAges.sort((a, b) => {
				const ageDifference = a.lastQuizUnix - b.lastQuizUnix;
				if (ageDifference !== 0) {
					return ageDifference;
				}

				return a.letterPair.localeCompare(b.letterPair);
			});

			for (let i = 1; i < quizAges.length - 1; i++) {
				if (quizAges[i].isMarker && quizAges[i - 1].isMarker && quizAges[i + 1].isMarker) {
					quizAges[i].hidden = true;
				}
			}
		}
		let total = 0;
		for (let letter0 = 0; letter0 < 24; letter0++) {
			for (let letter1 = 0; letter1 < 24; letter1++) {
				const letterPair = `${String.fromCharCode(97 + letter0)}${String.fromCharCode(97 + letter1)}`;
				if (
					isBuffer(letterPair, flashCardTypeInfo.bufferPiece) ||
					isTwist(letterPair, flashCardTypeInfo.samePieces)
				) {
					continue;
				}

				total += 1;
				const flashCard = flashCards[letterPair];
				if (flashCard) {
					if (!memoConfidences[flashCard.memoConfidence]) {
						memoConfidences[flashCard.memoConfidence] = [];
					}
					if (flashCard.memo) {
						memoConfidences[flashCard.memoConfidence].push(letterPair);
					} else {
						missingMemos.push(letterPair);
					}

					if (!commConfidences[flashCard.commConfidence]) {
						commConfidences[flashCard.commConfidence] = [];
					}
					if (flashCard.commutator) {
						commConfidences[flashCard.commConfidence].push(letterPair);
					} else {
						missingComms.push(letterPair);
					}

					const { insert, interchange, setup } = parseCommutator(flashCard.commutator);
					if (!insert) {
						continue;
					}

					if (!inserts[insert]) {
						inserts[insert] = [];
					}
					inserts[insert].push(flashCard.letterPair);

					if (!interchanges[interchange]) {
						interchanges[interchange] = [];
					}
					interchanges[interchange].push(flashCard.letterPair);

					if (!setups[setup]) {
						setups[setup] = [];
					}
					setups[setup].push(flashCard.letterPair);
				} else {
					missingComms.push(letterPair);
					missingMemos.push(letterPair);
				}
			}
		}

		return {
			inserts,
			interchanges,
			setups,
			memoConfidences,
			missingMemos,
			commConfidences,
			missingComms,
			quizAges,
			total
		};
	};

	let summary = $derived(summariseFlashCards($flashCardStore));

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
						in Decks: {Object.values($flashCardStore).filter((fc) => {
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
							{#each leitnerCurrentDeck as flashCard (flashCard.letterPair)}
								<LetterPair letterPair={flashCard.letterPair} cardType={flashCardType} />
							{/each}
							{#if leitnerCurrentDeck.length > 0}
								<span class="p-0.5">({leitnerCurrentDeck.length})</span>
							{/if}
						</div>
					</td>
				</tr>
				{#each ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as deckId (deckId)}
					{@const leitnerDeck = Object.values($flashCardStore).filter((fc) => {
						const { leitnerDeck } = getLeitnerTag(fc.tags);
						return leitnerDeck === deckId;
					})}
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
							{#each leitnerRetiredDeck as flashCard (flashCard.letterPair)}
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
									<a href={`/flash-cards?lp=${quizAge.letterPair}`} class="p-0.5 uppercase"
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
