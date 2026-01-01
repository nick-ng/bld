<script lang="ts">
	import { authenticationStore, parseAccessTokenExpiry } from "$lib/stores/authentication";
	import { authFetch, joinServerPath } from "$lib/utils";

	let username = $state("");
	let password = $state("");
	let warning = $state("");
</script>

<form
	class="text-center"
	onsubmit={(event) => {
		event.preventDefault();

		if ($authenticationStore.isAuthenticating) {
			return;
		}

		$authenticationStore.username = username;
		$authenticationStore.password = password;
		$authenticationStore.isAuthenticating = true;
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
				warning = "Invalid login";
				password = "";
				$authenticationStore.isAuthenticating = false;
			}
		});
	}}
>
	<table class="border-separate border-spacing-2">
		<tbody>
			<tr>
				<td class="text-right">
					<label for="homepageUsername">Username:</label>
				</td>
				<td>
					<input
						type="text"
						autocomplete="off"
						id="homepageUsername"
						name="username"
						disabled={$authenticationStore.isAuthenticating}
						bind:value={username}
					/>
				</td>
			</tr>
			<tr>
				<td class="text-right">
					<label for="homepagePassword">Password:</label>
				</td>
				<td>
					<input
						type="password"
						id="homepagePassword"
						name="password"
						disabled={$authenticationStore.isAuthenticating}
						bind:value={password}
					/>
				</td>
			</tr>
			<tr> </tr>
		</tbody>
	</table>
	<div class="flex flex-row gap-2">
		<button
			type="button"
			disabled={$authenticationStore.isAuthenticating}
			onclick={() => {
				$authenticationStore.isGuest = true;
			}}>Guest</button
		>
		<button disabled={$authenticationStore.isAuthenticating}>Login</button>
	</div>
	{#if warning}
		<p>{warning}</p>
	{/if}
</form>
