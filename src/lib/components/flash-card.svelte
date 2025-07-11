<script lang="ts">
	import { defaultFlashCard } from "$lib/types";
	import { upperCaseFirst } from "$lib/utils";
	import { flashCardStore, flashCardStoreStatus, loadFlashCard } from "$lib/stores/flash-cards";
	import Corners from "$lib/components/corners.svelte";
	import Image from "$lib/components/image.svelte";

	interface Props {
		letterPair?: string;
	}

	let { letterPair = "" }: Props = $props();
	let flashCard = $derived($flashCardStore[letterPair] || defaultFlashCard(letterPair));
</script>

<div class="mx-auto max-w-prose">
	<h2 class="text-center uppercase">{letterPair}</h2>
	<div class="mb-1 text-center">
		<Corners {letterPair} />
	</div>
	{#if $flashCardStoreStatus.status !== "loaded"}
		<div class="text-center">{upperCaseFirst($flashCardStoreStatus.message)}</div>
	{:else}
		<div>
			<table class="flash-card-editor mx-auto border-separate border-spacing-x-0.5">
				<tbody>
					<tr>
						<td class="text-right">Memo</td>
						<td>{flashCard.memo}</td>
					</tr>
					<tr>
						<td class="text-right">Commutator </td>
						<td>{flashCard.commutator}</td>
					</tr>
					<tr>
						<td colspan="2">
							<label for={`${letterPair}-image`} class="mx-auto mt-0.5 block">
								<Image
									imageUri={flashCard.image}
									alt={`${letterPair.toUpperCase()} visualisation`}
								/>
							</label>
						</td>
					</tr>
					<tr>
						<td class="text-right">Tags</td>
						<td>{flashCard.tags}</td>
					</tr>
				</tbody>
			</table>
			<div class="mt-1 flex w-full flex-row justify-between gap-8">
				<a
					class="cannot-hover:py-2 block flex-grow rounded border border-gray-600 px-2 py-0 text-center dark:border-gray-300"
					href="/flash-cards">Back</a
				>
				<a
					class="cannot-hover:py-2 block flex-grow rounded border border-gray-600 px-2 py-0 text-center dark:border-gray-300"
					href={`/flash-cards/edit?lp=${letterPair}`}>Edit</a
				>
			</div>
		</div>
	{/if}
</div>

<style>
	table.flash-card-editor td {
		vertical-align: top;
	}
</style>
