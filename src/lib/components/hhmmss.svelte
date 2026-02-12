<script lang="ts">
	import { hhmmssToSeconds, secondsToHhmmss } from "$lib/utils";

	interface Props {
		classes?: string;
		value: number;
		onChange: (newSeconds: number) => Promise<void> | void;
		afterBlur?: () => Promise<void> | void;
	}

	let { classes, value, onChange, afterBlur }: Props = $props();
	let currentValue = $state("");
</script>

<input
	class={classes || ""}
	type="text"
	value={currentValue || secondsToHhmmss(value)}
	onfocus={() => {
		currentValue = secondsToHhmmss(value);
	}}
	onchange={(event) => {
		currentValue = event.currentTarget.value;
	}}
	onblur={() => {
		onChange(hhmmssToSeconds(currentValue));
		currentValue = "";

		if (typeof afterBlur === "function") {
			setTimeout(afterBlur, 0);
		}
	}}
/>
