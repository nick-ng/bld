<script lang="ts">
	interface Props {
		tableType: string;
		missing: string[];
		cardType: string;
		confidences: { [confidence: number]: string[] };
		total: number;
	}

	import LetterPair from "./letter-pair.svelte";

	let { tableType, missing, cardType, confidences, total }: Props = $props();
	let randomMissing = $derived(missing[Math.floor(Math.random() * missing.length)]);
</script>

<table class="summary-tables block w-full lg:max-w-lg">
	<thead>
		<tr>
			<th class="text-center">{tableType}. Confidence</th>
			<th class="w-full text-left">Letter Pairs</th>
		</tr>
	</thead>
	<tbody>
		{#if missing.length > 0}
			<tr>
				<td class="p-1 text-center">
					<div>No {tableType}s</div>
					<div>({missing.length}/{total})</div>
					{#if missing.length > 0}
						<a
							class="my-1 block rounded border border-gray-600 px-2 py-1 dark:border-gray-300"
							href={`/flash-cards?lp=${randomMissing}?t=${cardType}`}>Random</a
						>
					{/if}
				</td>
				<td>
					<div
						class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
					>
						{#each missing.toSorted() as letterPair (letterPair)}
							<LetterPair {letterPair} {cardType} />
						{/each}
					</div>
				</td>
			</tr>
		{/if}
		{#each Object.keys(confidences)
			.toSorted((a, b) => parseInt(a) - parseInt(b))
			.map((a) => parseInt(a)) as confidence (confidence)}
			<tr>
				<td class="p-1 text-center"
					><div>{confidence}</div>
					<div>({confidences[confidence].length}/{total})</div></td
				>
				<td>
					<div
						class="flex flex-row flex-wrap items-start justify-start p-0.5 font-mono leading-none"
					>
						{#each confidences[confidence].toSorted() as letterPair (letterPair)}
							<LetterPair {letterPair} {cardType} />
						{/each}
					</div>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.summary-tables td,
	.summary-tables th {
		border: 1px solid grey;
		line-height: 1;
	}

	.summary-tables th {
		padding: 4px;
	}
</style>
