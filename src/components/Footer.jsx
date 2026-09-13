import React from 'react';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .league-footer {
          background-color: #0c1c8c; 
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 60px 24px 30px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #ffffff;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
        }

        .league-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #0c1c8c, #f3e73f, #0c1c8c);
        }

        .footer-container {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
          align-items: start;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-brand h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(2rem, 4vw, 2.5rem);
          margin: 0;
          letter-spacing: 1.5px;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          line-height: 1;
          color: #ffffff;
          text-transform: uppercase;
        }

        .footer-accent { 
          color: #f3e73f; 
        }

        .footer-motto {
          font-family: 'Cinzel', serif;
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2.5px;
        }

        .footer-desc {
          color: #94a3b8;
          font-size: 0.9rem;
          line-height: 1.7;
          max-width: 400px;
          margin: 4px 0 0 0;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
        }

        .footer-heading {
          font-family: 'Cinzel', serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: 0 0 20px 0;
          color: #ffffff;
          text-transform: uppercase;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-link:hover {
          color: #ffffff;
          transform: translateX(4px);
        }

        .footer-bottom {
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .copyright {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .developer-link {
          color: #f3e73f;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .developer-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .footer-brand, .footer-section {
            align-items: center;
            text-align: center;
          }
          .footer-brand h2 { justify-content: center; }
          .footer-desc { max-width: 100%; }
          .footer-link { justify-content: center; }
          .footer-bottom { flex-direction: column; text-align: center; gap: 10px; }
        }
      `}</style>

      <footer className="league-footer">
        <div className="footer-container">
          <div className="footer-grid">
            
            <div className="footer-brand">
              <h2>
                <span>STACON</span> 
                <span className="footer-accent">LEAGUE</span>
              </h2>
              <span className="footer-motto">Reka Entanga Etambure</span>
              <p className="footer-desc">
                Building a legacy of excellence and faith through the power of sport.
              </p>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Quick Navigation</h4>
              <ul className="footer-links">
                <li><Link to="/news" className="footer-link">Latest News</Link></li>
                <li><Link to="/players" className="footer-link">The Players</Link></li>
                <li><Link to="/fixtures" className="footer-link">Match Day Fixtures</Link></li>
                <li><Link to="/table" className="footer-link">League Standings</Link></li>
                <li><Link to="/about" className="footer-link">Our History</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Contact Info</h4>
              <ul className="footer-links">
                <li className="footer-link">
                  <Icons.MapPin size={16} className="footer-accent" /> Kampala, Uganda
                </li>
                <li className="footer-link">
                  <Icons.Mail size={16} className="footer-accent" /> info@staconleague.com
                </li>
                <li>
                  <a href="https://twitter.com/stacon_league" target="_blank" rel="noopener noreferrer" className="footer-link">
                    {/* Twitter / X Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="footer-accent">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg> 
                    @stacon_league
                  </a>
                </li>
                <li>
                  <a href="https://tiktok.com/@stacon_league" target="_blank" rel="noopener noreferrer" className="footer-link">
                    {/* TikTok Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="footer-accent">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg> 
                    @stacon_league
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/stacon_league" target="_blank" rel="noopener noreferrer" className="footer-link">
                    {/* Instagram Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-accent">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg> 
                    @stacon_league
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="copyright">
              © {currentYear} STACON League. All rights reserved. Developed by{' '}
              <a 
                href="https://atumanya-memory.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="developer-link"
              >
                MemoTech Solutions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;