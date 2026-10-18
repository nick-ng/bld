<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { SvelteURLSearchParams } from "svelte/reactivity";
	import { fetchRegistrations, fetchRound } from "./wca";

	// @todo(nick-ng): just save the competition id (e.g. DuallinginMilford2026) so the url is shorter
	let tempUrl = $derived(page.url.searchParams.get("url") || "");
	let registrations = $derived(fetchRegistrations(page.url.searchParams.get("url")));
	let roundData = $derived(fetchRound(page.url.searchParams.get("url"), "333-r1"));
</script>

<div class="m-2">
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
	{#await Promise.all([registrations, roundData])}
		<div>Loading...</div>
	{:then results}
		{@const registrations = results[0]}
		{@const roundData = results[1]}
		<pre>
		{JSON.stringify({ roundData }, null, 2)}
		</pre>
	{:catch error}
		<div>{error.toString()}</div>
	{/await}
</div>
