import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
	getAccessToken,
	getAnimeList,
	getAuthorizationUrl,
} from "../../lib/mal.js";

const malRoutes = new Hono()

	.get("/auth", async (c) => {
		try {
			const { url, codeVerifier } = await getAuthorizationUrl();

			setCookie(c, "mal_code_verifier", codeVerifier, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "Lax",
				maxAge: 60 * 10,
				path: "/",
			});

			return c.redirect(url);
		} catch (error) {
			console.error("MAL Auth Error:", error);
			return c.json({ error: "Failed to generate authorization URL" }, 500);
		}
	})

	.get("/callback", async (c) => {
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

			setCookie(c, "mal_code_verifier", "", {
				maxAge: 0,
				path: "/",
			});

			return c.redirect("/anime");
		} catch (error) {
			console.error("MAL Callback Error:", error);
			return c.redirect("/anime?error=token_error");
		}
	})

	.get("/anime-list", async (c) => {
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
