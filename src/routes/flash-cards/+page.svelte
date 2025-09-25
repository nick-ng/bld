<script lang="ts">
	import { page } from "$app/state";
	import { USERNAME_STORE_KEY, PASSWORD_STORE_KEY } from "$lib/constants";
	import FlashCard from "$lib/components/flash-card.svelte";
	import AllFlashCards from "$lib/components/all-flash-cards.svelte";

	let letterPair = $derived(page.url.searchParams.get("lp"));
	let flashCardType = $derived(page.url.searchParams.get("t") || "corner");
	let showLogin = $state(false);
	let username = $state("");
	let password = $state("");
</script>

{#if typeof letterPair === "string" && letterPair.length === 2}
	<FlashCard
		{letterPair}
		{flashCardType}
		showCorners
		showMemo
		showCommutator
		showImage
		showInverseLink
	/>
	<div class="mx-auto mt-1 flex max-w-prose flex-row justify-between gap-8">
		<button
			class="flex-grow"
			onclick={() => {
				history.back();
			}}>Back</button
		>
		<a
			class="like-button block flex-grow"
			href={`/flash-cards/edit?t=${flashCardType}&lp=${letterPair}`}>Edit</a
		>
	</div>
{:else}
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
								<input
									type="password"
									id="homepagePassword"
									name="password"
									bind:value={password}
								/>
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
{/if}
