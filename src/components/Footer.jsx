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
          background-color: #ffffff; 
          border-top: 1px solid #e2e8f0;
          padding: 60px 24px 30px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 -10px 30px rgba(12, 28, 140, 0.03);
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
          color: #0c1c8c;
          text-transform: uppercase;
        }

        .footer-accent { 
          color: #b8970b; 
        }

        .footer-motto {
          font-family: 'Cinzel', serif;
          color: #0c1c8c;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2.5px;
        }

        .footer-desc {
          color: #475569;
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
          color: #0c1c8c;
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
          color: #475569;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-link:hover {
          color: #0c1c8c;
          transform: translateX(4px);
        }

        .footer-bottom {
          width: 100%;
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .copyright {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
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
                  <Icons.Mail size={16} className="footer-accent" /> info@stagonleague.com
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="copyright">
              © {currentYear} STACON League. All rights reserved.
            </div>
            <div className="copyright" style={{ color: '#b8970b' }}>
              Est. 2026
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;