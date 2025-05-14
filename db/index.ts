import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { config } from 'dotenv';
import { malTokens } from './schema';
import type { MALTokenResponse } from '../types/mal';

config({ path: '.env.development.local' });

const db = drizzle({ 
  connection: { 
    url: process.env.TURSO_DATABASE_URL!, 
    authToken: process.env.TURSO_AUTH_TOKEN!
  }
});

export { db };

export async function saveMalToken(tokens: MALTokenResponse) {
  await db.insert(malTokens).values({
    tokenType: tokens.token_type,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
    createdAt: Date.now()
  }).onConflictDoUpdate({
    target: malTokens.tokenType,
    set: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      createdAt: Date.now()
    }
  });
}

export async function getMalToken() {
  const result = await db.select()
    .from(malTokens)
    .limit(1);
  return result[0];
}

export async function deleteMalToken() {
  await db.delete(malTokens);
}

export async function isMalTokenExpired(): Promise<boolean> {
  const token = await getMalToken();
  if (!token) return true;
  const expirationTime = token.createdAt + token.expiresIn * 1000;
  return Date.now() >= expirationTime;
}
