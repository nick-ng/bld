<script lang="ts">
	import { onMount } from "svelte";

	interface Props {
		isMinutes?: boolean;
		showQuartermarkers?: boolean;
	}

	let { isMinutes = false, showQuartermarkers = false }: Props = $props();

	const get12HourTimeHours = () => {
		const now = new Date();

		return (now.getHours() % 12) + now.getMinutes() / 60 + now.getSeconds() / 3600;
	};

	const getMinutes = () => {
		const now = new Date();

		return now.getMinutes() + now.getSeconds() / 60;
	};

	const handColour = "#ccc";
	let timeFraction = isMinutes ? getMinutes() / 60 : get12HourTimeHours() / 12;
	let intervalId: number | null = null;
	let gradientStyle = $state(
		`background: conic-gradient(${handColour} 0%, ${handColour} ${timeFraction * 100}%, black ${timeFraction * 100}%), black 100%;`
	);

	onMount(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}

		intervalId = setInterval(() => {
			timeFraction = isMinutes ? getMinutes() / 60 : get12HourTimeHours() / 12;
			gradientStyle = `background: conic-gradient(${handColour} 0%, ${handColour} ${timeFraction * 100}%, black ${timeFraction * 100}%), black 100%;`;
		}, 997);

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});
</script>

<div class="clock">
	<div class="hand" style={gradientStyle}>
		{#if showQuartermarkers}
			<table>
				<tbody>
					<tr>
						<td></td>
						<td></td>
					</tr>
					<tr>
						<td></td>
						<td></td>
					</tr>
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style lang="postcss">
	.clock {
		width: 100%;
		height: 100%;
		color: white;
		background-color: black;
	}

	.hand {
		border-radius: 50%;
		background-color: black;
		height: 100%;
		width: 100%;
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
	}

	.hand td {
		border: 1px solid black;
	}
</style>
