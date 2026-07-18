<script lang="ts">
	import type { Options } from "$lib/types";

	import { page } from "$app/state";
	import { letterPairStore, letterPairStoreStatus, saveAlgorithm } from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import {
		daysAgo,
		getTrueKeys,
		msToMinAndSec,
		parseCommutator,
		shuffleArray,
		upperCaseFirst,
	} from "$lib/utils";
	import { getQuizKit, getAlgorithms } from "$lib/quiz";
	import { SvelteURLSearchParams } from "svelte/reactivity";
	import { goto } from "$app/navigation";

	const NEW_TIME_WEIGHT = 0.6;

	// "stand-by", "go", "review", "done"
	let quizState = $state("stand-by");
	let quizStartMs = $state(0);
	let quizTimeMs = $state(0);
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
	let selectedDrillCategoryIndex = $state(0);
	let flatAlgorithms = $derived.by(() => {
		const selectedDrillCategory = drillCategories[selectedDrillCategoryIndex];
		if (!selectedDrillCategory) {
			return [];
		}

		const algs: {
			fullMoves: string;
			speffz_pair: string;
			buffer: string;
			moves: string;
			sm2_n: number;
			sm2_ef: number;
			sm2_i: number;
			drill_time_ms: number;
			last_drill_at: Date;
			last_review_at: Date;
			next_review_at: Date;
		}[] = [];
		selectedDrillCategory.forEach((dc) => {
			dc.algorithms.forEach((a) => {
				algs.push(a);
			});
		});

		return algs;
	});

	const getDrillUrl = (buf: string, next: string[], prev: string[]) => {
		const searchParams = new SvelteURLSearchParams({ buf, n: next.join(" "), p: prev.join(" ") });

		return `/drill?${searchParams.toString()}`;
	};

	const getFullMoves = (
		options: Options,
		flatAlgs: {
			fullMoves: string;
			speffz_pair: string;
			buffer: string;
			moves: string;
			sm2_n: number;
			sm2_ef: number;
			sm2_i: number;
			drill_time_ms: number;
			last_drill_at: Date;
			last_review_at: Date;
			next_review_at: Date;
		}[],
		speffzLetterPairs: string[]
	) => {
		const commsSoFar = speffzLetterPairs.map((sp) => {
			const temp = flatAlgs.find((a) => a.speffz_pair === sp);
			if (!temp) {
				return "";
			}

			return temp.fullMoves;
		});

		const allMoves = [options.solveOrientationPreMoves, ...commsSoFar].join(" ");

		return allMoves;
	};

	const advanceQuiz = (correct: boolean, solvedCube: boolean = false) => {
		const [curr, ...rest] = next;
		const alg = flatAlgorithms.find((a) => a.speffz_pair === curr);
		if (!alg || !buf) {
			return;
		}

		const newDrillTimeMs = Math.round(
			quizTimeMs * NEW_TIME_WEIGHT + alg.drill_time_ms * (1 - NEW_TIME_WEIGHT)
		);

		if (correct) {
			// @todo(nick-ng): also update the super memo parameters? if incorrect, also update?
			saveAlgorithm({
				speffz_pair: curr.toLocaleLowerCase(),
				buffer: buf,
				last_drill_at: new Date(),
				drill_time_ms: newDrillTimeMs,
			});
		}

		if (rest.length === 0) {
			quizState = "done";
			return;
		}

		quizState = "review-countdown";
		setTimeout(() => {
			quizState = "go";
			quizStartMs = Date.now();

			if (!correct || solvedCube) {
				prev = [];
			} else {
				prev = [...prev, curr];
			}

			next = rest;

			const searchParams = new SvelteURLSearchParams(location.search);
			searchParams.set("n", next.join(" "));
			searchParams.set("p", prev.join(" "));
			goto(`/drill?${searchParams.toString()}`);
		}, 1000);
	};
</script>

<div class="mx-auto max-w-prose">
	{#if $letterPairStoreStatus.status !== "loaded" && $letterPairStoreStatus.status !== "reloading" && $letterPairStoreStatus.status !== "saving"}
		<div class="">{upperCaseFirst($letterPairStoreStatus.message)}</div>
	{:else if next.length > 0}
		<div class="flex flex-col items-center gap-1">
			<div class="self-stretch h-2 border border-gray-500">
				<div
					class="h-full bg-blue-800 ease-linear"
					style={`${[
						`width:${["countdown", "review-countdown", "go"].includes(quizState) ? "0" : "100%"}`,
						`transition-duration:${["countdown", "review-countdown", "go"].includes(quizState) ? "1s" : "0"}`,
					].join(";")};`}
				></div>
			</div>
			<div>Buffer: {buf}</div>
			{#if quizState === "stand-by" || quizState === "countdown"}
				<button
					class="self-stretch"
					type="button"
					onclick={() => {
						quizState = "countdown";
						setTimeout(() => {
							quizState = "go";
							quizStartMs = Date.now();
						}, 1000);
					}}
				>
					{#if quizState === "countdown"}
						Get Ready
					{:else}
						Start
					{/if}
				</button>
			{:else if quizState === "go"}
				<div class="relative self-stretch">
					<button
						class="absolute top-0 left-0 right-0 mx-auto bg-white z-10"
						type="button"
						style="width:90vw;height:70vh;"
						onclick={() => {
							quizState = "review";
							quizTimeMs = Date.now() - quizStartMs;
						}}
					>
						<div class="uppercase text-2xl">
							{next[0]}
						</div>
						<div>Done</div>
					</button>
				</div>
			{:else if quizState === "review" || quizState === "review-countdown"}
				{#if quizState === "review"}
					{@const alg = flatAlgorithms.find((a) => a.speffz_pair === next[0])}
					<div>
						<span class="uppercase">{next[0]}</span> took: {msToMinAndSec(quizTimeMs, true)}
					</div>
					{#if alg}
						<div>
							{alg.moves}
						</div>
					{/if}
					<div class="flex flex-row gap-1 self-stretch">
						<button
							class="grow"
							type="button"
							onclick={() => {
								if (!confirm("Solve the cube")) {
									return;
								}

								quizState = "review-countdown";
								// save quiz result here
								advanceQuiz(false, true);
							}}>Wrong</button
						>
						{#if next.length > 1}
							<button
								class="grow"
								type="button"
								onclick={() => {
									if (!confirm("Solve the cube")) {
										return;
									}

									advanceQuiz(true, true);
								}}>From Solved</button
							>
						{/if}
						<button
							class="grow"
							type="button"
							onclick={() => {
								advanceQuiz(true, false);
							}}
						>
							{#if next.length > 1}
								Continue ({next.length - 1})
							{:else}
								Correct
							{/if}
						</button>
					</div>
				{:else}
					Get ready
				{/if}
			{:else}
				<div>All done! Back to <a href="/drill">Drill</a></div>
			{/if}
			<div class={`${quizState === "review" ? "" : "opacity-0"}`}>
				<twisty-player
					puzzle="3x3x3"
					alg={getFullMoves($optionsStore, flatAlgorithms, [...prev, next[0]])}
					visualization="2D"
					hint-facelets="none"
					background="none"
					control-panel="none"
					style={`width: 90vw; height: ${90 * (3 / 4)}vw;`}
				></twisty-player>
			</div>
		</div>
	{:else}
		{@const slowest = flatAlgorithms.toSorted((a, b) => {
			return b.drill_time_ms - a.drill_time_ms;
		})}
		{@const oldest = flatAlgorithms.toSorted((a, b) => {
			return a.last_drill_at.valueOf() - b.last_drill_at.valueOf();
		})}
		<div class="flex flex-col gap-1 my-1">
			<select
				class="like-button block grow py-2 text-center text-xl leading-none"
				bind:value={selectedDrillCategoryIndex}
			>
				{#each drillCategories as drillCategory, i (`${drillCategory[0]?.category}-${i}`)}
					<option value={i}>{drillCategory[0]?.category || "Error"}</option>
				{/each}
			</select>
			<div class="flex flex-row gap-1">
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl(
						drillCategories[selectedDrillCategoryIndex][0].category,
						shuffleArray(slowest.slice(0, 10).map((a) => a.speffz_pair)),
						[]
					)}
					onclick={() => {
						quizState = "stand-by";
					}}>🐌 ({msToMinAndSec(slowest[0].drill_time_ms, true)})</a
				>
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl(
						drillCategories[selectedDrillCategoryIndex][0].category,
						shuffleArray(oldest.slice(0, 10).map((a) => a.speffz_pair)),
						[]
					)}
					onclick={() => {
						quizState = "stand-by";
					}}>👴 ({daysAgo(oldest[0].last_drill_at, 30)})</a
				>
			</div>
			{#each drillCategories[selectedDrillCategoryIndex] as drillSubcategory (`${drillSubcategory.category}-${drillSubcategory.subcategory || "all"}`)}
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl(
						drillSubcategory.category,
						shuffleArray(drillSubcategory.algorithms.map((a) => a.speffz_pair)),
						[]
					)}
					onclick={() => {
						quizState = "stand-by";
					}}
					>{drillSubcategory.title} ({msToMinAndSec(drillSubcategory.maxDrillTime, true)})
				</a>
			{/each}
		</div>
	{/if}
</div>
