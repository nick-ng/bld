import type { AuthenticationOptions } from "$lib/types";
import { writable } from "svelte/store";

import { browser } from "$app/environment";
import {
	USERNAME_STORE_KEY,
	PASSWORD_STORE_KEY,
	ACCESS_TOKEN_STORE_KEY,
	ACCESS_TOKEN_EXPIRY_STORE_KEY,
	IS_GUEST_STORE_KEY
} from "$lib/constants";
import { authFetch } from "$lib/utils";

export const authenticationStore = writable<AuthenticationOptions>({
	isUserAuthenticated: false,
	isGuest: false,
	username: "",
	password: "",
	accessToken: "",
	accessTokenExpiry: "0"
});

const updateIfDifferent = (storeKey: string, value?: string) => {
	if (typeof value === "string" && localStorage.getItem(storeKey) !== value) {
		localStorage.setItem(storeKey, value);
	}
};

if (browser) {
	const username = localStorage.getItem(USERNAME_STORE_KEY);
	if (username) {
		authenticationStore.update((prev) => ({
			...prev,
			username
		}));
	}

	const password = localStorage.getItem(PASSWORD_STORE_KEY);
	if (password) {
		authenticationStore.update((prev) => ({
			...prev,
			password
		}));
	}
	console.log("hi");
	const isGuest = localStorage.getItem(IS_GUEST_STORE_KEY)?.toLowerCase() === "yes";
	if (isGuest) {
		authenticationStore.update((prev) => ({
			...prev,
			isGuest: true
		}));
	} else {
		// only check access token if guest is false
		const accessToken = localStorage.getItem(ACCESS_TOKEN_STORE_KEY);
		const accessTokenExpiry = localStorage.getItem(ACCESS_TOKEN_EXPIRY_STORE_KEY) || "0";
		if (accessToken && parseInt(accessTokenExpiry, 10) < Date.now()) {
			console.log("up to date");
			authenticationStore.update((prev) => ({
				...prev,
				accessToken,
				accessTokenExpiry,
				isUserAuthenticated: true
			}));
		} else {
			// try and login
			authFetch("/login").then((res) => {
				console.log("hi2");
				if (res.ok) {
					console.log("ok!", res);
				} else {
					console.log("not ok", res);
				}
			});
		}
	}

	authenticationStore.subscribe((newAuthOptions) => {
		updateIfDifferent(USERNAME_STORE_KEY, newAuthOptions.username);
		updateIfDifferent(PASSWORD_STORE_KEY, newAuthOptions.password);
		updateIfDifferent(ACCESS_TOKEN_STORE_KEY, newAuthOptions.accessToken);
		updateIfDifferent(ACCESS_TOKEN_EXPIRY_STORE_KEY, newAuthOptions.accessTokenExpiry);
		updateIfDifferent(IS_GUEST_STORE_KEY, newAuthOptions.isGuest ? "yes" : "no");
	});
}
