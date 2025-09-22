<script lang="ts">
	import { SPEFFZ_LETTERS } from "$lib/constants";

	let chosenLetter = $state("");
</script>

<div class="flex flex-col items-center">
	<button
		onclick={() => {
			const randomIndex = Math.floor(Math.random() * SPEFFZ_LETTERS.length);

			chosenLetter = SPEFFZ_LETTERS[randomIndex];
		}}>Random</button
	>
	<h2>{chosenLetter}</h2>
</div>
