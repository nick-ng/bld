<script lang="ts">
	import CommutatorsTester from "./commutators-tester.svelte";

	let videoUrl = $state("");
	let videoHtml: HTMLVideoElement | null = $state(null);
</script>

<div class="mx-2">
	<details>
		<summary>Video</summary>
		<input type="text" bind:value={videoUrl} />
		<button
			onclick={() => {
				if (videoHtml) {
					videoHtml.currentTime = 120;
				}
			}}>Skip to 2:00</button
		>
		<video src={videoUrl} controls bind:this={videoHtml}></video>
	</details>
	<details>
		<summary>Commutators</summary>
		<div>
			<CommutatorsTester />
		</div>
	</details>
</div>
