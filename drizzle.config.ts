import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
	throw new Error("Missing required Turso environment variables");
}

export default defineConfig({
	schema: "./db/schema.ts",
	out: "./drizzle",
	dialect: "turso",
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL,
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
	verbose: true,
	strict: true,
});
