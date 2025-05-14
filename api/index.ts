import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import malRoutes from './mal'
import spotifyRoutes from './spotify'
import steamRoutes from './steam'
import wakatimeRoutes from './wakatime'

const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.json({ message: "Hewwoo :3", createdBy: "iaMJ アーリャ" })
})

// Mount MAL routes
app.route('/mal', malRoutes)

// Mount Spotify routes
app.route('/spotify', spotifyRoutes)

// Mount Steam routes
app.route('/steam', steamRoutes)

// Mount WakaTime routes
app.route('/wakatime', wakatimeRoutes)

const handler = handle(app)

export const GET = handler
export const POST = handler
export const PATCH = handler
export const PUT = handler
export const OPTIONS = handler