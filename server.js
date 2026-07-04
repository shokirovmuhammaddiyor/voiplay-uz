import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static assets with a long cache time
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), { maxAge: '1y' }));
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// Firebase Database configuration
const DATABASE_URL = "https://uz-voiplay-tv-default-rtdb.europe-west1.firebasedatabase.app";

// Local cache for movies and tvShows
let moviesCache = [];
let tvShowsCache = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function refreshCache() {
  try {
    console.log('[SEO Server] Refreshing content cache from Firebase...');
    const [moviesRes, tvShowsRes] = await Promise.all([
      fetch(`${DATABASE_URL}/movies.json`),
      fetch(`${DATABASE_URL}/tvShows.json`)
    ]);
    
    if (moviesRes.ok && tvShowsRes.ok) {
      const moviesData = await moviesRes.json();
      const tvShowsData = await tvShowsRes.json();
      
      const newMovies = [];
      if (moviesData) {
        Object.entries(moviesData).forEach(([id, value]) => {
          newMovies.push({ id, type: 'movie', ...value });
        });
      }
      
      const newTvShows = [];
      if (tvShowsData) {
        Object.entries(tvShowsData).forEach(([id, value]) => {
          newTvShows.push({ id, type: 'tv', ...value });
        });
      }
      
      moviesCache = newMovies;
      tvShowsCache = newTvShows;
      cacheTimestamp = Date.now();
      console.log(`[SEO Server] Cache refreshed: ${moviesCache.length} movies, ${tvShowsCache.length} TV shows.`);
    } else {
      console.error('[SEO Server] Failed to fetch data from Firebase:', moviesRes.status, tvShowsRes.status);
    }
  } catch (error) {
    console.error('[SEO Server] Error refreshing cache:', error);
  }
}

// Slugify function matching urlHelper.js exactly
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\._~!@#$&*()+=\[\]{};':"\\|,<>\/?]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/[^a-z0-9-]/g, '');
}

// Helper to escape HTML special characters
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Middleware to ensure cache is fresh
app.use(async (req, res, next) => {
  if (Date.now() - cacheTimestamp > CACHE_DURATION || moviesCache.length === 0) {
    await refreshCache();
  }
  next();
});

// Endpoint to force cache clear/refresh
app.post('/api/refresh-cache', async (req, res) => {
  await refreshCache();
  res.json({ success: true, movies: moviesCache.length, tvShows: tvShowsCache.length });
});

// Route handler for matching page and injecting meta tags
app.get('*', async (req, res) => {
  const urlPath = req.path;
  let seoData = null;
  
  // 1. Movie watch route: /movie/:slug-uzbek-tilida
  const movieMatch = urlPath.match(/^\/movie\/(.+)-uzbek-tilida$/);
  if (movieMatch) {
    const slug = movieMatch[1];
    const item = moviesCache.find(m => slugify(m.title) === slug);
    if (item) {
      seoData = {
        title: `${item.title} Uzbek Tilida Tarjima Online Ko'rish - VoiPlay`,
        description: `${item.title} o'zbek tilida tarjima kinoni VoiPlay platformasida yuqori (HD) sifatda va reklamasiz online tomosha qiling. ${item.overview || ''}`.slice(0, 300),
        image: item.posterPath || item.backdropPath,
        url: `https://voiplay.uz${urlPath}`,
        type: 'video.movie'
      };
    }
  }
  
  // 2. TV show watch route: /tv/:slug-uzbek-tilida/season-:season-fasl/:episode-qism
  const tvEpisodeMatch = urlPath.match(/^\/tv\/(.+)-uzbek-tilida\/season-(\d+)-fasl\/(\d+)-qism$/);
  if (tvEpisodeMatch) {
    const slug = tvEpisodeMatch[1];
    const season = tvEpisodeMatch[2];
    const episode = tvEpisodeMatch[3];
    const item = tvShowsCache.find(t => slugify(t.title) === slug);
    if (item) {
      seoData = {
        title: `${item.title} ${season}-fasl ${episode}-qism Uzbek Tilida Tarjima - VoiPlay`,
        description: `${item.title} serialining ${season}-mavsum ${episode}-qismi o'zbek tilida VoiPlay platformasida tomosha qiling. ${item.overview || ''}`.slice(0, 300),
        image: item.backdropPath || item.posterPath,
        url: `https://voiplay.uz${urlPath}`,
        type: 'video.episode'
      };
    }
  }

  // 3. Detail route: /detail/:param
  const detailMatch = urlPath.match(/^\/detail\/(.+)$/);
  if (detailMatch) {
    const param = detailMatch[1];
    const isNumeric = /^\d+$/.test(param);
    let item = null;
    if (isNumeric) {
      item = moviesCache.find(m => m.id === param) || tvShowsCache.find(t => t.id === param);
    } else {
      item = moviesCache.find(m => slugify(m.title) === param) || tvShowsCache.find(t => slugify(t.title) === param);
    }
    
    if (item) {
      seoData = {
        title: `${item.title} Uzbek Tilida Tarjima Online Ko'rish (Barcha Qismlar) - VoiPlay`,
        description: `${item.title} o'zbek tilida tarjima kino/serialini VoiPlay platformasida yuqori (HD) sifatda va reklamasiz online tomosha qiling. ${item.overview || ''}`.slice(0, 300),
        image: item.posterPath || item.backdropPath,
        url: `https://voiplay.uz${urlPath}`,
        type: item.type === 'movie' ? 'video.movie' : 'video.tv_show'
      };
    }
  }

  // Default SEO details
  const title = seoData ? seoData.title : "VoiPlay - Premium Anime va Filmlar Portal";
  const description = seoData ? seoData.description : "VoiPlay - O'zbekistondagi eng zamonaviy anime va filmlar striming portali. Barcha sevimli videolaringizni yuqori sifatda, o'zbek tilida tomosha qiling.";
  const image = seoData ? seoData.image : "https://raw.githubusercontent.com/kiduyu-klaus/VoiPlayTv_final/refs/heads/main/app/src/main/res/mipmap-xxxhdpi/ic_launcher1.png";
  const url = seoData ? seoData.url : "https://voiplay.uz";
  const ogType = seoData ? seoData.type : "website";

  const indexPath = path.join(__dirname, 'dist/index.html');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(500).send('Index.html not found. Please build the project.');
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // Regex replacements to inject seo details
  html = html.replace(/<title>.*?<\/title>/g, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/g, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/g, `<meta property="og:url" content="${escapeHtml(url)}" />`);
  html = html.replace(/<meta property="og:type" content=".*?" \/>/g, `<meta property="og:type" content="${escapeHtml(ogType)}" />`);

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`[SEO Server] Server running on port ${PORT}`);
});
