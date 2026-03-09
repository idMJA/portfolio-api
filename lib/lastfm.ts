import type { LastFmRecentTracksResponse } from "../types/lastfm";

const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_METHOD = "user.getrecenttracks";
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

export async function getRecentTracks(limit = 10) {
	const params = new URLSearchParams({
		method: LASTFM_METHOD,
		user: LASTFM_USERNAME ?? "",
		api_key: LASTFM_API_KEY ?? "",
		format: "json",
		limit: String(limit),
	});

	const response = await fetch(`${LASTFM_BASE_URL}?${params.toString()}`, {
		headers: {
			Accept: "application/json",
		},
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch Last.fm recent tracks: ${response.status}`,
		);
	}

	const data: LastFmRecentTracksResponse = await response.json();
	return data;
}
