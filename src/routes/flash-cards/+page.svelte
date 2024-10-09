<script lang="ts">
	import { USERNAME_STORE_KEY, PASSWORD_STORE_KEY } from "$lib/constants";

	let showLogin = false;
	let username = "";
	let password = "";
</script>

<div class="max-w-prose mx-auto">
	<h1 class="text-center">Flash Cards</h1>
	<ul>
		<li class="mt-1">
			<a class="text-xl leading-none py-2 button-default text-center" href="/flash-cards/quiz"
				>Quiz</a
			>
		</li>
		<li class="mt-1">
			<a class="text-xl leading-none py-2 button-default text-center" href="/flash-cards/edit"
				>Edit</a
			>
		</li>
	</ul>
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
			</tabel>
		</form>
	</details>
</div>
