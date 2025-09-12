<script lang="ts">
	import { page } from "$app/state";
	import type { DrillItem } from "$lib/drill";
	import { drillSets, makeDrillSet } from "$lib/drill";
	import { capFirst } from "$lib/utils";

	interface Props {
		onMakeDrill?: (newDrillLetters: DrillItem[]) => Promise<void> | void;
	}

	let { onMakeDrill }: Props = $props();
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");

	let drillSetKey = $state("none");
	let drillSet = $state<(typeof drillSets)[0]>();
	let drillFilter = $state("");
	let drillSize = $state(0);
</script>

<div class="hidden flex-col gap-1 lg:flex">
	<div class="flex flex-row gap-2">
		<label class="block" for="drillSetSelect">Drill Set:</label>
		<select
			id="drillSetSelect"
			class="block"
			onchange={(event) => {
				drillSetKey = event.currentTarget.value;
				drillSet = drillSets.find((ds) => ds.key === drillSetKey);
				if (drillSet) {
					drillFilter = drillSet.filters[0];
					drillSize = drillSet.defaultSize;
				}
			}}
		>
			<option value="none">Choose a set</option>
			{#each drillSets as drillSetItem (drillSetItem.key)}
				<option value={drillSetItem.key}>{drillSetItem.label}</option>
			{/each}
		</select>
		{#if drillSet && drillSet.filters.length > 1}
			<select class="block capitalize" bind:value={drillFilter}>
				{#each drillSet.filters as drillFilterItem (drillFilterItem)}
					<option value={drillFilterItem}>{capFirst(drillFilterItem)}</option>
				{/each}
			</select>
		{/if}
		{#if drillSet && drillSet.defaultSize > 0}
			<input class="block shrink basis-2 text-right" type="number" bind:value={drillSize} />
		{/if}
	</div>
	<button
		class="py-2 text-xl leading-none"
		type="button"
		onclick={async () => {
			const drillLetters = await makeDrillSet(drillSetKey, flashCardType, drillFilter, drillSize);

			if (typeof onMakeDrill === "function") {
				onMakeDrill(drillLetters);
			}
		}}>Start Drill</button
	>
</div>
