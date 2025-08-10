<script lang="ts">
	import { commutatorDetails } from "$lib/utils";
	let singleCommutator = $state("");
	let parsedCommutator = $derived(commutatorDetails(singleCommutator));
</script>

<div>
	<table class="border-separate border-spacing-x-2">
		<tbody>
			<tr>
				<td>
					<label for="raw-single-commutator-input">Commutator</label>
				</td>
				<td>
					<input id="raw-single-commutator-input" type="text" bind:value={singleCommutator} />
				</td>
			</tr>
			<tr>
				<td> Expanded Commutator </td>
				<td>
					{singleCommutator}
				</td>
			</tr>
			<tr>
				<td> Commutator Stats </td>
				<td>
					<pre>{JSON.stringify(parsedCommutator, null, "  ")}</pre>
				</td>
			</tr>
		</tbody>
	</table>
</div>
