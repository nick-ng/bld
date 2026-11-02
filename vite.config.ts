import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({
				fallback: "404.html",
				pages: "build",
				assets: "build",
				precompress: false,
				strict: true,
			}),
		}),
	],
	ssr: {
		external: ["cubing"],
	},
});
