import { FLASH_CARD_FILTER_STORE_KEY } from "$lib/constants";

export const setMethodFilters = (hideNon3Style: boolean, hideNonOP: boolean) => {
	const stored = [hideNon3Style, hideNonOP].map((a) => (a ? "t" : "f")).join("");
	localStorage.setItem(FLASH_CARD_FILTER_STORE_KEY, stored);
};

export const getMethodFilters = () => {
	const stored = localStorage.getItem(FLASH_CARD_FILTER_STORE_KEY);
	if (stored) {
		const hideNon3Style = stored[0] === "t";
		const hideNonOP = stored[1] === "t";

		return {
			hideNon3Style,
			hideNonOP,
		};
	}

	return {};
};
