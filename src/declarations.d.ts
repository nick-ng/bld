declare module "cubejs";

// src/lib/components/youtube.svelte
declare var YT;
interface Window {
	YT;
	onYouTubeIframeAPIReady;
}
