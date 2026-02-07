declare module "cubejs";

// src/lib/components/youtube.svelte
declare let YT;
interface Window {
	YT;
	onYouTubeIframeAPIReady;
}
