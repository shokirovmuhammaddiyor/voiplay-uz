import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Play, User, ChevronDown, Crown } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGenresDropdownOpen, setIsGenresDropdownOpen] = useState(false);
  const [isPremiumTooltipOpen, setIsPremiumTooltipOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const genresDropdownRef = useRef(null);
  const premiumTooltipRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genresDropdownRef.current && !genresDropdownRef.current.contains(event.target)) {
        setIsGenresDropdownOpen(false);
      }
      if (premiumTooltipRef.current && !premiumTooltipRef.current.contains(event.target)) {
        setIsPremiumTooltipOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Bosh sahifa', path: '/' },
    { name: 'Filmlar', path: '/list?type=movie' },
    { name: 'Seriallar', path: '/list?type=tv' }
  ];

  const genres = [
    { name: 'Jangari', path: '/list?type=movie&genre=action' },
    { name: 'Drama', path: '/list?type=movie&genre=drama' },
    { name: 'Komediya', path: '/list?type=movie&genre=comedy' },
    { name: 'Ilmiy-fantastika', path: '/list?type=movie&genre=scifi' }
  ];

  return (
    <>
      <header className={`glass-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="brand-logo">
              <span className="logo-icon-bg">
                <Play size={20} fill="#fff" stroke="none" />
              </span>
              <span className="logo-text">VOI<span className="orange-text">PLAY</span></span>
            </Link>

            <nav className="desktop-nav">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || 
                  (link.path !== '/' && location.pathname + location.search === link.path);
                return (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Genres Dropdown */}
              <div 
                className="nav-dropdown-wrapper"
                ref={genresDropdownRef}
                onMouseEnter={() => setIsGenresDropdownOpen(true)}
                onMouseLeave={() => setIsGenresDropdownOpen(false)}
              >
                <button 
                  className={`nav-item nav-dropdown-btn ${isGenresDropdownOpen ? 'active' : ''}`}
                  onClick={() => setIsGenresDropdownOpen(!isGenresDropdownOpen)}
                >
                  Ommabop Janrlar
                  <ChevronDown size={16} className="dropdown-arrow" />
                </button>
                <div className={`nav-dropdown-menu ${isGenresDropdownOpen ? 'open' : ''}`}>
                  {genres.map((genre) => (
                    <Link 
                      key={genre.name}
                      to={genre.path}
                      className="dropdown-item"
                      onClick={() => setIsGenresDropdownOpen(false)}
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="nav-right">
            <form onSubmit={handleSearchSubmit} className="search-bar-form">
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Qidiruv..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-icon-btn">
                  <Search size={18} />
                </button>
              </div>
            </form>

            <Link to="/search" className="mobile-search-trigger">
              <Search size={20} />
            </Link>

            {/* Premium Button with Tooltip */}
            <div 
              className="premium-wrapper"
              ref={premiumTooltipRef}
              onMouseEnter={() => setIsPremiumTooltipOpen(true)}
              onMouseLeave={() => setIsPremiumTooltipOpen(false)}
            >
              <button 
                className="premium-btn"
                onClick={() => setIsPremiumTooltipOpen(!isPremiumTooltipOpen)}
              >
                <Crown size={16} className="premium-icon" />
                <span>Premium</span>
              </button>
              <div className={`premium-tooltip ${isPremiumTooltipOpen ? 'open' : ''}`}>
                <div className="tooltip-content">
                  <p>Premium a'zolik bilan reklamalarsiz, eksklyuziv va premyera kontentlarni birinchilardan bo'lib tomosha qiling.</p>
                  <Link to="/premium" className="tooltip-cta">
                    Sotib olish
                  </Link>
                </div>
              </div>
            </div>

            <button className="profile-btn-nav" title="User Profile">
              <User size={18} />
            </button>

            <button 
              className="menu-toggle-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* Mobile Genres Section */}
            <div className="mobile-genres-section">
              <div className="mobile-genres-title">Ommabop Janrlar</div>
              <div className="mobile-genres-grid">
                {genres.map((genre) => (
                  <Link 
                    key={genre.name}
                    to={genre.path}
                    className="mobile-genre-item"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Premium Section */}
            <Link to="/premium" className="mobile-premium-btn">
              <Crown size={18} />
              <span>VoiPlay Premium</span>
            </Link>
          </nav>
        </div>
      </div>

      <style>{`
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 4%;
          height: 70px;
        }
        
        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-icon-bg {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 100, 10, 0.3);
        }

        .orange-text {
          color: var(--primary);
        }

        .desktop-nav {
          display: flex;
          gap: 1.5rem;
        }

        .nav-item {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
          position: relative;
          padding: 0.25rem 0;
        }

        .nav-item:hover, .nav-item.active {
          color: var(--text-main);
        }

        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: var(--transition-smooth);
        }

        .nav-item:hover::after, .nav-item.active::after {
          width: 100%;
        }

        /* Genres Dropdown */
        .nav-dropdown-wrapper {
          position: relative;
        }

        .nav-dropdown-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .dropdown-arrow {
          transition: transform 0.2s ease;
        }

        .nav-dropdown-btn.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        .nav-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: rgba(20, 20, 25, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.75rem 0;
          min-width: 180px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          z-index: 1000;
        }

        .nav-dropdown-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(8px);
        }

        .dropdown-item {
          display: block;
          padding: 0.6rem 1.25rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .dropdown-item:hover {
          background: rgba(255, 100, 10, 0.1);
          color: var(--primary);
        }

        /* Premium Button */
        .premium-wrapper {
          position: relative;
        }

        .premium-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 25px;
          color: #1a1a1a;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(255, 165, 0, 0.3);
        }

        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 165, 0, 0.5);
        }

        .premium-icon {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }

        .premium-tooltip {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: rgba(20, 20, 25, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          min-width: 280px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          z-index: 1000;
        }

        .premium-tooltip.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .tooltip-content p {
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .tooltip-cta {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: var(--primary);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .tooltip-cta:hover {
          background: #ff8c00;
        }

        .search-bar-form {
          display: block;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-color);
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          border-radius: 20px;
          color: var(--text-main);
          font-size: 0.85rem;
          width: 200px;
          transition: var(--transition-smooth);
        }

        .search-input:focus {
          width: 280px;
          background: rgba(0,0,0,0.4);
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(255, 100, 10, 0.15);
        }

        .search-icon-btn {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .search-icon-btn:hover {
          color: var(--primary);
        }

        .mobile-search-trigger {
          display: none;
          color: var(--text-muted);
        }

        .profile-btn-nav {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          transition: var(--transition-smooth);
        }

        .profile-btn-nav:hover {
          border-color: var(--primary);
          background: rgba(255, 100, 10, 0.1);
          color: var(--primary);
          box-shadow: var(--shadow-orange);
        }

        .menu-toggle-btn {
          display: none;
          color: var(--text-main);
        }

        /* Mobile Drawer styling */
        .mobile-drawer {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-base);
          z-index: 999;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-top: 1px solid var(--border-color);
          padding: 2rem;
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mobile-nav-item {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-muted);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .mobile-nav-item.active, .mobile-nav-item:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .mobile-genres-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .mobile-genres-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .mobile-genres-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .mobile-genre-item {
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          transition: all 0.2s ease;
        }

        .mobile-genre-item:hover {
          background: rgba(255, 100, 10, 0.1);
          border-color: var(--primary);
          color: var(--primary);
        }

        .mobile-premium-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          border-radius: 12px;
          color: #1a1a1a;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
        }

        .mobile-premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(255, 165, 0, 0.5);
        }

        @media (max-width: 900px) {
          .desktop-nav, .search-bar-form {
            display: none;
          }

          .mobile-search-trigger, .menu-toggle-btn {
            display: flex;
          }

          .nav-right {
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}
