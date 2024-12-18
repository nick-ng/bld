import { ACCESS_TOKEN_STORE_KEY, PASSWORD_STORE_KEY, USERNAME_STORE_KEY } from "$lib/constants";

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
		if (SAME_PIECES[i].includes(letters[0])) {
			if (SAME_PIECES[i].includes(letters[1])) {
				return true;
			}
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

export const is3Style = (letterPair: string) => {
	const letters = letterPair.split("");

	for (let i = 0; i < letters.length; i++) {
		if (UFR.includes(letters[i])) {
			return false;
		}
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

	return {
		rawCommutator,
		normalisedCommutator: commutator ? normaliseCommutator(conjugatePlusCommutator) : rawCommutator,
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
