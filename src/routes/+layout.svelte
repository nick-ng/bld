<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import { page } from "$app/state";
	import { optionsStore } from "$lib/stores/options";
	import { authenticationStore } from "$lib/stores/authentication";
	import "../app.css";

	import Login from "$lib/components/login.svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	let showNav = $derived(["big-scramble", "clock"].every((a) => page.route.id !== `/${a}`));
	let currentFlashCardType = $derived(
		page.url.searchParams.get("t") || $optionsStore.defaultFlashCardType
	);
	let showLogin = $derived(
		!$authenticationStore.isUserAuthenticated && !$authenticationStore.isGuest
	);

	onMount(() => {});
</script>

<svelte:head>
	<title>Blindfolded Cube Resources</title>
</svelte:head>

{#if showNav}
	<div class="m-1 flex flex-row items-start gap-2">
		<a class="like-button" href={`/flash-cards?t=${currentFlashCardType}`}>Browse</a>
		<a class="like-button" href="/quiz">Study</a>
		<a class="like-button" href="/flash-cards/summary">Stats</a>
		<div class="grow"></div>
		<a class="like-button" href="/settings">Settings</a>
		{#if !showLogin}
			<button
				onclick={() => {
					$authenticationStore.isUserAuthenticated = false;
					$authenticationStore.isGuest = false;
					$authenticationStore.username = "";
					$authenticationStore.password = "";
					$authenticationStore.accessToken = "";
				}}>Logout</button
			>
		{/if}
	</div>
{/if}
<div class={showNav ? "mx-1" : ""}>
	{#if showLogin}
		<div class="mx-auto max-w-prose">
			<h2>Login</h2>
			<Login />
		</div>
	{:else}
		{@render children?.()}
	{/if}
</div>
