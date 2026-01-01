<script lang="ts">
	interface Props {
		move: string;
		cancellationType: string;
	}

	let { move, cancellationType }: Props = $props();

	let classes = $derived(
		[
			cancellationType === "cancelled" && "underline text-emerald-700 dark:text-emerald-500",
			cancellationType === "gone" && "line-through text-blue-700 dark:text-blue-500",
		]
			.filter((a) => a)
			.join(" ")
	);
</script>

<span class={classes}>{move}</span>
