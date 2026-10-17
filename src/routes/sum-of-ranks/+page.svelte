<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { SvelteURLSearchParams } from "svelte/reactivity";
	import { fetchRegistrations } from "./wca";

	let tempUrl = $derived(page.url.searchParams.get("url") || "");
	let registrations = $derived(fetchRegistrations(page.url.searchParams.get("url")));
</script>

<div>
	<form
		onsubmit={(formEvent) => {
			formEvent.preventDefault();

			let query = new SvelteURLSearchParams(page.url.searchParams.toString());

			query.set("url", tempUrl);
			goto(`?${query.toString()}`, { state: page.state, replaceState: true });
		}}
	>
		<label>
			Competition URL: <input type="text" bind:value={tempUrl} />
		</label>
		<button class="inline-block">Save</button>
	</form>
	{#await Promise.all([registrations])}
		<div>Loading...</div>
	{:then results}
		{@const registrations = results[0]}
		<pre>
		{JSON.stringify({ url: page.url.searchParams.get("url"), registrations }, null, 2)}
		</pre>
	{:catch error}
		<div>{error.toString()}</div>
	{/await}
</div>
