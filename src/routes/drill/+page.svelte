<script lang="ts">
	import type { Algorithm, Options } from "$lib/types";

	import { page } from "$app/state";
	import { letterPairStore, letterPairStoreStatus, saveAlgorithm } from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import {
		getTrueKeys,
		msToMinAndSec,
		parseCommutator,
		shuffleArray,
		upperCaseFirst,
	} from "$lib/utils";
	import { getQuizKit, getAlgorithms } from "$lib/quiz";
	import { SvelteURLSearchParams } from "svelte/reactivity";
	import { goto } from "$app/navigation";

	// @todo(nick-ng): show stats after drill

	const NEW_TIME_WEIGHT = 0.6;
	const MINUTE_MS = 1000 * 60;

	// "stand-by", "go", "review", "done"
	let drillState = $state("stand-by");
	let drillStartMs = $state(0);
	let drillTimeMs = $state(0);
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
					const meanDrillTime = drillTimes.reduce((prev, curr) => {
						return prev + curr / drillTimes.length;
					}, 0);

					return { ...quizKit, algorithms, maxDrillTime, maxDrillTimestamps, meanDrillTime };
				})
				.filter((a) => a.algorithms.length > 0)
				.sort((a, b) => {
					if (a.algorithms.length !== b.algorithms.length) {
						return b.algorithms.length - a.algorithms.length;
					}

					if (a.maxDrillTime !== b.maxDrillTime) {
						return b.maxDrillTime - a.maxDrillTime;
					}

					if (a.meanDrillTime !== b.meanDrillTime) {
						return b.meanDrillTime - a.meanDrillTime;
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

		const algs: (Algorithm & { fullMoves: string })[] = [];
		selectedDrillCategory.forEach((dc) => {
			dc.algorithms.forEach((a) => {
				algs.push(a);
			});
		});

		return algs;
	});

	const getMixedDrill = (
		options: Options,
		flatAlgs: (Algorithm & { fullMoves: string })[],
		limit: number = 10
	) => {
		const nextLetterPairs = flatAlgs
			.filter((a) => a.drill_time_ms > options.drillTarget * 1000)
			.sort((a, b) => {
				return b.drill_time_ms - a.drill_time_ms;
			})
			.slice(0, Math.ceil(limit / 2))
			.map((a) => a.speffz_pair);

		const oldAlgs = flatAlgs.sort((a, b) => {
			return a.last_drill_at.valueOf() - b.last_drill_at.valueOf();
		});

		for (let i = 0; i < oldAlgs.length; i++) {
			if (nextLetterPairs.length >= limit) {
				break;
			}

			const thisSpeffzPair = oldAlgs[i].speffz_pair;

			if (nextLetterPairs.includes(thisSpeffzPair)) {
				continue;
			}

			nextLetterPairs.push(thisSpeffzPair);
		}

		return nextLetterPairs;
	};

	const getDrillUrl = (buf: string, next: string[], prev: string[]) => {
		const searchParams = new SvelteURLSearchParams({ buf, n: next.join(" "), p: prev.join(" ") });

		return `/drill?${searchParams.toString()}`;
	};

	const getFullMoves = (
		options: Options,
		flatAlgs: (Algorithm & { fullMoves: string })[],
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

		if (drillTimeMs > 10 * MINUTE_MS) {
			alert("Took more than 10 minutes");
			drillState = "stand-by";
			goto("/drill");

			return;
		}

		let newDrillTimeMs = drillTimeMs;
		if (alg.drill_time_ms < 10 * MINUTE_MS) {
			newDrillTimeMs = Math.round(
				drillTimeMs * NEW_TIME_WEIGHT + alg.drill_time_ms * (1 - NEW_TIME_WEIGHT)
			);
		}

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
			drillState = "done";
			return;
		}

		drillState = "review-countdown";
		setTimeout(() => {
			drillState = "go";
			drillStartMs = Date.now();

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
						`width:${["countdown", "review-countdown", "go"].includes(drillState) ? "0" : "100%"}`,
						`transition-duration:${["countdown", "review-countdown", "go"].includes(drillState) ? "1s" : "0"}`,
					].join(";")};`}
				></div>
			</div>
			<div>Buffer: {buf}</div>
			{#if drillState === "stand-by" || drillState === "countdown"}
				<button
					class="self-stretch"
					type="button"
					onclick={() => {
						drillState = "countdown";
						setTimeout(() => {
							drillState = "go";
							drillStartMs = Date.now();
						}, 1000);
					}}
				>
					{#if drillState === "countdown"}
						Get Ready
					{:else}
						Start
					{/if}
				</button>
			{:else if drillState === "go"}
				<div class="relative self-stretch">
					<button
						class="absolute top-0 left-0 right-0 mx-auto bg-white z-10"
						type="button"
						style="width:90vw;height:70vh;"
						onclick={() => {
							drillState = "review";
							drillTimeMs = Date.now() - drillStartMs;
						}}
					>
						<div class="uppercase text-2xl">
							{next[0]}
						</div>
						<div>Done</div>
					</button>
				</div>
			{:else if drillState === "review" || drillState === "review-countdown"}
				{#if drillState === "review"}
					{@const alg = flatAlgorithms.find((a) => a.speffz_pair === next[0])}
					<div>
						<span class="uppercase">{next[0]}</span> took: {msToMinAndSec(drillTimeMs, true)}
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

								drillState = "review-countdown";
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
			<div class={`${drillState === "review" ? "" : "opacity-0"}`}>
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
						drillState = "stand-by";
					}}>🐌</a
				>
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl(
						drillCategories[selectedDrillCategoryIndex][0].category,
						shuffleArray(getMixedDrill($optionsStore, flatAlgorithms, 10)),
						[]
					)}
					onclick={() => {
						drillState = "stand-by";
					}}>🐌 & 👴</a
				>
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl(
						drillCategories[selectedDrillCategoryIndex][0].category,
						shuffleArray(oldest.slice(0, 10).map((a) => a.speffz_pair)),
						[]
					)}
					onclick={() => {
						drillState = "stand-by";
					}}>👴</a
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
						drillState = "stand-by";
					}}
					>{drillSubcategory.title} ({msToMinAndSec(drillSubcategory.meanDrillTime, false)}, {msToMinAndSec(
						drillSubcategory.maxDrillTime,
						false
					)})
				</a>
			{/each}
		</div>
	{/if}
</div>
