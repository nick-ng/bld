<script lang="ts">
	import type { FlashCardStoreType } from "$lib/stores/flash-cards";

	import { onMount } from "svelte";
	import { commutatorDetails, sortAlgs, is3Style, isTwist } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus, fetchFlashCards } from "$lib/stores/flash-cards";
	import ConfidenceTable from "./confidence-table.svelte";

	const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
	const HOUR_MS = 60 * 60 * 1000;
	const DAY_MS = 24 * HOUR_MS;
	const WEEK_MS = 7 * DAY_MS;
	const MONTH_MS = 4 * WEEK_MS;

	const summariseFlashCards = (flashCards: FlashCardStoreType) => {
		const inserts: { [insert: string]: string[] } = {};
		const interchanges: { [interchange: string]: string[] } = {};
		const setups: { [setup: string]: string[] } = {};
		const memoConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
		const commConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
		const missingComms: string[] = [];
		const missingMemos: string[] = [];
		const quizAges: { letterPair: string; lastQuizUnix: number }[] = [
			...Object.values(flashCards).filter(
				(fc) => is3Style(fc.letterPair) && !isTwist(fc.letterPair)
			),
			{ letterPair: "1 Month", lastQuizUnix: (Date.now() - MONTH_MS) / 1000 },
			{ letterPair: "1 Week", lastQuizUnix: (Date.now() - WEEK_MS) / 1000 },
			{ letterPair: "1 Day", lastQuizUnix: (Date.now() - DAY_MS) / 1000 },
			{ letterPair: "1 Hour", lastQuizUnix: (Date.now() - HOUR_MS) / 1000 }
		].sort((a, b) => {
			const ageDifference = a.lastQuizUnix - b.lastQuizUnix;
			if (ageDifference !== 0) {
				return ageDifference;
			}

			return a.letterPair.localeCompare(b.letterPair);
		});
		const oldest = quizAges[0].lastQuizUnix;
		const oldestDate = new Date(oldest * 1000);
		quizAges.unshift({
			lastQuizUnix: oldest - 1,
			letterPair: `${oldestDate.getFullYear()}-${(oldestDate.getMonth() + 1).toString().padStart(2, "0")}-${oldestDate.getDate().toString().padStart(2, "0")}`
		});
		let total = 0;
		for (let letter0 = 0; letter0 < 24; letter0++) {
			for (let letter1 = 0; letter1 < 24; letter1++) {
				const letterPair =
					`${String.fromCharCode(65 + letter0)}${String.fromCharCode(65 + letter1)}`.toLowerCase();
				if (!is3Style(letterPair) || isTwist(letterPair)) {
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

					const { insert, interchange, setup } = commutatorDetails(flashCard.commutator);
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
		<ConfidenceTable
			tableType="Comm"
			missing={summary.missingComms}
			confidences={summary.commConfidences}
			total={summary.total}
		/>
		<ConfidenceTable
			tableType="Memo"
			missing={summary.missingMemos}
			confidences={summary.memoConfidences}
			total={summary.total}
		/>
		<table class="quiz-history block lg:col-span-2 lg:max-w-5xl">
			<thead>
				<tr>
					<th class="text-left whitespace-nowrap">Quiz History</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<div
							class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
						>
							{#each summary.quizAges as quizAge (quizAge.letterPair)}
								{#if quizAge.letterPair.length !== 2}
									<span
										class="dark:bg-whitei dark: mx-0.5 bg-gray-800 p-0.5 text-black text-gray-100"
										>{quizAge.letterPair}</span
									>
								{:else}
									<a href={`/flash-cards?lp=${quizAge.letterPair}`} class="p-0.5 uppercase"
										>{quizAge.letterPair}</a
									>
								{/if}
							{/each}
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<table class="summary-tables block lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left">Insert</th>
					<th class="text-left">Letter Pairs</th>
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
									<a href={`/flash-cards?lp=${letterPair}`} class="p-0.5 uppercase">{letterPair}</a>
								{/each}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table class="summary-tables block lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left">Setup</th>
					<th class="text-left">Letter Pairs</th>
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
									<a href={`/flash-cards?lp=${letterPair}`} class="p-0.5 uppercase">{letterPair}</a>
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
