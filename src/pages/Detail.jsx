import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFirebase } from '../contexts/FirebaseContext';
import ContentCard from '../components/ContentCard';
import { Play, Calendar, Layers, User, Clapperboard, Sparkles, Loader } from 'lucide-react';
import { slugify, generateContentUrl, findContentBySlug, parseLegacyUrl, generateMovieUrl, generateEpisodeUrl } from '../utils/urlHelper';
import { generateMetaTags } from '../utils/seo';

export default function Detail() {
  const params = useParams();
  const navigate = useNavigate();
  const { movies, tvShows, actors, genres, getEpisodes } = useFirebase();

  const [item, setItem] = useState(null);
  
  // TV Shows specific states
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodesData, setEpisodesData] = useState(null);

  // Parse URL parameters (support both legacy ID and new slug formats)
  const urlParams = React.useMemo(() => {
    const pathname = window.location.pathname;

    // Try parsing as legacy ID-based URL
    const legacyParsed = parseLegacyUrl(pathname);
    if (legacyParsed && legacyParsed.type === 'detail') {
      return legacyParsed;
    }

    // Direct parameter access
    if (params.param) {
      const isNumeric = /^\d+$/.test(params.param);
      if (isNumeric) {
        return {
          id: params.param,
          isSlug: false
        };
      } else {
        return {
          slug: params.param,
          isSlug: true
        };
      }
    }

    return null;
  }, [params]);

  // Find the item details in movies or tvShows catalog
  useEffect(() => {
    if (!urlParams) return;

    let foundContent = null;

    if (urlParams.isSlug) {
      // Find by slug
      foundContent = findContentBySlug(urlParams.slug, movies, tvShows);
    } else {
      // Find by ID (legacy)
      const foundMovie = movies.find(m => m.id === urlParams.id);
      const foundTv = tvShows.find(t => t.id === urlParams.id);
      foundContent = foundMovie || foundTv;
    }

    setItem(foundContent);

    // Reset media states when ID changes
    setEpisodesData(null);
    setSeasons([]);
    setActiveSeason(1);

    // If it's a TV show, prefetch the season listings
    if (foundContent && foundContent.type === 'tv') {
      const fetchTvInfo = async () => {
        const episodes = await getEpisodes(foundContent.id);
        if (episodes) {
          setEpisodesData(episodes);
          // filter empty elements (index 0 might be null)
          const seasonIndices = [];
          
          if (Array.isArray(episodes)) {
            episodes.forEach((s, idx) => {
              if (s) seasonIndices.push(idx);
            });
          } else if (typeof episodes === 'object') {
            Object.keys(episodes).forEach((key) => {
              const idx = parseInt(key);
              if (!isNaN(idx) && episodes[key]) {
                seasonIndices.push(idx);
              }
            });
          }
          
          setSeasons(seasonIndices);
          if (seasonIndices.length > 0) {
            setActiveSeason(seasonIndices[0]);
          }
        }
      };
      fetchTvInfo();
    }
  }, [urlParams, movies, tvShows, getEpisodes]);

  // Navigate to Dedicated Movie Watch Page
  const handleWatchMovie = () => {
    const newUrl = generateMovieUrl(item.title);
    if (newUrl) navigate(newUrl);
  };

  // Navigate to Dedicated Episode Watch Page
  const handleWatchEpisode = (episodeNum, e) => {
    e.preventDefault();
    const newUrl = generateEpisodeUrl(item.title, activeSeason, episodeNum);
    if (newUrl) {
      navigate(newUrl);
    }
  };

  // Generate dynamic meta tags
  const metaTags = React.useMemo(() => {
    if (!item) return null;

    const shortDesc = item.overview?.slice(0, 150) || 'Eng yaxshi kontent';
    const keywords = `${item.title} uzbek tilida, ${item.title} tarjima kino, ${item.title} barcha qismlari, voiplay ${item.title}, tarjima seriallar 2026`;
    const canonicalUrl = `https://voiplay.uz/detail/${slugify(item.title)}`;

    return {
      title: `${item.title} Uzbek Tilida Tarjima Online Ko'rish (Barcha Qismlar) - VoiPlay`,
      description: `${item.title} o'zbek tilida tarjima kino/serialini VoiPlay platformasida yuqori (HD) sifatda va reklamasiz online tomosha qiling. ${shortDesc}.`,
      keywords: keywords,
      ogTitle: `${item.title} Uzbek Tilida Tarjima Online Ko'rish - VoiPlay`,
      ogDescription: `${item.title} o'zbek tilida tarjima kino/serialini VoiPlay platformasida yuqori (HD) sifatda va reklamasiz online tomosha qiling.`,
      ogImage: item.posterPath || item.backdropPath,
      ogUrl: canonicalUrl,
      ogType: item.type === 'movie' ? 'video.movie' : 'video.tv_show',
      canonical: canonicalUrl
    };
  }, [item]);

  if (!item) {
    return (
      <div className="detail-loading-screen">
        <Loader className="loader-spin" size={48} />
        <p className="loading-text">Tafsilotlar yuklanmoqda...</p>
      </div>
    );
  }

  // Get matching actors for cast list
  const castList = [];
  if (item.actors) {
    Object.keys(item.actors).forEach(actorId => {
      const actorInfo = actors[actorId];
      if (actorInfo) {
        castList.push({ id: actorId, role: item.actors[actorId], ...actorInfo });
      }
    });
  }

  // Recommendations: Items of same genre
  const recommendations = [...movies, ...tvShows]
    .filter(x => x.id !== item.id && x.genres && item.genres && x.genres.some(g => item.genres.includes(g)))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5);

  return (
    <>
      {metaTags && (
        <Helmet>
          <title>{metaTags.title}</title>
          <meta name="description" content={metaTags.description} />
          <meta name="keywords" content={metaTags.keywords} />
          <link rel="canonical" href={metaTags.canonical} />
          <meta property="og:title" content={metaTags.ogTitle} />
          <meta property="og:description" content={metaTags.ogDescription} />
          <meta property="og:image" content={metaTags.ogImage} />
          <meta property="og:url" content={metaTags.ogUrl} />
          <meta property="og:type" content={metaTags.ogType} />
          <meta property="og:site_name" content="VoiPlay" />
          <meta property="og:locale" content="uz_UZ" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@voiplayuz" />
          <meta name="twitter:title" content={metaTags.ogTitle} />
          <meta name="twitter:description" content={metaTags.ogDescription} />
          <meta name="twitter:image" content={metaTags.ogImage} />
        </Helmet>
      )}
      <div className="detail-page animate-fade">
      
      {/* Visual Parallax Banner Header */}
      <div 
        className="detail-hero-banner" 
        style={{ backgroundImage: `url(${item.backdropPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'})` }}
      >
        <div className="detail-banner-overlay"></div>
      </div>

      <div className="detail-content-container">
        
        {/* Poster & Main Metadata block */}
        <div className="detail-main-info-row">
          <div className="detail-poster-col">
            <img 
              src={item.posterPath || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80'} 
              alt={item.title} 
              className="detail-poster-img"
            />
            {item.isPremium && (
              <span className="premium-label-badge">
                <Sparkles size={12} fill="#fff" />
                PREMIUM
              </span>
            )}
          </div>

          <div className="detail-meta-col">
            <div className="meta-badge-line">
              <span className="type-badge">
                {item.type === 'movie' ? 'Film' : 'Serial'}
              </span>
              <span className="meta-info-item">
                <Calendar size={14} />
                <span>{item.year}</span>
              </span>
              {item.totalSeasons && (
                <span className="meta-info-item">
                  <Layers size={14} />
                  <span>{item.totalSeasons} Sezon</span>
                </span>
              )}
            </div>

            <h1 className="detail-title-text">{item.title}</h1>

            <div className="genres-tags-line">
              {item.genres && item.genres.map(genreId => {
                const gInfo = genres[genreId];
                return (
                  <span key={genreId} className="genre-tag">
                    {gInfo ? (gInfo.nameUz || gInfo.name) : genreId}
                  </span>
                );
              })}
            </div>

            <p className="detail-overview-text">
              {item.overview || "Ushbu video uchun hech qanday ma'lumot kiritilmagan. Sevimli filmlaringizni o'zbek tilida, yuqori sifatda faqat bizda tomosha qiling."}
            </p>

            {item.type === 'movie' ? (
              <button onClick={handleWatchMovie} className="btn-premium btn-primary watch-now-detail-btn">
                <Play size={20} fill="#fff" stroke="none" />
                <span>Tomosha qilish</span>
              </button>
            ) : (
              <a href="#episodes-section" className="btn-premium btn-primary watch-now-detail-btn">
                <Play size={20} fill="#fff" stroke="none" />
                <span>Qismlarni ko'rish</span>
              </a>
            )}
          </div>
        </div>

        {/* Cast & voice actors Section */}
        {castList.length > 0 && (
          <section className="detail-section animate-slide-up">
            <h2 className="section-title">
              <User size={20} className="orange-text" /> 
              Ijodkorlar va Ovoz beruvchilar
            </h2>
            <div className="actors-horizontal-list">
              {castList.map(actor => (
                <div key={actor.id} className="actor-card glass-panel">
                  <img 
                    src={actor.profilePath || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                    alt={actor.name} 
                    className="actor-avatar"
                  />
                  <div className="actor-meta">
                    <span className="actor-name">{actor.name}</span>
                    <span className="actor-role">{actor.role || actor.knownForDepartment}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TV Series Season & Episode Matrix */}
        {item.type === 'tv' && seasons.length > 0 && (
          <section id="episodes-section" className="detail-section animate-slide-up">
            <h2 className="section-title">
              <Layers size={20} className="orange-text" /> 
              Sezonlar va Qismlar
            </h2>

            {/* Season switcher */}
            <div className="seasons-tab-bar">
              {seasons.map(sIndex => (
                <button 
                  key={sIndex}
                  onClick={() => setActiveSeason(sIndex)}
                  className={`season-tab-btn ${activeSeason === sIndex ? 'active' : ''}`}
                >
                  Sezon {sIndex}
                </button>
              ))}
            </div>

            {/* Episodes List Grid */}
            <div className="episodes-grid">
              {episodesData[activeSeason] && (() => {
                const epList = Array.isArray(episodesData[activeSeason])
                  ? episodesData[activeSeason]
                  : (() => {
                      const list = [];
                      Object.keys(episodesData[activeSeason]).forEach(key => {
                        const idx = parseInt(key);
                        if (!isNaN(idx)) list[idx] = episodesData[activeSeason][key];
                      });
                      return list;
                    })();

                return epList.map((episode, idx) => {
                  if (!episode) return null; // skip null index
                  const epUrl = generateEpisodeUrl(item.title, activeSeason, idx);
                  return (
                    <a 
                      key={idx} 
                      href={epUrl || '#'}
                      className="episode-card-item glass-panel"
                      onClick={(e) => handleWatchEpisode(idx, e)}
                    >
                      <div className="episode-thumbnail-wrapper">
                        <img 
                          src={episode.still_path || item.backdropPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80'} 
                          alt={`Episode ${idx}`} 
                          className="episode-thumbnail"
                        />
                        <div className="episode-play-icon-overlay">
                          <Play size={18} fill="#fff" stroke="none" />
                        </div>
                        <span className="episode-badge-count">{idx}-qism</span>
                      </div>
                      <div className="episode-card-details">
                        <h4 className="episode-number-title">
                          {idx}-Qism {episode.title ? `: ${episode.title}` : ''}
                        </h4>
                        <p className="episode-duration">
                          {episode.duration ? `${episode.duration} daqiqa` : '24 daqiqa'}
                        </p>
                      </div>
                    </a>
                  );
                });
              })()}
            </div>
          </section>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="detail-section recomendations-section animate-slide-up">
            <h2 className="section-title">
              <Clapperboard size={20} className="orange-text" /> 
              Tavsiya etiladigan videolar
            </h2>
            <div className="recommendations-flex-row">
              {recommendations.map(rec => (
                <ContentCard key={rec.id} item={rec} />
              ))}
            </div>
          </section>
        )}

      </div>

      <style>{`
        .detail-loading-screen {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .detail-hero-banner {
          height: 400px;
          background-size: cover;
          background-position: center 20%;
          position: relative;
          z-index: 1;
        }

        .detail-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.85) 60%, rgba(11,12,16,1) 100%);
        }

        .detail-content-container {
          max-width: 1200px;
          margin: -150px auto 0;
          padding: 0 4% 5rem;
          position: relative;
          z-index: 2;
        }

        .detail-main-info-row {
          display: flex;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .detail-poster-col {
          flex: 0 0 260px;
          position: relative;
        }

        .detail-poster-img {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-premium);
        }

        .premium-label-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #FF640A 0%, #FF8D0A 100%);
          color: white;
          padding: 0.35rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          box-shadow: 0 4px 15px rgba(255, 100, 10, 0.4);
        }

        .detail-meta-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 1rem;
        }

        .meta-badge-line {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1rem;
        }

        .type-badge {
          font-size: 0.75rem;
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 800;
        }

        .meta-info-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .detail-title-text {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .genres-tags-line {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .genre-tag {
          font-size: 0.8rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-color);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .detail-overview-text {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin-bottom: 2.25rem;
          max-width: 800px;
        }

        .watch-now-detail-btn {
          width: fit-content;
          gap: 0.75rem;
          padding: 1rem 2.2rem;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(255, 100, 10, 0.4);
        }

        /* Detail section layout */
        .detail-section {
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        /* Actor listings */
        .actors-horizontal-list {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          scrollbar-width: thin;
        }

        .actor-card {
          flex: 0 0 200px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
        }

        .actor-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .actor-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .actor-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .actor-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Season tab-bar styling */
        .seasons-tab-bar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }

        .season-tab-btn {
          padding: 0.6rem 1.4rem;
          border-radius: 6px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .season-tab-btn.active, .season-tab-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: var(--shadow-orange);
        }

        /* Episodes styling */
        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .episode-card-item {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: var(--transition-bounce);
          align-items: center;
        }

        .episode-card-item:hover {
          background: rgba(255, 100, 10, 0.05);
          border-color: var(--primary);
          transform: translateY(-4px) scale(1.02);
          box-shadow: var(--shadow-orange);
        }

        .episode-thumbnail-wrapper {
          position: relative;
          width: 120px;
          aspect-ratio: 16 / 9;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          background: #101115;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .episode-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .episode-play-icon-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-smooth);
        }

        .episode-card-item:hover .episode-play-icon-overlay {
          opacity: 1;
        }

        .episode-card-item:hover .episode-thumbnail {
          transform: scale(1.05);
        }

        .episode-badge-count {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 3px;
        }

        .episode-card-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .episode-number-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .episode-duration {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Recommendations rows */
        .recommendations-flex-row {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        @media (max-width: 900px) {
          .detail-main-info-row {
            flex-direction: column;
            gap: 2rem;
          }

          .detail-poster-col {
            width: 200px;
            margin: 0 auto;
          }

          .detail-meta-col {
            text-align: center;
            align-items: center;
          }

          .meta-badge-line, .genres-tags-line {
            justify-content: center;
          }

          .watch-now-detail-btn {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
    </>
  );
}
