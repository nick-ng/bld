<script lang="ts">
	import { onMount } from "svelte";
	import { goto, replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import { letterPairStore } from "$lib/stores/letter-pairs";
	import { optionsStore } from "$lib/stores/options";
	import { isSpeffzPairValid, getTrueKeys } from "$lib/utils";
	import { getDefaultMnemonic } from "$lib/types";
	import LetterPairChooser from "$lib/components/letter-pair-chooser.svelte";
	import LetterPair from "$lib/components/letter-pair.svelte";

	const allSpeffzPairs = (() => {
		const tempLetterPairs: string[] = [];
		for (let letter0 = 0; letter0 < 24; letter0++) {
			for (let letter1 = 0; letter1 < 24; letter1++) {
				const letterPair = `${String.fromCharCode(97 + letter0)}${String.fromCharCode(97 + letter1)}`;
				tempLetterPairs.push(letterPair);
			}
		}

		return tempLetterPairs;
	})();

	let speffzPairFilter = $derived(page.url.searchParams.get("f") || "");
	let filterInputElement = $derived<HTMLInputElement | null>(null);
	let processedSpeffzPairFilter = $derived.by(() => {
		const lowerCaseFilter = speffzPairFilter
			.toLowerCase()
			.replaceAll(/[^a-z ]/g, " ")
			.replaceAll(/[yz]/g, "x");

		if (lowerCaseFilter.length === 2) {
			if (lowerCaseFilter[0] === lowerCaseFilter[1]) {
				return [lowerCaseFilter];
			}
			return [lowerCaseFilter, `${lowerCaseFilter[1]}${lowerCaseFilter[0]}`];
		}

		if (lowerCaseFilter.includes(" ")) {
			const tempFilter = lowerCaseFilter.split(" ").filter((a) => a);
			const outputFilter = [];
			for (let i = 0; i < tempFilter.length; i++) {
				switch (tempFilter[i].length) {
					case 1: {
						outputFilter.push(`${tempFilter[i]}${tempFilter[i]}`);
						break;
					}
					case 2: {
						outputFilter.push(tempFilter[i]);
						break;
					}
					default: {
						outputFilter.push(...tempFilter[i].split(""));
					}
				}
			}

			return outputFilter;
		}

		return lowerCaseFilter.split("");
	});
	let filteredSpeffzPairs = $derived(
		speffzPairFilter && processedSpeffzPairFilter.every((sp) => sp.length === 2)
			? processedSpeffzPairFilter.filter((sp) => {
					return isSpeffzPairValid(sp, getTrueKeys($optionsStore.visibleBuffers));
				})
			: allSpeffzPairs.filter((sp) => {
					if (processedSpeffzPairFilter.length < 1) {
						return true;
					}

					if (processedSpeffzPairFilter.length === 1 && processedSpeffzPairFilter[0] !== sp[0]) {
						return false;
					}

					if (!sp.includes(processedSpeffzPairFilter[0])) {
						return false;
					}

					if (processedSpeffzPairFilter.length > 1 && !processedSpeffzPairFilter.includes(sp[1])) {
						return false;
					}

					return isSpeffzPairValid(sp, getTrueKeys($optionsStore.visibleBuffers));
				})
	);

	onMount(() => {
		const focusFilterInput = (event: KeyboardEvent) => {
			if (event.key !== ":") {
				return;
			}

			filterInputElement?.focus();
			filterInputElement?.select();
		};

		document.addEventListener("keypress", focusFilterInput);

		return () => {
			document.removeEventListener("keypress", focusFilterInput);
		};
	});
</script>

<div class="m-auto lg:w-min">
	<div class="mb-1 flex flex-row items-center gap-2">
		<div class="flex min-w-1/2 flex-row">
			<input
				class="shrink grow"
				type="text"
				autocomplete="off"
				bind:this={filterInputElement}
				bind:value={
					() => speffzPairFilter,
					(newSpeffzPairFilter) => {
						speffzPairFilter = newSpeffzPairFilter
							.replaceAll(/,/g, " ")
							.replaceAll(/[^a-z ()]/gi, "")
							.replaceAll(/ +/g, " ")
							.toUpperCase();
						page.url.searchParams.set("f", speffzPairFilter);
						replaceState(`/?${page.url.searchParams.toString()}`, page.state);
					}
				}
				placeholder="Filter"
			/><button
				class="inline-block"
				type="button"
				onclick={() => {
					page.url.searchParams.delete("f");
					goto(`/?${page.url.searchParams.toString()}`);
				}}>Clear</button
			>
		</div>
		<details class="relative">
			<summary>Buffers</summary>
			<div class="absolute top-full left-0 z-1 border border-gray-600 bg-white p-1">
				{#each getTrueKeys($optionsStore.chosenBuffers) as pos (pos)}
					<label class="block"
						><input
							type="checkbox"
							checked={$optionsStore.visibleBuffers[pos]}
							onchange={(e) => {
								$optionsStore.visibleBuffers[pos] = e.currentTarget.checked;
							}}
						/>
						{pos}</label
					>
				{/each}
			</div>
		</details>
		<div class="grow-1"></div>
	</div>
	{#if filteredSpeffzPairs.length === 0}
		<div class="w-prose max-w-full">
			No flash cards match the filter "{speffzPairFilter}"
		</div>
	{:else if filteredSpeffzPairs.length <= 25}
		<div class="flashCards lg:min-w-120">
			{#each filteredSpeffzPairs as speffzPair, i (`${speffzPair}-${i}`)}
				{@const letterPair = $letterPairStore[speffzPair] || {
					...getDefaultMnemonic(speffzPair),
					algorithms: {},
				}}
				<div
					class="flex w-68 flex-col justify-between rounded border border-gray-300 dark:border-gray-500"
				>
					<LetterPair {letterPair} selectedBuffers={getTrueKeys($optionsStore.visibleBuffers)} />
					<a
						class="block self-stretch border-t border-gray-300 text-center dark:border-gray-500"
						href={`/letter-pair/edit?lp=${speffzPair}`}>Edit</a
					>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class={["letterPairGrid", !speffzPairFilter && "letterPairGridColumns"]
				.filter((a) => a)
				.join(" ")}
		>
			{#each filteredSpeffzPairs as speffzPair, i (`${speffzPair}-${i}`)}
				{@const letterPair = $letterPairStore[speffzPair] || {
					...getDefaultMnemonic(speffzPair),
					algorithms: {},
				}}
				<LetterPairChooser
					{letterPair}
					selectedBuffers={getTrueKeys($optionsStore.visibleBuffers)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.flashCards {
		width: max-content;
		max-width: 90vw;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
	}

	.letterPairGrid {
		display: grid;
		justify-content: center;
		grid-template-columns: repeat(auto-fill, 42px);
	}

	@media (min-width: 1024px) {
		.letterPairGrid {
			grid-template-columns: repeat(24, 42px);
			grid-template-rows: repeat(24, 1fr);
		}

		.letterPairGridColumns {
			grid-auto-flow: column dense;
		}
	}
</style>
