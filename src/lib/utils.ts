export const joinUrl = (...args: string[]) => {
	return args
		.map((fragment, i) => {
			if (typeof fragment !== 'string') {
				return '';
			}

			let newFragment = fragment.replace(/\/+$/, '');

			if (i !== 0) {
				newFragment = newFragment.replace(/^\/+/, '');
			}

			return newFragment;
		})
		.filter((f) => f.length > 0)
		.join('/');
};

export const joinServerPath = (...args: string[]) => {
	return joinUrl(import.meta.env.VITE_SERVER_URL, ...args);
};
