<script lang="ts">
	import { page } from '$app/stores';
	import ClockHand from '$lib/components/clock-hand.svelte';
</script>

<div class="clock">
	<ClockHand
		isMinutes={$page.url.searchParams.get('unit') === 'minutes'}
		showQuartermarkers={$page.url.searchParams.has('quartermarkers')}
	/>
</div>

<style lang="postcss">
	.clock {
		width: 100vw;
		height: 100vh;
		color: white;
		background-color: black;
	}
</style>
