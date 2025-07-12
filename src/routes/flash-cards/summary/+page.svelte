<script lang="ts">
	import type { FlashCardStoreType } from "$lib/stores/flash-cards";

	import { onMount } from "svelte";
	import { commutatorDetails, sortAlgs, is3Style, isTwist } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus, fetchFlashCards } from "$lib/stores/flash-cards";

	const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
	const HOUR_MS = 60 * 60 * 1000;
	const DAY_MS = 24 * HOUR_MS;
	const WEEK_MS = 7 * DAY_MS;
	const MONTH_MS = 4 * WEEK_MS;

	const getAgeRange = (timestampMs: number): string => {
		const ageMs = Date.now() - timestampMs;
		if (ageMs > MONTH_MS) {
			return "> 1 Month";
		}

		if (ageMs > WEEK_MS) {
			return "< 1 Month";
		}

		if (ageMs > DAY_MS) {
			return "< 1 Week";
		}

		if (ageMs > HOUR_MS) {
			return "< 1 Day";
		}

		return "< 1 Hour";
	};

	const ageRangeToMs = (ageRange: string): number => {
		switch (ageRange) {
			case "> 1 Month": {
				return MONTH_MS + 1;
			}
			case "< 1 Month": {
				return WEEK_MS + 1;
			}
			case "< 1 Week": {
				return DAY_MS + 1;
			}
			case "< 1 Day": {
				return HOUR_MS + 1;
			}
			default: {
				return 0;
			}
		}
	};

	const summariseFlashCards = (flashCards: FlashCardStoreType) => {
		const inserts: { [insert: string]: string[] } = {};
		const interchanges: { [interchange: string]: string[] } = {};
		const setups: { [setup: string]: string[] } = {};
		const memoConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
		const commConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
		const missingComms: string[] = [];
		const missingMemos: string[] = [];
		const ageRanges: { [ageRangeString: string]: string[] } = {};
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

					const ageRange = getAgeRange(flashCard.lastQuizUnix * 1000);
					if (!ageRanges[ageRange]) {
						ageRanges[ageRange] = [];
					}
					ageRanges[ageRange].push(flashCard.letterPair);

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
			ageRanges,
			total
		};
	};

	let summary = $derived(summariseFlashCards($flashCardStore));
	let randomMissingComm = $derived(
		summary.missingComms[Math.floor(Math.random() * summary.missingComms.length)]
	);
	let randomMissingMemo = $derived(
		summary.missingMemos[Math.floor(Math.random() * summary.missingMemos.length)]
	);

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
		<table class="summary-tables block lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-center">Comm. Confidence</th>
					<th class="text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#if summary.missingComms.length > 0}
					<tr>
						<td class="text-center">
							<div>No Comms</div>
							<div>({summary.missingComms.length}/{summary.total})</div>
							{#if summary.missingComms.length > 0}
								<a
									class="my-1 block rounded border border-gray-600 px-2 py-1 dark:border-gray-300"
									href={`/flash-cards?lp=${randomMissingComm}`}>Random</a
								>
							{/if}
						</td>
						<td>
							{#each summary.missingComms.toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
						</td>
					</tr>
				{/if}
				{#each Object.keys(summary.commConfidences)
					.toSorted((a, b) => parseInt(a) - parseInt(b))
					.map((a) => parseInt(a)) as confidence (confidence)}
					<tr>
						<td class="text-center"
							><div>{confidence}</div>
							<div>({summary.commConfidences[confidence].length}/{summary.total})</div></td
						>
						<td>
							{#each summary.commConfidences[confidence].toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table class="summary-tables block lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-center">Memo. Confidence</th>
					<th class="text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#if summary.missingMemos.length > 0}
					<tr>
						<td class="text-center">
							<div>No Memo</div>
							<div>({summary.missingMemos.length}/{summary.total})</div>
							{#if summary.missingMemos.length > 0}
								<a
									class="my-1 block rounded border border-gray-600 px-2 py-1 dark:border-gray-300"
									href={`/flash-cards?lp=${randomMissingMemo}`}>Random</a
								>
							{/if}
						</td>
						<td>
							{#each summary.missingMemos.toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
						</td>
					</tr>
				{/if}
				{#each Object.keys(summary.memoConfidences)
					.toSorted((a, b) => parseInt(a) - parseInt(b))
					.map((a) => parseInt(a)) as confidence (confidence)}
					<tr>
						<td class="text-center"
							><div>{confidence}</div>
							<div>({summary.memoConfidences[confidence].length}/{summary.total})</div></td
						>
						<td>
							{#each summary.memoConfidences[confidence].toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table class="summary-tables block lg:col-span-2 lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left whitespace-nowrap">Last Reviewed</th>
					<th class="text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.keys(summary.ageRanges).toSorted((a, b) => ageRangeToMs(b) - ageRangeToMs(a)) as ageRange (ageRange)}
					<tr>
						<td>{ageRange}</td>
						<td>
							{#each summary.ageRanges[ageRange].toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
						</td>
					</tr>
				{/each}
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
						<td class="font-mono whitespace-nowrap">{insert}</td>
						<td>
							{#each summary.inserts[insert].toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
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
						<td class="font-mono whitespace-nowrap">{setup}</td>
						<td>
							{#each summary.setups[setup].toSorted() as letterPair, i (letterPair)}
								{i > 0 ? ", " : ""}<a href={`/flash-cards?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
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

	.summary-tables td,
	.summary-tables th {
		border: 1px solid grey;
		padding: 4px;
		line-height: 1;
	}
</style>
