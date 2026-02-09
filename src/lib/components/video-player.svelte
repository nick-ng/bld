<script lang="ts">
	import { getVideoId } from "$lib/utils";
	import Youtube from "$lib/components/youtube.svelte";
	import { onMount } from "svelte";

	interface Props {
		videoUrl: string;
		getSeekTo: (seekTo: (secs: number) => void) => void;
	}

	let { videoUrl, getSeekTo }: Props = $props();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let youtubePlayer: any = $state(null);
	let videoHtml: HTMLVideoElement | null = $state(null);
	let { id: videoId, platform } = $derived(getVideoId(videoUrl));

	const seekTo = (secs: number) => {
		switch (platform) {
			case "youtube": {
				if (youtubePlayer) {
					youtubePlayer.seekTo(secs, true);
				}
				return;
			}
			case "file": {
				if (videoHtml) {
					videoHtml.currentTime = secs;
				}
				return;
			}
		}
	};

	onMount(() => {
		getSeekTo(seekTo);
	});
</script>

{#if platform === "youtube"}
	{#key videoUrl}
		<Youtube bind:player={youtubePlayer} initialVideoId={videoId} />
	{/key}
{:else if platform === "file"}
	<video class="h-full w-full" src={videoUrl} controls bind:this={videoHtml}>
		<track kind="captions" src="" />
	</video>
{/if}
