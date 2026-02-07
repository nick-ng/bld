<script lang="ts">
	import type { LetterPair } from "$lib/types";

	import { SvelteURLSearchParams } from "svelte/reactivity";
	import {
		letterPairStore,
		letterPairStoreStatus,
		fetchAndLoadMnemonicsAndAlgorithms,
	} from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import { upperCaseFirst, getTrueKeys } from "$lib/utils";
	import { getQuizKit } from "$lib/quiz";

	const quizCategories = [
		{ category: "memo", subcategory: getTrueKeys($optionsStore.chosenBuffers).join(",") },
		...getTrueKeys($optionsStore.chosenBuffers).map((buf) => ({
			category: buf,
			subcategory: null,
		})),
		{ category: "UF", subcategory: "orozco" },
	];

	const getQuizUrl = (category: string, subcategory: string | null, nextLetters: LetterPair[]) => {
		if (nextLetters.length === 0) {
			return "";
		}

		const searchParams = new SvelteURLSearchParams();
		searchParams.set("sp", nextLetters[0].speffz_pair);
		searchParams.set("category", category);
		if (subcategory) {
			searchParams.set("subcategory", subcategory);
		}

		return `/quiz?${searchParams.toString()}`;
	};
</script>

<div class="mx-auto max-w-prose">
	{#if $letterPairStoreStatus.status !== "loaded"}
		<div class="">{upperCaseFirst($letterPairStoreStatus.message)}</div>
	{:else}
		<div>
			<div class="align-center mt-5 flex flex-col gap-2">
				{#each quizCategories as quizCategory (`${quizCategory.category}-${quizCategory.subcategory || "*"}`)}
					{@const quizKit = getQuizKit(quizCategory.category, quizCategory.subcategory)}
					{@const nextLetters = quizKit.getNextLetters(Object.values($letterPairStore))}
					<a
						class="like-button block w-full py-2 text-center text-xl leading-none"
						style={`order: -${nextLetters.length};`}
						href={getQuizUrl(quizCategory.category, quizCategory.subcategory, nextLetters)}
					>
						{quizKit.title} ({nextLetters.length} due)
					</a>
				{/each}
				<button
					class="self-start"
					disabled={$letterPairStoreStatus.status !== "loaded"}
					onclick={() => {
						if ($letterPairStoreStatus.status !== "loaded") {
							return;
						}

						fetchAndLoadMnemonicsAndAlgorithms();
					}}>Reload</button
				>
			</div>
		</div>
	{/if}
</div>
