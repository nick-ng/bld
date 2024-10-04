<script lang="ts">
	import { onMount } from "svelte";
	import { COLOURS, getSpeffzCornerColour, makeHtmlString } from "$lib/components/corner-colour";
	import Corners from "$lib/components/corners.svelte";

	const colours = Object.values(COLOURS);

	let pieceAsticker1 = COLOURS.COLOUR_GREY;
	let pieceAsticker2 = COLOURS.COLOUR_GREY;
	let pieceAsticker3 = COLOURS.COLOUR_GREY;

	let pieceBsticker1 = COLOURS.COLOUR_GREY;
	let pieceBsticker2 = COLOURS.COLOUR_GREY;
	let pieceBsticker3 = COLOURS.COLOUR_GREY;

	let letterPairInput: HTMLInputElement | null = null;
	let letterPair = "";
	let message = "a";
	let messageTimeStamp = 0;

	function getHtmlStringForLetterPair(lp: string): string {
		const letters = lp.split("");

		pieceAsticker1 = COLOURS.COLOUR_GREY;
		pieceAsticker2 = COLOURS.COLOUR_GREY;
		pieceAsticker3 = COLOURS.COLOUR_GREY;

		pieceBsticker1 = COLOURS.COLOUR_GREY;
		pieceBsticker2 = COLOURS.COLOUR_GREY;
		pieceBsticker3 = COLOURS.COLOUR_GREY;

		if (letters.length >= 1) {
			const temp = getSpeffzCornerColour(letters[0]);

			pieceAsticker1 = temp.a;
			pieceAsticker2 = temp.b;
			pieceAsticker3 = temp.c;
		}

		if (letters.length >= 2) {
			const temp = getSpeffzCornerColour(letters[1]);

			pieceBsticker1 = temp.a;
			pieceBsticker2 = temp.b;
			pieceBsticker3 = temp.c;
		}

		return makeHtmlString({
			pieceAsticker1,
			pieceAsticker2,
			pieceAsticker3,
			pieceBsticker1,
			pieceBsticker2,
			pieceBsticker3
		});
	}

	$: htmlString = getHtmlStringForLetterPair(letterPair);

	function focusLetterPairInput(event?: KeyboardEvent): void {
		if (event && event.key !== "Enter") {
			return;
		}

		if (letterPairInput) {
			letterPairInput.select();
		}
	}

	onMount(() => {
		focusLetterPairInput();

		document.addEventListener("keyup", focusLetterPairInput);

		return () => {
			document.removeEventListener("keyup", focusLetterPairInput);
		};
	});
</script>

<div class="corner-drawer w-prose mx-auto">
	<div class="mx-4 text-center uppercase">
		<span>{letterPair}</span>
		<br />
		<Corners {letterPair} />
	</div>
	<form
		on:submit={(event) => {
			event.preventDefault();

			navigator.clipboard.writeText(`${letterPair.slice(0, 2).toUpperCase()}<br />${htmlString}`);

			message = "HTML coppied to clipboard";
			messageTimeStamp = Date.now();
		}}
	>
		<label>
			<span>Corner Letter Pair</span>
			<input class="uppercase" type="text" bind:this={letterPairInput} bind:value={letterPair} />
		</label>
		<button type="submit"
			>Copy{letterPair.length >= 2 ? ` ${letterPair.slice(0, 2).toUpperCase()} + HTML` : ""}</button
		>
	</form>
	{#key messageTimeStamp}
		<div class={`message ${messageTimeStamp ? "" : "opacity-0"}`}>{message}</div>
	{/key}
	<details>
		<summary>Piece Colour Picker</summary>
		<div class="flex flex-col gap-1">
			<div class="border-default p-2">
				<h3>Piece A</h3>
				<div>
					<h4>Sticker 1</h4>
					{#each colours as colour}
						<button
							class="button-default"
							style={`background-color: ${colour}`}
							on:click={() => {
								pieceAsticker1 = colour;
								htmlString = makeHtmlString({
									pieceAsticker1,
									pieceAsticker2,
									pieceAsticker3,
									pieceBsticker1,
									pieceBsticker2,
									pieceBsticker3
								});
							}}>{colour}</button
						>
					{/each}
				</div>
				<div>
					<h4>Sticker 2</h4>
					{#each colours as colour}
						<button
							class="button-default"
							style={`background-color: ${colour}`}
							on:click={() => {
								pieceAsticker2 = colour;
								htmlString = makeHtmlString({
									pieceAsticker1,
									pieceAsticker2,
									pieceAsticker3,
									pieceBsticker1,
									pieceBsticker2,
									pieceBsticker3
								});
							}}>{colour}</button
						>
					{/each}
				</div>
				<div>
					<h4>Sticker 3</h4>
					{#each colours as colour}
						<button
							class="button-default"
							style={`background-color: ${colour}`}
							on:click={() => {
								pieceAsticker3 = colour;
								htmlString = makeHtmlString({
									pieceAsticker1,
									pieceAsticker2,
									pieceAsticker3,
									pieceBsticker1,
									pieceBsticker2,
									pieceBsticker3
								});
							}}>{colour}</button
						>
					{/each}
				</div>
			</div>
			<div class="border-default p-2">
				<h3>Piece B</h3>
				<div>
					<h4>Sticker 1</h4>
					{#each colours as colour}
						<button
							class="button-default"
							style={`background-color: ${colour}`}
							on:click={() => {
								pieceBsticker1 = colour;
								htmlString = makeHtmlString({
									pieceAsticker1,
									pieceAsticker2,
									pieceAsticker3,
									pieceBsticker1,
									pieceBsticker2,
									pieceBsticker3
								});
							}}>{colour}</button
						>
					{/each}
				</div>
				<div>
					<h4>Sticker 2</h4>
					{#each colours as colour}
						<button
							class="button-default"
							style={`background-color: ${colour}`}
							on:click={() => {
								pieceBsticker2 = colour;
								htmlString = makeHtmlString({
									pieceAsticker1,
									pieceAsticker2,
									pieceAsticker3,
									pieceBsticker1,
									pieceBsticker2,
									pieceBsticker3
								});
							}}>{colour}</button
						>
					{/each}
				</div>
				<div>
					<h4>Sticker 3</h4>
					{#each colours as colour}
						<button
							class="button-default"
							style={`background-color: ${colour}`}
							on:click={() => {
								pieceBsticker3 = colour;
								htmlString = makeHtmlString({
									pieceAsticker1,
									pieceAsticker2,
									pieceAsticker3,
									pieceBsticker1,
									pieceBsticker2,
									pieceBsticker3
								});
							}}>{colour}</button
						>
					{/each}
				</div>
			</div>
		</div>
	</details>
	<div>
		<button
			on:click={() => {
				navigator.clipboard.writeText(`${htmlString}`);
				message = "HTML coppied to clipboard";
				messageTimeStamp = Date.now();
			}}>Copy HTML</button
		>
		<details>
			<summary>Show HTML</summary>
			<textarea value={`${htmlString}`} />
		</details>
	</div>
</div>

<style>
	.corner-drawer > * {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	@keyframes message {
		0%,
		80% {
			color: #000000ff;
		}

		100% {
			color: #00000000;
		}
	}

	.message {
		color: #00000000;
		animation-duration: 5s;
		animation-name: message;
		animation-iteration-count: 1;
	}
</style>
