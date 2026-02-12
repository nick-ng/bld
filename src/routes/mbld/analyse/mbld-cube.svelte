<script lang="ts">
	import type { MbldCube } from "$lib/types";

	import { secondsToHhmmss } from "$lib/utils";
	import Hhmmss from "$lib/components/hhmmss.svelte";

	interface Props {
		index: number;
		cube: MbldCube;
		onSeekRequest: (sec: number) => Promise<void> | void;
		onSave: (newCube: MbldCube) => Promise<void> | void;
	}

	let { index, cube, onSeekRequest, onSave }: Props = $props();
	let pendingChanges: Partial<MbldCube> = $state({});
	let tempScramble = $derived(pendingChanges.scramble ?? cube.scramble);
	let scrambleLink = $derived(
		tempScramble && `https://alpha.twizzle.net/edit/?setup-alg=${encodeURIComponent(tempScramble)}`
	);

	const handleSave = () => {
		onSave({
			...cube,
			...pendingChanges,
		});

		pendingChanges = {};
	};

	// @todo(nick-ng): auto-complete scrambles
</script>

<tr class="bg-slate-200">
	<td colspan="2">Cube {index + 1}</td>
</tr>
<tr>
	<td>Pack</td>
	<td>
		<input
			class="w-full px-0.5"
			type="text"
			value={pendingChanges.pack ?? cube.pack}
			onchange={(event) => {
				pendingChanges.pack = event.currentTarget.value;
			}}
			onblur={handleSave}
		/>
	</td>
</tr>
<tr>
	<td>Exec Start</td>
	<td>
		<Hhmmss
			classes="px-0.5 w-16 text-right"
			value={pendingChanges.exec_start_s ?? cube.exec_start_s}
			onChange={(newSeconds) => {
				pendingChanges.exec_start_s = newSeconds;
			}}
			afterBlur={handleSave}
		/>
		<button
			class="inline"
			onclick={() => {
				onSeekRequest(cube.exec_start_s);
			}}>{secondsToHhmmss(cube.exec_start_s)}</button
		>
	</td>
</tr>
<tr class="group">
	<td>
		{#if tempScramble}
			<a target="pux-mbld-scramble" href={scrambleLink}>Scramble</a>
		{:else}
			Scramble
		{/if}
	</td>
	<td class="relative">
		<input
			class="w-full px-0.5"
			type="text"
			value={pendingChanges.scramble ?? cube.scramble}
			onchange={(event) => {
				pendingChanges.scramble = event.currentTarget.value;
			}}
			onblur={handleSave}
		/>
		<div class="top-0 left-0 hidden group-hover:visible">{cube.scramble}</div>
	</td>
</tr>
<tr>
	<td><label class="block" for={`dnf-cube-${index}`}>DNF</label></td>
	<td>
		<label class="block" for={`dnf-cube-${index}`}>
			<input
				id={`dnf-cube-${index}`}
				type="checkbox"
				checked={cube.is_dnf}
				onchange={() => {
					pendingChanges.is_dnf = !cube.is_dnf;
					handleSave();
				}}
			/>
		</label>
	</td>
</tr>
{#if cube.is_dnf}
	<tr>
		<td>Reason</td>
		<td>
			<textarea
				class="w-full resize-y px-0.5"
				value={pendingChanges.dnf_reason ?? cube.dnf_reason}
				onchange={(event) => {
					pendingChanges.dnf_reason = event.currentTarget.value;
				}}
				onblur={handleSave}
			></textarea>
		</td>
	</tr>
{/if}
