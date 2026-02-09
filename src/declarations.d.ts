declare module "cubejs";

// src/lib/components/youtube.svelte
declare let YT;
interface Window {
	YT;
	onYouTubeIframeAPIReady;
}

declare module "https://cdn.cubing.net/v0/js/cubing/scramble";
