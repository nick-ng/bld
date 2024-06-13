// ==UserScript==
// @name        cstimer.net adjustments
// @namespace   Violentmonkey Scripts
// @match       https://cstimer.net/
// @grant       none
// @version     1.17
// @author      https://github.com/nick-ng
// @description aaaa
// @downloadURL https://bld.pux.one/cstimer-violentmonkey.js
// @run-at      document-idle

// ==/UserScript==
(() => {
	const ID = '32bc11b3-3759-4192-8ae1-cae4a4043685';
	const oneDayMs = 86_400_000;
	const localStorageKey = `local-storage-${ID}`;
	const displayElements = {};
	const stats = {
		lastNSolves: {
			count: 0,
			dnfs: 0
		}
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

		return savedData.sessions[sessionName];
	};

	/**
	 * @returns {HTMLElement | null}
	 */
	const makeElement = (tag, parent, text, attributes) => {
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
		if (text) {
			tempElement.textContent = text;
		}

		parentEl.appendChild(tempElement);

		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => {
				tempElement.setAttribute(key, value);
			});
		}
		return tempElement;
	};

	const makeEventHandlers = () => {};

	const updateLastNSolves = () => {
		const statsTable = document.querySelector('#stats .stattl table');

		const statsRows = [...statsTable.querySelectorAll('tr')];
		let counter = 0;
		let dnfs = 0;
		let attempts = 0;
		for (let i = 0; i < statsRows.length; i++) {
			if (statsRows[i]?.children) {
				const cellsContents = [...statsRows[i].children].map((el) => el.textContent);

				if (cellsContents.length === 1) {
					continue;
				}

				const [solveNumberString, time] = cellsContents;

				if (!solveNumberString.match(/^\*?\d/)) {
					continue;
				}

				attempts++;
				if (time.toUpperCase() === 'DNF') {
					dnfs++;
				}

				counter++;
				if (counter >= savedData.lastNSolvesMax) {
					break;
				}
			}
		}

		stats.lastNSolves.count = attempts;
		stats.lastNSolves.dnfs = dnfs;
	};

	const createDisplay = () => {
		displayElements.displayRoot = makeElement('div', 'stats', null, {
			id: `display_root_${ID}`
		});
		if (!displayElements.displayRoot) {
			return false;
		}

		displayElements.todayRow = makeElement('div', displayElements.displayRoot, null, {
			id: `today_row_${ID}`
		});

		displayElements.todayToday = makeElement('div', displayElements.todayRow, 'Today:', {
			id: `today_today_${ID}`
		});

		displayElements.todayCount = makeElement('div', displayElements.todayRow, '0', {
			id: `today_count_${ID}`
		});

		displayElements.dnfRate = makeElement('div', displayElements.displayRoot, '', {
			id: `dnf_rate_${ID}`
		});

		displayElements.style = makeElement(
			'style',
			null,
			`
				#display_root_${ID} {
				position: absolute;
				bottom: 0;
				background-color: #00000088;
				left: calc(100%);
				border: solid 1px #333333;
				padding: 5px;
				display: flex;
				flex-direction: column;
				align-items: stretch;
				justify-content: flex-start;
				gap: 5px;
				font-size: 16pt;
				width: max-content;
				text-align: left;
				}

				#display_root_${ID} *[role=button] {
					cursor: pointer;
				}

				#today_row_${ID} {
					display: flex;
					flex-direction: row;
					gap: 5px;
					justify-content: space-between;
				}
			`,
			{ id: `style_${ID}` }
		);

		return true;
	};

	const updateDisplay = () => {
		const todayCount = getCurrentSolveIndex() - getSessionStats().countAdjustment;
		updateLastNSolves();

		displayElements.todayCount.textContent = `${todayCount}`;

		if (stats.lastNSolves.count === 0) {
			displayElements.dnfRate.textContent = '0/0';
		} else {
			displayElements.dnfRate.textContent = `${stats.lastNSolves.count - stats.lastNSolves.dnfs}/${stats.lastNSolves.count} (${((1 - stats.lastNSolves.dnfs / stats.lastNSolves.count) * 100).toFixed(0)}%)`;
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
			makeEventHandlers();
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
