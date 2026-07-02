/**
 * URL Helper Utilities for VoiPlay SEO
 * Handles slug generation, URL construction, and legacy ID-to-slug mapping
 */

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} URL-friendly slug
 */
export function slugify(text) {
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
 * Generate SEO-friendly URL for movie
 * @param {string} title - Movie title
 * @param {string} id - Movie ID (for fallback)
 * @returns {string} SEO-friendly URL slug
 */
export function generateMovieSlug(title, id) {
  const slug = slugify(title);
  return slug ? `${slug}-uzbek-tilida` : id;
}

/**
 * Generate SEO-friendly URL for TV series
 * @param {string} title - Series title
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {string} SEO-friendly URL slug
 */
export function generateSeriesSlug(title, season, episode) {
  const slug = slugify(title);
  const seasonPart = `season-${season}-fasl`;
  const episodePart = `${episode}-qism`;
  return `${slug}-uzbek-tilida/${seasonPart}/${episodePart}`;
}

/**
 * Parse legacy ID-based URL to extract components
 * @param {string} path - URL path
 * @returns {Object|null} Parsed components or null if invalid
 */
export function parseLegacyUrl(path) {
  // Match /tv/:id/:season/:episode
  const tvMatch = path.match(/^\/tv\/(\d+)\/(\d+)\/(\d+)$/);
  if (tvMatch) {
    return {
      type: 'tv',
      id: tvMatch[1],
      season: parseInt(tvMatch[2]),
      episode: parseInt(tvMatch[3])
    };
  }

  // Match /movie/:id
  const movieMatch = path.match(/^\/movie\/(\d+)$/);
  if (movieMatch) {
    return {
      type: 'movie',
      id: movieMatch[1]
    };
  }

  // Match /detail/:id
  const detailMatch = path.match(/^\/detail\/(\d+)$/);
  if (detailMatch) {
    return {
      type: 'detail',
      id: detailMatch[1]
    };
  }

  return null;
}

/**
 * Parse SEO-friendly URL to extract components
 * @param {string} path - URL path
 * @returns {Object|null} Parsed components or null if invalid
 */
export function parseSeoUrl(path) {
  // Match /tv/:slug-uzbek-tilida/season-:season-fasl/:episode-qism
  const tvMatch = path.match(/^\/tv\/(.+)-uzbek-tilida\/season-(\d+)-fasl\/(\d+)-qism$/);
  if (tvMatch) {
    return {
      type: 'tv',
      slug: tvMatch[1],
      season: parseInt(tvMatch[2]),
      episode: parseInt(tvMatch[3])
    };
  }

  // Match /movie/:slug-uzbek-tilida
  const movieMatch = path.match(/^\/movie\/(.+)-uzbek-tilida$/);
  if (movieMatch) {
    return {
      type: 'movie',
      slug: movieMatch[1]
    };
  }

  return null;
}

/**
 * Find content by slug from catalog
 * @param {string} slug - URL slug
 * @param {Array} movies - Movies catalog
 * @param {Array} tvShows - TV shows catalog
 * @returns {Object|null} Found content or null
 */
export function findContentBySlug(slug, movies, tvShows) {
  const allContent = [...movies, ...tvShows];
  return allContent.find(item => {
    const itemSlug = slugify(item.title);
    return itemSlug === slug;
  });
}

/**
 * Generate full URL for content
 * @param {Object} item - Content item
 * @param {number} season - Season number (for TV shows)
 * @param {number} episode - Episode number (for TV shows)
 * @returns {string} Full URL path
 */
export function generateContentUrl(item, season = null, episode = null) {
  if (!item) return '/';

  if (item.type === 'movie') {
    const slug = generateMovieSlug(item.title, item.id);
    return `/movie/${slug}`;
  }

  if (item.type === 'tv' && season !== null && episode !== null) {
    const slug = generateSeriesSlug(item.title, season, episode);
    return `/tv/${slug}`;
  }

  return `/detail/${item.id}`;
}

/**
 * Centralized utility to generate movie URL from title
 * @param {string} title - Movie title
 * @returns {string} SEO-friendly movie URL path
 */
export function generateMovieUrl(title) {
  const slug = slugify(title);
  return slug ? `/movie/${slug}-uzbek-tilida` : null;
}

/**
 * Centralized utility to generate episode URL from title, season, and episode
 * @param {string} title - Series title
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {string} SEO-friendly episode URL path
 */
export function generateEpisodeUrl(title, season, episode) {
  const slug = slugify(title);
  if (!slug) return null;
  return `/tv/${slug}-uzbek-tilida/season-${season}-fasl/${episode}-qism`;
}

/**
 * Generate detail page URL from title (for content cards, hero, etc.)
 * @param {Object} item - Content item with title and type
 * @returns {string} SEO-friendly detail URL path
 */
export function generateDetailUrl(item) {
  if (!item || !item.title) return '/';
  const slug = slugify(item.title);
  return slug ? `/detail/${slug}` : `/detail/${item.id}`;
}
