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
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.leitnerMinReviewStandBy =
								($optionsStore.leitnerMinReviewStandBy || 0) - 1;
						}}>-</button
					>
					<input
						class="w-16 text-right"
						id="optionsMinReviewStandBy"
						type="number"
						bind:value={$optionsStore.leitnerMinReviewStandBy}
					/>
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.leitnerMinReviewStandBy =
								($optionsStore.leitnerMinReviewStandBy || 0) + 1;
						}}>+</button
					>
				</td>
			</tr>
			<tr>
				<td>
					<label for="optionsBonusStandby">Bonus Stand By</label>
				</td>
				<td class="text-right">
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.leitnerBonusStandby = ($optionsStore.leitnerBonusStandby || 0) - 1;
						}}>-</button
					>
					<input
						class="inline-block w-16 text-right"
						id="optionsBonusStandby"
						type="number"
						bind:value={$optionsStore.leitnerBonusStandby}
					/>
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.leitnerBonusStandby = ($optionsStore.leitnerBonusStandby || 0) + 1;
						}}>+</button
					>
				</td>
			</tr>
			<tr>
				<td>
					<label for="optionsBonusRetired">Bonus Retired</label>
				</td>
				<td class="text-right">
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.leitnerBonusRetired = ($optionsStore.leitnerBonusRetired || 0) - 1;
						}}>-</button
					>
					<input
						class="inline-block w-16 text-right"
						id="optionsBonusRetired"
						type="number"
						bind:value={$optionsStore.leitnerBonusRetired}
					/>
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.leitnerBonusRetired = ($optionsStore.leitnerBonusRetired || 0) + 1;
						}}>+</button
					>
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
			{#if $optionsStore.flashCardTypes[flashCardType]}
				<tr>
					<td>
						<label for="optionsLeitnerQuizSession">Leitner Quiz Session</label>
					</td>
					<td class="text-right">
						<button
							type="button"
							class="inline-block py-1"
							onclick={() => {
								$optionsStore.flashCardTypes[flashCardType].leitnerSession =
									($optionsStore.flashCardTypes[flashCardType].leitnerSession || 0) - 1;
							}}>-</button
						>
						<input
							class="inline-block w-16 text-right"
							id="optionsLeitnerQuizSession"
							type="number"
							bind:value={$optionsStore.flashCardTypes[flashCardType].leitnerSession}
						/>
						<button
							type="button"
							class="inline-block py-1"
							onclick={() => {
								$optionsStore.flashCardTypes[flashCardType].leitnerSession =
									($optionsStore.flashCardTypes[flashCardType].leitnerSession || 0) + 1;
							}}>+</button
						>
					</td>
				</tr>
			{/if}
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
