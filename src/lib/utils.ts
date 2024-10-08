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

export const getOperatingSystem = () => {
	if (navigator.userAgent.includes("Win")) {
		return "win";
	}
	if (navigator.userAgent.includes("Mac")) {
		return "mac";
	}
	return "";
};
