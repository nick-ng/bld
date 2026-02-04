<script lang="ts">
	import { page } from "$app/state";
	import { getDefaultMnemonic } from "$lib/types";
	import { letterPairStore } from "$lib/stores/letter-pairs";
	import MainEditor from "./main-editor.svelte";

	let chosenSpeffzPair = $derived(page.url.searchParams.get("sp") || "");
	let letterPair = $derived(
		$letterPairStore[chosenSpeffzPair] ?? {
			...getDefaultMnemonic(chosenSpeffzPair),
			algorithms: {},
		}
	);
</script>

<MainEditor {letterPair} />
