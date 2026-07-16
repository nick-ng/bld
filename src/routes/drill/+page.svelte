<script lang="ts">
	import { page } from "$app/state";
	import LetterPair from "$lib/components/letter-pair.svelte";
	import {
		letterPairStore,
		letterPairStoreStatus,
		fetchAndLoadMnemonicsAndAlgorithms,
	} from "$lib/stores/letter-pairs";
	import { optionsStore, getCardsPerGroupLimit } from "$lib/stores/options";
	import {
		upperCaseFirst,
		getTrueKeys,
		shuffleArray,
		parseCommutator,
		msToLargestTime,
	} from "$lib/utils";
	import { getQuizKit, getAlgorithms } from "$lib/quiz";
	import { SvelteURLSearchParams } from "svelte/reactivity";

	// "stand-by", "go", "review", "done"
	let quizState = $state("stand-by");
	let buf = $derived(page.url.searchParams.get("buf"));
	let next = $derived(
		page.url.searchParams
			.get("n")
			?.split(" ")
			.filter((a) => a) || []
	);
	let prev = $derived(
		page.url.searchParams
			.get("p")
			?.split(" ")
			.filter((a) => a) || []
	);

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
					const algorithms = getAlgorithms(
						$letterPairStore,
						category,
						subcategory,
						$optionsStore
					).map((a) => {
						const parsedAlg = parseCommutator(a.moves);
						return {
							...a,
							fullMoves: parsedAlg.expansion,
						};
					});
					const drillTimes = algorithms.map((a) => a.drill_time_ms);
					const drillTimestamps = algorithms.map((a) => a.last_drill_at.valueOf());
					const maxDrillTime = Math.max(...drillTimes);
					const maxDrillTimestamps = Math.max(...drillTimestamps);

					return { ...quizKit, algorithms, maxDrillTime, maxDrillTimestamps };
				})
				.filter((a) => a.algorithms.length > 0)
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

	const getDrillUrl = (buf: string, next: string[], prev: string[]) => {
		const searchParams = new SvelteURLSearchParams({ buf, n: next.join(" "), p: prev.join(" ") });

		return `/drill?${searchParams.toString()}`;
	};
</script>

<div class="mx-auto max-w-prose">
	<pre>{JSON.stringify({ buf, next, prev }, null, 2)}</pre>
	{#if $letterPairStoreStatus.status !== "loaded" && $letterPairStoreStatus.status !== "reloading" && $letterPairStoreStatus.status !== "saving"}
		<div class="">{upperCaseFirst($letterPairStoreStatus.message)}</div>
	{:else if next.length > 0}
		<div class="flex flex-col items-center">
			<div>Buffer: {buf}</div>
			{#if quizState === "stand-by"}
				<button
					ontouchend={() => {
						quizState = "go";
					}}>Start</button
				>
			{:else}
				<h2 class="uppercase">
					{next[0]}
				</h2>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col gap-1 my-1">
			<select
				class="like-button block grow py-2 text-center text-xl leading-none"
				bind:value={selectedDrillCategory}
			>
				{#each drillCategories as drillCategory, i (`${drillCategory[0]?.category}-${i}`)}
					<option value={i}>{drillCategory[0]?.category || "Error"}</option>
				{/each}
			</select>
			{#each drillCategories[selectedDrillCategory] as drillSubcategory (`${drillSubcategory.category}-${drillSubcategory.subcategory || "all"}`)}
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl(
						drillSubcategory.category,
						shuffleArray(drillSubcategory.algorithms.map((a) => a.speffz_pair)),
						[]
					)}
					>{drillSubcategory.subcategory
						? drillSubcategory.title
						: `${drillSubcategory.category}, All`} ({msToLargestTime(
						drillSubcategory.maxDrillTime,
						true
					)})
				</a>
			{/each}
		</div>
	{/if}
</div>
