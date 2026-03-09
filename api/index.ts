import { Hono } from "hono";
import { handle } from "hono/vercel";
import github from "./github/index.js";
import lastfm from "./lastfm/index.js";
import mal from "./mal/index.js";
import spotify from "./spotify/index.js";
import steam from "./steam/index.js";
import wakatime from "./wakatime/index.js";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
	return c.json({ message: "Hewwoo :3", createdBy: "iaMJ アーリャ" });
});

app.route("/mal", mal);

app.route("/github", github);

app.route("/lastfm", lastfm);

app.route("/spotify", spotify);

app.route("/steam", steam);

app.route("/wakatime", wakatime);

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
