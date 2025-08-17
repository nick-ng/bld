<script lang="ts">
	import { optionsStore } from "$lib/stores/options";

	let flashCardType = $state($optionsStore.defaultFlashCardType);
</script>

<div class="mx-auto max-w-prose">
	<table class="options-table">
		<tbody>
			<tr>
				<td colspan={2} class="text-center"> Quiz </td>
			</tr>
			<tr>
				<td>
					<label for="optionsMinReviewStandBy"> Minimum Quiz Length </label>
				</td>
				<td class="text-right">
					<input
						class="w-min text-right"
						id="optionsMinReviewStandBy"
						type="number"
						bind:value={$optionsStore.leitnerMinReviewStandBy}
					/>
				</td>
			</tr>
			<tr>
				<td colspan={2}>
					<select class="w-full" bind:value={flashCardType}>
						{#each Object.keys($optionsStore.flashCardTypes) as flashCardKey (flashCardKey)}
							{@const flashCardDetails = $optionsStore.flashCardTypes[flashCardKey]}
							<option value={flashCardKey}>{flashCardDetails.name} </option>
						{/each}
					</select>
				</td>
			</tr>
			<tr>
				<td colspan={2}>
					<pre class="overflow-x-hidden">{JSON.stringify(
							$optionsStore.flashCardTypes[flashCardType],
							null,
							2
						)}</pre>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.options-table td {
		border: 1px solid grey;
		line-height: 1;
		padding: 4px;
	}
</style>
