/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			screens: {
				"can-hover": { raw: "(hover: hover)" },
				"cannot-hover": { raw: "(hover: none)" },
			},
			maxWidth: {
				prose2: "130ch",
			},
			width: {
				prose: "65ch",
				prose2: "130ch",
			},
			flexBasis: {
				prose: "65ch",
				prose2: "130ch",
			},
			fontFamily: {
				good: '"Comic Sans MS", sans-serif',
			},
			spacing: {
				"full-1": "calc(100% + 0.25rem)",
				"full-1.5": "calc(100% + 0.375rem)",
				"full-2": "calc(100% + 0.5rem)",
			},
		},
	},
	plugins: [],
};
