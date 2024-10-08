<script lang="ts">
	import { joinServerPath } from "$lib/utils";

	export let imageUri = "";
	export let alt: string;

	const getImageUrl = (uri: string) => {
		if (uri.startsWith("blob:")) {
			return uri;
		}

		return joinServerPath("images", uri);
	};
</script>

<div
	class={`flex flex-row justify-center h-64 w-64 ${!imageUri || imageUri.endsWith(".emoji") ? "border-gray-500 border items-center" : "items-stretch"}`}
>
	{#if imageUri.endsWith(".emoji")}
		<span class="text-9xl">{imageUri.replace(/\.emoji$/, "")}</span>
	{:else if imageUri}
		<img class="flex-shrink object-contain" src={getImageUrl(imageUri)} {alt} />
	{:else}
		<span class="text-3xl">No Image</span>
	{/if}
</div>
