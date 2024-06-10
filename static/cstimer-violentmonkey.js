// ==UserScript==
// @name        cstimer.net adjustments
// @namespace   Violentmonkey Scripts
// @match       https://cstimer.net/
// @grant       none
// @version     1.14
// @author      https://github.com/nick-ng
// @description aaaa
// @downloadURL https://bld.pux.one/cstimer-violentmonkey.js
// @run-at      document-idle

// ==/UserScript==
(() => {
	const ID = '32bc11b3-3759-4192-8ae1-cae4a4043685';

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

	const getCurrentNumber = () => {
		const a = [...document.querySelectorAll('div#stats tbody tr')];
		const b = a.map((aa) => {
			const d = aa.getAttribute('data');
			return d ? parseInt(d, 10) : -1;
		});

		return Math.max(...b);
	};

	const displayElements = {};
	const stats = {
		session: {
			countAdjustment: 0,
			count: 0
		},
		lastNSolves: {
			max: 50,
			count: 0,
			dnfs: 0
		}
	};

	const makeEventHandlers = () => {
		stats.session.countAdjustment = getCurrentNumber();

		displayElements.sessionCount.addEventListener('click', (event) => {
			if (event.shiftKey) {
				const newValue = prompt('Enter new value');

				stats.session.countAdjustment = getCurrentNumber() - newValue;
			} else {
				stats.session.countAdjustment = getCurrentNumber();
			}

			updateDisplay();
		});

		window.setCount = (newValue = -12) => {
			stats.session.countAdjustment = getCurrentNumber() - newValue;
		};
	};

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
				if (counter >= stats.lastNSolves.max) {
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

		displayElements.sessionCount = makeElement('div', displayElements.displayRoot, 'Today: 0', {
			id: `session_count_${ID}`,
			role: 'button'
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
			`,
			{ id: `style_${ID}` }
		);

		return true;
	};

	const updateDisplay = () => {
		stats.session.count = getCurrentNumber() - stats.session.countAdjustment;
		updateLastNSolves();

		displayElements.sessionCount.textContent = `Today: ${stats.session.count}`;

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
})();
