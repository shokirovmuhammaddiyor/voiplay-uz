import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import ContentCard from '../components/ContentCard';
import { Filter, EyeOff, LayoutGrid } from 'lucide-react';

export default function List() {
  const { movies, tvShows, genres } = useFirebase();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [mediaType, setMediaType] = useState('all'); // 'all' | 'movie' | 'tv'
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'addedAt'

  // Initialize filters from search params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'movie' || typeParam === 'tv') {
      setMediaType(typeParam);
    } else {
      setMediaType('all');
    }

    const genreParam = searchParams.get('genre');
    if (genreParam) {
      setGenreFilter(genreParam);
    } else {
      setGenreFilter('all');
    }
  }, [searchParams]);

  // Combine lists
  let filteredItems = [];
  if (mediaType === 'all') {
    filteredItems = [...movies, ...tvShows];
  } else if (mediaType === 'movie') {
    filteredItems = [...movies];
  } else if (mediaType === 'tv') {
    filteredItems = [...tvShows];
  }

  // Apply Genre Filter
  if (genreFilter !== 'all') {
    filteredItems = filteredItems.filter(item => 
      item.genres && item.genres.includes(genreFilter)
    );
  }

  // Apply Year Filter
  if (yearFilter !== 'all') {
    filteredItems = filteredItems.filter(item => 
      item.year && item.year.toString() === yearFilter
    );
  }

  // Apply Sorting
  filteredItems.sort((a, b) => {
    if (sortBy === 'popularity') {
      return (b.popularity || 0) - (a.popularity || 0);
    } else if (sortBy === 'addedAt') {
      return (b.addedAt || 0) - (a.addedAt || 0);
    }
    return 0;
  });

  // Extract all unique release years from database to populate year dropdown
  const years = Array.from(
    new Set(
      [...movies, ...tvShows]
        .map(item => item.year)
        .filter(y => y)
    )
  ).sort((a, b) => b - a);

  // Update URL on Type Tab switch
  const handleTypeChange = (newType) => {
    setMediaType(newType);
    const newParams = new URLSearchParams(searchParams);
    if (newType === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', newType);
    }
    setSearchParams(newParams);
  };

  // Update URL on Genre switch
  const handleGenreChange = (e) => {
    const val = e.target.value;
    setGenreFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all') {
      newParams.delete('genre');
    } else {
      newParams.set('genre', val);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="list-page-container animate-fade">
      
      {/* Header filter actions section */}
      <div className="list-header-banner glass-panel">
        <div className="list-header-content">
          <h1 className="list-title">
            <LayoutGrid size={24} className="orange-text" />
            Media Katalog
          </h1>
          
          <div className="filter-controls-row">
            {/* Type switcher Tabs */}
            <div className="type-switcher-tabs">
              <button 
                onClick={() => handleTypeChange('all')}
                className={`type-tab-btn ${mediaType === 'all' ? 'active' : ''}`}
              >
                Barchasi
              </button>
              <button 
                onClick={() => handleTypeChange('movie')}
                className={`type-tab-btn ${mediaType === 'movie' ? 'active' : ''}`}
              >
                Filmlar
              </button>
              <button 
                onClick={() => handleTypeChange('tv')}
                className={`type-tab-btn ${mediaType === 'tv' ? 'active' : ''}`}
              >
                Seriallar
              </button>
            </div>

            {/* Selector Dropdowns */}
            <div className="filter-dropdowns-group">
              <div className="filter-select-wrapper">
                <Filter size={14} className="select-icon" />
                <select 
                  value={genreFilter} 
                  onChange={handleGenreChange}
                  className="filter-select"
                >
                  <option value="all">Barcha Janrlar</option>
                  {Object.entries(genres).map(([id, genre]) => (
                    <option key={id} value={id}>
                      {genre.nameUz || genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrapper">
                <Filter size={14} className="select-icon" />
                <select 
                  value={yearFilter} 
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Barcha Yillar</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrapper">
                <Filter size={14} className="select-icon" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="popularity">Mashhurlik bo'yicha</option>
                  <option value="addedAt">Yangi qo'shilganlar</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid listing content */}
      <main className="list-grid-wrapper">
        {filteredItems.length > 0 ? (
          <div className="media-cards-grid animate-slide-up">
            {filteredItems.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-results-panel glass-panel animate-scale-up">
            <EyeOff size={48} className="empty-icon orange-text" />
            <h3 className="empty-title">Hech narsa topilmadi</h3>
            <p className="empty-desc">
              Tanlangan filtr mezonlariga mos keladigan videolar mavjud emas. Filtrlarni o'zgartirib qayta urinib ko'ring.
            </p>
            <button 
              onClick={() => {
                setYearFilter('all');
                handleTypeChange('all');
                setSearchParams({});
              }}
              className="btn-premium btn-primary reset-filter-btn"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </main>

      <style>{`
        .list-page-container {
          padding: 70px 4% 5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .list-header-banner {
          margin: 2rem 0;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .list-header-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .list-title {
          font-size: 1.6rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        /* Tabs styling */
        .type-switcher-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.25rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .type-tab-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .type-tab-btn.active, .type-tab-btn:hover {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 100, 10, 0.2);
        }

        /* Selector dropdowns styling */
        .filter-dropdowns-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .select-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .filter-select {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 0.5rem 2.25rem 0.5rem 2rem;
          border-radius: 6px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          min-width: 160px;
          transition: var(--transition-smooth);
        }

        .filter-select:hover, .filter-select:focus {
          border-color: var(--primary);
          background: rgba(0,0,0,0.3);
          box-shadow: 0 0 10px rgba(255, 100, 10, 0.1);
        }

        /* Dropdown arrow replacement styling */
        .filter-select-wrapper::after {
          content: '▼';
          font-size: 8px;
          color: var(--text-muted);
          position: absolute;
          right: 12px;
          pointer-events: none;
        }

        /* Grid */
        .list-grid-wrapper {
          margin-top: 2rem;
        }

        .media-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 2rem;
        }

        /* Empty state */
        .empty-results-panel {
          padding: 4rem 2rem;
          border-radius: 12px;
          text-align: center;
          max-width: 500px;
          margin: 3rem auto;
        }

        .empty-icon {
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .empty-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1.75rem;
          line-height: 1.6;
        }

        .reset-filter-btn {
          font-size: 0.85rem;
          padding: 0.6rem 1.4rem;
        }

        @media (max-width: 600px) {
          .media-cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
