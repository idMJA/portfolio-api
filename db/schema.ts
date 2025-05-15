import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tokens table
export const malTokens = sqliteTable("mal_tokens", {
	tokenType: text("token_type").primaryKey().notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	expiresIn: int("expires_in").notNull(),
	createdAt: int("created_at")
		.$defaultFn(() => Date.now())
		.notNull(),
});
