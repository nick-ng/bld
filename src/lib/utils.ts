import { soycat, soycatCentre } from './hideouts/soycat';

export const getDoodads = (hideout: string) => {
	const doodads: { [key: string]: number } = {};

	[...hideout.matchAll(/"([\w\s]+)":\s?\{/g)].forEach((match) => {
		if (
			[
				'doodads',
				'Stash',
				'Guild Stash',
				'Waypoint',
				'Crafting Bench',
				'Map Device',
				'Horticrafting Station',
				'Heist Locker',
				'Expedition Locker',
				'Tane Octavius',
				'Kirac',
				'Sister Cassia',
				'Einhar',
				'Alva',
				'Helena',
				'Niko',
				'Jun',
				'The Last to Die',
				'Lilly Roth',
				'Relic Locker'
			].includes(match[1])
		) {
			return;
		}

		if (!doodads[match[1]]) {
			doodads[match[1]] = 1;
		} else {
			doodads[match[1]] += 1;
		}
	});

	return doodads;
};

const moveDecoration = (
	hideout: string,
	hideoutCentre: { x: number; y: number },
	targetCentre: { x: number; y: number }
) => {
	const x = targetCentre.x - hideoutCentre.x;
	const y = targetCentre.y - hideoutCentre.y;

	return hideout
		.replaceAll(/"x": (\d+)/g, (_match, p1) => {
			const tempX = parseInt(p1, 10);

			return `"x": ${tempX + x}`;
		})
		.replaceAll(/"y": (\d+)/g, (_match, p1) => {
			const tempY = parseInt(p1, 10);

			return `"y": ${tempY + y}`;
		});
};

export const replaceWithSoycat = (
	originalHideout: string,
	chosenDoodad: string,
	adjustment: { x: number; y: number }
) => {
	if (!chosenDoodad) {
		return originalHideout;
	}

	const re = new RegExp(`"${chosenDoodad}"\\s?:\\s*\\{[^}]+?\\}`);

	const b = originalHideout.match(re);

	const b0 = b?.[0];

	const doodadX = b0?.match(/"x": (\d+)/)?.[1];
	const doodadY = b0?.match(/"y": (\d+)/)?.[1];

	if (!doodadX || !doodadY) {
		return originalHideout;
	}

	const movedSoycat = moveDecoration(soycat, soycatCentre, {
		x: parseInt(doodadX, 10) + adjustment.x,
		y: parseInt(doodadY, 10) + adjustment.y
	});

	return originalHideout.replaceAll(/\s+/g, ' ').replace(re, movedSoycat);
};
