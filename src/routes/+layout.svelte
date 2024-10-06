<script lang="ts">
	import { page } from "$app/stores";
	import { USERNAME_STORE_KEY, PASSWORD_STORE_KEY } from "$lib/constants";
	import "../app.css";

	let showLogin = false;
	let username = "";
	let password = "";

	$: showNav = ["big-scramble", "clock"].every((a) => $page.route.id !== `/${a}`);
</script>

<svelte:head>
	<title>Blindfolded Cube Resources</title>
</svelte:head>

{#if showNav}
	<div class="flex flex-row mx-2 my-2 gap-2">
		<a class="button-default" href="/flash-cards">Flash Cards</a>
		<a class="button-default" href="/corner-drawer">Corner Drawer</a>
		<a class="button-default" href="/anki-stuff">Anki Stuff</a>
	</div>
{/if}
<div class={showNav ? "mx-1" : ""}>
	<slot />
</div>
<details class="max-w-prose mx-auto" bind:open={showLogin}>
	<summary>Login</summary>
	<form
		class="text-center"
		on:submit={(event) => {
			event.preventDefault();

			localStorage.setItem(USERNAME_STORE_KEY, username);
			localStorage.setItem(PASSWORD_STORE_KEY, password);

			showLogin = false;
		}}
	>
		<tabel>
			<tbody>
				<tr>
					<td class="text-right">
						<label for="homepageUsername">Username:</label>
					</td>
					<td>
						<input type="text" id="homepageUsername" name="username" bind:value={username} />
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
					<td colspan="2"><button class="w-full">Login</button></td>
				</tr>
			</tbody>
		</tabel>
	</form>
</details>
