<script lang="ts">
	interface Props {
		rank: string;
		suit: string;
		unopacity?: number;
	}

	const { rank, suit, unopacity = 0 }: Props = $props();
	const suitProperties = $derived.by(() => {
		switch (suit) {
			case "c": {
				return { symbol: "♣️", red: false };
			}
			case "d": {
				return { symbol: "♦️", red: true };
			}
			case "h": {
				return { symbol: "♥️", red: true };
			}
			case "s": {
				return { symbol: "♠️", red: false };
			}
			case "r": {
				return { symbol: "🔴", red: true };
			}
			case "b": {
				return { symbol: "⚫", red: false };
			}
			default: {
				return { symbol: "", red: false };
			}
		}
	});
</script>

<div
	class="cannot-hover:w-[calc(100vw-6px)] cannot-hover:h-[140vw] rounded-xl border border-black bg-white p-4"
	style={`opacity: ${100 - unopacity}%`}
>
	{rank}
	{suitProperties.symbol}
</div>
