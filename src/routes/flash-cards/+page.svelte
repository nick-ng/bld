<script lang="ts">
	import { USERNAME_STORE_KEY, PASSWORD_STORE_KEY } from "$lib/constants";
	// import { optionsStore } from "$lib/stores/options";
	// import { getAllLetterPairs, getLettersOfTheDay } from "$lib/utils";

	let showLogin = false;
	let username = "";
	let password = "";

	// @todo(nick-ng): get letter pairs of the day
	// number of letter pairs
	// one set of letter pairs for the entire day
	// no duplicate letter pairs until all letter pairs have been used

	// $: lettersOfTheDay = getLettersOfTheDay(
	// 	new Date(),
	// 	$optionsStore.hideNon3Style,
	// 	$optionsStore.hideNonOP
	// );
</script>

<div class="max-w-prose mx-auto">
	<h1 class="text-center">Flash Cards</h1>
	<ul>
		<li class="mt-1">
			<a class="text-xl leading-none py-2 button-default text-center" href="/quiz">Quiz</a>
		</li>
		<li class="mt-1">
			<a class="text-xl leading-none py-2 button-default text-center" href="/flash-cards/summary"
				>Summary</a
			>
		</li>
		<li class="mt-1">
			<a class="text-xl leading-none py-2 button-default text-center" href="/flash-cards/edit"
				>Edit</a
			>
		</li>
	</ul>
	<!-- <h2 class="text-center">Letter Pairs of the Day</h2>
	<details class="max-w-prose mx-auto">
		<summary>Options</summary>
		<table>
			<tbody>
				<tr>
					<td>
						<label for="flash-card-home-non-3-style">Exclude Non-3-Style Pairs</label>
					</td>
					<td class="pl-2">
						<input
							id="flash-card-home-non-3-style"
							type="checkbox"
							bind:checked={$optionsStore.hideNon3Style}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="flash-card-home-non-3-style">Exclude Non-OP Pairs</label>
					</td>
					<td class="pl-2">
						<input
							id="flash-card-home-non-3-style"
							type="checkbox"
							bind:checked={$optionsStore.hideNonOP}
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</details>
	<table>
		<thead>
			<tr>
				<th>Pair</th>
				<th>Commutator</th>
				<th>Edit</th>
			</tr>
		</thead>
		<tbody>
			{#each lettersOfTheDay as letterPair}
				<tr>
					<td class="uppercase">{letterPair}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<hr class="my-1" /> -->
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
