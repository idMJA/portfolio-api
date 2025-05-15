import { Hono } from "hono";
import {
	getAuthorizationUrl,
	getAccessToken,
	getAnimeList,
} from "../../lib/mal.js";
import { getCookie, setCookie } from "hono/cookie";

const malRoutes = new Hono();

// MAL Auth endpoint
malRoutes.get("/auth", async (c) => {
	try {
		const { url, codeVerifier } = await getAuthorizationUrl();

		// Store code verifier in cookie
		setCookie(c, "mal_code_verifier", codeVerifier, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
			maxAge: 60 * 10, // 10 minutes
			path: "/",
		});

		return c.redirect(url);
	} catch (error) {
		console.error("MAL Auth Error:", error);
		return c.json({ error: "Failed to generate authorization URL" }, 500);
	}
});

// MAL Callback endpoint
malRoutes.get("/callback", async (c) => {
	try {
		const code = c.req.query("code");
		const error = c.req.query("error");
		const errorDescription = c.req.query("error_description");

		if (error) {
			console.error("MAL Auth Error:", error, errorDescription);
			return c.redirect(`/anime?error=${error}`);
		}

		const codeVerifier = getCookie(c, "mal_code_verifier");

		if (!code || !codeVerifier) {
			console.error("Missing parameters:", { code, codeVerifier });
			return c.redirect("/anime?error=missing_params");
		}

		await getAccessToken(code, codeVerifier);

		// Clear the code verifier cookie
		setCookie(c, "mal_code_verifier", "", {
			maxAge: 0,
			path: "/",
		});

		return c.redirect("/anime");
	} catch (error) {
		console.error("MAL Callback Error:", error);
		return c.redirect("/anime?error=token_error");
	}
});

// MAL Anime List endpoint
malRoutes.get("/anime-list", async (c) => {
	try {
		const status = c.req.query("status");
		const animeList = await getAnimeList(status);
		return c.json(animeList);
	} catch (error) {
		console.error("MAL Anime List Error:", error);
		return c.json(
			{
				error: "Failed to fetch anime list",
				details: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

export default malRoutes;
