function getApiUrl(baseUrl: string) {
	return baseUrl.replace("worldcubeassociation.org/", "worldcubeassociation.org/api/v1/");
}

export async function fetchRegistrations(baseUrl: string | null) {
	if (typeof baseUrl !== "string") {
		return {};
	}
	const endpointUrl = `${getApiUrl(baseUrl)}/registrations`;

	const res = await fetch(endpointUrl);
	if (res.ok && res.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
		const temp = await res.json();
		return temp;
	}

	return {};
}
