import { Hono } from 'hono'
import { getNowPlaying, getRecentlyPlayed } from '../../lib/spotify.js'

const spotifyRoutes = new Hono()

// Spotify Now Playing endpoint
spotifyRoutes.get('/now-playing', async (c) => {
  try {
    const response = await getNowPlaying();
    return c.json(response);
  } catch (error) {
    console.error("Error fetching now playing:", error);
    return c.json(
      { error: "Error fetching now playing" },
      { status: 500 }
    );
  }
});

// Spotify Recently Played endpoint
spotifyRoutes.get('/recently-played', async (c) => {
  try {
    const response = await getRecentlyPlayed();
    return c.json(response);
  } catch (error) {
    console.error("Error fetching recently played:", error);
    return c.json(
      { error: "Error fetching recently played" },
      { status: 500 }
    );
  }
});

export default spotifyRoutes 