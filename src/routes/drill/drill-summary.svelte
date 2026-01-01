<script lang="ts">
	import type { DrillItem } from "$lib/drill";

	import { goto } from "$app/navigation";
	import { DRILL_ITEMS_STORE_KEY } from "$lib/constants";
	import { fetchFlashCards, getFlashCard, flashCardStore } from "$lib/stores/flash-cards";
	import { patchQuiz } from "$lib/quiz";
	import { parseCommutator, shuffleArray } from "$lib/utils";

	interface Props {
		drillLetters: DrillItem[];
		afterSubmit: (
			newQuizState: string,
			newDrillLetters: DrillItem[] | null
		) => void | Promise<void>;
	}

	let { drillLetters, afterSubmit }: Props = $props();

	let drillWeight = $state(0.7);
	let actualDrillWeight = $derived(Math.max(0.0001, Math.min(1, drillWeight)));

	const submitDrill = async (drillLetters: DrillItem[], repeat = false): Promise<DrillItem[]> => {
		if (drillLetters.some((dl) => dl.send)) {
			await fetchFlashCards();

			await Promise.all(
				drillLetters.map((drillLetter) => {
					if (!drillLetter.send || drillLetter.timeMs <= 0) {
						return;
					}

					const flashCard = getFlashCard(
						drillLetter.letterPair,
						drillLetter.flashCardType,
						$flashCardStore
					);

					const drillTimeMs = drillLetter.timeMs;
					const adjustedDrillTimeMs =
						Math.min(drillTimeMs, flashCard.drillTimeMs) * actualDrillWeight +
						Math.max(drillTimeMs, flashCard.drillTimeMs) * (1 - actualDrillWeight);

					const formData = new FormData();
					formData.set("type", drillLetter.flashCardType);
					formData.set("drillTimeMs", adjustedDrillTimeMs.toFixed(0));
					if (drillLetter.timeMs < 15000) {
						formData.set("commConfidence", "2");
					} else if (drillLetter.timeMs < 5000) {
						formData.set("commConfidence", "3");
					}

					return patchQuiz(drillLetter.letterPair, formData, true);
				})
			);
		}

		if (repeat) {
			const temp = drillLetters.map((drillLetter) => {
				return {
					...drillLetter,
					quizzed: false,
					send: true,
					timeMs: -1,
				};
			});

			drillLetters = shuffleArray(temp);
		} else {
			drillLetters = [];
			goto("/flash-cards/summary");
		}

		localStorage.setItem(DRILL_ITEMS_STORE_KEY, JSON.stringify(drillLetters));
		return drillLetters;
	};
</script>

<div class="border border-gray-300 p-2 text-center dark:border-gray-500">
	<div class="mb-2 flex flex-row items-stretch gap-2">
		<input class="block w-16 text-right" type="number" bind:value={drillWeight} step={0.1} />
		<button
			class="grow"
			type="button"
			onclick={async () => {
				const newDrillLetters = await submitDrill(drillLetters, true);
				afterSubmit("stand-by", newDrillLetters);
			}}>Again</button
		>
		<button
			class="grow"
			type="button"
			onclick={async () => {
				const newDrillLetters = await submitDrill(drillLetters, false);
				afterSubmit("stand-by", newDrillLetters);
			}}>{drillLetters.every((dl) => !dl.send) ? "End Quiz" : "Send"}</button
		>
	</div>
	<table class="w-full">
		<thead>
			<tr>
				<th class="border border-gray-500 px-1 text-center"
					><input
						type="checkbox"
						checked={drillLetters.every((dl) => dl.send)}
						onclick={() => {
							if (drillLetters.every((dl) => dl.send)) {
								drillLetters.forEach((dl) => {
									dl.send = false;
								});
							} else {
								drillLetters.forEach((dl) => {
									dl.send = true;
								});
							}
						}}
					/></th
				>
				<th class="border border-gray-500 px-1 text-center" colspan="3">Letter Pair</th>
			</tr>
		</thead>
		<tbody>
			{#each drillLetters as drillLetter (drillLetter.letterPair)}
				{@const flashCard = getFlashCard(
					drillLetter.letterPair,
					drillLetter.flashCardType,
					$flashCardStore
				)}
				<tr>
					<td class="border border-gray-500 px-1 text-center"
						><input type="checkbox" bind:checked={drillLetter.send} /></td
					>
					<td class="border border-gray-500 px-1 text-center"
						><span class="uppercase">{drillLetter.letterPair}</span>
						<span>{parseCommutator(flashCard.commutator).normalisedCommutator}</span></td
					>
					<td class="border border-gray-500 px-1 text-right">
						{#if drillLetter.timeMs > 0}
							{(drillLetter.timeMs / 1000).toFixed(1)}
						{:else}
							-
						{/if}
					</td>
					<td class="border border-gray-500 px-1 text-right">
						{#if drillLetter.timeMs > 0}
							{(flashCard.drillTimeMs / 1000).toFixed(0)}→{(
								Math.min(flashCard.drillTimeMs / 1000, drillLetter.timeMs / 1000) *
									actualDrillWeight +
								Math.max(flashCard.drillTimeMs / 1000, drillLetter.timeMs / 1000) *
									(1 - actualDrillWeight)
							).toFixed(0)}
						{:else}
							-
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="mt-2 flex flex-row items-stretch gap-2">
		<input class="block w-16 text-right" type="number" bind:value={drillWeight} step={0.1} />
		<button
			class="grow"
			type="button"
			onclick={async () => {
				const newDrillLetters = await submitDrill(drillLetters, true);
				afterSubmit("stand-by", newDrillLetters);
			}}>Again</button
		>
		<button
			class="grow"
			type="button"
			onclick={async () => {
				const newDrillLetters = await submitDrill(drillLetters, false);
				afterSubmit("stand-by", newDrillLetters);
			}}>{drillLetters.every((dl) => !dl.send) ? "End Quiz" : "Send"}</button
		>
	</div>
</div>
