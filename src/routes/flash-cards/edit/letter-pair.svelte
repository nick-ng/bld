<script lang="ts">
	import { letterPairStore } from '$lib/stores/letter-pairs';
	export let letterPair = '';

	const samePieces = [
		['a', 'e', 'r'],
		['b', 'n', 'q'],
		['c', 'j', 'm'],
		['d', 'f', 'i'],
		['g', 'l', 'u'],
		['h', 's', 'x'],
		['k', 'p', 'v'],
		['o', 't', 'w']
	];

	const isSamePiece = (letterPair: string) => {
		const letters = letterPair.split('');
		if (letters.length !== 2) {
			return false;
		}

		if (letters[0] === letters[1]) {
			// repeated letter means odd number of swaps
			return false;
		}

		for (let i = 0; i < samePieces.length; i++) {
			if (samePieces[i].includes(letters[0])) {
				if (samePieces[i].includes(letters[1])) {
					return true;
				}
			}
		}

		return false;
	};

	const getIndicators = (letterPair: string) => {
		if (typeof $letterPairStore === 'string') {
			return ['#ff0000ff', '#00aa00ff', '#0000ffff'];
		}

		const letterPairObject = $letterPairStore[letterPair];
		return [
			!letterPairObject?.memo && '#ff0000ff',
			!letterPairObject?.commutator && '#00aa00ff',
			!letterPairObject?.image && '#0000ffff'
		];
	};
</script>

{#if !isSamePiece(letterPair)}
	<a
		class="block bg-white text-center no-underline border p-0 border-gray-800"
		href={`/flash-cards/edit/${letterPair}`}
	>
		<div class="uppercase p-0">{letterPair}</div>
		<div class="h-2 flex flex-row justify-center gap-0.5 px-0.5 pb-0.5">
			{#each getIndicators(letterPair) as colorHex}
				<div
					class="rounded-full block flex-1"
					style={`background-color: ${colorHex || '#ffffff00'};}`}
				></div>
			{/each}
		</div>
	</a>
{:else}
	<div class="bg-gray-800"></div>
{/if}
