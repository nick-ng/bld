<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ClockHand from '$lib/components/clock-hand.svelte';

	const scrambleToMoves = (
		scramble: string
	): { move: string; isPrime: boolean; isDouble: boolean; isWide: boolean; side: string }[] => {
		return scramble
			.split(' ')
			.filter((m) => m)
			.map((move) => {
				const isDouble = move.includes('2');
				const isWide = move.includes('w');
				return {
					move,
					isDouble,
					isPrime: move.includes("'") && !isDouble,
					isWide,
					side: move[0]
				};
			});
	};

	const getMoveStyle = ({
		fontOutline,
		outlineColor,
		size
	}: {
		fontOutline: number;
		outlineColor: string;
		size: number;
	}) =>
		[
			`flex-basis: ${size * 1.7}px`,
			`font-size:${size}px`,
			`height: ${size * 1.25}px`,
			`text-shadow: -${fontOutline}px -${fontOutline}px 0 ${outlineColor}, ${fontOutline}px -${fontOutline}px 0 ${outlineColor}, -${fontOutline}px ${fontOutline}px 0 ${outlineColor}, ${fontOutline}px ${fontOutline}px 0 ${outlineColor}`
		].join(';');

	const getClockStyle = ({ size }: { size: number }) =>
		[`height: ${size * 1.5}px`, `width: ${size * 1.5}px`].join(';');

	const getCubeImageUrl = (scramble: string) =>
		`https://cube.rider.biz/visualcube.php?fmt=svg&size=265&view=plan&bg=black&dist=1.35&alg=x2${scramble.replaceAll(' ', '')}`;

	let size: number = 120;
	let fontOutline: number = 2;
	let scramble = "L2 U L2 F2 R U' B' D R D' B2 U F2 D' F2 U' F2 D2 Rw Uw'";

	onMount(() => {
		const startingScramble = $page.url.searchParams.get('scramble');

		if (typeof startingScramble === 'string') {
			scramble = startingScramble;
		}

		const handleEvent = (event: MessageEvent) => {
			if (typeof event.data !== 'string') {
				return;
			}

			scramble = event.data;
		};

		window.addEventListener('message', handleEvent, false);

		return () => {
			window.removeEventListener('message', handleEvent);
		};
	});
</script>

<svelte:head>
	<title>Blindfolded Cube Resources - Big Scramble</title>
</svelte:head>

<div class="big-scramble-root">
	<div class="scramble">
		{#each scrambleToMoves(scramble) as scrambleMove}
			<div
				class={['move', scrambleMove.side.toLowerCase(), scrambleMove.isPrime && 'is_prime']
					.filter((c) => c)
					.join(' ')}
				style={getMoveStyle({
					outlineColor: scrambleMove.isPrime ? '#fff' : '#000',
					fontOutline,
					size
				})}
			>
				{#if scrambleMove.isDouble}
					<span>{scrambleMove.side}{scrambleMove.isWide ? 'w' : ''}</span><span
						class="two"
						style={getMoveStyle({
							outlineColor: '#FFF',
							fontOutline,
							size
						})}>2</span
					>
				{:else}
					{scrambleMove.move}
				{/if}
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
	<a class="cube-preview" href="https://cube.rider.biz/visualcube.php" target="_blank">
		<img src={getCubeImageUrl(scramble)} alt="U Face" />
		<img src={getCubeImageUrl(`${scramble}x`)} alt="F Face" />
	</a>
	<div class="footer">
		Scrambled cube images generated using Conrad Rider's <a
			class="text-blue-500"
			href="https://cube.rider.biz/visualcube.php"
			target="_blank">VisualCube</a
		>
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
		gap: 5px;
	}

	.clock {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 5px;
	}

	.clock-hand {
		border: 1px solid white;
	}

	.cube-preview {
		position: absolute;
		right: 0;
		bottom: 0;
	}

	.cube-preview img {
		max-width: 10vw;
	}

	.footer {
		color: white;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		text-align: center;
		margin-bottom: 5px;
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
