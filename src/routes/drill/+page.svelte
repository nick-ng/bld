<script lang="ts">
	import LetterPair from "$lib/components/letter-pair.svelte";
	import {
		letterPairStore,
		letterPairStoreStatus,
		fetchAndLoadMnemonicsAndAlgorithms,
	} from "$lib/stores/letter-pairs";
	import { optionsStore, getCardsPerGroupLimit } from "$lib/stores/options";
	import { upperCaseFirst, getTrueKeys, shuffleArray } from "$lib/utils";
	import { getQuizKit, getAlgorithms } from "$lib/quiz";

	let drillCategories = $derived([
		...getTrueKeys($optionsStore.chosenBuffers).map((category) => {
			const startsWith = $derived(
				Object.values($letterPairStore).reduce((prev, curr) => {
					prev.add(`${curr.speffz_pair[0]}*`);
					return prev;
				}, new Set<string>())
			);
			startsWith.add("**");

			return [...startsWith]
				.map((subcategory) => {
					const quizKit = getQuizKit(category, subcategory, $optionsStore);
					const algorithms = getAlgorithms($letterPairStore, category, subcategory, $optionsStore);
					const drillTimes = algorithms.map((a) => a.drill_time_ms);
					const drillTimestamps = algorithms.map((a) => a.last_drill_at.valueOf());
					const maxDrillTime = Math.max(...drillTimes);
					const maxDrillTimestamps = Math.max(...drillTimestamps);

					return { ...quizKit, algorithms, maxDrillTime, maxDrillTimestamps };
				})
				.sort((a, b) => {
					if (a.algorithms.length !== b.algorithms.length) {
						return b.algorithms.length - a.algorithms.length;
					}

					if (a.maxDrillTime !== b.maxDrillTime) {
						return b.maxDrillTime - a.maxDrillTime;
					}

					return a.maxDrillTimestamps - b.maxDrillTimestamps;
				});
		}),
	]);
	let selectedDrillCategory = $state(0);
</script>

<div class="mx-auto max-w-prose">
	{#if $letterPairStoreStatus.status !== "loaded" && $letterPairStoreStatus.status !== "reloading" && $letterPairStoreStatus.status !== "saving"}
		<div class="">{upperCaseFirst($letterPairStoreStatus.message)}</div>
	{:else}
		<div class="flex flex-col gap-1">
			<select
				class="like-button block grow py-2 text-center text-xl leading-none"
				bind:value={selectedDrillCategory}
			>
				{#each drillCategories as drillCategory, i (`${drillCategory[0]?.category}-${i}`)}
					<option value={i}>{drillCategory[0]?.category || "Error"}</option>
				{/each}
			</select>
			{#each drillCategories[selectedDrillCategory] as drillSubcategory (`${drillSubcategory.category}-${drillSubcategory.subcategory || "all"}`)}
				<a class="like-button block grow py-2 text-center text-xl leading-none"
					>{drillSubcategory.subcategory
						? drillSubcategory.title
						: `${drillSubcategory.category}, All`}
				</a>
				<pre>
					{JSON.stringify(drillSubcategory.algorithms.slice(0, 3), null, 2)}
	</pre>
			{/each}
		</div>
	{/if}
</div>
