<script lang="ts">
	import type { FiftyTwoCard } from "$lib/types";
	import Card52 from "$lib/components/card-52.svelte";
	import { onMount } from "svelte";
	import { fiftyTwoStore } from "$lib/stores/fifty-two";
	import { getCardProperties, shuffleArray, msToMinAndSec } from "$lib/utils";

	const SUITS = ["c", "d", "h", "s"];
	const dragThreshold = 0.3;
	let currentCardEl: HTMLDivElement | null = $state(null);
	let nextCardEl: HTMLDivElement | null = $state(null);
	let touchStartX = $state(0);
	let screenWidth = $state(0);
	let currentMove = $state(0);
	let currentLeft = $state(3);
	let unopacity = $state(0);
	let recallRank = $state(-1);
	let recallSuit = $state("");
	let recallIndex = $state(-1);
	let recallProperties = $derived(getCardProperties({ rank: recallRank, suit: recallSuit }));
	let results = $derived(
		$fiftyTwoStore.deck.map((card, i) => {
			const recalledCard = $fiftyTwoStore.recall[i];
			if (!recalledCard) {
				return {
					rank: card.rank,
					suit: card.suit,
					recalledRank: -1,
					recalledSuid: "",
					isSuccess: false,
				};
			}

			return {
				rank: card.rank,
				suit: card.suit,
				recalledRank: recalledCard.rank,
				recalledSuit: recalledCard.suit,
				isSuccess: recalledCard.rank === card.rank && recalledCard.suit === card.suit,
			};
		})
	);
	let firstWrongIndex = $derived(results.findIndex((r) => !r.isSuccess));

	const shuffleDeck = () => {
		const newDeck: FiftyTwoCard[] = [];
		for (let i = 0; i < 13; i++) {
			for (const suit of SUITS) {
				newDeck.push({
					rank: i + 1,
					suit,
				});
			}
		}

		$fiftyTwoStore.deck = shuffleArray(newDeck);
		$fiftyTwoStore.currentIndex = 0;
		$fiftyTwoStore.state = "memo";
		$fiftyTwoStore.memoStartMs = Date.now();
		$fiftyTwoStore.recall = [];
	};

	const getCursorXY = (e: TouchEvent | MouseEvent) => {
		// check MouseEvent because TouchEvent only exists on touch devices
		if (e instanceof MouseEvent) {
			return {
				x: e.screenX,
				y: e.screenY,
				clientX: e.clientX,
				clientY: e.clientY,
			};
		}

		let totalX = 0;
		let totalY = 0;
		let totalClientX = 0;
		let totalClientY = 0;

		for (let i = 0; i < e.touches.length; i++) {
			totalX += e.touches[i].screenX;
			totalY += e.touches[i].screenY;
			totalClientX += e.touches[i].clientX;
			totalClientY += e.touches[i].clientY;
		}

		return {
			x: totalX / e.touches.length,
			y: totalY / e.touches.length,
			clientX: totalClientX / e.touches.length,
			clientY: totalClientY / e.touches.length,
		};
	};

	const handleDrag = (event: TouchEvent) => {
		const touchCoords = getCursorXY(event);
		switch (event.type) {
			case "touchstart": {
				const documentRects = document.body.getClientRects();
				screenWidth = documentRects[0].width;
				touchStartX = touchCoords.x;
				break;
			}
			case "touchmove": {
				currentMove = touchCoords.x - touchStartX;
				currentLeft = 3 + currentMove;
				if (currentMove > screenWidth * dragThreshold) {
					unopacity = 80;
				} else if (currentMove < -screenWidth * dragThreshold) {
					unopacity = 30;
				} else {
					unopacity = 0;
				}
				break;
			}
			case "touchcancel": //fallthrough
			case "touchend": {
				if (
					currentMove > screenWidth * dragThreshold &&
					$fiftyTwoStore.currentIndex < $fiftyTwoStore.deck.length
				) {
					$fiftyTwoStore.currentIndex = $fiftyTwoStore.currentIndex + 1;
				} else if (currentMove < -screenWidth * dragThreshold && $fiftyTwoStore.currentIndex > 0) {
					$fiftyTwoStore.currentIndex = $fiftyTwoStore.currentIndex - 1;
				}

				touchStartX = 0;
				currentMove = 0;
				currentLeft = 3;
				unopacity = 0;
				break;
			}
			default: {
				console.debug("event type not handled:", event.type);
			}
		}
	};

	onMount(() => {
		addEventListener("touchstart", handleDrag);
		addEventListener("touchmove", handleDrag);
		addEventListener("touchend", handleDrag);
		addEventListener("touchcancel", handleDrag);

		return () => {
			removeEventListener("touchstart", handleDrag);
			removeEventListener("touchmove", handleDrag);
			removeEventListener("touchend", handleDrag);
			removeEventListener("touchcancel", handleDrag);
		};
	});
</script>

<div class="overflow-x-hidden">
	{#if !$fiftyTwoStore.isLoaded}
		Loading...
	{:else if $fiftyTwoStore.deck.length === 0 || $fiftyTwoStore.state === "standby"}
		<div class="m-1">
			<button
				type="button"
				onclick={() => {
					shuffleDeck();
				}}>Shuffle and begin</button
			>
		</div>
	{:else if $fiftyTwoStore.state === "done"}
		<div class="m-1">
			<div class="my-1">Results</div>
			{#if true}
				<table>
					<tbody>
						<tr>
							<td class="border border-gray-600 px-1 py-0.5">Correct</td>
							<td class="border border-gray-600 px-1 py-0.5 text-right"
								>{results.filter((r) => r.isSuccess).length}/{results.length}</td
							>
						</tr>
						<tr>
							<td class="border border-gray-600 px-1 py-0.5">Until Wrong</td>
							<td class="border border-gray-600 px-1 py-0.5 text-right"
								>{firstWrongIndex >= 0 ? firstWrongIndex : "-"}</td
							>
						</tr>
						<tr>
							<td class="border border-gray-600 px-1 py-0.5">Memo Time</td>
							<td class="border border-gray-600 px-1 py-0.5 text-right"
								>{msToMinAndSec($fiftyTwoStore.recallStartMs - $fiftyTwoStore.memoStartMs)}</td
							>
						</tr>
						<tr>
							<td class="border border-gray-600 px-1 py-0.5">Recall Time</td>
							<td class="border border-gray-600 px-1 py-0.5 text-right"
								>{msToMinAndSec($fiftyTwoStore.doneMs - $fiftyTwoStore.recallStartMs)}</td
							>
						</tr>
						<tr>
							<td class="border border-gray-600 px-1 py-0.5">Total Time</td>
							<td class="border border-gray-600 px-1 py-0.5 text-right"
								>{msToMinAndSec($fiftyTwoStore.doneMs - $fiftyTwoStore.memoStartMs)}</td
							>
						</tr>
					</tbody>
				</table>
			{/if}
			<div class="flex flex-row justify-center gap-1">
				<table>
					<thead>
						<tr>
							<th class="border border-gray-600 p-0.5 text-right">#</th>
							<th class="border border-gray-600 p-0.5 text-right">Card</th>
							<th class="border border-gray-600 p-0.5 text-right">Recall</th>
						</tr>
					</thead>
					<tbody>
						{#each $fiftyTwoStore.deck.slice(0, 26) as card, i (`${card.rank}-${card.suit}`)}
							{@const cardProperties = getCardProperties(card)}
							{@const recalledCard = $fiftyTwoStore.recall[i]}
							<tr
								class={card.rank === recalledCard?.rank && card.suit === recalledCard?.suit
									? ""
									: "bg-yellow-200"}
							>
								<td class="border border-gray-600 p-0.5 text-right">{i + 1}</td>
								<td class="border border-gray-600 p-0.5 text-right">
									<span style={`color: ${cardProperties.colorHex};`}
										>{cardProperties.displayRank}{cardProperties.symbol}</span
									>
								</td>
								<td class="border border-gray-600 p-0.5 text-right">
									{#if recalledCard}
										{@const recalledProperties = getCardProperties(recalledCard)}
										<span style={`color: ${recalledProperties.colorHex};`}
											>{recalledProperties.displayRank}{recalledProperties.symbol}</span
										>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<table>
					<thead>
						<tr>
							<th class="border border-gray-600 p-0.5 text-right">#</th>
							<th class="border border-gray-600 p-0.5 text-right">Card</th>
							<th class="border border-gray-600 p-0.5 text-right">Recall</th>
						</tr>
					</thead>
					<tbody>
						{#each $fiftyTwoStore.deck.slice(26, 52) as card, i (`${card.rank}-${card.suit}`)}
							{@const cardProperties = getCardProperties(card)}
							{@const recalledCard = $fiftyTwoStore.recall[i + 26]}
							<tr
								class={card.rank === recalledCard?.rank && card.suit === recalledCard?.suit
									? ""
									: "bg-yellow-200"}
							>
								<td class="border border-gray-600 p-0.5 text-right">{i + 27}</td>
								<td class="border border-gray-600 p-0.5 text-right">
									<span style={`color: ${cardProperties.colorHex};`}
										>{cardProperties.displayRank}{cardProperties.symbol}</span
									>
								</td>
								<td class="border border-gray-600 p-0.5 text-right">
									{#if recalledCard}
										{@const recalledProperties = getCardProperties(recalledCard)}
										<span style={`color: ${recalledProperties.colorHex};`}
											>{recalledProperties.displayRank}{recalledProperties.symbol}</span
										>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<button
				type="button"
				onclick={() => {
					$fiftyTwoStore.state = "standby";
				}}>Done</button
			>
		</div>
	{:else if $fiftyTwoStore.state === "recall"}
		<div class="relative">
			<div class="m-1">Recalling</div>
			<div class="sticky top-1 m-1 flex flex-row gap-1">
				<div class="grid grow grid-cols-3 gap-0.5">
					{#each [13, -1, 10, 11, 12, 7, 8, 9, 4, 5, 6, 1, 2, 3] as rank (rank)}
						<button
							class={`px-4 py-4 ${rank === -1 ? "col-span-2" : ""} ${recallRank !== -1 && recallRank === rank ? "bg-blue-300 dark:bg-blue-700" : ""}`}
							type="button"
							onclick={() => {
								recallRank = rank;
								if (rank === -1) {
									recallSuit = "";
								}
							}}
						>
							{#if rank === -1}
								Clear
							{:else}
								{getCardProperties({ rank, suit: "c" }).displayRank}
							{/if}
						</button>
					{/each}
				</div>
				<div class="grid grow grid-cols-1 gap-0.5">
					{#each SUITS as suit (suit)}
						<button
							class={`px-4 py-4 ${recallSuit === suit ? "bg-blue-300 dark:bg-blue-700" : ""}`}
							type="button"
							onclick={() => {
								recallSuit = suit;
							}}>{getCardProperties({ rank: 1, suit }).symbol}</button
						>
					{/each}
				</div>
				<div class="grid grow auto-rows-[1fr] grid-cols-1 gap-0.5">
					<button
						class="p-4"
						type="button"
						onclick={() => {
							if ($fiftyTwoStore.recall.length >= $fiftyTwoStore.deck.length) {
								return;
							}

							$fiftyTwoStore.recall = [...$fiftyTwoStore.recall, { rank: -1, suit: "" }];
						}}
					>
						Skip
					</button>
					<button
						class="p-4"
						type="button"
						onclick={() => {
							const newCard = { rank: recallRank, suit: recallSuit };
							if (recallIndex !== -1) {
								const temp = [...$fiftyTwoStore.recall];
								temp[recallIndex] = newCard;
								$fiftyTwoStore.recall = temp;
							} else if ($fiftyTwoStore.recall.length < $fiftyTwoStore.deck.length) {
								$fiftyTwoStore.recall = [...$fiftyTwoStore.recall, newCard];
							}

							recallIndex = -1;
							recallRank = -1;
							recallSuit = "";
						}}
					>
						<div style={`color: ${recallProperties.colorHex};`}>
							{recallProperties.displayRank}
						</div>
						<div>
							{recallProperties.symbol}
						</div>
					</button>
				</div>
			</div>
			<div class="col-auto col-span-1 m-1 mb-4 grid grid-cols-6 gap-0.5">
				{#each $fiftyTwoStore.recall as recall, i (`${i}-${recall.rank}-${recall.suit}`)}
					{@const cardProperties = getCardProperties(recall)}
					<button
						class={`${recallIndex === i ? "bg-blue-300 dark:bg-blue-700" : ""}`}
						onclick={() => {
							recallIndex = i;
							recallRank = recall.rank;
							recallSuit = recall.suit;
						}}
					>
						<span style={`color: ${cardProperties.colorHex};`}
							>{cardProperties.displayRank}{cardProperties.symbol}</span
						>
					</button>
				{/each}
				{#if recallIndex !== -1 && $fiftyTwoStore.recall.length < $fiftyTwoStore.deck.length}
					<button
						onclick={() => {
							recallIndex = -1;
						}}>Last</button
					>
				{/if}
				<div class="flex items-center justify-center">
					{$fiftyTwoStore.recall.length}/{$fiftyTwoStore.deck.length}
				</div>
			</div>
			<div class="m-1">
				<button
					type="button"
					onclick={() => {
						if (
							$fiftyTwoStore.recall.length < $fiftyTwoStore.deck.length &&
							!confirm(
								`Are you sure? You have only entered ${$fiftyTwoStore.recall.length}/${$fiftyTwoStore.deck.length} cards.`
							)
						) {
							return;
						}

						$fiftyTwoStore.state = "done";
						$fiftyTwoStore.doneMs = Date.now();
					}}>Check</button
				>
			</div>
		</div>
	{:else}
		<div class="m-1 flex flex-row">
			<button
				type="button"
				onclick={() => {
					$fiftyTwoStore.currentIndex = 0;
				}}>⏪</button
			>
			<div class="grow"></div>
			<button
				type="button"
				onclick={() => {
					$fiftyTwoStore.state = "recall";
					$fiftyTwoStore.recallStartMs = Date.now();
				}}>Done</button
			>
		</div>
		<div class="m-1">
			<div
				class="h-1 bg-slate-800 transition-[width]"
				style={`width: ${($fiftyTwoStore.currentIndex / $fiftyTwoStore.deck.length) * 100}%;`}
			></div>
		</div>
		<div class="relative">
			<div class="mx-[3px]" bind:this={nextCardEl}>
				<Card52 card={$fiftyTwoStore.deck[$fiftyTwoStore.currentIndex + 1]} />
			</div>
			{#key `${$fiftyTwoStore.currentIndex}`}
				<div
					class={`absolute top-0 ${touchStartX === 0 ? "transition-[left]" : ""}`}
					style={`left: ${currentLeft}px;`}
					bind:this={currentCardEl}
				>
					<Card52 card={$fiftyTwoStore.deck[$fiftyTwoStore.currentIndex]} {unopacity} />
				</div>
			{/key}
		</div>
	{/if}
</div>
