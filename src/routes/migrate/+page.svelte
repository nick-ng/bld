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
			const a = { speffz_pair: "sx", words: "wife", sm2_i: 3 };
			authFetch(joinServerPath("/mnemonic"), {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(a),
			});
		}}>Put Mnemonic</button
	>
	<p>{message}</p>
</div>
