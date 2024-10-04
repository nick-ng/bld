<script lang="ts">
	import { COLOURS, getSpeffzCornerColour, makeHtmlString } from "./corner-colour";

	let pieceAsticker1 = COLOURS.COLOUR_GREY;
	let pieceAsticker2 = COLOURS.COLOUR_GREY;
	let pieceAsticker3 = COLOURS.COLOUR_GREY;

	let pieceBsticker1 = COLOURS.COLOUR_GREY;
	let pieceBsticker2 = COLOURS.COLOUR_GREY;
	let pieceBsticker3 = COLOURS.COLOUR_GREY;

	export let letterPair = "";

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
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html getHtmlStringForLetterPair(letterPair)}
