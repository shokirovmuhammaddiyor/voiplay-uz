/**
 * Dynamic Sitemap Generator for VoiPlay
 * Generates sitemap index and sub-sitemaps from Firebase Realtime Database
 * Run this script before building the production bundle
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDeCAuEdEfJQIW96k_71IY2qQGufUAPY5A",
  authDomain: "uz-voiplay-tv.firebaseapp.com",
  databaseURL: "https://uz-voiplay-tv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "uz-voiplay-tv",
  storageBucket: "uz-voiplay-tv.firebasestorage.app",
  messagingSenderId: "507449448117",
  appId: "1:507449448117:android:a3440c11f0fdcbffc9d0fc"
};

const BASE_URL = 'https://voiplay.uz';
const PUBLIC_DIR = './public';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} URL-friendly slug
 */
function slugify(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with dashes
    .replace(/[\s\._~!@#$&*()+=\[\]{};':"\\|,<>\/?]/g, '-')
    // Remove multiple consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Remove non-alphanumeric characters except dashes
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Generate SEO-friendly movie URL
 * @param {Object} movie - Movie data
 * @returns {string} SEO-friendly URL
 */
function generateMovieUrl(movie) {
  const slug = slugify(movie.title);
  if (!slug) return null; // Skip if no slug can be generated
  return `${BASE_URL}/movie/${slug}-uzbek-tilida`;
}

/**
 * Generate SEO-friendly series URL
 * @param {Object} show - TV show data
 * @returns {string} SEO-friendly URL
 */
function generateSeriesUrl(show) {
  const slug = slugify(show.title);
  if (!slug) return null; // Skip if no slug can be generated
  return `${BASE_URL}/tv/${slug}-uzbek-tilida`;
}

/**
 * Generate SEO-friendly episode URL
 * @param {Object} show - TV show data
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {string} SEO-friendly URL
 */
function generateEpisodeUrl(show, season, episode) {
  const slug = slugify(show.title);
  if (!slug) return null; // Skip if no slug can be generated
  return `${BASE_URL}/tv/${slug}-uzbek-tilida/season-${season}-fasl/${episode}-qism`;
}

/**
 * Format date for sitemap (YYYY-MM-DD)
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(url, lastMod, changeFreq = 'weekly', priority = 0.7) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Generate movies sitemap
 */
async function generateMoviesSitemap(movies) {
  const urls = [
    generateUrlEntry(`${BASE_URL}/list?type=movie`, formatDate(new Date()), 'daily', 0.9)
  ];

  movies.forEach(movie => {
    const movieUrl = generateMovieUrl(movie);
    if (movieUrl) {
      const lastMod = movie.updatedAt ? new Date(movie.updatedAt) : new Date();
      urls.push(generateUrlEntry(
        movieUrl,
        formatDate(lastMod),
        'weekly',
        0.8
      ));
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate series sitemap
 */
async function generateSeriesSitemap(tvShows) {
  const urls = [
    generateUrlEntry(`${BASE_URL}/list?type=tv`, formatDate(new Date()), 'daily', 0.9)
  ];

  tvShows.forEach(show => {
    const seriesUrl = generateSeriesUrl(show);
    if (seriesUrl) {
      const lastMod = show.updatedAt ? new Date(show.updatedAt) : new Date();
      urls.push(generateUrlEntry(
        seriesUrl,
        formatDate(lastMod),
        'weekly',
        0.8
      ));
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate episodes sitemap
 */
async function generateEpisodesSitemap(tvShows, episodesData) {
  const urls = [];

  tvShows.forEach(show => {
    const showEpisodes = episodesData[show.id];
    if (showEpisodes) {
      Object.entries(showEpisodes).forEach(([seasonNum, episodes]) => {
        Object.entries(episodes).forEach(([episodeNum, episodeData]) => {
          const episodeUrl = generateEpisodeUrl(show, parseInt(seasonNum), parseInt(episodeNum));
          if (episodeUrl) {
            const lastMod = episodeData.updatedAt ? new Date(episodeData.updatedAt) : new Date();
            urls.push(generateUrlEntry(
              episodeUrl,
              formatDate(lastMod),
              'weekly',
              0.7
            ));
          }
        });
      });
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate static pages sitemap
 */
async function generatePagesSitemap() {
  const pages = [
    { url: '/', priority: 1.0, changeFreq: 'daily' },
    { url: '/list?type=movie', priority: 0.9, changeFreq: 'daily' },
    { url: '/list?type=tv', priority: 0.9, changeFreq: 'daily' },
    { url: '/search', priority: 0.5, changeFreq: 'monthly' },
    { url: '/terms', priority: 0.3, changeFreq: 'monthly' },
    { url: '/privacy', priority: 0.3, changeFreq: 'monthly' }
  ];

  // Add genre pages
  const genres = ['action', 'drama', 'comedy', 'scifi', 'horror', 'thriller', 'romance'];
  genres.forEach(genre => {
    pages.push({
      url: `/list?type=movie&genre=${genre}`,
      priority: 0.7,
      changeFreq: 'weekly'
    });
  });

  const urls = pages.map(page => 
    generateUrlEntry(
      `${BASE_URL}${page.url}`,
      formatDate(new Date()),
      page.changeFreq,
      page.priority
    )
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Validate sitemap for duplicate URLs
 * @param {string} sitemapContent - Sitemap XML content
 * @returns {Array} Array of duplicate URLs found
 */
function validateSitemapDuplicates(sitemapContent) {
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;
  
  while ((match = urlRegex.exec(sitemapContent)) !== null) {
    urls.push(match[1]);
  }
  
  const seen = new Set();
  const duplicates = [];
  
  urls.forEach(url => {
    if (seen.has(url)) {
      duplicates.push(url);
    }
    seen.add(url);
  });
  
  return duplicates;
}

/**
 * Generate sitemap index
 */
function generateSitemapIndex(lastMod) {
  const sitemaps = [
    { loc: `${BASE_URL}/movies-sitemap.xml` },
    { loc: `${BASE_URL}/series-sitemap.xml` },
    { loc: `${BASE_URL}/episodes-sitemap.xml` },
    { loc: `${BASE_URL}/pages-sitemap.xml` }
  ];

  const sitemapEntries = sitemaps.map(sm => 
    `  <sitemap>
    <loc>${sm.loc}</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Write file to public directory
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

function writeFile(filename, content) {
  const filepath = `${PUBLIC_DIR}/${filename}`;
  const dir = dirname(filepath);
  
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Generated: ${filename}`);
  } catch (error) {
    console.error(`❌ Error writing ${filename}:`, error);
    throw error;
  }
}

/**
 * Main function to generate all sitemaps
 */
async function generateSitemaps() {
  console.log('🚀 Starting sitemap generation...\n');

  try {
    // Fetch data from Firebase
    console.log('📡 Fetching data from Firebase...');
    const [moviesSnap, tvShowsSnap, episodesSnap] = await Promise.all([
      get(ref(db, 'movies')),
      get(ref(db, 'tvShows')),
      get(ref(db, 'episodes'))
    ]);

    const movies = [];
    if (moviesSnap.exists()) {
      Object.entries(moviesSnap.val()).forEach(([id, value]) => {
        movies.push({ id, ...value });
      });
    }

    const tvShows = [];
    if (tvShowsSnap.exists()) {
      Object.entries(tvShowsSnap.val()).forEach(([id, value]) => {
        tvShows.push({ id, ...value });
      });
    }

    const episodesData = episodesSnap.exists() ? episodesSnap.val() : {};

    console.log(`✅ Fetched ${movies.length} movies, ${tvShows.length} TV shows\n`);

    // Generate sitemaps
    const lastMod = formatDate(new Date());

    console.log('📝 Generating sitemaps...');
    
    const moviesSitemap = await generateMoviesSitemap(movies);
    const moviesDuplicates = validateSitemapDuplicates(moviesSitemap);
    if (moviesDuplicates.length > 0) {
      console.warn('⚠️  Found duplicates in movies sitemap:', moviesDuplicates);
    }
    writeFile('movies-sitemap.xml', moviesSitemap);

    const seriesSitemap = await generateSeriesSitemap(tvShows);
    const seriesDuplicates = validateSitemapDuplicates(seriesSitemap);
    if (seriesDuplicates.length > 0) {
      console.warn('⚠️  Found duplicates in series sitemap:', seriesDuplicates);
    }
    writeFile('series-sitemap.xml', seriesSitemap);

    const episodesSitemap = await generateEpisodesSitemap(tvShows, episodesData);
    const episodesDuplicates = validateSitemapDuplicates(episodesSitemap);
    if (episodesDuplicates.length > 0) {
      console.warn('⚠️  Found duplicates in episodes sitemap:', episodesDuplicates);
    }
    writeFile('episodes-sitemap.xml', episodesSitemap);

    const pagesSitemap = await generatePagesSitemap();
    const pagesDuplicates = validateSitemapDuplicates(pagesSitemap);
    if (pagesDuplicates.length > 0) {
      console.warn('⚠️  Found duplicates in pages sitemap:', pagesDuplicates);
    }
    writeFile('pages-sitemap.xml', pagesSitemap);

    const sitemapIndex = generateSitemapIndex(lastMod);
    writeFile('sitemap.xml', sitemapIndex);

    console.log('\n✨ Sitemap generation completed successfully!');
    console.log(`📍 Sitemap index: ${BASE_URL}/sitemap.xml`);
    console.log(`📍 Movies sitemap: ${BASE_URL}/movies-sitemap.xml`);
    console.log(`📍 Series sitemap: ${BASE_URL}/series-sitemap.xml`);
    console.log(`📍 Episodes sitemap: ${BASE_URL}/episodes-sitemap.xml`);
    console.log(`📍 Pages sitemap: ${BASE_URL}/pages-sitemap.xml`);

    if (moviesDuplicates.length === 0 && seriesDuplicates.length === 0 && 
        episodesDuplicates.length === 0 && pagesDuplicates.length === 0) {
      console.log('✅ No duplicate URLs found in sitemaps');
    }

    // Explicitly exit to close Firebase persistent connections
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemaps();
