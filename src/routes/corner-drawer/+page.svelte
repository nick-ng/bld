<script lang="ts">
	function rgbToHex(r: number, g: number, b: number): string {
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	const colourBlue = rgbToHex(0, 0, 255);
	const colourOrange = rgbToHex(255, 153, 51);
	const colourGreen = rgbToHex(0, 220, 0);
	const colourRed = rgbToHex(255, 0, 0);
	const colourWhite = rgbToHex(255, 255, 255);
	const colourYellow = rgbToHex(255, 255, 0);
	const colours = [colourBlue, colourGreen, colourOrange, colourRed, colourWhite, colourYellow];

	let pieceAsticker1 = colourWhite;
	let pieceAsticker2 = colourWhite;
	let pieceAsticker3 = colourWhite;

	let pieceBsticker1 = colourWhite;
	let pieceBsticker2 = colourWhite;
	let pieceBsticker3 = colourWhite;

	let htmlString = '';

	const mainPx = 50;
	const edgePx = mainPx / 2;
	const betweenPx = 10;

	function makeHtmlString({
		pieceAsticker1,
		pieceAsticker2,
		pieceAsticker3,
		pieceBsticker1,
		pieceBsticker2,
		pieceBsticker3
	}: {
		pieceAsticker1: string;
		pieceAsticker2: string;
		pieceAsticker3: string;
		pieceBsticker1: string;
		pieceBsticker2: string;
		pieceBsticker3: string;
	}): string {
		return `
		<div>
			<div style="line-height: 0">
				<div style="margin: 0;padding: 0;">
					<div style="display: inline-block;
					box-sizing: border-box;border: solid 1px black;
					background-color:${pieceAsticker2};
					width:${edgePx}px;
					height:${mainPx}px;"></div>
					<div style="display: inline-block;
					box-sizing: border-box;border: solid 1px black;
					background-color:${pieceAsticker1};
					width:${mainPx}px;
					height:${mainPx}px;
					"></div>
					<div style="display: inline-block; width:${betweenPx}px"></div>
					<div style="display: inline-block;
					box-sizing: border-box;border: solid 1px black;
					background-color:${pieceBsticker1};
					width:${mainPx}px;
					height:${mainPx}px;
					"></div>
					<div style="display: inline-block;
					box-sizing: border-box;border: solid 1px black;
					background-color:${pieceBsticker3};
					width:${edgePx}px;
					height:${mainPx}px;"></div>
				</div>
				<div style="">
					<div style="display: inline-block;width:${edgePx}px;"></div>
					<div style="display: inline-block;
					box-sizing: border-box;border: solid 1px black;
					background-color:${pieceAsticker3};
					width:${mainPx}px;
					height:${edgePx}px;"></div>
					<div style="display: inline-block; width:${betweenPx}px"></div>
					<div style="display: inline-block;
					box-sizing: border-box;border: solid 1px black;
					background-color:${pieceBsticker2};
					width:${mainPx}px;
					height:${edgePx}px;"></div>
					<div style="display:inline-block;width:${edgePx}px;"></div>
				</div>
		</div>
		`
			.replaceAll(/[\t\n]/g, '')
			.replaceAll(/: +/g, ':');
	}

	htmlString = makeHtmlString({
		pieceAsticker1,
		pieceAsticker2,
		pieceAsticker3,
		pieceBsticker1,
		pieceBsticker2,
		pieceBsticker3
	});
</script>

<div class="flex flex-row gap-4">
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

<div class="m-4">
	{@html htmlString}
</div>

<div>
	<textarea value={`<br />${htmlString}`} />
	<button
		on:click={() => {
			navigator.clipboard.writeText(`<br />${htmlString}`);
		}}>Copy</button
	>
</div>
