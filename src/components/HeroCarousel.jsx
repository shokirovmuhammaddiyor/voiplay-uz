import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateAltText } from '../utils/seo';
import { generateDetailUrl } from '../utils/urlHelper';

export default function HeroCarousel({ items }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return <div className="hero-skeleton glass-panel"></div>;
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="hero-carousel-container">
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;
        const { id, title, backdropPath, overview, year, type, isPremium } = item;
        return (
          <div 
            key={id} 
            className={`hero-slide ${isActive ? 'active' : ''}`}
            style={{ backgroundImage: `url(${backdropPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'})` }}
            role="img"
            aria-label={generateAltText(title, 'banner')}
          >
            <div className="hero-slide-overlay">
              <div className="hero-slide-content animate-slide-up">
                <div className="hero-badge-row">
                  {isPremium && (
                    <span className="hero-badge hero-premium-badge">
                      <Sparkles size={12} fill="#fff" />
                      <span>PREMIUM</span>
                    </span>
                  )}
                  <span className="hero-badge hero-type-badge">
                    {type === 'movie' ? 'Film' : 'Serial'}
                  </span>
                  <span className="hero-meta-year">{year}</span>
                </div>

                <h1 className="hero-title-text">{title}</h1>
                
                <p className="hero-overview-text">
                  {overview || "Ushbu video uchun qisqacha ma'lumot kiritilmagan. Ammo ushbu sarguzasht sizga ajoyib his-tuyg'ular ulashishi aniq. Hozirgi sahifada tomosha qilishni boshlashingiz mumkin."}
                </p>

                <div className="hero-actions-row">
                  <button 
                    onClick={() => {
                      const url = generateDetailUrl(item);
                      if (url) navigate(url);
                    }}
                    className="btn-premium btn-primary hero-action-btn primary-hero-btn"
                  >
                    <Play size={18} fill="#fff" stroke="none" />
                    <span>Tomosha qilish</span>
                  </button>
                  <button 
                    onClick={() => {
                      const url = generateDetailUrl(item);
                      if (url) navigate(url);
                    }}
                    className="btn-premium btn-secondary hero-action-btn"
                  >
                    <Info size={18} />
                    <span>Batafsil</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {items.length > 1 && (
        <>
          <button className="carousel-nav-btn prev-btn" onClick={handlePrev} aria-label="Previous slide">
            <ChevronLeft size={24} />
          </button>
          <button className="carousel-nav-btn next-btn" onClick={handleNext} aria-label="Next slide">
            <ChevronRight size={24} />
          </button>
          
          <div className="carousel-dots-container">
            {items.map((_, idx) => (
              <button 
                key={idx} 
                className={`carousel-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .hero-carousel-container {
          position: relative;
          height: 75vh;
          min-height: 550px;
          max-height: 800px;
          background: #000;
          overflow: hidden;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 20%;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.8s ease, visibility 0.8s ease;
          display: flex;
          align-items: center;
        }

        .hero-slide.active {
          opacity: 1;
          visibility: visible;
        }

        .hero-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(11,12,16,1) 0%, rgba(11,12,16,0.8) 35%, rgba(11,12,16,0) 100%),
                      linear-gradient(0deg, rgba(11,12,16,1) 0%, rgba(11,12,16,0.3) 50%, rgba(11,12,16,0) 100%);
          display: flex;
          align-items: center;
          padding: 0 8%;
        }

        .hero-slide-content {
          max-width: 650px;
          z-index: 10;
        }

        .hero-badge-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .hero-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .hero-premium-badge {
          background: linear-gradient(135deg, #FF640A 0%, #FF8D0A 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 100, 10, 0.3);
        }

        .hero-type-badge {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-meta-year {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .hero-title-text {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          letter-spacing: -1px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .hero-overview-text {
          font-size: clamp(0.9rem, 2vw, 1.05rem);
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        }

        .hero-actions-row {
          display: flex;
          gap: 1rem;
        }

        .hero-action-btn {
          font-size: 0.85rem;
          padding: 0.8rem 1.8rem;
          border-radius: 6px;
        }

        .primary-hero-btn {
          box-shadow: 0 4px 20px rgba(255, 100, 10, 0.4);
        }

        /* Nav controls */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 20;
          transition: var(--transition-smooth);
        }

        .carousel-nav-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: var(--shadow-orange);
        }

        .prev-btn {
          left: 2%;
        }

        .next-btn {
          right: 2%;
        }

        /* Indicators */
        .carousel-dots-container {
          position: absolute;
          bottom: 30px;
          left: 8%;
          display: flex;
          gap: 0.5rem;
          z-index: 20;
        }

        .carousel-dot {
          width: 24px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.2);
          transition: var(--transition-smooth);
        }

        .carousel-dot.active {
          background: var(--primary);
          width: 40px;
        }

        .hero-skeleton {
          height: 75vh;
          min-height: 550px;
          border-radius: 0;
          border: none;
          background: linear-gradient(90deg, #101115 0%, #15161b 50%, #101115 100%);
          background-size: 200% 100%;
          animation: skeletonShine 2s infinite;
        }

        @keyframes skeletonShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .hero-slide-overlay {
            padding: 0 5%;
            background: linear-gradient(180deg, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.85) 60%, rgba(11,12,16,1) 100%);
            align-items: flex-end;
            padding-bottom: 5rem;
          }

          .hero-carousel-container {
            height: 60vh;
            min-height: 400px;
          }

          .carousel-nav-btn {
            display: none;
          }

          .carousel-dots-container {
            left: 5%;
            bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
