import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detail from './pages/Detail';
import List from './pages/List';
import Search from './pages/Search';
import Watch from './pages/Watch';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { parseLegacyUrl, generateContentUrl, slugify } from './utils/urlHelper';

// Legacy URL Redirect Component - handles ID-based redirects to SEO URLs
function LegacyUrlRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { movies, tvShows, loading } = useFirebase();

  React.useEffect(() => {
    // Wait for Firebase data to load before redirecting
    if (loading) return;

    const parsed = parseLegacyUrl(location.pathname);

    if (parsed) {
      let content = null;

      if (parsed.type === 'movie' || parsed.type === 'detail') {
        content = movies.find(m => m.id === parsed.id) || tvShows.find(t => t.id === parsed.id);
      } else if (parsed.type === 'tv') {
        content = tvShows.find(t => t.id === parsed.id);
      }

      if (content) {
        const newUrl = generateContentUrl(
          content,
          parsed.type === 'tv' ? parsed.season : null,
          parsed.type === 'tv' ? parsed.episode : null
        );

        // Use replace instead of push to simulate 301 redirect behavior
        navigate(newUrl, { replace: true });
      } else {
        // Content not found, redirect to home
        navigate('/', { replace: true });
      }
    } else {
      // If not a legacy URL, redirect to home
      navigate('/', { replace: true });
    }
  }, [location.pathname, movies, tvShows, loading, navigate]);

  // Show loading while redirecting
  return (
    <div className="redirect-loading">
      <div className="loader"></div>
      <p>Qayta yo'naltirilmoqda...</p>
      <button onClick={() => window.history.back()} className="cancel-redirect-btn">
        Bekor qilish
      </button>
      <style>{`
        .redirect-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          background: var(--bg-base);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
        }
        .loader {
          width: 48px;
          height: 48px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .cancel-redirect-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-muted);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cancel-redirect-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <FirebaseProvider>
        <Router>
          <div className="app-container">
            {/* Global Responsive Navigation Header */}
            <Header />

            {/* Router page contents */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/detail/:id" element={<Detail />} />
                <Route path="/list" element={<List />} />
                <Route path="/search" element={<Search />} />

                {/* Legacy ID-based Routes - Redirect to SEO URLs */}
                <Route path="/movie/:id" element={<LegacyUrlRedirect />} />
                <Route path="/tv/:id/:season/:episode" element={<LegacyUrlRedirect />} />
                <Route path="/tv/:id" element={<LegacyUrlRedirect />} />

                {/* New SEO-friendly Routes - Primary Routes */}
                <Route path="/movie/:slug" element={<Watch />} />
                <Route path="/tv/:slug/season-:season-fasl/:episode" element={<Watch />} />

                {/* Legal Pages */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </main>

            {/* Global responsive Footer */}
            <Footer />
          </div>
        </Router>
      </FirebaseProvider>
    </HelmetProvider>
  );
}

export default App;
