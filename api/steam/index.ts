import { Hono } from 'hono'
import type { OwnedGamesResponse, PlayerSummaryResponse, RecentGamesResponse } from '../../types/steam'

const steamRoutes = new Hono()

// Steam Owned Games endpoint
steamRoutes.get('/owned-games', async (c) => {
  try {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    const STEAM_ID = process.env.STEAM_ID;

    if (!STEAM_API_KEY || !STEAM_ID) {
      return c.json(
        { error: "Steam credentials not found" },
        500
      );
    }

    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json&include_appinfo=1&include_played_free_games=1`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return c.json(
        { error: "Failed to fetch Steam owned games" },
        response.status as 400 | 401 | 403 | 404 | 500
      );
    }

    const data: OwnedGamesResponse = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Steam API Error:", error);
    return c.json(
      { error: "Failed to fetch Steam data" },
      500
    );
  }
});

// Steam Player Summary endpoint
steamRoutes.get('/player-summary', async (c) => {
  try {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    const STEAM_ID = process.env.STEAM_ID;

    if (!STEAM_API_KEY || !STEAM_ID) {
      return c.json(
        { error: "Steam credentials not found" },
        500
      );
    }

    // Fetch player summary
    const summaryResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!summaryResponse.ok) {
      return c.json(
        { error: "Failed to fetch Steam player summary" },
        summaryResponse.status as 400 | 401 | 403 | 404 | 500
      );
    }

    const summaryData: PlayerSummaryResponse = await summaryResponse.json();
    const playerSummary = summaryData.response.players[0];

    // If player is in game, fetch recent games to get the game icon
    if (playerSummary?.gameid) {
      const recentGamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (recentGamesResponse.ok) {
        const recentGamesData: RecentGamesResponse =
          await recentGamesResponse.json();
        const currentGame = recentGamesData.response.games?.find(
          (game) => game.appid.toString() === playerSummary.gameid,
        );

        if (currentGame) {
          playerSummary.img_icon_url = currentGame.img_icon_url;
        }
      }
    }

    return c.json(summaryData);
  } catch (error) {
    console.error("Steam API Error:", error);
    return c.json(
      { error: "Failed to fetch Steam data" },
      500
    );
  }
});

// Steam Recently Played endpoint
steamRoutes.get('/recently-played', async (c) => {
  try {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    const STEAM_ID = process.env.STEAM_ID;

    if (!STEAM_API_KEY || !STEAM_ID) {
      return c.json(
        { error: "Steam credentials not found" },
        500
      );
    }

    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return c.json(
        { error: "Failed to fetch Steam recent games" },
        response.status as 400 | 401 | 403 | 404 | 500
      );
    }

    const data: RecentGamesResponse = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Steam API Error:", error);
    return c.json(
      { error: "Failed to fetch Steam data" },
      500
    );
  }
});

export default steamRoutes 