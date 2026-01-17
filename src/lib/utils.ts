import type { FlashCard } from "$lib/types";

import {
	ACCESS_TOKEN_STORE_KEY,
	PASSWORD_STORE_KEY,
	USERNAME_STORE_KEY,
	SPEFFZ_CORNER_SAME_PIECES,
	SPEFFZ_EDGE_SAME_PIECES,
} from "$lib/constants";
import { optionsStore } from "$lib/stores/options";

const RANDOM_LIMIT = 1_000_000;
const regripEmojis = ["👍", "👎"];

// @todo(nick-ng): functions need to be clear whether they are operating with speffz letters or locations
const cornerSpeffzLocationMap: Record<string, string> = {
	a: "UBL",
	b: "UBR",
	c: "UFR",
	d: "UFL",
	e: "LUB",
	f: "LUF",
	g: "LDF",
	h: "LDB",
	i: "FUL",
	j: "FUR",
	k: "FDR",
	l: "FDL",
	m: "RUF",
	n: "RUB",
	o: "RDB",
	p: "RDF",
	q: "BUR",
	r: "BUL",
	s: "BDL",
	t: "BDR",
	u: "DFL",
	v: "DFR",
	w: "DBR",
	x: "DBL",
	y: "DBL",
	z: "DBL",
	UBL: "a",
	UBR: "b",
	UFR: "c",
	UFL: "d",
	LUB: "e",
	LUF: "f",
	LDF: "g",
	LDB: "h",
	FUL: "i",
	FUR: "j",
	FDR: "k",
	FDL: "l",
	RUF: "m",
	RUB: "n",
	RDB: "o",
	RDF: "p",
	BUR: "q",
	BUL: "r",
	BDL: "s",
	BDR: "t",
	DFL: "u",
	DFR: "v",
	DBR: "w",
	DBL: "x",
};

const edgeSpeffzLocationMap: Record<string, string> = {
	a: "UB",
	b: "UL",
	c: "UF",
	d: "UR",
	e: "RU",
	f: "RF",
	g: "RD",
	h: "RB",
	i: "FU",
	j: "FL",
	k: "FD",
	l: "FR",
	m: "LU",
	n: "LB",
	o: "LD",
	p: "LF",
	q: "BU",
	r: "BR",
	s: "BD",
	t: "BL",
	u: "DF",
	v: "DR",
	w: "DB",
	x: "DL",
	y: "DL",
	z: "DL",
	UB: "a",
	UL: "b",
	UF: "c",
	UR: "d",
	RU: "e",
	RF: "f",
	RD: "g",
	RB: "h",
	FU: "i",
	FL: "j",
	FD: "k",
	FR: "l",
	LU: "m",
	LB: "n",
	LD: "o",
	LF: "p",
	BU: "q",
	BR: "r",
	BD: "s",
	BL: "t",
	DF: "u",
	DR: "v",
	DB: "w",
	DL: "x",
};

export const getTrueKeys = (obj: Record<string, boolean>): string[] => {
	const temp = Object.keys(obj).filter((k) => obj[k]);

	return temp;
};

export const getRandomSequence = (seed: number, count: number) => {
	const randomNumbers: number[] = [];
	for (let i = 0; i < count; i++) {
		const temp = Math.floor(Math.abs((Math.sin(seed + i) * RANDOM_LIMIT) % RANDOM_LIMIT));

		randomNumbers.push(temp);
	}

	return randomNumbers;
};

export const capFirst = (str: string) => {
	return `${str[0].toUpperCase()}${str.slice(1)}`;
};

export const joinUrl = (...args: string[]) => {
	return args
		.map((fragment, i) => {
			if (typeof fragment !== "string") {
				return "";
			}

			let newFragment = fragment.replace(/\/+$/, "");

			if (i !== 0) {
				newFragment = newFragment.replace(/^\/+/, "");
			}

			return newFragment;
		})
		.filter((f) => f.length > 0)
		.join("/");
};

export const joinServerPath = (...args: string[]) => {
	return joinUrl(import.meta.env.VITE_SERVER_URL, ...args);
};

export const upperCaseFirst = (str: string) => {
	const [first, ...rest] = str.split("");

	return [first.toLocaleUpperCase(), ...rest].join("");
};

export const addCredentialsToHeaders = (
	originalHeaders?: HeadersInit
): {
	headers: Headers;
	isValid: boolean;
	previousAccessToken: string | null;
} => {
	const headers = originalHeaders ? new Headers(originalHeaders) : new Headers();

	const accessToken = localStorage.getItem(ACCESS_TOKEN_STORE_KEY);
	const username = localStorage.getItem(USERNAME_STORE_KEY);
	const password = localStorage.getItem(PASSWORD_STORE_KEY);
	if (!username || !password) {
		return {
			headers,
			isValid: false,
			previousAccessToken: null,
		};
	}

	if (accessToken) {
		headers.append("x-access-token", accessToken);
	}
	headers.append("x-username", username);
	headers.append("x-password", password);

	return {
		headers: headers,
		isValid: true,
		previousAccessToken: accessToken,
	};
};

export const daysAgo = (date: Date | number) => {
	const startOfToday = new Date();
	startOfToday.setHours(0);
	startOfToday.setMinutes(0);
	startOfToday.setSeconds(0);
	const targetDate = new Date(date);
	targetDate.setHours(0);
	targetDate.setMinutes(0);
	targetDate.setSeconds(0);

	const differenceDays = (startOfToday.valueOf() - targetDate.valueOf()) / (1000 * 60 * 60 * 24);

	if (differenceDays < 1) {
		return "Today";
	}

	if (differenceDays < 2) {
		return `${differenceDays.toFixed(0)} Day ago`;
	}

	return `${differenceDays.toFixed(0)} Days ago`;
};

export const authFetch = (url: string, init?: RequestInit) => {
	const newInit = { ...init };
	const { headers, isValid, previousAccessToken } = addCredentialsToHeaders(init?.headers);

	if (isValid) {
		newInit.headers = headers;
	}

	const response = fetch(url, { mode: "cors", ...newInit });

	response.then((r) => {
		if (r.ok) {
			optionsStore.update((prevOptions) => ({
				...prevOptions,
				isUserAuthenticated: true,
			}));
			const newAccessToken = r.headers.get("X-Access-Token");
			if (newAccessToken && previousAccessToken !== newAccessToken) {
				localStorage.setItem(ACCESS_TOKEN_STORE_KEY, newAccessToken);
			}
		}

		return r;
	});

	return response;
};

export const positionSortIndex = (positionLetter: string) => {
	const uppercaseLetter = positionLetter.toUpperCase();
	switch (uppercaseLetter) {
		case "U":
			return 1;
		case "D":
			return 2;
		case "F":
			return 3;
		case "B":
			return 4;
		case "L":
			return 5;
		case "R":
			return 6;
		default:
			return 7;
	}
};

export const locationType = (
	location: string
):
	| {
			isValid: true;
			name: string;
			bufferSpeffz: string;
			samePieces: string[][];
			speffzLocationMap: Record<string, string>;
	  }
	| { isValid: false } => {
	if (location.toUpperCase() === location) {
		// all letters are uppercase e.g. UF, UFR
		if (location.length === 3) {
			return {
				isValid: true,
				name: "corner",
				bufferSpeffz: cornerSpeffzLocationMap[location],
				samePieces: SPEFFZ_CORNER_SAME_PIECES,
				speffzLocationMap: cornerSpeffzLocationMap,
			};
		}
		if (location.length === 2) {
			return {
				isValid: true,
				name: "edge",
				bufferSpeffz: edgeSpeffzLocationMap[location],
				samePieces: SPEFFZ_EDGE_SAME_PIECES,
				speffzLocationMap: edgeSpeffzLocationMap,
			};
		}
	}

	// @todo(nick-ng): handle other piece types (x centre, + centre, wing)
	return {
		isValid: false,
	};
};

export const normalisePosition = (rawPosition: string) => {
	const [firstLetter, ...otherLetters] = rawPosition.split("");

	otherLetters.sort((a, b) => positionSortIndex(a) - positionSortIndex(b));

	return [firstLetter, ...otherLetters].join("");
};

export const areLocationsSame = (locationA: string, locationB: string) => {
	const tempA = locationA.split("").sort().join("");
	const tempB = locationB.split("").sort().join("");

	return tempA === tempB;
};

export const isTwist = (speffzPair: string, samePieces: string[][]) => {
	const letters = speffzPair.split("");
	if (letters.length !== 2) {
		return false;
	}

	if (letters[0] === letters[1]) {
		// repeated letter means odd number of swaps
		return false;
	}

	for (let i = 0; i < samePieces.length; i++) {
		if (samePieces[i].includes(letters[0]) && samePieces[i].includes(letters[1])) {
			return true;
		}
	}

	return false;
};

export const isBuffer = (letterPair: string, bufferPiece: string[]) => {
	const letters = letterPair.split("");

	for (let i = 0; i < letters.length; i++) {
		if (bufferPiece.includes(letters[i])) {
			return true;
		}
	}

	return false;
};

export const isSpeffzPairValid = (speffzPair: string, bufferLocation: string) => {
	if (speffzPair.length !== 2) {
		// a speffz pair contains exactly 2 letters
		return false;
	}

	const pieceType = locationType(bufferLocation);
	if (!pieceType.isValid) {
		return false;
	}

	const location1 = pieceType.speffzLocationMap[speffzPair[0]];
	const location2 = pieceType.speffzLocationMap[speffzPair[1]];

	if (areLocationsSame(bufferLocation, location1) || areLocationsSame(bufferLocation, location2)) {
		return false;
	}

	if (speffzPair[0] === speffzPair[1]) {
		// repeated letters are either parity or long-term twist/flips
		return true;
	}

	if (areLocationsSame(location1, location2)) {
		// same piece means a twist/flip
		return false;
	}

	return true;
};

export const getOperatingSystem = (): string => {
	if (navigator.userAgent.includes("Win")) {
		return "win";
	}
	if (navigator.userAgent.includes("Mac")) {
		return "mac";
	}
	return "";
};

export const normaliseCommutator = (rawCommutator: string): string => {
	return rawCommutator
		.replaceAll(/  +/g, " ")
		.replaceAll(/ *([ufrdlb])/gi, " $1")
		.replaceAll(/ *\[ */g, "[")
		.replaceAll(/ *\] */g, "]")
		.replaceAll(/ *, */g, ",")
		.replaceAll(/ *: */g, ":")
		.replaceAll(/ *\/ */g, "/")
		.trim();
};

export const reverseMoves = (moves: string): string => {
	const moveList = moves
		.split(" ")
		.filter((a) => a)
		.reverse();
	for (let i = 0; i < moveList.length; i++) {
		if (moveList[i].includes("2")) {
			continue;
		} else if (moveList[i].includes("'")) {
			moveList[i] = moveList[i].replaceAll("'", "");
		} else {
			moveList[i] = `${moveList[i]}'`;
		}
	}

	return moveList.join(" ");
};

const jbPerm = "R U R' F' R U R' U' R' F R2 U' R' U'";
const tPerm = "R U R' U' R' F R2 U' R' U' R U R' F'";
const opSwap = "R' F R2 U' R' U' R U R' F' R U R' U'";
const leftJbPerm = "L' U' L F L' U' L U L F' L2 U L U";
const yPerm = `F ${opSwap} F'`;
export const hydrateAlgorithms = (rawAlg: string) => {
	const hydratedAlg = rawAlg
		.replaceAll(/<jb-perm>/gi, jbPerm)
		.replaceAll(/<op-swap>/gi, opSwap)
		.replaceAll(/<left jb-perm>/gi, leftJbPerm)
		.replaceAll(/<ljb-perm>/gi, leftJbPerm)
		.replaceAll(/<t-perm>/gi, tPerm)
		.replaceAll(/<y-perm>/gi, yPerm);

	return hydratedAlg;
};

// @todo(nick-ng): handle cube rotations (x y z)
export const parseCommutator = (rawCommutator: string) => {
	const hydratedCommutator = hydrateAlgorithms(rawCommutator);
	const neededHydration = rawCommutator !== hydratedCommutator;
	let regripEmoji = "";
	for (let i = 0; i < regripEmojis.length; i++) {
		if (hydratedCommutator.includes(regripEmojis[i])) {
			regripEmoji = `${regripEmojis[i]} `;
			break;
		}
	}

	const commutatorResult = hydratedCommutator.match(/\[[ufrdlb2' ]+,[ufrdlb2' ]+\]/i);
	if (commutatorResult) {
		const commutator = normaliseCommutator(commutatorResult[0]);
		// there is at least a commutator
		let conjugatePlusCommutator = commutator;
		// check if there is a conjugate as well
		const conjugatePlusCommutatorResult = hydratedCommutator.match(
			/[ufrdlb2' ]+: ?\[[ufrdlb2' ]+,[ufrdlb2' ]+\]/i
		);
		let setup = "";
		if (conjugatePlusCommutatorResult) {
			conjugatePlusCommutator = normaliseCommutator(conjugatePlusCommutatorResult[0]);
			const temp = conjugatePlusCommutator.split(":");
			setup = temp[0].trim();
		}

		let insert = "";
		let interchange = "";
		const temp = commutator
			.replaceAll("[", "")
			.replaceAll("]", "")
			.split(",")
			.map((a) => a.trim());
		insert = temp[0];
		interchange = temp[1];
		if (temp[0].match(/^[ufrdlb][2']*$/i)) {
			interchange = temp[0];
			insert = temp[1];
		}

		if (conjugatePlusCommutator[0] !== "[") {
			conjugatePlusCommutator = `[${conjugatePlusCommutator}]`;
		}

		return {
			rawCommutator,
			normalisedCommutator: neededHydration ? rawCommutator : conjugatePlusCommutator,
			commutator,
			conjugatePlusCommutator,
			setup,
			insert,
			insertLength: insert.split(" ").length,
			interchange,
			regripEmoji,
			expansion: [
				setup,
				temp[0],
				temp[1],
				reverseMoves(temp[0]),
				reverseMoves(temp[1]),
				reverseMoves(setup),
			]
				.filter((a) => a)
				.join(" "),
		};
	}

	const slashCommutatorResult = hydratedCommutator.match(
		/(?<setupRG>[ufrdlb2' ]+:)? *(?<commutatorRG>\[[ufrdlb]'?\/[ufrdlb2' ]+\])/i
	);
	if (slashCommutatorResult) {
		const { setupRG, commutatorRG } = slashCommutatorResult.groups || {};

		const [temp, insert] = commutatorRG.replaceAll("[", "").replaceAll("]", "").split("/");
		const interchange = temp.trim();
		const interchange2 = `${interchange.replaceAll("'", "")}2`;

		const commutator = normaliseCommutator(commutatorRG);
		const setup = setupRG ? normaliseCommutator(setupRG.replaceAll(":", "")) : "";
		let conjugatePlusCommutator = commutator;
		if (setup) {
			conjugatePlusCommutator = `[${setup}:${commutator}]`;
		}

		return {
			rawCommutator,
			normalisedCommutator: neededHydration ? rawCommutator : conjugatePlusCommutator,
			commutator,
			conjugatePlusCommutator,
			setup,
			insert,
			insertLength: insert.split(" ").length,
			interchange: interchange2,
			expansion: [
				setup,
				interchange,
				insert,
				interchange2,
				reverseMoves(insert),
				interchange,
				reverseMoves(setup),
			]
				.filter((a) => a)
				.join(" "),
		};
	}

	const conjugateResult = hydratedCommutator.match(
		/(?<setupRG>[ufrdlb2' ]+) *: *(?<algorithmRG>[ufrdlb2' ]+)/i
	);
	if (conjugateResult) {
		const { setupRG, algorithmRG } = conjugateResult.groups || {};

		const setup = setupRG ? normaliseCommutator(setupRG) : "";
		const algorithm = algorithmRG ? normaliseCommutator(algorithmRG) : "";

		return {
			rawCommutator,
			normalisedCommutator: neededHydration ? rawCommutator : `[${setup}:${algorithm}]`,
			commutator: "",
			conjugatePlusCommutator: "",
			setup,
			insert: "",
			insertLength: 0,
			interchange: "",
			expansion: [setup, algorithm, reverseMoves(setup)].filter((a) => a).join(" "),
		};
	}

	return {
		rawCommutator,
		normalisedCommutator: rawCommutator,
		commutator: "",
		conjugatePlusCommutator: "",
		setup: "",
		insert: "",
		insertLength: 0,
		interchange: "",
		expansion: hydratedCommutator,
	};
};

export const simplifyAlgorithm = (alg: string) => {
	const moves = alg.split(" ").filter((a) => a);
	const originalMoves = moves.map((move) => ({ move, type: "normal" }));
	const tempSimplified: {
		face: string;
		amount: number;
		type: string;
		steps: number[];
	}[] = [];
	const steps = moves.map((move, i) => {
		return {
			move,
			face: move.replaceAll("'", "").replaceAll("2", ""),
			amount: move.includes("'") ? 3 : move.includes("2") ? 2 : 1,
			type: "normal",
			steps: [i],
		};
	});

	// @todo(nick-ng): is the loop necessary?
	let nextSteps = steps.map((step) => step.move).join(" ");
	let previousSteps = "";
	while (previousSteps !== nextSteps) {
		previousSteps = nextSteps;
		steps.sort((a, b) => {
			if (a.move.startsWith("U") && b.move.startsWith("D")) {
				return -1;
			}
			if (a.move.startsWith("D") && b.move.startsWith("U")) {
				return 1;
			}

			if (a.move.startsWith("F") && b.move.startsWith("B")) {
				return -1;
			}
			if (a.move.startsWith("B") && b.move.startsWith("F")) {
				return 1;
			}

			if (a.move.startsWith("R") && b.move.startsWith("L")) {
				return -1;
			}
			if (a.move.startsWith("L") && b.move.startsWith("R")) {
				return 1;
			}

			return 0;
		});

		nextSteps = steps.map((step) => step.move).join(" ");
	}

	steps.forEach((step) => {
		if (tempSimplified.length === 0) {
			tempSimplified.push(step);
			return;
		}

		let lastI = tempSimplified.length - 1;
		for (let j = tempSimplified.length - 1; j >= 0; j--) {
			if (tempSimplified[j].amount !== 0) {
				lastI = j;
				break;
			}
		}

		if (tempSimplified[lastI].face === step.face) {
			tempSimplified[lastI].amount = (tempSimplified[lastI].amount + step.amount) % 4;
			tempSimplified[lastI].type = "cancelled";
			tempSimplified[lastI].steps.push(...step.steps);

			return;
		}

		tempSimplified.push(step);
	});

	const simplified = tempSimplified
		.map((step) => {
			if (step.type === "cancelled") {
				step.steps.forEach((i) => {
					originalMoves[i].type = "cancelled";
				});
			}

			switch (step.amount) {
				case 0: {
					step.steps.forEach((i) => {
						originalMoves[i].type = "gone";
					});
					return { ...step, move: "" };
				}
				case 1: {
					return { ...step, move: `${step.face}` };
				}
				case 2: {
					return { ...step, move: `${step.face}2` };
				}
				case 3: {
					return { ...step, move: `${step.face}'` };
				}
				default:
					{
						console.warn("step", step);
						alert("Invalid move. See console for details");
					}

					return { ...step, move: "" };
			}
		})
		.filter((step) => step.move);
	const simplifiedMoves = simplified.map((step) => step.move);

	return {
		original: originalMoves,
		simplified,
		simplifiedString: simplifiedMoves.join(" "),
		originalCount: moves.length,
		simplifiedCount: simplifiedMoves.length,
	};
};

export const sortAlgs = (a: string, b: string): number => {
	const aMoves = a
		.trim()
		.split(" ")
		.filter((m) => m);
	const bMoves = b
		.trim()
		.split(" ")
		.filter((m) => m);

	if (aMoves.length != bMoves.length) {
		return bMoves.length - aMoves.length;
	}

	return a.localeCompare(b);
};

export const shuffleArray = <T>(arr: T[]): T[] => {
	const temp = arr
		.map((v) => {
			return {
				sortValue: Math.random(),
				v,
			};
		})
		.sort((a, b) => {
			return a.sortValue - b.sortValue;
		})
		.map((t) => {
			return t.v;
		});

	return temp;
};
export const oneCornerSpeffzToLocation = (speffzLetter: string): string => {
	const letter = speffzLetter[0].toLowerCase();
	if (letter && letter in cornerSpeffzLocationMap) {
		return cornerSpeffzLocationMap[<keyof typeof cornerSpeffzLocationMap>letter];
	}

	return "";
};

export const cornerSpeffzToLocation = (speffzLetters: string): string[] => {
	return speffzLetters.split("").map(oneCornerSpeffzToLocation);
};

export const arrayToCsvRow = (items: string[]): string => {
	return items
		.map((i) => {
			const tempI = i.replaceAll("\n", "\\n");
			if (tempI.includes(",")) {
				return `"${tempI.replaceAll('"', '""')}"`;
			}

			return tempI;
		})
		.join(",");
};

export const updateTags = (previousTags: string, tagPrefix: string, newFullTag: string) => {
	const splitTags = previousTags
		.split(";")
		.map((a) => a.trim())
		.filter((a) => a);
	const newTags = splitTags.filter((t) => !t.startsWith(tagPrefix));
	newTags.push(newFullTag);

	return newTags.join("; ");
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export const summariseFlashCards = (
	flashCards: FlashCard[],
	chosenBuffers: Record<string, boolean>
) => {
	const inserts: { [insert: string]: string[] } = {};
	const interchanges: { [interchange: string]: string[] } = {};
	const setups: { [setup: string]: string[] } = {};
	const memoConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
	const commConfidences: { [confidence: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
	const drillSpeedGroups: { seconds: number[]; letters: string[] }[] = [];
	const missingComms: string[] = [];
	const missingMemos: string[] = [];
	const quizAges: {
		letterPair: string;
		lastQuizUnix: number;
		hidden?: boolean;
		isMarker?: boolean;
	}[] = flashCards.toSorted((a, b) => b.lastQuizUnix - a.lastQuizUnix);
	const drillAges: {
		letterPair: string;
		lastDrillUnix: number;
		hidden?: boolean;
		isMarker?: boolean;
	}[] = flashCards.toSorted((a, b) => b.lastDrillUnix - a.lastDrillUnix);
	if (quizAges.length > 0) {
		const nowMs = Date.now();
		const newest = quizAges[0].lastQuizUnix;
		const newestDate = new Date(newest * 1000);
		const oldest = quizAges[quizAges.length - 1].lastQuizUnix;
		const oldestDate = new Date(oldest * 1000);
		const historyMarkers = [
			{ label: "1 Year", unixTimestamp: (nowMs - YEAR_MS) / 1000 },
			{ label: "6 Months", unixTimestamp: (nowMs - 6 * MONTH_MS) / 1000 },
			{ label: "1 Month", unixTimestamp: (nowMs - MONTH_MS) / 1000 },
			{ label: "1 Week", unixTimestamp: (nowMs - WEEK_MS) / 1000 },
			{ label: "1 Day", unixTimestamp: (nowMs - DAY_MS) / 1000 },
			{ label: "1 Hour", unixTimestamp: (nowMs - HOUR_MS) / 1000 },
		];
		for (let i = 0; i < historyMarkers.length; i++) {
			if (oldest < historyMarkers[i].unixTimestamp && newest > historyMarkers[i].unixTimestamp) {
				quizAges.push({
					lastQuizUnix: historyMarkers[i].unixTimestamp,
					letterPair: historyMarkers[i].label,
					isMarker: true,
				});
			}
		}
		quizAges.push({
			lastQuizUnix: oldest - 1,
			letterPair: `${oldestDate.getFullYear()}-${(oldestDate.getMonth() + 1).toString().padStart(2, "0")}-${oldestDate.getDate().toString().padStart(2, "0")}`,
			isMarker: true,
		});
		if (newest * 1000 > nowMs - DAY_MS) {
			quizAges.push({
				lastQuizUnix: quizAges[0].lastQuizUnix + 1,
				letterPair: `${newestDate.getHours()}:${newestDate.getMinutes().toString().padStart(2, "0")}`,
				isMarker: true,
			});
		} else {
			quizAges.push({
				lastQuizUnix: newest + 1,
				letterPair: `${newestDate.getFullYear()}-${(newestDate.getMonth() + 1).toString().padStart(2, "0")}-${newestDate.getDate().toString().padStart(2, "0")}`,
				isMarker: true,
			});
		}

		quizAges.sort((a, b) => {
			const ageDifference = a.lastQuizUnix - b.lastQuizUnix;
			if (ageDifference !== 0) {
				return ageDifference;
			}

			return a.letterPair.localeCompare(b.letterPair);
		});

		for (let i = 1; i < quizAges.length - 1; i++) {
			if (quizAges[i].isMarker && quizAges[i - 1].isMarker && quizAges[i + 1].isMarker) {
				quizAges[i].hidden = true;
			}
		}
	}
	if (drillAges.length > 0) {
		const nowMs = Date.now();
		const newest = drillAges[0].lastDrillUnix;
		const newestDate = new Date(newest * 1000);
		const oldest = drillAges[drillAges.length - 1].lastDrillUnix;
		const oldestDate = new Date(oldest * 1000);
		const historyMarkers = [
			{ label: "1 Year", unixTimestamp: (nowMs - YEAR_MS) / 1000 },
			{ label: "6 Months", unixTimestamp: (nowMs - 6 * MONTH_MS) / 1000 },
			{ label: "1 Month", unixTimestamp: (nowMs - MONTH_MS) / 1000 },
			{ label: "1 Week", unixTimestamp: (nowMs - WEEK_MS) / 1000 },
			{ label: "1 Day", unixTimestamp: (nowMs - DAY_MS) / 1000 },
			{ label: "1 Hour", unixTimestamp: (nowMs - HOUR_MS) / 1000 },
		];
		for (let i = 0; i < historyMarkers.length; i++) {
			if (oldest < historyMarkers[i].unixTimestamp && newest > historyMarkers[i].unixTimestamp) {
				drillAges.push({
					lastDrillUnix: historyMarkers[i].unixTimestamp,
					letterPair: historyMarkers[i].label,
					isMarker: true,
				});
			}
		}
		drillAges.push({
			lastDrillUnix: oldest - 1,
			letterPair: `${oldestDate.getFullYear()}-${(oldestDate.getMonth() + 1).toString().padStart(2, "0")}-${oldestDate.getDate().toString().padStart(2, "0")}`,
			isMarker: true,
		});
		if (newest * 1000 > nowMs - DAY_MS) {
			drillAges.push({
				lastDrillUnix: drillAges[0].lastDrillUnix + 1,
				letterPair: `${newestDate.getHours()}:${newestDate.getMinutes().toString().padStart(2, "0")}`,
				isMarker: true,
			});
		} else {
			drillAges.push({
				lastDrillUnix: newest + 1,
				letterPair: `${newestDate.getFullYear()}-${(newestDate.getMonth() + 1).toString().padStart(2, "0")}-${newestDate.getDate().toString().padStart(2, "0")}`,
				isMarker: true,
			});
		}

		drillAges.sort((a, b) => {
			const ageDifference = a.lastDrillUnix - b.lastDrillUnix;
			if (ageDifference !== 0) {
				return ageDifference;
			}

			return a.letterPair.localeCompare(b.letterPair);
		});

		for (let i = 1; i < drillAges.length - 1; i++) {
			if (drillAges[i].isMarker && drillAges[i - 1].isMarker && drillAges[i + 1].isMarker) {
				drillAges[i].hidden = true;
			}
		}
	}
	let total = 0;
	for (let letter0 = 0; letter0 < 24; letter0++) {
		for (let letter1 = 0; letter1 < 24; letter1++) {
			const letterPair = `${String.fromCharCode(97 + letter0)}${String.fromCharCode(97 + letter1)}`;
			if (!getTrueKeys(chosenBuffers).some((buf) => isSpeffzPairValid(letterPair, buf))) {
				continue;
			}

			total += 1;
			const flashCard = flashCards.find((fc) => fc.letterPair === letterPair);
			if (flashCard) {
				if (!flashCard.memo) {
					missingMemos.push(letterPair);
				}

				if (!memoConfidences[flashCard.memoConfidence]) {
					memoConfidences[flashCard.memoConfidence] = [];
				}

				if (flashCard.memo) {
					memoConfidences[flashCard.memoConfidence].push(letterPair);
				}

				if (!commConfidences[flashCard.commConfidence]) {
					commConfidences[flashCard.commConfidence] = [];
				}

				if (flashCard.commutator) {
					commConfidences[flashCard.commConfidence].push(letterPair);
				} else {
					missingComms.push(letterPair);
				}

				const { insert, interchange, setup } = parseCommutator(flashCard.commutator);
				if (!insert) {
					continue;
				}

				if (!inserts[insert]) {
					inserts[insert] = [];
				}
				inserts[insert].push(flashCard.letterPair);

				if (!interchanges[interchange]) {
					interchanges[interchange] = [];
				}
				interchanges[interchange].push(flashCard.letterPair);

				if (!setups[setup]) {
					setups[setup] = [];
				}
				setups[setup].push(flashCard.letterPair);
			} else {
				missingMemos.push(letterPair);
				if (isSpeffzPairValid(letterPair, "UFR")) {
					missingComms.push(letterPair);
				}
			}
		}
	}

	flashCards.sort((a, b) => {
		if (a.drillTimeMs !== b.drillTimeMs) {
			return a.drillTimeMs - b.drillTimeMs;
		}

		return a.letterPair.localeCompare(b.letterPair);
	});
	const drillTimesMs = flashCards.map((fc) => fc.drillTimeMs);
	const fastestDrillMs = Math.min(...drillTimesMs);
	const slowestDrillMs = Math.max(...drillTimesMs);
	const drillDifferenceMs = slowestDrillMs - fastestDrillMs;
	const drillStep = drillDifferenceMs / 10;
	for (let i = 0; i < 9; i++) {
		const low = fastestDrillMs + i * drillStep;
		const high = fastestDrillMs + (i + 1) * drillStep;
		const flashCardGroup = flashCards.filter(
			(fc) => Math.floor(fc.drillTimeMs) >= low && Math.floor(fc.drillTimeMs) < high
		);

		const times = {
			seconds: [
				Math.min(...flashCardGroup.map((fc) => fc.drillTimeMs)) / 1000,
				Math.max(...flashCardGroup.map((fc) => fc.drillTimeMs)) / 1000,
			],
			letters: flashCardGroup.map((fc) => fc.letterPair),
		};
		drillSpeedGroups.push(times);
	}

	const low = fastestDrillMs + 9 * drillStep;
	const flashCardGroup = flashCards.filter((fc) => Math.floor(fc.drillTimeMs) >= low);
	const times = {
		seconds: [
			Math.min(...flashCardGroup.map((fc) => fc.drillTimeMs)) / 1000,
			Math.max(...flashCardGroup.map((fc) => fc.drillTimeMs)) / 1000,
		],
		letters: flashCardGroup.map((fc) => fc.letterPair),
	};
	drillSpeedGroups.push(times);

	return {
		inserts,
		interchanges,
		setups,
		memoConfidences,
		missingMemos,
		commConfidences,
		drillSpeedGroups,
		missingComms,
		quizAges,
		drillAges,
		total,
	};
};
