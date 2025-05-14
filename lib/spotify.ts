const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

async function getAccessToken() {
	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: REFRESH_TOKEN ?? "",
		}),
		cache: "no-store",
	});

	return response.json();
}

export async function getNowPlaying() {
	const { access_token } = await getAccessToken();

	const response = await fetch("https://api.spotify.com/v1/me/player", {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
		cache: "no-store",
	});

	if (response.status === 204 || response.status > 400) {
		return null;
	}

	const data = await response.json();

	return {
		item: data.item,
		is_playing: data.is_playing,
		progress_ms: data.progress_ms,
	};
}

export async function getRecentlyPlayed() {
	const { access_token } = await getAccessToken();

	const response = await fetch(
		"https://api.spotify.com/v1/me/player/recently-played?limit=10",
		{
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
			cache: "no-store",
		},
	);

	if (response.status === 204 || response.status > 400) {
		return null;
	}

	return response.json();
} 