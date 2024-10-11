<script lang="ts">
	import type { FlashCard } from "$lib/types";
	import { onMount } from "svelte";
	import { commutatorDetails, sortAlgs } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus, fetchFlashCards } from "$lib/stores/flash-cards";

	const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

	const summariseFlashCards = (flatFlashCards: FlashCard[]) => {
		const inserts: { [insert: string]: string[] } = {};
		const interchanges: { [interchange: string]: string[] } = {};
		const setups: { [setup: string]: string[] } = {};
		for (let i = 0; i < flatFlashCards.length; i++) {
			const flashCard = flatFlashCards[i];
			if (flashCard.letterPair[0] === flashCard.letterPair[1] || !flashCard.commutator) {
				continue;
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
		}

		return {
			inserts,
			interchanges,
			setups
		};
	};

	$: summary = summariseFlashCards(Object.values($flashCardStore));

	onMount(() => {
		if (Date.now() - $flashCardStoreStatus.fetchEndMs > STALE_THRESHOLD_MS) {
			fetchFlashCards();
		}
	});
</script>

<div>
	<div class="flex lg:flex-row flex-col lg:items-start lg:justify-center gap-2 lg:m-0 mx-2">
		<table class="summary-tables lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left">Insert</th>
					<th class="text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.keys(summary.inserts).toSorted(sortAlgs) as insert}
					{@const insertId = `insert-${insert}`}
					<tr>
						<td><label class="font-mono" for={insertId}>{insert}</label></td>
						<td>
							{#each summary.inserts[insert].toSorted() as letterPair, i}
								{i > 0 ? ", " : ""}<a href={`/flash-cards/edit?lp=${letterPair}`} class="uppercase"
									>{letterPair}</a
								>
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table class="summary-tables lg:max-w-lg">
			<thead>
				<tr>
					<th class="text-left">Setup</th>
					<th class="text-left">Letter Pairs</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.keys(summary.setups).toSorted(sortAlgs) as setup}
					{@const setupId = `setup-${setup}`}
					<tr>
						<td><label class="font-mono" for={setupId}>{setup}</label></td>
						<td>
							{#each summary.setups[setup].toSorted() as letterPair, i}
								{i > 0 ? ", " : ""}<a href={`/flash-cards/edit?lp=${letterPair}`} class="uppercase"
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
	.summary-tables td,
	.summary-tables th {
		border: 1px solid grey;
		padding: 4px;
		line-height: 1;
	}
</style>
