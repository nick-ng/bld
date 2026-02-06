<script lang="ts">
	import { migrateLetterPairs } from "$lib/letter-pair";
	import { authFetch, joinServerPath } from "$lib/utils";

	let message = $state("");
</script>

<div class="mx-auto max-w-prose">
	<button
		onclick={async () => {
			if (confirm("Migrate from old flash card data? Any new letter pair data will be lost")) {
				message = "migration in progress...";
				const m = await migrateLetterPairs();
				message = m;
			} else {
				message = "not doing migration";
			}
		}}
	>
		Migrate Data
	</button>
	<button
		onclick={async () => {
			const res1 = await authFetch(`${joinServerPath("mnemonic")}?offset=0`);
			const json1 = await res1.json();

			console.log("res2.json", json1);
			const newOffset = json1.length;
			console.log("new offset", newOffset);
			const res2 = await authFetch(`${joinServerPath("mnemonic")}?offset=${newOffset}`);
			console.log("res2.json", await res2.json());
		}}>Test</button
	>
	<p>{message}</p>
</div>
