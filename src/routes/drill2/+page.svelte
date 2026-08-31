<script lang="ts">
	import type { Algorithm } from "$lib/types";

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
	import {
		MINUTE_MS,
		HOUR_MS,
		getDrillUrl,
		getFullMoves,
		getNextTimeDrillCases,
		getFirstTimeDrillCaseUrl,
		getTimeDrillStatus,
	} from "./drill";

	// @todo(nick-ng): show stats after drill
	// @todo(nick-ng): remove the old /drill and change this to /drill

	const NEW_TIME_WEIGHT = 0.6;

	// "stand-by", "go", "review", "done"
	let drillState = $state("stand-by");
	let drillStartMs = $state(0);
	let drillTimeMs = $state(0);
	let drillResult = $state("blank"); // "blank", "correct", "wrong"
	let fromSolved = $state(false);

	/**
	 * search params:
	 * buf: selected buffer
	 * n: next letter pairs, space separated
	 * p: previous letter pairs, space separated
	 * c: correct letter pairs, space separated
	 * w: wrong letter pairs, space separated
	 * e: end time in seconds
	 */
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
	let correctCases = $derived(
		page.url.searchParams
			.get("c")
			?.split(" ")
			.filter((a) => a) || []
	);
	let wrongCases = $derived(
		page.url.searchParams
			.get("w")
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
					const noTimesCount = drillTimes.filter((a) => a > 10 * MINUTE_MS).length;
					const withTimesCount = algorithms.length - noTimesCount;

					return {
						...quizKit,
						algorithms,
						maxDrillTime,
						maxDrillTimestamps,
						meanDrillTime,
						noTimesCount,
						withTimesCount,
					};
				})
				.filter((a) => a.algorithms.length > 0)
				.sort((a, b) => {
					if (a.withTimesCount !== b.withTimesCount) {
						return b.withTimesCount - a.withTimesCount;
					}

					const aEffectiveMaxDrillTime = Math.max(a.maxDrillTime, $optionsStore.drillTarget);
					const bEffectiveMaxDrillTime = Math.max(b.maxDrillTime, $optionsStore.drillTarget);

					if (aEffectiveMaxDrillTime !== bEffectiveMaxDrillTime) {
						return bEffectiveMaxDrillTime - aEffectiveMaxDrillTime;
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

	const advanceDrill = (correct: boolean, solvedCube: boolean, keepGoing: boolean) => {
		const [curr, ...rest] = next;
		const alg = flatAlgorithms.find((a) => a.speffz_pair === curr);
		if (!alg || !buf) {
			return;
		}

		if (drillTimeMs > 10 * MINUTE_MS) {
			alert("Took more than 10 minutes");
			drillState = "stand-by";
			goto("/drill2");

			return;
		}

		let newDrillTimeMs = drillTimeMs;
		if (!correct) {
			// start from the worse of the new and old drill time
			const baseWrongDrillTimeMs = Math.max(alg.drill_time_ms, drillTimeMs);
			// apply penalty for getting the quiz wrong
			newDrillTimeMs = Math.min(
				Math.round(baseWrongDrillTimeMs * 1.1),
				baseWrongDrillTimeMs + 2000,
				HOUR_MS
			);
		} else if (alg.drill_time_ms < 10 * MINUTE_MS) {
			// lower of average drill time, and double the drill time just set
			newDrillTimeMs = Math.min(
				Math.round(drillTimeMs * NEW_TIME_WEIGHT + alg.drill_time_ms * (1 - NEW_TIME_WEIGHT)),
				drillStartMs * 2
			);
		}

		if (solvedCube) {
			prev = [];
		} else {
			prev = [...prev, curr];
		}
		const timeDrillStatus = getTimeDrillStatus(page.url.searchParams.get("e"));
		if (timeDrillStatus === "fixed") {
			next = rest;
		} else if (timeDrillStatus === "over") {
			next = [];
		} else {
			const nextCase = getNextTimeDrillCases(flatAlgorithms, [
				...correctCases,
				...wrongCases,
				curr,
			]);
			if (typeof nextCase !== "string") {
				next = [];
			} else {
				next = [nextCase];
			}
		}

		const searchParams = new SvelteURLSearchParams(location.search);
		searchParams.set("n", next.join(" "));
		searchParams.set("p", prev.join(" "));

		if (correct) {
			// @todo(nick-ng): also update the super memo parameters? if incorrect, also update?
			saveAlgorithm({
				speffz_pair: curr.toLocaleLowerCase(),
				buffer: buf,
				last_drill_at: new Date(),
				drill_time_ms: newDrillTimeMs,
			});
			searchParams.set("c", [...correctCases, curr].join(" "));
			searchParams.set("w", wrongCases.join(" "));
		} else {
			searchParams.set("c", correctCases.join(" "));
			searchParams.set("w", [...wrongCases, curr].join(" "));

			// nothing to update if previous time is the same as new time
			if (newDrillTimeMs !== alg.drill_time_ms) {
				// don't update last_drill_at if you get it wrong
				saveAlgorithm({
					speffz_pair: curr.toLocaleLowerCase(),
					buffer: buf,
					drill_time_ms: newDrillTimeMs,
				});
			}
		}

		if (
			!keepGoing ||
			(rest.length === 0 && timeDrillStatus === "fixed") ||
			timeDrillStatus === "over"
		) {
			drillState = "done";
			drillResult = "blank";
			fromSolved = false;
			next = [];
			searchParams.set("n", "");

			goto(`/drill2?${searchParams.toString()}`);
			return;
		}

		drillState = "review-countdown";
		drillResult = "blank";
		fromSolved = false;
		setTimeout(() => {
			drillState = "go";
			drillStartMs = Date.now();

			goto(`/drill2?${searchParams.toString()}`);
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
			<div class="text-2xl">Buffer: {buf}</div>
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
						<div class="uppercase text-4xl">
							{next[0]}
						</div>
						<div>Done</div>
					</button>
				</div>
			{:else if drillState === "review" || drillState === "review-countdown"}
				{#if drillState === "review"}
					{@const alg = flatAlgorithms.find((a) => a.speffz_pair === next[0])}
					{@const timeDrillStatus = getTimeDrillStatus(page.url.searchParams.get("e"))}
					<div class="text-lg">
						<span class="uppercase">{next[0]}</span> took: {msToMinAndSec(drillTimeMs, true)}
					</div>
					{#if alg}
						<div class="text-lg">
							{parseCommutator(alg.moves).normalisedCommutator}
						</div>
					{/if}
					<div>
						{#if next.length > 1}
							{next.length - 1} left
						{:else if timeDrillStatus === "fixed"}
							Done!
						{/if}
					</div>
					<div class="grid grid-cols-2 gap-1 self-stretch">
						{#if next.length > 1 || timeDrillStatus === "in progress"}
							<button
								class={fromSolved ? "bg-blue-300" : ""}
								type="button"
								onclick={() => {
									fromSolved = true;
								}}
							>
								From Solved
							</button>
							<button
								class={!fromSolved ? "bg-blue-300" : ""}
								type="button"
								onclick={() => {
									fromSolved = false;
								}}
							>
								As Is
							</button>
						{/if}
						<button
							class={drillResult === "wrong" ? "bg-red-300" : ""}
							type="button"
							onclick={() => {
								drillResult = "wrong";
							}}
						>
							Wrong
						</button>
						<button
							class={drillResult === "correct" ? "bg-green-300" : ""}
							type="button"
							onclick={() => {
								drillResult = "correct";
							}}
						>
							Correct
						</button>
						<button
							type="button"
							onclick={() => {
								if (
									(drillResult !== "wrong" && drillResult !== "correct") ||
									(fromSolved && !confirm("Solve the cube"))
								) {
									return;
								}

								drillState = "review-countdown";
								// save quiz result here
								advanceDrill(drillResult === "correct", fromSolved, false);
							}}
						>
							Done
						</button>
						<button
							type="button"
							onclick={() => {
								if (
									(drillResult !== "wrong" && drillResult !== "correct") ||
									(fromSolved && !confirm("Solve the cube"))
								) {
									return;
								}

								drillState = "review-countdown";
								// save quiz result here
								advanceDrill(drillResult === "correct", fromSolved, true);
							}}
						>
							Next
						</button>
					</div>
				{:else}
					Get ready
				{/if}
			{:else}
				<div>How did you get here? Back to <a href="/drill2">Drill</a></div>
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
	{:else if correctCases.length + wrongCases.length > 0}
		<div class="flex flex-col items-center gap-1">
			<h4>Results</h4>
			<div>{correctCases.length}/{correctCases.length + wrongCases.length} cases correct</div>
			<div>Back to <a href="/drill2">Drill</a></div>
		</div>
	{:else}
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
					href={getFirstTimeDrillCaseUrl(
						drillCategories[selectedDrillCategoryIndex][0].category,
						flatAlgorithms,
						5 * MINUTE_MS
					)}
					onclick={() => {
						drillState = "stand-by";
						drillResult = "blank";
						fromSolved = false;
					}}>5 Minutes</a
				>
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getFirstTimeDrillCaseUrl(
						drillCategories[selectedDrillCategoryIndex][0].category,
						flatAlgorithms,
						10 * MINUTE_MS
					)}
					onclick={() => {
						drillState = "stand-by";
						drillResult = "blank";
						fromSolved = false;
					}}>10 Minutes</a
				>
			</div>
			{#each drillCategories[selectedDrillCategoryIndex] as drillSubcategory (`${drillSubcategory.category}-${drillSubcategory.subcategory || "all"}`)}
				<a
					class="like-button block grow py-2 text-center text-xl leading-none"
					href={getDrillUrl({
						buf: drillSubcategory.category,
						next: shuffleArray(drillSubcategory.algorithms.map((a) => a.speffz_pair)),
						prev: [],
					})}
					onclick={() => {
						drillState = "stand-by";
						drillResult = "blank";
						fromSolved = false;
					}}
					>{drillSubcategory.title}
					{#if drillSubcategory.maxDrillTime < 10 * MINUTE_MS}({msToMinAndSec(
							drillSubcategory.meanDrillTime,
							false
						)}, {msToMinAndSec(
							drillSubcategory.maxDrillTime,
							false
						)}){:else}({drillSubcategory.algorithms.filter((a) => a.drill_time_ms < 10 * MINUTE_MS)
							.length}/{drillSubcategory.algorithms.length}){/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
