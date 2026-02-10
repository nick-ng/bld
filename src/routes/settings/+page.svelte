<script lang="ts">
	import { CORNER_POSITIONS, EDGE_POSITIONS } from "$lib/constants";
	import { optionsStore } from "$lib/stores/options";
</script>

<div class="mx-auto max-w-prose">
	<table class="options-table">
		<tbody>
			<tr>
				<td colspan={2} class="text-center"> Quiz </td>
			</tr>
			<tr>
				<td>
					<label for="targetEF"> Target EF </label>
				</td>
				<td class="text-right">
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.targetEf = ($optionsStore.targetEf || 0) - 0.1;
						}}>-</button
					>
					<input
						class="w-16 text-right"
						id="targetEF"
						type="number"
						bind:value={$optionsStore.targetEf}
					/>
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.targetEf = ($optionsStore.targetEf || 0) + 0.1;
						}}>+</button
					>
				</td>
			</tr>
			<tr>
				<td>
					<label for="auto5s"> Auto Perfect (sec) </label>
				</td>
				<td class="text-right">
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.auto5s = ($optionsStore.auto5s || 0) - 1;
						}}>-</button
					>
					<input
						class="inline-block w-16 text-right"
						id="auto5s"
						type="number"
						bind:value={$optionsStore.auto5s}
					/>
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.auto5s = ($optionsStore.auto5s || 0) + 1;
						}}>+</button
					>
				</td>
			</tr>
			<tr>
				<td>
					<label for="optionsBonusRetired"> Auto Hesitate (sec) </label>
				</td>
				<td class="text-right">
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.auto4s = ($optionsStore.auto4s || 0) - 1;
						}}>-</button
					>
					<input
						class="inline-block w-16 text-right"
						id="optionsBonusRetired"
						type="number"
						bind:value={$optionsStore.auto4s}
					/>
					<button
						type="button"
						class="inline-block py-1"
						onclick={() => {
							$optionsStore.auto4s = ($optionsStore.auto4s || 0) + 1;
						}}>+</button
					>
				</td>
			</tr>
			<tr>
				<td>Chosen Buffers</td>
				<td>
					<details>
						<summary>Corners</summary>
						<div class="mt-1">
							{#each CORNER_POSITIONS as pos (pos)}
								<label class="block"
									><input
										type="checkbox"
										checked={$optionsStore.chosenBuffers[pos]}
										onchange={(e) => {
											$optionsStore.chosenBuffers[pos] = e.currentTarget.checked;
										}}
									/>
									{pos}</label
								>
							{/each}
						</div>
					</details>
					<details class="mt-1">
						<summary>Edges</summary>
						<div class="mt-1">
							{#each EDGE_POSITIONS as pos (pos)}
								<label class="block"
									><input
										type="checkbox"
										checked={$optionsStore.chosenBuffers[pos]}
										onchange={(e) => {
											$optionsStore.chosenBuffers[pos] = e.currentTarget.checked;
										}}
									/>
									{pos}</label
								>
							{/each}
						</div>
					</details>
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
