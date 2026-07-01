import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Sparkles } from 'lucide-react';
import { generateAltText } from '../utils/seo';
import { generateDetailUrl } from '../utils/urlHelper';

export default function ContentCard({ item }) {
  const navigate = useNavigate();
  const { id, title, posterPath, year, isPremium, genres, type } = item;

  const handleClick = () => {
    const url = generateDetailUrl(item);
    if (url) navigate(url);
  };

  return (
    <div className="content-card" onClick={handleClick}>
      <div className="card-image-wrapper">
        <img 
          src={posterPath || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80'} 
          alt={generateAltText(title, 'card')}
          loading="lazy"
          className="card-image"
        />
        
        {/* Glow overlay */}
        <div className="card-border-glow"></div>

        {/* Badges */}
        <div className="card-badges">
          {isPremium && (
            <span className="badge badge-premium" title="Premium Content">
              <Sparkles size={10} fill="#fff" />
              <span>PREMIUM</span>
            </span>
          )}
          <span className="badge badge-type">
            {type === 'movie' ? 'KINO' : 'SERIAL'}
          </span>
        </div>

        {/* Hover play button */}
        <div className="card-hover-overlay">
          <div className="play-button-circle">
            <Play size={20} fill="#fff" stroke="none" />
          </div>
        </div>

        {/* Text Details Overlay */}
        <div className="card-info-overlay">
          <h3 className="card-title">{title}</h3>
          <div className="card-meta">
            <span className="card-year">{year}</span>
            <span className="card-meta-dot">&bull;</span>
            <span className="card-category">
              {type === 'movie' ? 'Film' : 'Serial'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .content-card {
          flex: 0 0 auto;
          width: 200px;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          transition: var(--transition-bounce);
          position: relative;
        }

        .card-image-wrapper {
          position: relative;
          aspect-ratio: 2 / 3;
          background: #101115;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: var(--transition-bounce);
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        /* Border glow on hover */
        .card-border-glow {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-radius: 8px;
          pointer-events: none;
          z-index: 4;
          transition: var(--transition-smooth);
        }

        .content-card:hover .card-border-glow {
          border-color: var(--primary);
          box-shadow: inset 0 0 15px rgba(255, 100, 10, 0.4), 0 0 20px rgba(255, 100, 10, 0.3);
        }

        .content-card:hover .card-image-wrapper {
          transform: translateY(-8px) scale(1.03);
          border-color: var(--primary);
        }

        .content-card:hover .card-image {
          transform: scale(1.08);
        }

        /* Badges styling */
        .card-badges {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 5;
          pointer-events: none;
        }

        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .badge-premium {
          background: linear-gradient(135deg, #FF640A 0%, #FF8D0A 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 100, 10, 0.4);
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .badge-type {
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Hover Overlay (Play icon) */
        .card-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          z-index: 3;
          transition: var(--transition-smooth);
        }

        .content-card:hover .card-hover-overlay {
          opacity: 1;
        }

        .play-button-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 100, 10, 0.4);
          transform: scale(0.8);
          transition: var(--transition-bounce);
        }

        .content-card:hover .play-button-circle {
          transform: scale(1);
        }

        /* Info Gradient Overlay */
        .card-info-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2.5rem 0.75rem 0.75rem;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .card-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .card-meta-dot {
          color: var(--text-muted-dark);
        }

        @media (max-width: 600px) {
          .content-card {
            width: 155px;
          }
        }
      `}</style>
    </div>
  );
}
