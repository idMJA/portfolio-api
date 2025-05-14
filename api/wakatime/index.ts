import { Hono } from 'hono'

const wakatimeRoutes = new Hono()

// WakaTime Stats endpoint
wakatimeRoutes.get('/stats', async (c) => {
  try {
    const apiKey = process.env.WAKATIME_API_KEY;
    
    if (!apiKey) {
      return c.json(
        { error: 'WakaTime API key not configured' },
        500
      );
    }

    // Fetch all-time stats
    const response = await fetch(
      'https://wakatime.com/api/v1/users/current/all_time_since_today',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from WakaTime API');
    }

    const allTimeData = await response.json();

    // Fetch languages and editors data separately since all_time_since_today doesn't include them
    const statsResponse = await fetch(
      'https://wakatime.com/api/v1/users/current/stats/all_time',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
        },
      }
    );

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch detailed stats from WakaTime API');
    }

    const statsData = await statsResponse.json();
    
    return c.json({
      total_seconds: allTimeData.data.total_seconds,
      languages: statsData.data.languages || [],
      editors: statsData.data.editors || [],
      start_date: statsData.data.range.start,
      human_readable_range: `Since ${new Date(statsData.data.range.start).toLocaleDateString()}`
    });
  } catch (error) {
    console.error('WakaTime API Error:', error);
    return c.json(
      { error: 'Failed to fetch WakaTime stats' },
      500
    );
  }
});

export default wakatimeRoutes 