import { ACCESS_TOKEN_STORE_KEY, PASSWORD_STORE_KEY, USERNAME_STORE_KEY } from "$lib/constants";
import { optionsStore } from "$lib/stores/options";
import { flashCardStore } from "$lib/stores/flash-cards";
import { quizStore } from "$lib/stores/quiz";
import { parseFlashCard } from "$lib/types";

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
): { headers: Headers; isValid: boolean; previousAccessToken: string | null } => {
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
			optionsStore.update((prevOptions) => ({ ...prevOptions, isUserAuthenticated: true }));
			const newAccessToken = r.headers.get("X-Access-Token");
			if (newAccessToken && previousAccessToken !== newAccessToken) {
				localStorage.setItem(ACCESS_TOKEN_STORE_KEY, newAccessToken);
			}
		}

		return r;
	});

	return response;
};

export const putQuiz = async (letterPair: string, formData: FormData) => {
	// go to next question on next frame
	setTimeout(() => {
		quizStore.update((prevQuiz) => prevQuiz.filter((lp) => lp != letterPair));
	});
	const response = await authFetch(joinServerPath("quiz", letterPair), {
		method: "PUT",
		body: formData
	});
	if (!response) {
		return;
	}

	const responseJson = await response.json();
	const parseResponse = parseFlashCard(responseJson);
	if (parseResponse.isValid) {
		const { data } = parseResponse;
		flashCardStore.update((prevFlashCards) => {
			return {
				...prevFlashCards,
				[data.letterPair]: { ...data, fetchedAtMs: Date.now() }
			};
		});
	} else {
		console.error("wrong", responseJson);
	}
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
		.replaceAll(" ", "")
		.replace(/([ufrdlb])/gi, " $1")
		.replaceAll("[ ", "[")
		.replaceAll(", ", ",")
		.replaceAll(": ", ":")
		.trim();
};

export const commutatorDetails = (rawCommutator: string) => {
	const commutatorResult = rawCommutator.match(/\[[ufrdlb2' ]+,[ufrdlb2' ]+\]/i);

	if (!commutatorResult) {
		// if there isn't a commutator, return the original string
		return {
			rawCommutator,
			normalisedCommutator: rawCommutator,
			commutator: "",
			conjugatePlusCommutator: "",
			setup: "",
			insert: "",
			interchange: ""
		};
	}

	let regripEmoji = "";
	for (let i = 0; i < regripEmojis.length; i++) {
		if (rawCommutator.includes(regripEmojis[i])) {
			regripEmoji = `${regripEmojis[i]} `;
			break;
		}
	}

	const commutator = normaliseCommutator(commutatorResult[0]);
	// there is at least a commutator
	let conjugatePlusCommutator = commutator;
	// check if there is a conjugate as well
	const conjugatePlusCommutatorResult = rawCommutator.match(
		/[ufrdlb2' ]+: ?\[[ufrdlb2' ]+,[ufrdlb2' ]+\]/i
	);
	let setup = "";
	if (conjugatePlusCommutatorResult) {
		conjugatePlusCommutator = normaliseCommutator(conjugatePlusCommutatorResult[0]);
		const temp = conjugatePlusCommutator.split(":");
		setup = temp[0].trim();
	}

	const temp = commutator
		.replaceAll("[", "")
		.replaceAll("]", "")
		.split(",")
		.map((a) => a.trim());
	let insert = temp[0];
	let interchange = temp[1];
	if (temp[0].match(/^[ufrdlb][2']*$/i)) {
		interchange = temp[0];
		insert = temp[1];
	}

	let normalisedCommutator = commutator
		? `${normaliseCommutator(conjugatePlusCommutator)}`
		: rawCommutator;
	if (normalisedCommutator[0] !== "[") {
		normalisedCommutator = `[${normalisedCommutator}]`;
	}

	return {
		rawCommutator,
		normalisedCommutator,
		commutator,
		conjugatePlusCommutator,
		setup,
		insert,
		interchange,
		regripEmoji
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

const leitnerDecks: number[][] = [];
for (let i = 0; i < 10; i++) {
	leitnerDecks.push([i % 10, (i + 2) % 10, (i + 5) % 10, (i + 9) % 10]);
}
console.log("leitnerDecks", leitnerDecks);
export const leitnerSessionToDeckList = (session: number) => {
	let tempSession = session;
	if (session > 9) {
		tempSession = session % 10;
	}

	const deckList = [];

	for (let i = 0; i < leitnerDecks.length; i++) {
		if (leitnerDecks[i].includes(i)) {
			deckList.push(i);
		}
	}

	return deckList;
};

export const isLastLeitnerSession = (deck: number[], session: number) => {
	return deck[deck.length - 1] === session;
};

export const updateTags = (previousTags: string, tagPrefix: string, newFullTag: string) => {
	const splitTags = previousTags.split(";").map((a) => a.trim());
	const newTags = splitTags.filter((t) => !t.startsWith(tagPrefix));
	newTags.push(newFullTag);

	return newTags.join("; ");
};
