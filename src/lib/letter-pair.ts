import { authFetch, joinServerPath } from "$lib/utils";

export const migrateLetterPairs = async () => {
	const response = await authFetch(joinServerPath("/migrate-letter-pairs"), {
		method: "POST",
	});
	if (!response) {
		return "no response";
	}

	const responseText = await response.text();

	return responseText;
};
