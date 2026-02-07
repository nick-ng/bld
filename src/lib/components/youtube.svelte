<script lang="ts">
	// https://stackoverflow.com/questions/76690112/how-to-use-youtube-embed-api-in-svelte
	import { onMount } from "svelte";

	interface Props {
		player: any;
		initialVideoId: string;
	}

	let { player = $bindable(), initialVideoId }: Props = $props();

	const ytPlayerId = "youtube-player";

	onMount(() => {
		function load() {
			player = new YT.Player(ytPlayerId, {
				height: "100%",
				width: "100%",
				videoId: initialVideoId,
				playerVars: { autoplay: 0 },
			});
		}

		if (window.YT) {
			load();
		} else {
			window.onYouTubeIframeAPIReady = load;
		}
	});
</script>

<svelte:head>
	<script src="https://www.youtube.com/iframe_api"></script>
</svelte:head>

<div class="h-full w-full">
	<div id={ytPlayerId}></div>
</div>
