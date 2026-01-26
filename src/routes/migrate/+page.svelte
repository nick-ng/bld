<script lang="ts">
	import { migrateLetterPairs } from "$lib/letter-pair";

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
	<p>{message}</p>
</div>
