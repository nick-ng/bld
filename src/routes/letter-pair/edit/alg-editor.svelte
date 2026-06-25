<script lang="ts">
	import { getBlddbUrl } from "$lib/utils";

	interface Props {
		speffzPair: string;
		buffer: string;
		moves: string;
		movesChanged: (newMoves: string) => void | Promise<void>;
		zeroSM: () => void | Promise<void>;
		nextSM: () => void | Promise<void>;
	}

	let { speffzPair, buffer, moves, movesChanged, zeroSM, nextSM }: Props = $props();

	let blddbUrl = $derived(getBlddbUrl(speffzPair, buffer));
</script>

{#if blddbUrl}
	<tr>
		<td class="text-right">
			<a href={blddbUrl} target="pux_bld_blddb_comm">
				{buffer}
			</a>
		</td>
		<td class="flex flex-row gap-1">
			<input
				class="grow px-0.5"
				type="text"
				autocomplete="off"
				name={`${buffer}-moves`}
				value={moves}
				oninput={(event) => {
					// @todo(nick-ng): use 2 argument bind:value style?
					movesChanged(event.currentTarget.value);
				}}
			/>
			<button
				class="grow-0 hidden lg:block"
				type="button"
				onclick={() => {
					zeroSM();
				}}>0</button
			>
			<button
				class="grow-0 hidden lg:block"
				type="button"
				onclick={() => {
					nextSM();
				}}>1</button
			>
		</td>
	</tr>
{/if}
