// ==UserScript==
// @name        cstimer.net adjustments
// @namespace   Violentmonkey Scripts
// @match       https://cstimer.net/
// @grant       none
// @version     1.18
// @author      https://github.com/nick-ng
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

	const savedData = getDevData()[localStorageKey] || {
		sessions: {},
		lastNSolvesMax: 50
	};

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

	const updateSaveData = (newSaveData) => {
		const nowMinusOneDayMs = Date.now() - oneDayMs;
		Object.keys(newSaveData).reduce((prev, key) => {
			// remove all expired session data before saving
			if (nowMinusOneDayMs <= newSaveData[key].startOfDay) {
				prev[key] = newSaveData[key];
			}

			return prev;
		}, {});

		const prevDevData = getDevData();
		localStorage.setItem(
			'devData',
			JSON.stringify({
				...prevDevData,
				[localStorageKey]: newSaveData
			})
		);
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
						solveStats.hundredths = minutes * 6000 + Math.floor(seconds * 100);
					} else {
						const seconds = parseFloat(parts[0]);
						solveStats.hundredths = Math.floor(seconds * 100);
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

			updateSaveData(savedData);
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

	const getRecentSolvesStats = () => {
		const todayStartId = getSessionStats().countAdjustment;
		const solvesStats = getSolveStats({
			maxCount: savedData.lastNSolvesMax,
			minId: todayStartId
		});

		const lastNSolves = solvesStats.slice(0, savedData.lastNSolvesMax);

		const todaySolves = solvesStats.filter((s) => s.id > todayStartId);

		let bestAo5 = null;
		let bestAo12 = null;
		for (let i = 0; i < todaySolves.length; i++) {
			if (i >= 4) {
				const fiveSolves = todaySolves.slice(i - 4, i + 1);
				const ao5 = calculateAoN(fiveSolves);
				if (ao5 < bestAo5 || typeof bestAo5 !== 'number') {
					bestAo5 = ao5;
				}
			}

			if (i >= 11) {
				const fiveSolves = todaySolves.slice(i - 11, i + 1);
				const ao12 = calculateAoN(fiveSolves);
				if (ao12 < bestAo12 || typeof bestAo12 !== 'number') {
					bestAo12 = ao12;
				}
			}
		}

		return {
			lastNSolves: {
				count: lastNSolves.length,
				dnfs: lastNSolves.filter((s) => s.dnf).length
			},
			todaySolves: {
				maxHundredths: todaySolves.length > 0 && Math.max(...todaySolves.map((s) => s.hundredths)),
				minHundredths: todaySolves.length > 0 && Math.min(...todaySolves.map((s) => s.hundredths)),
				aoToday: calculateAoN(todaySolves.filter((s) => !s.dnf)),
				bestAo5,
				bestAo12
			}
		};
	};

	const createDisplay = () => {
		displayElements.displayRoot = makeElement(
			'div',
			'stats',
			`
			<div id="today_root_${ID}">
				<div style="text-align:center;">Today</div>
				<div>
					<div>Solves</div>
					<div id="today_count_${ID}">0</div>
				</div>
				<div id="aotoday_row_${ID}">
					<div>AoToday</div>
					<div id="aotoday_${ID}"></div>
				</div>
				<div id="best_today_row_${ID}">
					<div>Best</div>
					<div id="best_today_${ID}"></div>
				</div>
				<div id="best_ao5_today_row_${ID}">
					<div>Best Ao5</div>
					<div id="best_ao5_today_${ID}"></div>
				</div>
				<div id="best_ao12_today_row_${ID}">
					<div>Best Ao12</div>
					<div id="best_ao12_today_${ID}"></div>
				</div>
			</div>
			<div id="last_n_root_${ID}">
				<div id="dnf_rate_${ID}"></div>
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
					bottom: 0px;
					background-color: #00000088;
					left: calc(100%);
					border: solid 1px #333333;
					padding: 0;
					display: flex;
					flex-direction: column;
					align-items: stretch;
					justify-content: flex-start;
					gap: 0;
					font-size: 16pt;
					width: max-content;
					text-align: left;
					box-sizing: border-box;
				}

				#display_root_${ID} > div {
					padding: 5px;
					box-sizing: content-box;
				}

				#display_root_${ID} > div:not(:last-child) {
					border-bottom: solid 1px #333333;
				}

				#display_root_${ID} *[role=button] {
					cursor: pointer;
				}

				#display_root_${ID} hr {
					border-color: #333333;
				}

				#today_root_${ID} > div:not(:first-child) {
					display: flex;
					flex-direction: row;
					gap: 10px;
					justify-content: space-between;
				}
			`,
			{ id: `style_${ID}` }
		);

		return true;
	};

	const updateDisplay = () => {
		const todayCount = getCurrentSolveIndex() - getSessionStats().countAdjustment;
		const stats = getRecentSolvesStats();

		getElement('today_count').textContent = todayCount;
		if (typeof stats.todaySolves.aoToday === 'number') {
			getElement('aotoday_row').setAttribute('style', '');
			getElement('aotoday').textContent = formatHundredths(stats.todaySolves.aoToday);
		} else {
			getElement('aotoday_row').setAttribute('style', 'display: none;');
		}
		getElement('best_today').textContent = formatHundredths(stats.todaySolves.minHundredths);
		getElement('best_ao5_today').textContent = formatHundredths(stats.todaySolves.bestAo5);
		getElement('best_ao12_today').textContent = formatHundredths(stats.todaySolves.bestAo12);

		if (stats.lastNSolves.count === 0) {
			getElement('dnf_rate').textContent = '0/0';
		} else {
			getElement('dnf_rate').textContent =
				`${stats.lastNSolves.count - stats.lastNSolves.dnfs}/${stats.lastNSolves.count} (${((1 - stats.lastNSolves.dnfs / stats.lastNSolves.count) * 100).toFixed(0)}%)`;
		}
	};

	setTimeout(updateDisplay, 2000);

	const createDisplayIntervalIdKey = `${ID}-create-display-interval`;
	if (window[createDisplayIntervalIdKey]) {
		clearInterval(window[createDisplayIntervalIdKey]);
	}

	window[createDisplayIntervalIdKey] = setInterval(() => {
		if (createDisplay()) {
			clearInterval(window[createDisplayIntervalIdKey]);
			updateDisplay();
		}
	}, 100);

	window.addEventListener('keyup', () => {
		setTimeout(updateDisplay, 500);
	});
	window.addEventListener('mouseup', () => {
		setTimeout(updateDisplay, 500);
	});
})();
