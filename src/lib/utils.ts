import { ACCESS_TOKEN_STORE_KEY, PASSWORD_STORE_KEY, USERNAME_STORE_KEY } from "$lib/constants";
import { optionsStore } from "$lib/stores/options";

const RANDOM_LIMIT = 1_000_000;
const regripEmojis = ["👍", "👎"];

export const getRandomSequence = (seed: number, count: number) => {
	const randomNumbers: number[] = [];
	for (let i = 0; i < count; i++) {
		const temp = Math.floor(Math.abs((Math.sin(seed + i) * RANDOM_LIMIT) % RANDOM_LIMIT));

		randomNumbers.push(temp);
	}

	return randomNumbers;
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
			previousAccessToken: null
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
		previousAccessToken: accessToken
	};
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
				isUserAuthenticated: true
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

export const isTwist = (letterPair: string, samePieces: string[][]) => {
	const letters = letterPair.split("");
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
export const hydrateAlgorithms = (rawAlg: string) => {
	const hydratedAlg = rawAlg
		.replaceAll(/<jb-perm>/gi, jbPerm)
		.replaceAll(/<op-swap>/gi, opSwap)
		.replaceAll(/<left jb-perm>/gi, leftJbPerm)
		.replaceAll(/<ljb-perm>/gi, leftJbPerm)
		.replaceAll(/<t-perm>/gi, tPerm);

	return hydratedAlg;
};

// @todo(nick-ng): handle cube rotations (x y z)
export const parseCommutator = (rawCommutator: string) => {
	const hydratedCommutator = hydrateAlgorithms(rawCommutator);
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
			normalisedCommutator: conjugatePlusCommutator,
			commutator,
			conjugatePlusCommutator,
			setup,
			insert,
			interchange,
			regripEmoji,
			expansion: [
				setup,
				temp[0],
				temp[1],
				reverseMoves(temp[0]),
				reverseMoves(temp[1]),
				reverseMoves(setup)
			]
				.filter((a) => a)
				.join(" ")
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
			normalisedCommutator: conjugatePlusCommutator,
			commutator,
			conjugatePlusCommutator,
			setup,
			insert,
			interchange: interchange2,
			expansion: [
				setup,
				interchange,
				insert,
				interchange2,
				reverseMoves(insert),
				interchange,
				reverseMoves(setup)
			]
				.filter((a) => a)
				.join(" ")
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
			normalisedCommutator: `[${setup}:${algorithm}]`,
			commutator: "",
			conjugatePlusCommutator: "",
			setup,
			insert: "",
			interchange: "",
			expansion: [setup, algorithm, reverseMoves(setup)].filter((a) => a).join(" ")
		};
	}

	return {
		rawCommutator,
		normalisedCommutator: rawCommutator,
		commutator: "",
		conjugatePlusCommutator: "",
		setup: "",
		insert: "",
		interchange: "",
		expansion: hydratedCommutator
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
			steps: [i]
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
		simplifiedCount: simplifiedMoves.length
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
				v
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

const cornerSpeffzLocationMap = {
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
	z: "DBL"
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
