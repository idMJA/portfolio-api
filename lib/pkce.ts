export async function generatePKCEChallenge(length = 128): Promise<string> {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);

	// Convert to base64URL
	const base64 = btoa(String.fromCharCode(...array));
	const base64URL = base64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");

	return base64URL.slice(0, length);
}
