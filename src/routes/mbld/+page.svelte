<script lang="ts">
	import { mbldStore } from "$lib/stores/mbld";
</script>

<div class="mx-auto max-w-prose">
	<h1>MBLD Attempts Organiser</h1>
	<h2>{$mbldStore.length} sessions</h2>
	<ul>
		<li>
			<a href="/mbld/scramble">Generate Scrambles</a>
		</li>
		<li>
			<a href="/mbld/analyse">Analyse Attempts</a>
		</li>
	</ul>
</div>
