<script lang="ts">
	import type { MbldCube } from "$lib/types";

	interface Props {
		cube: MbldCube;
		onSeekRequest: (sec: number) => Promise<void> | void;
		onSave: (newCube: MbldCube) => Promise<void> | void;
	}

	let { cube }: Props = $props();
</script>

<div>
	<pre>{JSON.stringify(cube, null, 2)}</pre>
</div>
