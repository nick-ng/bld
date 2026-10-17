function getApiUrl(baseUrl: string) {
	// https://www.worldcubeassociation.org/competitions/DuallinginMilford2026
	// https://www.worldcubeassociation.org/api/v1/competitions/DuallinginMilford2026
	return baseUrl.replace("worldcubeassociation.org/", "worldcubeassociation.org/api/v1/");
}

export async function fetchCompetitors(baseUrl: string) {
	const apiUrl = getApiUrl(baseUrl);

	console.log("apiUrl", apiUrl);
}
