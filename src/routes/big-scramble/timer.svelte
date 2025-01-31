<script lang="ts">
	let timerStartMs = $state(0);
	let timerEndMs = $state(0);
	let intervalId: ReturnType<typeof setInterval> | null = $state(null);
	let minutes = $state("");
	let barHeightPercent = $state(0);
</script>

<div class="timer">
	<form
		class="text-white"
		onsubmit={(event) => {
			event.preventDefault();

			if (typeof intervalId === "number") {
				clearInterval(intervalId);
				intervalId = null;
			}

			const timerDuration = parseFloat(minutes) * 60 * 1000;
			timerStartMs = Date.now();
			timerEndMs = timerStartMs + timerDuration;
			barHeightPercent = 0;

			intervalId = setInterval(() => {
				const now = Date.now();
				const elapsed = now - timerStartMs;
				barHeightPercent = 100 * (elapsed / timerDuration);

				if (now >= timerEndMs && typeof intervalId === "number") {
					clearInterval(intervalId);
					intervalId = null;
				}
			}, timerDuration / 1900);
		}}
	>
		<label
			>Minutes: <input type="number" min="0" max="99999" step="0.001" bind:value={minutes} /></label
		>
	</form>
	<div
		class="timer_bar_outer mt-2 border {typeof intervalId === 'number'
			? 'border-gray-500'
			: 'border-black'}"
	>
		<button
			type="button"
			class="timer_bar_inner border-none {typeof intervalId !== 'number' ? 'timer_animation' : ''}"
			style={`height: ${barHeightPercent}%;`}
			onclick={() => {
				barHeightPercent = 0;
			}}
			>{#if barHeightPercent > 0}<span
					>{(barHeightPercent * 0.01 * parseFloat(minutes)).toFixed(1)} / {minutes}</span
				>{/if}</button
		>
	</div>
</div>

<style>
	.timer {
		position: absolute;
		left: 0;
		top: 0;
	}

	.timer_bar_outer {
		height: 80vh;
		width: 100px;
	}

	.timer_bar_inner {
		width: 100%;
		background-color: #aaa;
	}

	.timer_animation {
		animation: 5s linear 0s infinite pulse;
	}

	@keyframes pulse {
		0%,
		100% {
			background-color: #aaa;
		}
		50% {
			background-color: #b00;
		}
	}
</style>
