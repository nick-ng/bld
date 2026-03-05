<script lang="ts">
	import type { FiftyTwoCard } from "$lib/types";

	import { getCardProperties } from "$lib/utils";

	interface Props {
		card?: FiftyTwoCard;
		unopacity?: number;
	}

	const { card, unopacity = 0 }: Props = $props();
	const cardProperties = $derived(getCardProperties(card));
</script>

<div
	class="cannot-hover:w-[calc(100vw-6px)] cannot-hover:h-[140vw] rounded-xl border border-black bg-white p-4"
	style={`opacity: ${100 - unopacity}%;`}
>
	<div class="flex flex-row">
		<div class="text-center text-xl">
			<div style={`color: ${cardProperties.colorHex};`}>{cardProperties.displayRank}</div>
			<div>{cardProperties.symbol}</div>
		</div>
		<div class="grow"></div>
	</div>
</div>
