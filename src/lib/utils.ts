import { PASSWORD_STORE_KEY, USERNAME_STORE_KEY } from "$lib/constants";

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
): { headers: Headers; isValid: boolean } => {
	const headers = originalHeaders ? new Headers(originalHeaders) : new Headers();

	const username = localStorage.getItem(USERNAME_STORE_KEY);
	const password = localStorage.getItem(PASSWORD_STORE_KEY);
	if (!username || !password) {
		return {
			headers,
			isValid: false
		};
	}

	headers.append("x-username", username);
	headers.append("x-password", password);

	return {
		headers: headers,
		isValid: true
	};
};

export const authFetch = (url: string, init?: RequestInit, alwaysSend: boolean = false) => {
	const newInit = { ...init };
	const { headers, isValid } = addCredentialsToHeaders(init?.headers);

	if (isValid) {
		newInit.headers = headers;
	} else if (!alwaysSend) {
		return Promise.resolve();
	}

	return fetch(url, newInit);
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
