/**
 * SEO Utility for VoiPlay - Uzbekistan Streaming Platform
 * Handles dynamic meta tags, OpenGraph, and JSON-LD schema markup
 */

// Uzbekistan-specific SEO keywords
const UZBEK_KEYWORDS = [
  'uzbek tilida',
  'tarjima kino',
  'online ko\'rish',
  'bepul',
  'kino 2026',
  'hd sifatda',
  'tarjima filmlar',
  'premyera',
  'seriallar',
  'multfilmlar'
];

// Base URL
const BASE_URL = 'https://voiplay.uz';

/**
 * Generate page title with Uzbek SEO structure
 * @param {string} title - Content title (movie/series name)
 * @param {string} type - Content type (movie, series, genre, etc.)
 * @returns {string} Formatted title
 */
export const generatePageTitle = (title, type = 'movie') => {
  const typeMap = {
    movie: 'uzbek tilida tarjima online ko\'rish',
    series: 'seriali uzbek tilida online ko\'rish',
    genre: 'filmlar bepul tomosha qilish',
    home: 'Eng yaxshi filmlar va seriallar uzbek tilida'
  };

  const suffix = typeMap[type] || typeMap.movie;
  return `${title} ${suffix} - VoiPlay`;
};

/**
 * Generate meta description with Uzbek keywords
 * @param {string} title - Content title
 * @param {string} description - Content description
 * @param {string} type - Content type
 * @returns {string} SEO-optimized description
 */
export const generateMetaDescription = (title, description, type = 'movie') => {
  const typeKeywords = {
    movie: 'uzbek tilida tarjima kino',
    series: 'seriali uzbek tilida',
    genre: 'janridagi filmlar'
  };

  const keyword = typeKeywords[type] || typeKeywords.movie;
  const shortDesc = description?.slice(0, 150) || 'Eng yaxshi kontent';
  
  return `${title} ${keyword} online ko'rish. ${shortDesc} HD sifatda, bepul va reklamalarsiz tomosha qiling. VoiPlay - O\'zbekistondagi eng yaxshi streaming platformasi.`;
};

/**
 * Generate OpenGraph meta tags
 * @param {Object} data - Content data
 * @returns {Object} OpenGraph meta tags
 */
export const generateOpenGraphTags = (data) => {
  const {
    title,
    description,
    image,
    type = 'video.movie',
    url
  } = data;

  return {
    'og:title': generatePageTitle(title, type === 'video.movie' ? 'movie' : 'series'),
    'og:description': generateMetaDescription(title, description, type === 'video.movie' ? 'movie' : 'series'),
    'og:image': image || `${BASE_URL}/og-default.jpg`,
    'og:url': url || BASE_URL,
    'og:type': type,
    'og:site_name': 'VoiPlay',
    'og:locale': 'uz_UZ',
    'og:locale:alternate': 'ru_RU'
  };
};

/**
 * Generate Twitter Card meta tags
 * @param {Object} data - Content data
 * @returns {Object} Twitter Card meta tags
 */
export const generateTwitterCardTags = (data) => {
  const {
    title,
    description,
    image
  } = data;

  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@voiplayuz',
    'twitter:title': generatePageTitle(title),
    'twitter:description': generateMetaDescription(title, description),
    'twitter:image': image || `${BASE_URL}/twitter-default.jpg`
  };
};

/**
 * Generate JSON-LD schema for Movie
 * @param {Object} movieData - Movie data
 * @returns {Object} JSON-LD schema
 */
export const generateMovieSchema = (movieData) => {
  const {
    title,
    description,
    poster,
    releaseDate,
    rating,
    duration,
    genres,
    director,
    actors
  } = movieData;

  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    description: description || `${title} uzbek tilida tarjima kino`,
    image: poster,
    datePublished: releaseDate,
    contentRating: rating || 'PG-13',
    duration: duration || 'PT120M',
    genre: genres || ['Action', 'Drama'],
    director: director ? {
      '@type': 'Person',
      name: director
    } : undefined,
    actor: actors?.map(actor => ({
      '@type': 'Person',
      name: actor
    })),
    inLanguage: 'uz',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Uzbekistan'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'UZS',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/movie/${movieData.id}`
    }
  };
};

/**
 * Generate JSON-LD schema for TV Series
 * @param {Object} seriesData - Series data
 * @returns {Object} JSON-LD schema
 */
export const generateSeriesSchema = (seriesData) => {
  const {
    title,
    description,
    poster,
    releaseDate,
    rating,
    genres,
    seasons,
    numberOfEpisodes
  } = seriesData;

  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    description: description || `${title} seriali uzbek tilida`,
    image: poster,
    datePublished: releaseDate,
    contentRating: rating || 'PG-13',
    genre: genres || ['Drama', 'Action'],
    numberOfSeasons: seasons?.length || 1,
    numberOfEpisodes: numberOfEpisodes || 10,
    inLanguage: 'uz',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Uzbekistan'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'UZS',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/tv/${seriesData.id}`
    }
  };
};

/**
 * Generate JSON-LD schema for Episode
 * @param {Object} episodeData - Episode data
 * @param {Object} seriesData - Parent series data
 * @returns {Object} JSON-LD schema
 */
export const generateEpisodeSchema = (episodeData, seriesData) => {
  const {
    seasonNumber,
    episodeNumber,
    title,
    description
  } = episodeData;

  return {
    '@context': 'https://schema.org',
    '@type': 'Episode',
    episodeNumber: episodeNumber,
    partOfSeries: {
      '@type': 'TVSeries',
      name: seriesData.title,
      url: `${BASE_URL}/tv/${seriesData.id}`
    },
    partOfSeason: {
      '@type': 'TVSeason',
      seasonNumber: seasonNumber,
      url: `${BASE_URL}/tv/${seriesData.id}/season/${seasonNumber}`
    },
    name: title || `${seriesData.title} - ${seasonNumber}-fasl, ${episodeNumber}-qism`,
    description: description || `${seriesData.title} serialining ${seasonNumber}-fasl ${episodeNumber}-qismi uzbek tilida`,
    inLanguage: 'uz',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'UZS',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/tv/${seriesData.id}/${seasonNumber}/${episodeNumber}`
    }
  };
};

/**
 * Generate JSON-LD schema for WebSite
 * @returns {Object} JSON-LD schema
 */
export const generateWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VoiPlay',
    url: BASE_URL,
    description: 'VoiPlay - O\'zbekistondagi eng yaxshi streaming platformasi. Filmlar, seriallar va multfilmlar uzbek tilida online ko\'rish.',
    inLanguage: 'uz',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Generate JSON-LD schema for Organization
 * @returns {Object} JSON-LD schema
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VoiPlay',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'VoiPlay - O\'zbekistondagi eng yaxshi streaming platformasi',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UZ'
    },
    sameAs: [
      'https://facebook.com/voiplayuz',
      'https://instagram.com/voiplayuz',
      'https://telegram.me/voiplayuz'
    ]
  };
};

/**
 * Generate all meta tags for a page
 * @param {Object} data - Page data
 * @returns {Object} All meta tags
 */
export const generateMetaTags = (data) => {
  const {
    title,
    description,
    image,
    type,
    url,
    schemaType,
    schemaData
  } = data;

  const metaTags = {
    title: generatePageTitle(title, type),
    description: generateMetaDescription(title, description, type),
    keywords: UZBEK_KEYWORDS.join(', '),
    ...generateOpenGraphTags({ title, description, image, type, url }),
    ...generateTwitterCardTags({ title, description, image })
  };

  // Add JSON-LD schema if provided
  if (schemaData) {
    let schema;
    switch (schemaType) {
      case 'movie':
        schema = generateMovieSchema(schemaData);
        break;
      case 'series':
        schema = generateSeriesSchema(schemaData);
        break;
      case 'episode':
        schema = generateEpisodeSchema(schemaData, data.seriesData);
        break;
      case 'website':
        schema = generateWebsiteSchema();
        break;
      case 'organization':
        schema = generateOrganizationSchema();
        break;
      default:
        schema = generateWebsiteSchema();
    }
    metaTags.schema = schema;
  }

  return metaTags;
};

/**
 * Inject meta tags into document head
 * @param {Object} metaTags - Meta tags object
 */
export const injectMetaTags = (metaTags) => {
  // Update document title
  if (metaTags.title) {
    document.title = metaTags.title;
  }

  // Update or create meta tags
  const metaMappings = {
    description: 'name',
    keywords: 'name',
    'og:title': 'property',
    'og:description': 'property',
    'og:image': 'property',
    'og:url': 'property',
    'og:type': 'property',
    'og:site_name': 'property',
    'og:locale': 'property',
    'og:locale:alternate': 'property',
    'twitter:card': 'name',
    'twitter:site': 'name',
    'twitter:title': 'name',
    'twitter:description': 'name',
    'twitter:image': 'name'
  };

  Object.entries(metaMappings).forEach(([content, attr]) => {
    if (metaTags[content]) {
      let meta = document.querySelector(`meta[${attr}="${content}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, content);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', metaTags[content]);
    }
  });

  // Update or create JSON-LD schema
  if (metaTags.schema) {
    let schemaScript = document.getElementById('json-ld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(metaTags.schema);
  }
};

/**
 * Generate semantic alt text for images
 * @param {string} title - Content title
 * @param {string} type - Image type (poster, banner, card, etc.)
 * @returns {string} Semantic alt text
 */
export const generateAltText = (title, type = 'poster') => {
  const typeMap = {
    poster: 'uzbek tilida tarjima kino posteri',
    banner: 'uzbek tilida tarjima kino banneri',
    card: 'uzbek tilida tarjima kino kartasi',
    thumbnail: 'uzbek tilida tarjima kino rasmi'
  };

  const suffix = typeMap[type] || typeMap.poster;
  return `${title} ${suffix}`;
};
