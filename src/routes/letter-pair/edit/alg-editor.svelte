<script lang="ts">
	import { getBlddbUrl } from "$lib/utils";

	interface Props {
		speffzPair: string;
		buffer: string;
		moves: string;
		movesChanged: (newMoves: string) => void | Promise<void>;
	}

	let { speffzPair, buffer, moves, movesChanged }: Props = $props();

	let blddbUrl = $derived(getBlddbUrl(speffzPair, buffer));
</script>

{#if blddbUrl}
	<tr>
		<td class="text-right">
			<a href={blddbUrl} target="pux_bld_blddb_comm">
				{buffer}
			</a>
		</td>
		<td>
			<input
				class="w-full px-0.5"
				type="text"
				autocomplete="off"
				name={`${buffer}-moves`}
				value={moves}
				oninput={(event) => {
					// @todo(nick-ng): use 2 argument bind:value style?
					movesChanged(event.currentTarget.value);
				}}
			/>
		</td>
	</tr>
{/if}
