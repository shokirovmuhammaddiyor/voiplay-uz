import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import ContentCard from '../components/ContentCard';
import { Search as SearchIcon, EyeOff, Sparkles, TrendingUp } from 'lucide-react';

export default function Search() {
  const { movies, tvShows, genres } = useFirebase();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Sync search state with URL query parameter
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      setQuery(qParam);
      runSearch(qParam);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchParams]);

  // Autofocus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const runSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const cleanTerm = searchTerm.toLowerCase().trim();
    const allItems = [...movies, ...tvShows];

    const searchHits = allItems.filter(item => {
      // Search by title
      const titleMatch = item.title && item.title.toLowerCase().includes(cleanTerm);
      
      // Search by year
      const yearMatch = item.year && item.year.toString().includes(cleanTerm);
      
      // Search by genre name matching the genre IDs of the item
      const genreMatch = item.genres && item.genres.some(genreId => {
        const gInfo = genres[genreId];
        return gInfo && (
          (gInfo.name && gInfo.name.toLowerCase().includes(cleanTerm)) ||
          (gInfo.nameUz && gInfo.nameUz.toLowerCase().includes(cleanTerm))
        );
      });

      return titleMatch || yearMatch || genreMatch;
    });

    setResults(searchHits);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    // Update URL query string param
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val);
      runSearch(val);
    } else {
      newParams.delete('q');
      setResults([]);
    }
    setSearchParams(newParams);
  };

  const handleQuickTagClick = (tagValue) => {
    setQuery(tagValue);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', tagValue);
    setSearchParams(newParams);
    runSearch(tagValue);
  };

  const quickTags = [
    { label: 'Jangari', val: 'Jangari' },
    { label: 'Drama', val: 'Drama' },
    { label: 'Kiberpank', val: 'kiberpank' },
    { label: 'Komediya', val: 'Komediya' },
    { label: 'Isekai', val: 'isekai' },
    { label: 'Romantika', val: 'Ramantik' }
  ];

  return (
    <div className="search-page-container animate-fade">
      
      {/* Centered Large Search Input */}
      <div className="search-input-hero-panel glass-panel">
        <div className="search-input-field-wrapper">
          <SearchIcon size={24} className="hero-search-icon orange-text" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Kino, serial yoki janrni yozing..."
            value={query}
            onChange={handleInputChange}
            className="hero-search-input"
          />
        </div>
        
        {/* Quick Suggest tags panel */}
        <div className="quick-tags-panel">
          <span className="tags-label">
            <TrendingUp size={14} /> Tavsiyalar:
          </span>
          <div className="tags-row">
            {quickTags.map(tag => (
              <button 
                key={tag.label}
                onClick={() => handleQuickTagClick(tag.val)}
                className="quick-tag-btn"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Output Section */}
      <main className="search-output-wrapper">
        {query.trim() && (
          <div className="results-info-header">
            <h3>Qidiruv natijalari: <span className="orange-text">"{query}"</span></h3>
            <p className="results-count-text">{results.length} ta yozuv topildi</p>
          </div>
        )}

        {results.length > 0 ? (
          <div className="media-cards-grid animate-slide-up">
            {results.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : query.trim() ? (
          <div className="empty-results-panel glass-panel animate-scale-up">
            <EyeOff size={48} className="empty-icon orange-text" />
            <h3 className="empty-title">Hech qanday natija yo'q</h3>
            <p className="empty-desc">
              Kiritilgan so'rov bo'yicha hech qanday ma'lumot topilmadi. So'zlarning to'g'ri yozilganligini tekshiring yoki boshqa kalit so'z kiritib ko'ring.
            </p>
          </div>
        ) : (
          <div className="search-idle-panel glass-panel">
            <Sparkles size={32} className="idle-icon orange-text" />
            <h3 className="idle-title">Nimadir qidiramizmi?</h3>
            <p className="idle-desc">
              Filmlar va seriallar olamidan istalgan nom yoki kalit so'zni yozib qidiruvni boshlang.
            </p>
          </div>
        )}
      </main>

      <style>{`
        .search-page-container {
          padding: 70px 4% 5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .search-input-hero-panel {
          margin: 3rem auto 2rem;
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          max-width: 800px;
        }

        .search-input-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .hero-search-icon {
          position: absolute;
          left: 18px;
          pointer-events: none;
        }

        .hero-search-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid var(--border-color);
          padding: 1.1rem 1rem 1.1rem 3.5rem;
          border-radius: 10px;
          color: white;
          font-size: 1.1rem;
          font-weight: 500;
          transition: var(--transition-smooth);
        }

        .hero-search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(255, 100, 10, 0.2);
          background: rgba(0, 0, 0, 0.6);
        }

        /* Quick Tags styling */
        .quick-tags-panel {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .tags-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .tags-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .quick-tag-btn {
          font-size: 0.8rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          font-weight: 600;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .quick-tag-btn:hover {
          background: rgba(255,100,10,0.1);
          border-color: var(--primary);
          color: white;
        }

        /* Results meta information */
        .results-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 3rem 0 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .results-info-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .results-count-text {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* Grid */
        .media-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 2rem;
        }

        /* Empty/Idle panels */
        .empty-results-panel, .search-idle-panel {
          padding: 4rem 2rem;
          border-radius: 12px;
          text-align: center;
          max-width: 500px;
          margin: 3rem auto;
        }

        .idle-icon, .empty-icon {
          margin-bottom: 1rem;
        }

        .idle-title, .empty-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .idle-desc, .empty-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .media-cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .search-input-hero-panel {
            padding: 1.5rem;
          }
          
          .results-info-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
