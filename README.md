# Portfolio API

This is a personal portfolio API built with [Hono](https://hono.dev/) running on [Vercel](https://vercel.com/). The API integrates with various external services including MyAnimeList, Spotify, Steam, and WakaTime to provide a unified interface for personal data.

## Features

- **GitHub Integration** - Fetch repository data and project information
- **MyAnimeList Integration** - Fetch anime lists and handle OAuth authentication
- **Spotify Integration** - Get currently playing tracks and recently played history
- **Steam Integration** - Access Steam profile and game data
- **WakaTime Integration** - Track coding statistics and time spent programming

## Tech Stack

- [Hono](https://hono.dev/) - Lightweight, fast web framework for API development
- [Vercel](https://vercel.com/) - Deployment platform
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for database operations
- [Turso](https://turso.tech/) - SQLite database service (LibSQL)

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Vercel CLI

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
# or
bun install
```

3. Set up environment variables in a `.env` file:

```
# Turso Database
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# GitHub (optional - no auth required for public repos)
# Uses GitHub API v3 with rate limits: 60 requests/hour unauthenticated, 5000/hour authenticated
# Add token for higher rate limits:
# GITHUB_TOKEN=your_github_token

# MyAnimeList
MAL_CLIENT_ID=your_mal_client_id
MAL_CLIENT_SECRET=your_mal_client_secret

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token

# Steam
STEAM_API_KEY=your_steam_api_key
STEAM_ID=your_steam_id

# WakaTime
WAKATIME_API_KEY=your_wakatime_api_key
```

### Development

Run the development server:

```bash
npm run start
# or
bun start
```

Alternatively, use nodemon for auto-reloading:

```bash
npm run dev
# or
bun dev
```

### Deployment

Deploy to Vercel:

```bash
npm run deploy
# or
bun deploy
```

## API Endpoints

### Base URL
- `/api` - Base path for all endpoints

### GitHub
- `GET /api/github/project?username={username}&limit={limit}` - Get repositories by username (default limit: 10)
  - Returns non-fork, non-archived repos sorted by most recently updated
  - Includes language colors for visualization
  - Query Params:
    - `username` - GitHub username (required if `repos` not provided)
    - `limit` - Number of repos to fetch (default: 10)

- `GET /api/github/project?repos={url1},{url2}` - Get specific repositories by URL
  - Accept comma-separated or multiple `repos` query parameters
  - URLs can be in format: `https://github.com/owner/repo`
  - Response includes language colors with fallback color `#6b7280`

### MyAnimeList
- `GET /api/mal/auth` - Initiate OAuth flow
- `GET /api/mal/callback` - OAuth callback handler
- `GET /api/mal/anime-list` - Get full anime list

### Spotify
- `GET /api/spotify/now-playing` - Get currently playing track
- `GET /api/spotify/recently-played` - Get recently played tracks

### Steam
- `GET /api/steam/owned-games` - Get list of all owned games with details
- `GET /api/steam/player-summary` - Get current player status and game activity
- `GET /api/steam/recently-played` - Get recently played games with playtime

### WakaTime
- `GET /api/wakatime/stats` - Get coding statistics including:
  - Total coding time
  - Programming languages used
  - Editors used
  - Statistics since first tracked day

## License

[MIT](LICENSE)

## Author

iaMJ アーリャ