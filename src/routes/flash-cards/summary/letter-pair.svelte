<script lang="ts">
	let { letterPair, cardType } = $props();
</script>

<a class="p-0.5 uppercase" href={`/flash-cards?lp=${letterPair}&t=${cardType}`}>{letterPair}</a>
