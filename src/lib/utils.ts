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
	originalHeaders?: Headers
): { headers: Headers; isValid: boolean } => {
	let headers = originalHeaders;
	if (!headers) {
		headers = new Headers();
	}

	const username = localStorage.getItem(USERNAME_STORE_KEY);
	const password = localStorage.getItem(PASSWORD_STORE_KEY);
	if (!username || !password) {
		return {
			headers: headers,
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
