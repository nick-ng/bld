import type { LetterPair } from '$lib/types';

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const letterPairStore = writable<{ [letterPair: string]: LetterPair }>({});

if (browser) {
	const fetchLetterPairs = async () => {
		letterPairStore.set({
			tb: {
				letterPair: 'tb',
				memo: 'Tiger Balm',
				lastCorrectUnix: 0,
				lastQuizUnix: 0,
				commutator: ''
			}
		});
	};

	fetchLetterPairs();
}
