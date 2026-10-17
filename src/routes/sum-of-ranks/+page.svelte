<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { SvelteURLSearchParams } from "svelte/reactivity";

	let baseUrl = $derived(page.url.searchParams.get("url") || "");
</script>

<div>
	<label
		>Competition URL: <input
			type="text"
			bind:value={
				() => baseUrl,
				(newUrl) => {
					baseUrl = newUrl;
					let query = new SvelteURLSearchParams(page.url.searchParams.toString());

					query.set("url", newUrl);
					goto(`?${query.toString()}`, { state: page.state, shallow: true, replace: true });
				}
			}
		/></label
	>
</div>
