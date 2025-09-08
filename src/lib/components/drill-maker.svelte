<script lang="ts">
	import { page } from "$app/state";
	import type { DrillItem } from "$lib/drill";
	import { drillSets, makeDrillSet } from "$lib/drill";

	interface Props {
		onMakeDrill?: (newDrillLetters: DrillItem[]) => Promise<void> | void;
	}

	let { onMakeDrill }: Props = $props();
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");

	let drillSetKey = $state("none");
</script>

<div class="flex flex-col gap-1">
	<label
		>Drill Set: <select class="" bind:value={drillSetKey}>
			<option value="none">Choose a set</option>
			{#each drillSets as drillSet (drillSet.key)}
				<option value={drillSet.key}>{drillSet.label}</option>
			{/each}
		</select>
	</label>
	<button
		type="button"
		onclick={async () => {
			const drillLetters = await makeDrillSet(drillSetKey, flashCardType);

			if (typeof onMakeDrill === "function") {
				onMakeDrill(drillLetters);
			}
		}}>Start Drill</button
	>
</div>
