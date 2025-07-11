import { ACCESS_TOKEN_STORE_KEY, PASSWORD_STORE_KEY, USERNAME_STORE_KEY } from "$lib/constants";

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

export const authFetch = (url: string, init?: RequestInit, alwaysSend: boolean = false) => {
	const newInit = { ...init };
	const { headers, isValid, previousAccessToken } = addCredentialsToHeaders(init?.headers);

	if (isValid) {
		newInit.headers = headers;
	} else if (!alwaysSend) {
		return Promise.resolve();
	}

	const response = fetch(url, { mode: "cors", ...newInit });

	response.then((r) => {
		if (r.ok) {
			const newAccessToken = r.headers.get("X-Access-Token");
			if (newAccessToken && previousAccessToken !== newAccessToken) {
				localStorage.setItem(ACCESS_TOKEN_STORE_KEY, newAccessToken);
			}
		}
	});

	return response;
};

const UBL = ["a", "e", "r"];
const UFR = ["c", "j", "m"];
const SAME_PIECES = [
	UBL,
	["b", "n", "q"],
	UFR,
	["d", "f", "i"],
	["g", "l", "u"],
	["h", "s", "x"],
	["k", "p", "v"],
	["o", "t", "w"]
];

export const isTwist = (letterPair: string) => {
	const letters = letterPair.split("");
	if (letters.length !== 2) {
		return false;
	}

	if (letters[0] === letters[1]) {
		// repeated letter means odd number of swaps
		return false;
	}

	for (let i = 0; i < SAME_PIECES.length; i++) {
		if (SAME_PIECES[i].includes(letters[0]) && SAME_PIECES[i].includes(letters[1])) {
			return true;
		}
	}

	return false;
};

export const isOP = (letterPair: string) => {
	const letters = letterPair.split("");

	for (let i = 0; i < letters.length; i++) {
		if (UBL.includes(letters[i])) {
			return false;
		}
	}

	return true;
};

export const hasOPBuffer = (letterPair: string) => {
	const letters = letterPair.split("");

	for (let i = 0; i < letters.length; i++) {
		if (UBL.includes(letters[i])) {
			return true;
		}
	}

	return false;
};

export const is3Style = (letterPair: string) => {
	const letters = letterPair.split("");

	for (let i = 0; i < letters.length; i++) {
		if (UFR.includes(letters[i])) {
			return false;
		}
	}

	return true;
};

export const has3StyleBuffer = (letterPair: string) => {
	const letters = letterPair.split("");

	for (let i = 0; i < letters.length; i++) {
		if (UFR.includes(letters[i])) {
			return true;
		}
	}

	return false;
};

export const isOrozco = (letterPair: string) => {
	if (letterPair.toLowerCase().includes("b")) {
		return is3Style(letterPair);
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

	const normalisedCommutator = commutator
		? `${regripEmoji}${normaliseCommutator(conjugatePlusCommutator)}`
		: rawCommutator;

	return {
		rawCommutator,
		normalisedCommutator,
		commutator,
		conjugatePlusCommutator,
		setup,
		insert,
		interchange
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

export const getAllLetterPairs = (includeTwists: boolean) => {
	const allLetterPairs = [];

	const codePointOffset = 97;
	for (let i = 0; i < 24; i++) {
		for (let j = 0; j < 24; j++) {
			const firstLetter = String.fromCodePoint(codePointOffset + i);
			const secondLetter = String.fromCodePoint(codePointOffset + j);
			const letterPair = `${firstLetter}${secondLetter}`;
			if (!includeTwists && isTwist(letterPair)) {
				continue;
			}

			allLetterPairs.push(letterPair);
		}
	}

	return allLetterPairs;
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

const bagRandomByDay = (itemSet: string[], startDate: Date, forDate: Date) => {
	// 10: get number of days
	const difference = forDate.valueOf() - startDate.valueOf();
	// ms -> seconds -> minutes -> hours -> days
	const differenceDays = Math.floor(difference / (1000 * 60 * 60 * 24));

	console.log("differenceDays", differenceDays);

	// @todo(nick-ng): make a "bag" with all items in itemSet and shuffle
	// @todo(nick-ng): remove items from bag and put into subsets
	// @todo(nick-ng): when you have constructed the nth subset, return that subset
	// @todo(nick-ng): if there are not enough items in the bag to construct the nth subset, make a new bag

	// 20: shuffle set
	// let counter = 0;
	// do {
	// 	const seedDate = startDate;
	// 	const seed =
	// 		seedDate.getDate() * 100000 + (seedDate.getMonth() + 1) * 1000 + seedDate.getFullYear();
	// 	console.log("seed", seed);
	// 	const randomSequence = getRandomSequence(seed, itemSet.length);
	// 	const temp = [...itemSet]
	// 		.map((item, i) => ({
	// 			item,
	// 			shuffleValue: randomSequence[i]
	// 		}))
	// 		.sort((a, b) => {
	// 			return a.shuffleValue - b.shuffleValue;
	// 		});

	// 	counter++;
	// } while (counter < 10000);

	// return tempSet;
	return [];
};

export const getLettersOfTheDay = (
	date: Date,
	exclude3StyleBuffer: boolean,
	excludeOPBuffer: boolean
) => {
	console.log(date, exclude3StyleBuffer, excludeOPBuffer);

	const startDate = new Date("2025-01-19");

	console.log("startDate", startDate);

	const realLetterPairs = getAllLetterPairs(false).filter((lp) => {
		if (lp[0] === lp[1]) {
			return false;
		}

		if (exclude3StyleBuffer && has3StyleBuffer(lp)) {
			return false;
		}

		if (excludeOPBuffer && hasOPBuffer(lp)) {
			return false;
		}

		return true;
	});

	return bagRandomByDay(realLetterPairs, startDate, date);
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

export const oneCornerSpeffzToLocation = (speffzLetter: string) => {
	const letter = speffzLetter[0].toLowerCase();
	if (letter && letter in cornerSpeffzLocationMap) {
		return cornerSpeffzLocationMap[<keyof typeof cornerSpeffzLocationMap>letter];
	}

	return "";
};

export const cornerSpeffzToLocation = (speffzLetters: string) => {
	return speffzLetters.split("").map(oneCornerSpeffzToLocation);
};
