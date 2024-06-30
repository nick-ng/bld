// ==UserScript==
// @name        cstimer.net adjustments
// @namespace   Violentmonkey Scripts
// @match       https://cstimer.net/
// @grant       none
// @version     1.24
// @author      https://bld.pux.one
// @description aaaa
// @downloadURL https://bld.pux.one/cstimer-violentmonkey.js
// @run-at      document-idle

// ==/UserScript==
(() => {
	const ID = '32bc11b3-3759-4192-8ae1-cae4a4043685';
	const oneDayMs = 1000 * 60 * 60 * 24;
	const localStorageKey = `local-storage-${ID}`;
	const displayElements = {};

	const formatHundredths = (hundredths) => {
		if (typeof hundredths !== 'number') {
			return '-';
		}

		// 10 days in hundredths
		if (hundredths > oneDayMs) {
			return 'DNF';
		}

		if (hundredths > 6000) {
			const minutes = Math.floor(hundredths / 6000);
			const seconds = (hundredths % 6000) / 100;

			return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
		}

		const seconds = hundredths / 100;
		return seconds.toFixed(2);
	};

	const calculateAoN = (unsortedSolves) => {
		const sortedSolves = [...unsortedSolves].sort((a, b) => a.hundredths - b.hundredths);
		if (sortedSolves.length >= 3) {
			return (
				sortedSolves.slice(1, sortedSolves.length - 1).reduce((prev, curr) => {
					return prev + curr.hundredths;
				}, 0) /
				(sortedSolves.length - 2)
			);
		}

		return null;
	};

	const getDevData = () => {
		try {
			return JSON.parse(localStorage.getItem('devData')) || {};
		} catch (e) {
			console.warn('invalid saved data', e);
		}

		return {};
	};

	const getSavedData = () => {
		const temp = getDevData()[localStorageKey];

		if (temp?.sessions) {
			return temp;
		}

		return {
			sessions: {},
			lastNSolvesMax: 50
		};
	};

	let savedData = getSavedData();

	const getCurrentSolveIndex = () => {
		const a = [...document.querySelectorAll('div#stats tbody tr')];
		const b = a.map((aa) => {
			const d = aa.getAttribute('data');
			return d ? parseInt(d, 10) : -1;
		});

		return Math.max(...b);
	};

	const getCurrentSessionName = () => {
		const tempEl = document.querySelector('#stats select');
		return tempEl.options[tempEl.selectedIndex].textContent;
	};

	const getStartOfTodayMs = () => {
		const today = new Date();
		today.setHours(4, 0, 0, 0); // 4 AM

		return today.valueOf();
	};

	const updateSavedData = (partialData) => {
		const newData = {
			...getSavedData(),
			...partialData
		};

		const nowMinusOneDayMs = Date.now() - oneDayMs;
		newData.sessions = Object.keys(newData.sessions).reduce((prev, key) => {
			// add all unexpired expired session back
			if (nowMinusOneDayMs <= newData.sessions[key].startOfDay) {
				prev[key] = newData.sessions[key];
			}

			return prev;
		}, {});

		const prevDevData = getDevData();
		localStorage.setItem(
			'devData',
			JSON.stringify({
				...prevDevData,
				[localStorageKey]: newData
			})
		);

		savedData = newData;
	};

	/**
	 * most recent solve at the start of the array
	 */
	const getSolveStats = ({ minId, maxCount }) => {
		const statsTable = document.querySelector('#stats .stattl table');

		const statsRows = [...statsTable.querySelectorAll('tr')];
		const solvesStats = [];
		let counter = 0;
		for (let i = 0; i < statsRows.length; i++) {
			const rowDataAttr = statsRows[i].getAttribute('data');
			if (rowDataAttr) {
				const solveId = parseInt(rowDataAttr, 10);

				const solveStats = {
					id: solveId,
					dnf: false,
					plus2: false,
					hundredths: -1
				};

				const cellsContents = [...statsRows[i].children].map((el) => el.textContent);

				if (cellsContents.length === 1) {
					continue;
				}

				const [solveNumberString, time] = cellsContents;

				if (!solveNumberString.match(/^\*?\d/)) {
					continue;
				}

				if (time.toUpperCase() === 'DNF') {
					solveStats.dnf = true;
					solveStats.hundredths = Infinity;
				} else {
					const parts = time.split(/[:+]/g);
					if (time.includes(':')) {
						const minutes = parseInt(parts[0], 10);
						const seconds = parseFloat(parts[1]);
						solveStats.hundredths = minutes * 6000 + Math.round(seconds * 100);
					} else {
						const seconds = parseFloat(parts[0]);
						solveStats.hundredths = Math.round(seconds * 100);
					}

					if (time.includes('+')) {
						solveStats.plus2 = true;
					}
				}

				solvesStats.push(solveStats);

				counter++;

				const enoughCounter = typeof maxCount !== 'number' || counter >= maxCount;
				// I think this gets an extra solve
				const enoughId = typeof minId !== 'number' || minId < solveId;
				if (enoughCounter && enoughId) {
					break;
				}
			}
		}

		return solvesStats.sort((a, b) => b.id - a.id);
	};

	//@todo: this is a bit weird
	const getSessionStats = (inputSessionName = null) => {
		const sessionName = inputSessionName || getCurrentSessionName();

		if (!savedData.sessions[sessionName]) {
			savedData.sessions[sessionName] = {
				countAdjustment: getCurrentSolveIndex(),
				startOfDay: 0
			};
		}

		if (Date.now() - oneDayMs > savedData.sessions[sessionName].startOfDay) {
			savedData.sessions[sessionName] = {
				countAdjustment: getCurrentSolveIndex(),
				startOfDay: getStartOfTodayMs()
			};

			updateSavedData(savedData);
		}

		const solveCount = getCurrentSolveIndex() - savedData.sessions[sessionName].countAdjustment;

		return {
			...savedData.sessions[sessionName],
			solveCount
		};
	};

	/**
	 * @returns {HTMLElement | null}
	 */
	const makeElement = (tag, parent, innerHTML, attributes) => {
		if (attributes?.id) {
			const el = document.getElementById(attributes.id);

			if (el) {
				el.remove();
			}
		}

		let parentEl = parent;
		if (!parent) {
			parentEl = document.querySelector('body');
		} else if (typeof parent === 'string') {
			parentEl = document.getElementById(parent);
		}

		if (!parentEl) {
			return null;
		}

		const tempElement = document.createElement(tag);
		if (innerHTML) {
			tempElement.innerHTML = innerHTML;
		}

		parentEl.appendChild(tempElement);

		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => {
				tempElement.setAttribute(key, value);
			});
		}
		return tempElement;
	};

	const getElement = (partialId) => {
		return document.getElementById(`${partialId}_${ID}`);
	};

	const resolveValue = (value) => {
		if (typeof value === 'function') {
			return value();
		}

		return value;
	};

	const updateElement = (partialId, value, isInnerHTML = false) => {
		const el = getElement(partialId);

		if (!el) {
			return;
		}

		if (isInnerHTML) {
			el.innerHTML = resolveValue(value);
		} else {
			el.textContent = resolveValue(value);
		}
	};

	const getAgregateStats = (solves) => {
		let bestAo5 = null;
		let bestAo12 = null;

		for (let i = 0; i < solves.length; i++) {
			if (i >= 4) {
				const fiveSolves = solves.slice(i - 4, i + 1);
				const ao5 = calculateAoN(fiveSolves);
				if (ao5 < bestAo5 || typeof bestAo5 !== 'number') {
					bestAo5 = ao5;
				}
			}

			if (i >= 11) {
				const fiveSolves = solves.slice(i - 11, i + 1);
				const ao12 = calculateAoN(fiveSolves);
				if (ao12 < bestAo12 || typeof bestAo12 !== 'number') {
					bestAo12 = ao12;
				}
			}
		}

		return {
			maxHundredths: solves.length > 0 && Math.max(...solves.map((s) => s.hundredths)),
			minHundredths: solves.length > 0 && Math.min(...solves.map((s) => s.hundredths)),
			aoNonDNF: calculateAoN(solves.filter((s) => !s.dnf)),
			bestAo5,
			bestAo12
		};
	};

	const getRecentSolvesStats = () => {
		const todayStartId = getSessionStats().countAdjustment;
		const solvesStats = getSolveStats({
			maxCount: getSavedData().lastNSolvesMax,
			minId: todayStartId
		});

		const todaySolves = solvesStats.filter((s) => s.id > todayStartId);
		const lastNSolves = solvesStats.slice(0, getSavedData().lastNSolvesMax);

		let bestAo5 = null;
		let bestAo12 = null;
		for (let i = 0; i < todaySolves.length; i++) {
			if (i >= 4) {
				const tempSolves = todaySolves.slice(i - 4, i + 1);
				const ao5 = calculateAoN(tempSolves);
				if (ao5 < bestAo5 || typeof bestAo5 !== 'number') {
					bestAo5 = ao5;
				}
			}

			if (i >= 11) {
				const tempSolves = todaySolves.slice(i - 11, i + 1);
				const ao12 = calculateAoN(tempSolves);
				if (ao12 < bestAo12 || typeof bestAo12 !== 'number') {
					bestAo12 = ao12;
				}
			}
		}

		return {
			lastNSolves: {
				...getAgregateStats(lastNSolves),
				dnfs: lastNSolves.filter((s) => s.dnf).length,
				solves: lastNSolves
			},
			todaySolves: {
				...getAgregateStats(todaySolves),
				dnfs: todaySolves.filter((s) => s.dnf).length,
				solves: todaySolves
			}
		};
	};

	const createDisplay = () => {
		displayElements.displayRoot = makeElement(
			'div',
			null,
			`
			<div id="today_root_${ID}">
				<div style="text-align:center;">Today</div>
				<div class="solves_row_${ID}">
					<div>Solves:</div><div id="today_count_${ID}" class="number">0</div>
				</div>
				<div class="grid_${ID}">
					<div>Average:</div><div id="today_aonondnf_${ID}" class="number"></div>
					<div>Best:</div><div id="today_best_${ID}" class="number"></div>
					<div>Best Ao5:</div><div id="today_best_ao5_${ID}" class="number"></div>
					<div>Best Ao12:</div><div id="today_best_ao12_${ID}" class="number"></div>
				</div>
			</div>
			<div id="last_n_root_${ID}">
				<div id="last_n_max_button_${ID}" style="text-align:center;" role="button">Last <span id="last_n_max_${ID}">1</span> Solves</div>
				<div class="solves_row_${ID}">
					<div>Solves:</div><div id="last_n_count_${ID}" class="number"></div>
				</div>
				<div class="grid_${ID}">
					<div>Average:</div><div id="last_n_aonondnf_${ID}" class="number"></div>
						<div>Best:</div><div id="last_n_best_${ID}" class="number"></div>
						<div>Best Ao5:</div><div id="last_n_best_ao5_${ID}" class="number"></div>
						<div>Best Ao12:</div><div id="last_n_best_ao12_${ID}" class="number"></div>
				</div>
			</div>
			`,
			{
				id: `display_root_${ID}`
			}
		);
		if (!displayElements.displayRoot) {
			return false;
		}

		displayElements.style = makeElement(
			'style',
			null,
			`
				#display_root_${ID} {
					position: absolute;
					bottom: 5px;
					left: 0;
					right: 0;
					margin-left: auto;
					margin-right: auto;
					background-color: #00000088;
					border: solid 1px #333333;
					padding: 0;
					display: flex;
					flex-direction: row;
					align-items: stretch;
					justify-content: flex-start;
					gap: 0;
					font-size: 14pt;
					width: max-content;
					text-align: left;
					box-sizing: border-box;
				}

				#display_root_${ID} > div {
					padding: 5px;
					box-sizing: content-box;
				}

				#display_root_${ID} > div:not(:last-child) {
					border-right: solid 1px #333333;
				}

				#display_root_${ID} *[role=button] {
					cursor: pointer;
				}

				#display_root_${ID} hr {
					border-color: #333333;
				}

				.grid_${ID} {
					display: grid;
					grid-template-columns: auto auto;
					gap: 0 8px;
				}

				.grid_${ID} .number {
					text-align: right;
				}

				.solves_row_${ID} {
					display: flex;
					gap: 8px;
					flex-direction: row;
					justify-content: space-between;
				}
			`,
			{ id: `style_${ID}` }
		);

		displayElements.lastNStyle = makeElement('style', null, '', { id: `last_n_style_${ID}` });

		if (!getElement('last_n_max_button')) {
			return false;
		}

		return true;
	};

	const updateAgregateStats = (prefix, groupStats) => {
		if (groupStats.solves.length === 0) {
			updateElement(`${prefix}_count`, '0/0');
		} else {
			updateElement(
				`${prefix}_count`,
				`${groupStats.solves.length - groupStats.dnfs}/${groupStats.solves.length} (${((1 - groupStats.dnfs / groupStats.solves.length) * 100).toFixed(0)}%)`
			);
		}

		updateElement(`${prefix}_aonondnf`, formatHundredths(groupStats.aoNonDNF));
		updateElement(`${prefix}_best`, formatHundredths(groupStats.minHundredths));
		updateElement(`${prefix}_best_ao5`, formatHundredths(groupStats.bestAo5));
		updateElement(`${prefix}_best_ao12`, formatHundredths(groupStats.bestAo12));
	};

	const updateDisplay = () => {
		const stats = getRecentSolvesStats();

		updateAgregateStats('today', stats.todaySolves);
		updateAgregateStats('last_n', stats.lastNSolves);

		updateElement('last_n_max', () => getSavedData().lastNSolvesMax);

		if (stats.lastNSolves.solves.length > 0) {
			const lastNSolvesSelector = stats.lastNSolves.solves
				.map((s) => `tr[data="${s.id}"] td`)
				.join(', ');

			displayElements.lastNStyle.textContent = `
				tr[data] td {
					opacity: 0.7;
				}

				${lastNSolvesSelector} {
					opacity: 1;
				}`;
		}
	};

	const createDisplayIntervalIdKey = `${ID}-create-display-interval`;
	if (window[createDisplayIntervalIdKey]) {
		clearInterval(window[createDisplayIntervalIdKey]);
	}

	window[createDisplayIntervalIdKey] = setInterval(() => {
		if (createDisplay()) {
			clearInterval(window[createDisplayIntervalIdKey]);
			updateDisplay();

			const lastNButton = getElement('last_n_max_button');

			lastNButton.addEventListener('click', () => {
				const newValue = parseInt(prompt('Enter the number of solves.'));

				if (!isNaN(newValue)) {
					updateSavedData({
						lastNSolvesMax: newValue
					});

					setTimeout(updateDisplay, 500);
				}
			});
		}
	}, 100);

	const mutationObserver = new MutationObserver(updateDisplay);
	mutationObserver.observe(document.querySelector('#stats table'), {
		childList: true,
		subtree: true
	});

	setTimeout(updateDisplay, 2000);
})();
