<script lang="ts">
	import Card52 from "$lib/components/card-52.svelte";
	import { onMount } from "svelte";

	const dragThreshold = 0.3;
	let currentCardEl: HTMLDivElement | null = $state(null);
	let nextCardEl: HTMLDivElement | null = $state(null);
	let touchStartX = $state(0);
	let screenWidth = $state(0);
	let currentMove = $state(0);
	let currentLeft = $state(3);
	let unopacity = $state(0);
	let currentCardRank = $state(2);

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
				} else {
					unopacity = 0;
				}
				break;
			}
			case "touchcancel": //fallthrough
			case "touchend": {
				if (currentMove > screenWidth * dragThreshold) {
					currentCardRank = currentCardRank + 1;
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

<div class="relative overflow-x-hidden">
	<div class="mx-[3px]" bind:this={nextCardEl}>
		<Card52 rank={`${currentCardRank + 1}`} suit={(currentCardRank + 1) % 2 ? "c" : "h"} />
	</div>
	{#key `${currentCardRank}`}
		<div
			class={`absolute top-0 ${touchStartX === 0 ? "transition-[left]" : ""}`}
			style={`left: ${currentLeft}px;`}
			bind:this={currentCardEl}
		>
			<Card52 rank={`${currentCardRank}`} suit={currentCardRank % 2 ? "c" : "h"} {unopacity} />
		</div>
	{/key}
</div>
