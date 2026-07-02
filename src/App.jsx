import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { parseLegacyUrl, generateContentUrl } from './utils/urlHelper';

// ---------------------------------------------------------------------------
// Legacy URL Redirect — turns old numeric ID routes into SEO-friendly URLs
// ---------------------------------------------------------------------------
function LegacyUrlRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { movies, tvShows, loading } = useFirebase();

  React.useEffect(() => {
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
        navigate(newUrl, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      navigate('/', { replace: true });
    }
  }, [location.pathname, movies, tvShows, loading, navigate]);

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
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
        }
        .loader {
          width: 48px; height: 48px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cancel-redirect-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255,255,255,0.1);
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

// ---------------------------------------------------------------------------
// MovieRoute — /movie/:slug
//   numeric slug  → legacy redirect
//   SEO slug      → Watch
// ---------------------------------------------------------------------------
function MovieRoute() {
  const { slug } = useParams();
  if (/^\d+$/.test(slug)) {
    return <LegacyUrlRedirect />;
  }
  return <Watch />;
}

// ---------------------------------------------------------------------------
// TvEpisodeRoute — catches ANY 3-segment /tv/:a/:b/:c path
//
//   SEO  format: /tv/title-uzbek-tilida/season-1-fasl/1-qism
//                 b matches /^season-\d+-fasl$/  →  render Watch
//
//   Legacy format: /tv/123/1/1  (all numeric)
//                 all three are digits             →  LegacyUrlRedirect
//
//   Anything else →  redirect home
// ---------------------------------------------------------------------------
function TvEpisodeRoute() {
  const { a, b, c } = useParams();

  // SEO format check: middle segment must be "season-N-fasl"
  if (/^season-\d+-fasl$/.test(b)) {
    // This is a SEO episode URL — render Watch directly.
    // Watch.jsx uses parseSeoUrl(pathname) internally, so no extra props needed.
    return <Watch />;
  }

  // Legacy format check: all three segments are purely numeric
  if (/^\d+$/.test(a) && /^\d+$/.test(b) && /^\d+$/.test(c)) {
    return <LegacyUrlRedirect />;
  }

  // Unknown / malformed → go home
  return <Navigate to="/" replace />;
}

// ---------------------------------------------------------------------------
// TvIdRoute — /tv/:id  (single segment, no season/episode)
//   Always treated as legacy redirect (shows detail page for the show)
// ---------------------------------------------------------------------------
function TvIdRoute() {
  return <LegacyUrlRedirect />;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
  return (
    <HelmetProvider>
      <FirebaseProvider>
        <Router>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Core pages */}
                <Route path="/" element={<Home />} />
                <Route path="/detail/:param" element={<Detail />} />
                <Route path="/list" element={<List />} />
                <Route path="/search" element={<Search />} />

                {/*
                  Movie routes
                  /movie/:slug — MovieRoute decides: numeric → legacy, text → Watch
                */}
                <Route path="/movie/:slug" element={<MovieRoute />} />

                {/*
                  TV routes

                  /tv/:a/:b/:c  →  TvEpisodeRoute (smart dispatcher):
                      b = "season-N-fasl"  → Watch (SEO)
                      a,b,c all numeric   → LegacyUrlRedirect
                      else                → home

                  /tv/:id       →  TvIdRoute (legacy redirect to detail page)
                */}
                <Route path="/tv/:a/:b/:c" element={<TvEpisodeRoute />} />
                <Route path="/tv/:id" element={<TvIdRoute />} />

                {/* Legal */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </FirebaseProvider>
    </HelmetProvider>
  );
}

export default App;
