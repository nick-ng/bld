// ==UserScript==
// @name        B L D D B adjustments
// @namespace   Violentmonkey Scripts
// @include     https://blddb.net/corner.html
// @include     https://blddb.net/corner.html?*
// @include     https://blddb.net/edge.html
// @include     https://blddb.net/edge.html?*
// @grant       none
// @version     1.3
// @author      https://bld.pux.one
// @description Show move count of commutators and add a query parameter to search for a letter pair
// @downloadURL https://bld.pux.one/blddb-violentmonkey.js
// @run-at      document-idle
// ==/UserScript==

(async () => {
	const ID = "9ab0171a-e427-4448-9d1b-f34e95a2e887";
	const ELEMENT_CLASS = `pux-${ID}`;

	let inputEl = document.getElementById("cornerinput");
	for (let i = 0; i < 100; i++) {
		inputEl = document.getElementById("cornerinput");
		if (!inputEl) {
			inputEl = document.getElementById("edgeinput");
		}

		if (inputEl) {
			break;
		}

		const wait = (i + 1) * 20;
		console.warn(`couldn't find input element. waiting ${wait} ms`);
		await new Promise((resolve) => {
			setTimeout(resolve, wait);
		});
	}

	const addMoveCount = (counter = 0) => {
		const tbodyEl = document.querySelector("#table tbody");
		if (!tbodyEl && counter < 100) {
			console.log("no table. waiting", (counter + 1) * 200);
			setTimeout(
				() => {
					addMoveCount(counter + 1);
				},
				(counter + 1) * 200
			);

			return;
		}

		const elements = [...document.querySelectorAll(`.${ELEMENT_CLASS}`)];
		for (let i = 0; i < elements.length; i++) {
			elements[i].remove();
		}

		const tds = [...tbodyEl.querySelectorAll("td:nth-child(2)")];
		for (let i = 0; i < tds.length; i++) {
			const tdEl = tds[i];
			const algorithm = tdEl.textContent.split(" ").filter((a) => a);
			let moveCount = 1;
			for (let j = 1; j < algorithm.length; j++) {
				if (["U", "D"].includes(algorithm[j - 1][0]) && ["U", "D"].includes(algorithm[j][0])) {
					// you can do the moves at the same time
				} else {
					moveCount = moveCount + 1;
				}
			}
			const moveCountEl = document.createElement("span");
			moveCountEl.classList.add(ELEMENT_CLASS);
			moveCountEl.innerHTML = `&nbsp;(${moveCount})`;
			tdEl.appendChild(moveCountEl);
		}

		const commTds = [...tbodyEl.querySelectorAll("td:nth-child(3)")];
		const regripTds = [...tbodyEl.querySelectorAll("td:nth-child(4)")];
		for (let i = 0; i < commTds.length; i++) {
			const tdEl = commTds[i];
			const regrip = regripTds[i].textContent.toLocaleLowerCase() || "";
			let regripSymbol = "";
			if (regrip.includes("home grip")) {
				regripSymbol = "";
			} else if (regrip.includes("up")) {
				regripSymbol = "👍 ";
			} else if (regrip.includes("down")) {
				regripSymbol = "👎 ";
			}
			const comm = tdEl.textContent.trim();
			if (comm.length > 0) {
				tdEl.addEventListener("click", async () => {
					navigator.clipboard.writeText(`${regripSymbol}${comm}`);
				});
				const prevStyle = tdEl.getAttribute("style") || "";
				tdEl.setAttribute(
					"style",
					`${prevStyle};cursor: pointer; padding-top: 8px; padding-bottom: 8px;`
				);
			}
		}
	};

	inputEl.addEventListener("input", (event) => {
		if (event.currentTarget.value.length === 3) {
			setTimeout(() => {
				addMoveCount(0);
			}, 300);
		}
	});

	const cornerStyleEl = document.getElementById("cornerstyle");
	if (cornerStyleEl) {
		cornerStyleEl.addEventListener("change", () => {
			setTimeout(() => {
				addMoveCount(0);
			}, 300);
		});
	}

	setTimeout(() => {
		const params = new URLSearchParams(document.location.search);
		const letterPair = params.get("letter-pair");
		if (letterPair) {
			inputEl.value = letterPair;
			window.algSearch();
			setTimeout(() => {
				addMoveCount(0);
			}, 300);
		}
	}, 100);
})();
