<script lang="ts">
	let { letterPair, cardType } = $props();
</script>

<a class="p-0.5 uppercase" href={`/flash-cards?f=${letterPair}&t=${cardType}`}>{letterPair}</a>
