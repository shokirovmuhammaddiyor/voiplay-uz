import React from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import HeroCarousel from '../components/HeroCarousel';
import ContentCard from '../components/ContentCard';
import { Play, TrendingUp, Sparkles, Film, Tv, ChevronRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { movies, tvShows, loading, error, genres } = useFirebase();

  // Combine items to find recently added ones
  const allItems = [...movies, ...tvShows];
  const recentlyAdded = [...allItems]
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
    .slice(0, 10);

  // Featured slides for Hero Carousel
  const featured = allItems
    .filter(item => item.backdropPath)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 4);

  // Genres preview
  const genreList = Object.entries(genres).slice(0, 8);

  if (loading) {
    return (
      <div className="home-loading-screen">
        <Loader className="loader-spin" size={48} />
        <p className="loading-text">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error-screen glass-panel">
        <h2 className="error-title">Xatolik yuz berdi</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-premium btn-primary">
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="home-page animate-fade">
      {/* Cinematic Hero Slider */}
      <HeroCarousel items={featured.length > 0 ? featured : allItems.slice(0, 4)} />

      <main className="home-rows-container">
        
        {/* Row 1: So'nggi qo'shilganlar */}
        {recentlyAdded.length > 0 && (
          <div className="scroll-row-container animate-slide-up">
            <h2 className="scroll-row-title">
              <span>
                <Sparkles className="title-icon orange-text" size={20} />
                So'nggi qo'shilganlar
              </span>
              <Link to="/list" className="accent-text">
                Barchasi <ChevronRight size={14} />
              </Link>
            </h2>
            <div className="scroll-row-wrapper">
              {recentlyAdded.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Row 2: Top Kinolar */}
        {movies.length > 0 && (
          <div className="scroll-row-container">
            <h2 className="scroll-row-title">
              <span>
                <Film className="title-icon orange-text" size={20} />
                Eng sara filmlar
              </span>
              <Link to="/list?type=movie" className="accent-text">
                Barchasi <ChevronRight size={14} />
              </Link>
            </h2>
            <div className="scroll-row-wrapper">
              {movies
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 10)
                .map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        )}

        {/* Row 3: Top Seriallar */}
        {tvShows.length > 0 && (
          <div className="scroll-row-container">
            <h2 className="scroll-row-title">
              <span>
                <Tv className="title-icon orange-text" size={20} />
                Mashhur seriallar
              </span>
              <Link to="/list?type=tv" className="accent-text">
                Barchasi <ChevronRight size={14} />
              </Link>
            </h2>
            <div className="scroll-row-wrapper">
              {tvShows
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 10)
                .map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        )}

      </main>

      <style>{`
        .home-loading-screen {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .loading-text {
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .home-error-screen {
          max-width: 500px;
          margin: 10vh auto;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .error-title {
          font-size: 1.4rem;
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .error-message {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        /* Category buttons row */
        .home-quick-categories {
          padding: 1.5rem 4% 0.5rem;
        }

        .categories-wrapper {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none;
        }

        .categories-wrapper::-webkit-scrollbar {
          display: none;
        }

        .cat-tag-btn {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.2rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .cat-tag-btn:hover {
          background: rgba(255, 100, 10, 0.1);
          border-color: var(--primary);
          color: var(--text-main);
        }

        .home-rows-container {
          padding-bottom: 3rem;
        }

        .title-icon {
          display: inline-block;
          vertical-align: middle;
          margin-right: 0.5rem;
        }

        .scroll-row-title span {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
