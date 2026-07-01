import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Send } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand-logo">
            <span className="logo-icon-bg">
              <Play size={16} fill="#fff" stroke="none" />
            </span>
            <span className="logo-text">VOI<span className="orange-text">PLAY</span></span>
          </Link>
          <p className="footer-description">
            O'zbekistondagi eng zamonaviy anime va filmlar striming portali. Barcha sevimli seriallaringizni o'zbek tilida, yuqori sifatda tomosha qiling.
          </p>
          <div className="social-links">
            <a href="https://t.me/+DeBcIo2mXK0yNDli" target="_blank" rel="noreferrer" className="social-icon" aria-label="Telegram">
              <Send size={18} />
            </a>
            <a href="https://instagram.com/voiplaystudio" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="https://youtube.com/@voiplaytv?si=EDnscGpch23n8XyM" target="_blank" rel="noreferrer" className="social-icon" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path><path d="m10 15 5-3-5-3z"></path></svg>
            </a>
          </div>
        </div>

        <div className="footer-links-column">
          <h4 className="footer-title">Navigatsiya</h4>
          <ul className="footer-list">
            <li><Link to="/">Bosh sahifa</Link></li>
            <li><Link to="/list?type=movie">Filmlar</Link></li>
            <li><Link to="/list?type=tv">Seriallar</Link></li>
            <li><Link to="/search">Qidiruv</Link></li>
          </ul>
        </div>

        <div className="footer-links-column">
          <h4 className="footer-title">Ommabop Janrlar</h4>
          <ul className="footer-list">
            <li><Link to="/list?genre=28">Jangari (Action)</Link></li>
            <li><Link to="/list?genre=18">Drama</Link></li>
            <li><Link to="/list?genre=35">Komediya</Link></li>
            <li><Link to="/list?genre=878">Ilmiy-fantastika</Link></li>
          </ul>
        </div>

        <div className="footer-premium-column">
          <h4 className="footer-title">VoiPlay Premium</h4>
          <p className="premium-pitch">
            Premium a'zolik bilan reklamalarsiz, eksklyuziv va premyera kontentlarni birinchilardan bo'lib tomosha qiling.
          </p>
          <button className="btn-premium btn-primary premium-footer-btn">
            Sotib olish
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright-text">
          &copy; {currentYear} VoiPlay.uz. Barcha huquqlar himoyalangan.
        </p>
        <div className="footer-legal-links">
          <Link to="/terms">Foydalanish shartlari</Link>
          <span className="dot-separator">&bull;</span>
          <Link to="/privacy">Maxfiylik siyosati</Link>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: #07080a;
          border-top: 1px solid var(--border-color);
          padding: 4.5rem 4% 2rem;
          color: var(--text-muted);
        }

        .footer-top {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid var(--border-color);
        }

        .footer-brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          color: var(--text-main);
        }

        .footer-description {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          max-width: 320px;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .social-icon:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: rgba(255, 100, 10, 0.05);
          transform: translateY(-2px);
        }

        .footer-title {
          color: var(--text-main);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-list a {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .footer-list a:hover {
          color: var(--text-main);
          padding-left: 4px;
        }

        .premium-pitch {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        .premium-footer-btn {
          font-size: 0.8rem;
          padding: 0.6rem 1.2rem;
          border-radius: 4px;
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-legal-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-legal-links a:hover {
          color: var(--text-main);
        }

        .dot-separator {
          color: var(--text-muted-dark);
        }

        @media (max-width: 900px) {
          .footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 600px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
