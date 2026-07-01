import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebase } from '../contexts/FirebaseContext';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { ArrowLeft, Loader, Layers, Clapperboard, Play, Sparkles } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import { parseSeoUrl, findContentBySlug, slugify, generateEpisodeUrl, generateMovieUrl } from '../utils/urlHelper';

export default function Watch() {
  const params = useParams();
  const navigate = useNavigate();
  const { movies, tvShows, getMovieSource, getEpisodes, getEpisodeSource, genres, loading: firebaseLoading } = useFirebase();

  const videoRef = useRef(null);
  const [item, setItem] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // TV Shows Specific states
  const [episodesList, setEpisodesList] = useState([]);
  const [seasonsCount, setSeasonsCount] = useState(1);

  // Parse URL parameters (SEO slug format)
  const urlParams = React.useMemo(() => {
    const pathname = window.location.pathname;

    // Direct parameter access for slug-based routes
    if (params.slug) {
      const isMovie = pathname.startsWith('/movie');
      if (isMovie) {
        // Remove -uzbek-tilida suffix from slug for content lookup
        const cleanSlug = params.slug.replace(/-uzbek-tilida$/, '');
        console.log('Watch.jsx - Movie URL parsed:', { slug: params.slug, cleanSlug });
        return {
          type: 'movie',
          slug: cleanSlug
        };
      } else {
        // TV route with season and episode
        // Remove -uzbek-tilida suffix from slug for content lookup
        const cleanSlug = params.slug.replace(/-uzbek-tilida$/, '');
        // Remove -qism suffix from episode for parsing
        const cleanEpisode = params.episode ? params.episode.replace(/-qism$/, '') : null;
        console.log('Watch.jsx - TV URL parsed:', {
          slug: params.slug,
          cleanSlug,
          season: params.season,
          episode: params.episode,
          cleanEpisode
        });
        return {
          type: 'tv',
          slug: cleanSlug,
          season: params.season ? parseInt(params.season) : null,
          episode: cleanEpisode ? parseInt(cleanEpisode) : null
        };
      }
    }

    console.log('Watch.jsx - No slug found in URL');
    return null;
  }, [params]);

  // 1. Fetch Item info
  useEffect(() => {
    if (!urlParams) return;

    let foundContent = null;

    if (urlParams.slug) {
      // Find by slug
      foundContent = findContentBySlug(urlParams.slug, movies, tvShows);
    } else if (urlParams.id) {
      // Find by ID (legacy)
      const foundMovie = movies.find(m => m.id === urlParams.id);
      const foundTv = tvShows.find(t => t.id === urlParams.id);
      foundContent = foundMovie || foundTv;
    }

    setItem(foundContent);
  }, [urlParams, movies, tvShows]);

  // 2. Fetch Video Source URL
  useEffect(() => {
    async function loadSource() {
      if (!item) return;
      
      // Wait for Firebase context to be ready
      if (firebaseLoading) return;
      
      setLoading(true);
      setError('');
      setSourceUrl('');

      try {
        if (urlParams.type === 'tv' && urlParams.season && urlParams.episode) {
          // TV Show Episode Watch
          console.log('Fetching episode source:', { tvId: item.id, season: urlParams.season, episode: urlParams.episode });
          const source = await getEpisodeSource(item.id, urlParams.season, urlParams.episode);
          console.log('Episode source result:', source);
          if (source && source.length > 0) {
            setSourceUrl(source[0].url);
          } else {
            console.error('No source found or empty array:', source);
            setError("Ushbu qism uchun video manbasi topilmadi.");
          }

          // Fetch other episodes of current season for bottom selection drawer
          const allEps = await getEpisodes(item.id);
          console.log('All episodes for TV show:', allEps);
          if (allEps && allEps[urlParams.season]) {
            setEpisodesList(allEps[urlParams.season]);
          } else {
            console.error('No episodes found for season:', urlParams.season);
          }
        } else {
          // Movie Watch
          const source = await getMovieSource(item.id);
          if (source && source.length > 0) {
            setSourceUrl(source[0].url);
          } else {
            setError("Ushbu film uchun video manbasi topilmadi.");
          }
        }
      } catch (err) {
        console.error("Video load error:", err);
        setError("Videoni yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    }

    loadSource();
  }, [item, urlParams, firebaseLoading]);

  // 3. Initialize Plyr + Hls.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourceUrl) return;

    let hls = null;
    let player = null;

    // Define plyr options (highly convenient for mobile)
    const plyrOptions = {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'duration',
        'mute', 'volume', 'settings', 'pip', 'fullscreen'
      ],
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      tooltips: { controls: true, seek: true }
    };

    // Initialize Plyr player immediately on render
    player = new Plyr(video, plyrOptions);

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30, // Optimize memory buffer sizes
        enableWorker: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              console.error("HLS non-recoverable error");
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari Native HLS support
      video.src = sourceUrl;
    } else {
      setError("Ushbu brauzer HLS oqimlarini o'ynatishni qo'llab-quvvatlamaydi.");
    }

    // Cleanup players on unmount or source change
    return () => {
      if (player) {
        player.destroy();
      }
      if (hls) {
        hls.destroy();
      }
    };
  }, [sourceUrl]);

  if (!item) {
    return (
      <div className="watch-loading-screen">
        <Loader className="loader-spin" size={48} />
        <p>Tafsilotlar yuklanmoqda...</p>
      </div>
    );
  }

  // Related Recommendations (Movies only)
  const recommendations = [...movies]
    .filter(x => x.id !== item.id && x.genres && item.genres && x.genres.some(g => item.genres.includes(g)))
    .slice(0, 5);

  // Generate canonical URL
  const canonicalUrl = React.useMemo(() => {
    if (!item) return 'https://voiplay.uz';
    if (urlParams.type === 'movie') {
      return `https://voiplay.uz/movie/${slugify(item.title)}-uzbek-tilida`;
    } else if (urlParams.type === 'tv' && urlParams.season && urlParams.episode) {
      return `https://voiplay.uz/tv/${slugify(item.title)}-uzbek-tilida/season-${urlParams.season}-fasl/${urlParams.episode}-qism`;
    }
    return 'https://voiplay.uz';
  }, [item, urlParams]);

  return (
    <>
      {canonicalUrl && (
        <Helmet>
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
      )}
      <div className="watch-page animate-fade">
      
      {/* Immersive Watch Header */}
      <div className="watch-top-nav">
        <Link to={`/detail/${slugify(item.title)}`} className="back-link-btn glass-panel" title="Orqaga qaytish">
          <ArrowLeft size={18} />
          <span>Orqaga</span>
        </Link>
        <div className="watch-title-block">
          <h1 className="watch-main-title">
            {item.title}
          </h1>
          {urlParams.season && urlParams.episode && (
            <p className="watch-subtitle">
              {urlParams.season}-Sezon, {urlParams.episode}-Qism
            </p>
          )}
        </div>
      </div>

      {/* Video Container Frame */}
      <div className="watch-video-section">
        {loading && (
          <div className="player-placeholder glass-panel">
            <Loader className="loader-spin orange-text" size={40} />
            <p>Video yuklanmoqda...</p>
          </div>
        )}
        
        {error && (
          <div className="player-placeholder glass-panel error-box">
            <p className="error-text">{error}</p>
            <Link to={`/detail/${slugify(item.title)}`} className="btn-premium btn-secondary reset-btn">
              Tafsilotlarga qaytish
            </Link>
          </div>
        )}

        <div className={`plyr-player-wrapper animate-scale-up ${(loading || error) ? 'hidden-player' : ''}`}>
          <video 
            ref={videoRef} 
            playsInline 
            crossOrigin="anonymous"
            poster={item.backdropPath || item.posterPath}
            className="plyr-video"
          />
        </div>
      </div>

      {/* Bottom selection drawer (Mobile friendly) */}
      <div className="watch-drawer-container">
        
        {/* If it's a TV show: show other episodes of the current season */}
        {urlParams.type === 'tv' && urlParams.season && urlParams.episode && episodesList.length > 0 && (
          <section className="watch-drawer-section animate-slide-up">
            <h2 className="drawer-title-header">
              <Layers size={18} className="orange-text" />
              <span>Sezonning boshqa qismlari</span>
            </h2>
            
            {/* Horizontal swiper of episodes */}
            <div className="watch-episodes-swiper">
              {episodesList.map((epInfo, idx) => {
                if (!epInfo) return null; // skip index 0
                const isCurrent = idx.toString() === urlParams.episode.toString();
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (!isCurrent) {
                        const newUrl = generateEpisodeUrl(item.title, urlParams.season, idx);
                        if (newUrl) navigate(newUrl);
                      }
                    }}
                    className={`swiper-episode-card glass-panel ${isCurrent ? 'active' : ''}`}
                  >
                    <div className="swiper-img-wrapper">
                      <img 
                        src={epInfo.still_path || item.backdropPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80'} 
                        alt={`Qism ${idx}`} 
                        className="swiper-thumb"
                      />
                      {isCurrent ? (
                        <div className="swiper-play-badge current">
                          <span>Kuzatilmoqda</span>
                        </div>
                      ) : (
                        <div className="swiper-play-badge">
                          <Play size={12} fill="#fff" stroke="none" />
                        </div>
                      )}
                    </div>
                    <div className="swiper-info">
                      <h4 className="swiper-ep-title">{idx}-Qism {epInfo.title ? `: ${epInfo.title}` : ''}</h4>
                      <p className="swiper-duration">{epInfo.duration ? `${epInfo.duration} daqiqa` : '24 daqiqa'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* If it's a Movie: show recommendations */}
        {urlParams.type === 'movie' && recommendations.length > 0 && (
          <section className="watch-drawer-section animate-slide-up">
            <h2 className="drawer-title-header">
              <Clapperboard size={18} className="orange-text" />
              <span>O'xshash filmlar</span>
            </h2>
            <div className="swiper-recommendations-row">
              {recommendations.map(rec => (
                <ContentCard key={rec.id} item={rec} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .watch-page {
          padding: 85px 4% 5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .watch-loading-screen {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        /* Immersive header */
        .watch-top-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .back-link-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          flex-shrink: 0;
        }

        .back-link-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: var(--shadow-orange);
        }

        .watch-title-block {
          overflow: hidden;
        }

        .watch-main-title {
          font-size: 1.4rem;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .watch-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Video frame wrapper */
        .watch-video-section {
          width: 100%;
          margin-bottom: 3rem;
        }

        .plyr-player-wrapper {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-premium);
          border: 1px solid var(--border-color);
          background: #000;
        }

        /* Override Plyr primary color theme to matching Voiplay Orange */
        .plyr--full-ui input[type=range] {
          color: var(--primary) !important;
        }
        .plyr__control--overlaid {
          background: var(--primary) !important;
          box-shadow: var(--shadow-orange) !important;
        }
        .plyr__controls .plyr__control:hover {
          background: var(--primary) !important;
        }
        .plyr__menu__container .plyr__control[role=menuitemradio][aria-checked=true]::before {
          background: var(--primary) !important;
        }

        .player-placeholder {
          aspect-ratio: 16 / 9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: #090a0d;
          border-radius: 12px;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
        }

        .error-box {
          padding: 2rem;
          text-align: center;
        }

        .error-text {
          color: #ef4444;
          font-weight: 700;
          font-size: 1.05rem;
        }

        .reset-btn {
          font-size: 0.8rem;
          padding: 0.5rem 1.25rem;
          margin-top: 1rem;
        }

        /* Swipers / Drawers */
        .watch-drawer-container {
          margin-top: 2rem;
        }

        .watch-drawer-section {
          margin-bottom: 3rem;
        }

        .drawer-title-header {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        /* Swiper cards list */
        .watch-episodes-swiper {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 1.25rem;
          scroll-behavior: smooth;
        }

        .swiper-episode-card {
          flex: 0 0 240px;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .swiper-episode-card:hover {
          border-color: var(--primary);
          background: rgba(255, 100, 10, 0.05);
          transform: translateY(-4px);
        }

        .swiper-episode-card.active {
          border-color: var(--primary);
          background: rgba(255, 100, 10, 0.08);
          cursor: default;
        }

        .swiper-img-wrapper {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 4px;
          overflow: hidden;
          background: #101115;
          margin-bottom: 0.5rem;
        }

        .swiper-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .swiper-play-badge {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-smooth);
        }

        .swiper-episode-card:hover:not(.active) .swiper-play-badge {
          opacity: 1;
        }

        .swiper-play-badge.current {
          opacity: 1;
          background: rgba(11, 12, 16, 0.8);
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .swiper-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .swiper-ep-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.15rem;
        }

        .swiper-duration {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Recommendations flex */
        .swiper-recommendations-row {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .watch-page {
            padding: 80px 3% 4rem;
          }
          
          .watch-main-title {
            font-size: 1.15rem;
          }
          
          .swiper-episode-card {
            width: 200px;
            flex: 0 0 200px;
          }
        }

        .hidden-player {
          position: absolute;
          width: 0;
          height: 0;
          opacity: 0;
          pointer-events: none;
          overflow: hidden;
        }
      `}</style>
    </div>
    </>
  );
}
