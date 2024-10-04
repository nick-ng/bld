type CornerColours = { a: string; b: string; c: string };

const COLOUR_BLUE = rgbToHex(0, 0, 255);
const COLOUR_ORANGE = rgbToHex(255, 153, 51);
const COLOUR_GREEN = rgbToHex(0, 220, 0);
const COLOUR_RED = rgbToHex(255, 0, 0);
const COLOUR_WHITE = rgbToHex(255, 255, 255);
const COLOUR_YELLOW = rgbToHex(255, 255, 0);
const COLOUR_GREY = '#555555';

const mainPx = 50;
const edgePx = mainPx / 2;
const betweenPx = 10;

export const COLOURS = {
	COLOUR_GREY,
	COLOUR_BLUE,
	COLOUR_GREEN,
	COLOUR_ORANGE,
	COLOUR_RED,
	COLOUR_WHITE,
	COLOUR_YELLOW
};

export const UNKNOWN_CORNER = {
	a: COLOUR_GREY,
	b: COLOUR_GREY,
	c: COLOUR_GREY
};

const u = 'u';
const l = 'l';
const f = 'f';
const r = 'r';
const b = 'b';
const d = 'd';

function rgbToHex(r: number, g: number, b: number): string {
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getFaceColour(face?: string): string {
	switch (face?.toLowerCase()) {
		case u:
			return COLOUR_WHITE;
		case l:
			return COLOUR_ORANGE;
		case f:
			return COLOUR_GREEN;
		case r:
			return COLOUR_RED;
		case b:
			return COLOUR_BLUE;
		case d:
			return COLOUR_YELLOW;
		default:
			return COLOUR_GREY;
	}
}

function getAntiClockwiseFaceOrder([mainFace, ...otherFaces]: string[]): string[] {
	const invalidResult = [mainFace || '?', '?', '?'];
	if (!mainFace || otherFaces.length !== 2) {
		return invalidResult;
	}

	const otherFacesString = otherFaces.sort().join('').toLowerCase();

	switch (mainFace.toLowerCase()) {
		case u: {
			switch (otherFacesString) {
				case 'fl': {
					return [u, l, f];
				}
				case 'fr': {
					return [u, f, r];
				}
				case 'br': {
					return [u, r, b];
				}
				case 'bl': {
					return [u, b, l];
				}
				default: {
					return invalidResult;
				}
			}
		}
		case l: {
			switch (otherFacesString) {
				case 'fu': {
					return [l, f, u];
				}
				case 'df': {
					return [l, d, f];
				}
				case 'bd': {
					return [l, b, d];
				}
				case 'bu': {
					return [l, u, b];
				}
				default: {
					return invalidResult;
				}
			}
		}
		case f: {
			switch (otherFacesString) {
				case 'lu': {
					return [f, u, l];
				}
				case 'ru': {
					return [f, r, u];
				}
				case 'dr': {
					return [f, d, r];
				}
				case 'dl': {
					return [f, l, d];
				}
				default: {
					return invalidResult;
				}
			}
		}
		case r: {
			switch (otherFacesString) {
				case 'fu': {
					return [r, u, f];
				}
				case 'bu': {
					return [r, b, u];
				}
				case 'bd': {
					return [r, d, b];
				}
				case 'df': {
					return [r, f, d];
				}
				default: {
					return invalidResult;
				}
			}
		}
		case b: {
			switch (otherFacesString) {
				case 'ru': {
					return [b, u, r];
				}
				case 'lu': {
					return [b, l, u];
				}
				case 'dl': {
					return [b, d, l];
				}
				case 'dr': {
					return [b, r, d];
				}
				default: {
					return invalidResult;
				}
			}
		}
		case d: {
			switch (otherFacesString) {
				case 'fl': {
					return [d, f, l];
				}
				case 'fr': {
					return [d, r, f];
				}
				case 'br': {
					return [d, b, r];
				}
				case 'bl': {
					return [d, l, b];
				}
				default: {
					return invalidResult;
				}
			}
		}
		default: {
			return invalidResult;
		}
	}
}

function getCornerColour(faces: string[]): CornerColours {
	const [a, b, c] = getAntiClockwiseFaceOrder(faces);

	return {
		a: getFaceColour(a),
		b: getFaceColour(b),
		c: getFaceColour(c)
	};
}

/**
 * returns face colours going anti-clockwise
 */
export function getSpeffzCornerColour(letter: string): CornerColours {
	switch (letter?.toLowerCase()) {
		case 'a': {
			return getCornerColour([u, b, l]);
		}
		case 'b': {
			return getCornerColour([u, b, r]);
		}
		case 'c': {
			return getCornerColour([u, f, r]);
		}
		case 'd': {
			return getCornerColour([u, l, f]);
		}
		case 'e': {
			return getCornerColour([l, u, b]);
		}
		case 'f': {
			return getCornerColour([l, f, u]);
		}
		case 'g': {
			return getCornerColour([l, d, f]);
		}
		case 'h': {
			return getCornerColour([l, d, b]);
		}
		case 'i': {
			return getCornerColour([f, u, l]);
		}
		case 'j': {
			return getCornerColour([f, r, u]);
		}
		case 'k': {
			return getCornerColour([f, d, r]);
		}
		case 'l': {
			return getCornerColour([f, l, d]);
		}
		case 'm': {
			return getCornerColour([r, u, f]);
		}
		case 'n': {
			return getCornerColour([r, b, u]);
		}
		case 'o': {
			return getCornerColour([r, d, b]);
		}
		case 'p': {
			return getCornerColour([r, f, d]);
		}
		case 'q': {
			return getCornerColour([b, u, r]);
		}
		case 'r': {
			return getCornerColour([b, l, u]);
		}
		case 's': {
			return getCornerColour([b, d, l]);
		}
		case 't': {
			return getCornerColour([b, r, d]);
		}
		case 'u': {
			return getCornerColour([d, f, l]);
		}
		case 'v': {
			return getCornerColour([d, r, f]);
		}
		case 'w': {
			return getCornerColour([d, b, r]);
		}
		case 'x': {
			return getCornerColour([d, l, b]);
		}
		default: {
			return { ...UNKNOWN_CORNER };
		}
	}
}

export function makeHtmlString({
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
