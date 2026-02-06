import type { AuthenticationOptions } from "$lib/types";
import { writable } from "svelte/store";

import { browser } from "$app/environment";
import {
	USERNAME_STORE_KEY,
	PASSWORD_STORE_KEY,
	ACCESS_TOKEN_STORE_KEY,
	IS_GUEST_STORE_KEY,
} from "$lib/constants";
import { authFetch, joinServerPath } from "$lib/utils";

export const authenticationStore = writable<AuthenticationOptions>({
	isUserAuthenticated: false,
	isGuest: false,
	username: "",
	password: "",
	accessToken: "",
	accessTokenExpiry: 0,
	isAuthenticating: false,
});

const updateIfDifferent = (storeKey: string, value?: string) => {
	if (typeof value === "string" && localStorage.getItem(storeKey) !== value) {
		localStorage.setItem(storeKey, value);
	}
};

export const parseAccessTokenExpiry = (accessToken?: string | null) => {
	if (typeof accessToken !== "string") {
		return 0;
	}

	const accessTokenExpiry = parseInt(accessToken.split(":")[0] || "0", 10) * 1000;
	return accessTokenExpiry;
};

if (browser) {
	const username = localStorage.getItem(USERNAME_STORE_KEY);
	if (username) {
		authenticationStore.update((prev) => ({
			...prev,
			username,
		}));
	}

	const password = localStorage.getItem(PASSWORD_STORE_KEY);
	if (password) {
		authenticationStore.update((prev) => ({
			...prev,
			password,
		}));
	}
	const isGuest = localStorage.getItem(IS_GUEST_STORE_KEY)?.toLowerCase() === "yes";
	if (isGuest) {
		authenticationStore.update((prev) => ({
			...prev,
			isGuest: true,
			isUserAuthenticated: false,
		}));
	} else {
		// only check access token if guest is false
		const accessToken = localStorage.getItem(ACCESS_TOKEN_STORE_KEY) || "";
		const accessTokenExpiry = parseAccessTokenExpiry(accessToken);
		if (accessToken && accessTokenExpiry < Date.now()) {
			authenticationStore.update((prev) => ({
				...prev,
				accessToken,
				accessTokenExpiry,
				isUserAuthenticated: true,
			}));
		} else {
			// try and login
			authenticationStore.update((prev) => ({
				...prev,
				isAuthenticating: true,
			}));
			authFetch(joinServerPath("/login"), {
				method: "POST",
			}).then((res) => {
				if (res.ok) {
					const accessToken = res.headers.get("x-access-token");
					const accessTokenExpiry = parseAccessTokenExpiry(accessToken);
					if (accessToken && accessTokenExpiry) {
						authenticationStore.update((prev) => ({
							...prev,
							accessToken,
							accessTokenExpiry,
							isUserAuthenticated: true,
							isAuthenticating: false,
						}));
					}
				} else {
					console.error("error during login", res);
					authenticationStore.update((prev) => ({
						...prev,
						isAuthenticating: false,
					}));
				}
			});
		}
	}

	authenticationStore.subscribe((newAuthOptions) => {
		updateIfDifferent(USERNAME_STORE_KEY, newAuthOptions.username);
		updateIfDifferent(PASSWORD_STORE_KEY, newAuthOptions.password);
		updateIfDifferent(ACCESS_TOKEN_STORE_KEY, newAuthOptions.accessToken);
		updateIfDifferent(IS_GUEST_STORE_KEY, newAuthOptions.isGuest ? "yes" : "no");
	});
}
