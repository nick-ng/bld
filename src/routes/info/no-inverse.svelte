<script lang="ts">
	import type { LetterPair } from "$lib/types";

	import { isSpeffzPairValid } from "$lib/utils";

	type Props = {
		buffer: string;
		letterPairs: LetterPair[];
	};

	let { buffer, letterPairs }: Props = $props();

	let validLetterPairs = $derived(
		letterPairs.filter((lp) => isSpeffzPairValid(lp.speffz_pair, [buffer]))
	);
	let noInverse = $derived(
		Object.values(
			validLetterPairs.reduce<Record<string, string[]>>((prev, curr) => {
				const inverse = `${curr.speffz_pair[1]}${curr.speffz_pair[0]}`;
				// skip the "second" inverse and twists
				if (curr.speffz_pair >= inverse) {
					return prev;
				}

				const withAlgs: string[] = [];
				if (!curr.algorithms[buffer]?.moves.trim()) {
					withAlgs.push(curr.speffz_pair);
				}

				const inverseLp = validLetterPairs.find((lp) => lp.speffz_pair === inverse);
				if (!inverseLp?.algorithms[buffer]?.moves.trim()) {
					withAlgs.push(inverse);
				}
				if (withAlgs.length === 2) {
					prev[curr.speffz_pair] = withAlgs;
				}

				return prev;
			}, {})
		)
	);
</script>

<h4>No Algs</h4>
<ul class="list-disc list-inside uppercase">
	{#each noInverse as temp (temp[0])}
		{@const params = new URLSearchParams({ f: temp.join(" ").toUpperCase() })}
		<li><a href={`/?${params.toString()}`}>{temp.join(", ")}</a></li>
	{/each}
</ul>
