import { Hono } from "hono";
import { getRecentTracks } from "../../lib/lastfm.js";

const lastFmRoutes = new Hono().get("/recent-tracks", async (c) => {
	try {
		const limitParam = c.req.query("limit");
		const parsedLimit = Number.parseInt(limitParam ?? "10", 10);
		const limit = Number.isNaN(parsedLimit)
			? 10
			: Math.min(Math.max(parsedLimit, 1), 50);

		const response = await getRecentTracks(limit);
		return c.json(response);
	} catch (error) {
		console.error("Error fetching Last.fm recent tracks:", error);
		return c.json(
			{ error: "Error fetching Last.fm recent tracks" },
			{ status: 500 },
		);
	}
});

export default lastFmRoutes;
