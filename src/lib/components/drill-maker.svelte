<script lang="ts">
	import { page } from "$app/state";
	import { flashCardStore } from "$lib/stores/flash-cards";
	import type { DrillItem } from "$lib/drill";
	import { makeDrill, getDrillSets } from "$lib/drill";
	import { capFirst } from "$lib/utils";

	interface Props {
		onMakeDrill?: (newDrillLetters: DrillItem[]) => Promise<void> | void;
	}

	let { onMakeDrill }: Props = $props();
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");
	let drillSets = $derived(getDrillSets(flashCardType, $flashCardStore));

	let drillSetKey = $state("none");
	let drillSet = $state<(typeof drillSets)[0] | null>(null);
	let drillFilter = $state("");
	let drillSize = $state(0);
</script>

<div class="flex flex-col gap-1">
	<div class="flex flex-col gap-y-1 lg:flex-row lg:gap-2">
		<label class="hidden lg:block" for="drillSetSelect">Drill Set:</label>
		<select
			id="drillSetSelect"
			class="block px-1 py-1 lg:py-0"
			onchange={(event) => {
				drillSetKey = event.currentTarget.value;
				drillSet = drillSets.find((ds) => ds.key === drillSetKey) || null;
				if (drillSet) {
					drillFilter = drillSet.filters[0];
					drillSize = drillSet.defaultSize;
				}
			}}
			value={drillSetKey}
		>
			<option value="none">Choose a set</option>
			{#each drillSets as drillSetItem (drillSetItem.key)}
				<option value={drillSetItem.key}>{drillSetItem.label}</option>
			{/each}
		</select>
		{#if drillSet && drillSet.filters.length > 1}
			<select class="block px-1 py-1 capitalize lg:py-0" bind:value={drillFilter}>
				{#each drillSet.filters as drillFilterItem (drillFilterItem)}
					<option value={drillFilterItem}>{capFirst(drillFilterItem)}</option>
				{/each}
			</select>
		{/if}
		{#if drillSet && drillSet.defaultSize > 0}
			<div class="flex flex-row gap-1">
				<button
					type="button"
					class="px-4 lg:hidden"
					onclick={() => {
						drillSize = drillSize - 1;
					}}>-1</button
				>
				<input
					class="block w-16 shrink grow basis-1 text-right"
					type="number"
					bind:value={drillSize}
				/>
				<button
					type="button"
					class="px-4 lg:hidden"
					onclick={() => {
						drillSize = drillSize + 1;
					}}>+1</button
				>
			</div>
		{/if}
	</div>
	<button
		class="py-2 text-xl leading-none"
		type="button"
		onclick={async () => {
			const drillLetters = await makeDrill(drillSetKey, flashCardType, drillFilter, drillSize);
			drillSetKey = "none";
			drillSet = null;
			drillFilter = "";
			drillSize = 0;

			if (typeof onMakeDrill === "function") {
				onMakeDrill(drillLetters);
			}
		}}>Start Drill</button
	>
</div>
