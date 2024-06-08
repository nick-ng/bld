export const findCentre = (decoration: string): { x: number; y: number } => {
	const allX = [...decoration.matchAll(/"x": (\d+)/g)].map((a) => parseInt(a[1], 10));
	const allY = [...decoration.matchAll(/"y": (\d+)/g)].map((a) => parseInt(a[1], 10));

	const maxX = Math.max(...allX);
	const minX = Math.min(...allX);

	const maxY = Math.max(...allY);
	const minY = Math.min(...allY);

	return {
		x: Math.ceil((maxX + minX) / 2),
		y: Math.ceil((maxY + minY) / 2)
	};
};
