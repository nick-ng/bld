<script lang="ts">
	import { USERNAME_STORE_KEY, PASSWORD_STORE_KEY } from "$lib/constants";
	import AllFlashCards from "$lib/components/all-flash-cards.svelte";

	let showLogin = $state(false);
	let username = $state("");
	let password = $state("");
</script>

<AllFlashCards />
<div class="mx-auto max-w-prose">
	<details class="mx-auto max-w-prose" bind:open={showLogin}>
		<summary>Login</summary>
		<form
			class="text-center"
			onsubmit={(event) => {
				event.preventDefault();

				localStorage.setItem(USERNAME_STORE_KEY, username);
				localStorage.setItem(PASSWORD_STORE_KEY, password);

				showLogin = false;
			}}
		>
			<table>
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
								bind:value={username}
							/>
						</td>
					</tr>
					<tr>
						<td class="text-right">
							<label for="homepagePassword">Password:</label>
						</td>
						<td>
							<input type="password" id="homepagePassword" name="password" bind:value={password} />
						</td>
					</tr>
					<tr>
						<td colspan="2"><button class="w-full">Save</button></td>
					</tr>
				</tbody>
			</table>
		</form>
	</details>
</div>
