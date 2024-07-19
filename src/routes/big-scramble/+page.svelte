<script lang="ts">
	import ClockHand from '$lib/components/clock-hand.svelte';
	import { onMount } from 'svelte';

	const scrambleToMoves = (scramble: string) => {
		return scramble
			.split(' ')
			.filter((m) => m)
			.map((move) => {
				return {
					move,
					isDouble: move.includes('2'),
					isPrime: move.includes("'"),
					side: move[0].toLowerCase()
				};
			});
	};

	const getMoveStyle = ({
		fontOutline,
		fontColor,
		size
	}: {
		fontOutline: number;
		fontColor: string;
		size: number;
	}) =>
		[
			`flex-basis: ${size * 1.7}px`,
			`font-size:${size}px`,
			`height: ${size * 1.25}px`,
			`text-shadow: -${fontOutline}px -${fontOutline}px 0 ${fontColor}, ${fontOutline}px -${fontOutline}px 0 ${fontColor}, -${fontOutline}px ${fontOutline}px 0 ${fontColor}, ${fontOutline}px ${fontOutline}px 0 ${fontColor}`
		].join(';');

	const getClockStyle = ({ size }: { size: number }) =>
		[`height: ${size * 1.5}px`, `width: ${size * 1.5}px`].join(';');

	let scramble = "D2 B' R2 U2 R2 D2 B F' D2 F' R2 L D' B R2 U' R2 F2 D2 F' L' Rw Uw";
	let scrambleMoves: { move: string; isPrime: boolean; isDouble: boolean; side: string }[] =
		scrambleToMoves(scramble);
	let size: number = 120;
	let fontOutline: number = 2;

	onMount(() => {
		const handleEvent = (event: MessageEvent) => {
			const scramble = event.data;

			if (typeof scramble !== 'string') {
				scrambleMoves = [];
				return;
			}

			scrambleMoves = scrambleToMoves(scramble);
		};

		window.addEventListener('message', handleEvent, false);

		return () => {
			window.removeEventListener('message', handleEvent);
		};
	});
</script>

<div class="big-scramble-root">
	<div class="scramble">
		{#each scrambleMoves as scrambleMove}
			{@const fontColor = scrambleMove.isDouble || scrambleMove.isPrime ? '#fff' : '#000'}
			<div
				class={[
					'move',
					scrambleMove.side,
					scrambleMove.isPrime && 'is_prime',
					scrambleMove.isDouble && 'two'
				]
					.filter((c) => c)
					.join(' ')}
				style={getMoveStyle({
					fontColor,
					fontOutline,
					size
				})}
			>
				{scrambleMove.move}
			</div>
		{/each}
	</div>
	<div class="clock">
		<div class="clock-hand" style={getClockStyle({ size })}>
			<ClockHand />
		</div>
		<div class="clock-hand" style={getClockStyle({ size })}>
			<ClockHand isMinutes />
		</div>
	</div>
</div>

<style lang="postcss">
	.big-scramble-root {
		background-color: black;
		height: 100vh;
		padding-top: 50px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.clock {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.clock-hand {
		border: 1px solid white;
	}

	.scramble {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 5px;
		width: 80vw;
	}

	.move {
		text-align: center;
		color: white;
		font-weight: bold;
		line-height: 1.1;
		border: 1px solid white;
	}

	.b {
		background-color: #0000ff;
	}

	.d {
		background-color: #ffff00;
	}

	.f {
		background-color: #00dc00;
	}

	.l {
		background-color: #ff9933;
	}

	.r {
		background-color: #ff0000;
	}

	.u {
		background-color: #ffffff;
	}

	.is_prime {
		text-decoration: underline;
	}

	.is_prime,
	.two {
		color: black;
	}
</style>