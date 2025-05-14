import { generatePKCEChallenge } from './pkce';
import type { MALAnimeList, MALTokenResponse } from '../types/mal';
import { saveMalToken, getMalToken, isMalTokenExpired } from '../db';

const CLIENT_ID = process.env.MAL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAL_CLIENT_SECRET;
const BASE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REDIRECT_URI = new URL('/api/mal/callback', BASE_URL).toString();

const tokenEndpoint = 'https://myanimelist.net/v1/oauth2/token';
const authEndpoint = 'https://myanimelist.net/v1/oauth2/authorize';
const animeListEndpoint = 'https://api.myanimelist.net/v2/users/@me/animelist';

export async function getAuthorizationUrl() {
    const challenge = await generatePKCEChallenge();

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID ?? '',
        redirect_uri: REDIRECT_URI,
        code_challenge: challenge,
        code_challenge_method: 'plain',
    });

    return {
        url: `${authEndpoint}?${params.toString()}`,
        codeVerifier: challenge,
    };
}

export async function getAccessToken(
    code: string,
    codeVerifier: string,
): Promise<MALTokenResponse> {
    const params = new URLSearchParams({
        client_id: CLIENT_ID ?? '',
        client_secret: CLIENT_SECRET ?? '',
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
    });

    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const tokens = await response.json();
    await saveMalToken(tokens);
    return tokens;
}

export async function refreshAccessToken(
    refreshToken: string,
): Promise<MALTokenResponse> {
    const params = new URLSearchParams({
        client_id: CLIENT_ID ?? '',
        client_secret: CLIENT_SECRET ?? '',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    });

    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    await saveMalToken(tokens);
    return tokens;
}

export async function getAnimeList(status?: string): Promise<MALAnimeList> {
    const tokens = await getMalToken();
    if (!tokens) {
        throw new Error('Not authenticated');
    }

    let accessToken = tokens.accessToken;

    if (await isMalTokenExpired()) {
        const newTokens = await refreshAccessToken(tokens.refreshToken);
        accessToken = newTokens.access_token;
    }

    const fields = [
        'id',
        'title',
        'main_picture',
        'status',
        'media_type',
        'num_episodes',
        'start_date',
        'end_date',
        'genres',
        'mean',
        'list_status',
    ].join(',');

    const params = new URLSearchParams({
        fields: fields,
        limit: '1000',
        nsfw: '1',
    });

    if (status) {
        params.append('status', status);
    }

    const response = await fetch(`${animeListEndpoint}?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch anime list');
    }

    return response.json();
} 