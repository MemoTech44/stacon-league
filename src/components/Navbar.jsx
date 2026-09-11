import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; 
import logo from '../assets/logo.png'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Executive', path: '/executive' },
    { name: 'News', path: '/news' },
    { name: 'Players', path: '/players' },
    { name: 'Fixtures', path: '/fixtures' },
    { name: 'Champions', path: '/results' },
    { name: 'Table', path: '/table' },
    { name: 'Gallery', path: '/GalleryView' },
    { name: 'Contact', path: '/contact' },
  ];

  // Close mobile nav when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .league-nav {
          position: fixed;
          top: 0; 
          left: 0; 
          width: 100%;
          z-index: 9999;
          background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0; 
          padding: 12px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          transition: all 0.35s ease;
        }

        .brand-container {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .nav-logo-img {
          width: 40px; 
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
          border: 1.5px solid #0c1c8c;
          box-shadow: 0 0 12px rgba(12, 28, 140, 0.15);
          transition: transform 0.3s ease;
        }

        .brand-container:hover .nav-logo-img {
          transform: scale(1.05);
        }

        .league-logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-main { 
          font-family: 'Bebas Neue', cursive;
          color: #0c1c8c; 
          font-size: 1.4rem; 
          letter-spacing: 1px; 
          line-height: 0.95;
          display: flex; 
          gap: 6px;
          font-weight: 400;
        }

        .logo-accent { 
          color: #0c1c8c; 
          background: linear-gradient(135deg, #0c1c8c 0%, #1e3a8a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-sub { 
          font-family: 'Cinzel', serif;
          color: #64748b; 
          font-size: 0.5rem; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 1.5px;
          margin-top: 2px;
        }

        .nav-links-desktop { 
          display: flex; 
          gap: 14px; 
          align-items: center; 
        }

        .nav-link { 
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #334155; 
          text-decoration: none; 
          font-size: 0.72rem; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
          transition: all 0.25s ease;
          padding: 6px 2px;
          position: relative;
        }

        .nav-link:hover, .nav-link.active { 
          color: #0c1c8c; 
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #0c1c8c;
          border-radius: 2px;
        }

        .nav-register {
          background: #0c1c8c;
          color: #ffffff !important;
          padding: 8px 16px;
          border-radius: 10px;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.72rem;
          border: none;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(12, 28, 140, 0.15);
          transition: all 0.25s ease !important;
        }

        .nav-register:hover {
          background: #09146c;
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(12, 28, 140, 0.25);
        }

        .nav-register.active::after {
          display: none;
        }

        .menu-toggle {
          display: none;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 6px;
          color: #0c1c8c;
          cursor: pointer;
          z-index: 10001;
          transition: all 0.2s ease;
        }

        .menu-toggle:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        /* MOBILE RESPONSIVE STYLES */
        @media (max-width: 1024px) {
          .league-logo-text { 
            display: none !important; 
          }
          
          .nav-links-desktop { 
            display: none; 
          }
          
          .menu-toggle { 
            display: flex; 
            align-items: center;
            justify-content: center;
          }

          .nav-logo-img {
            width: 36px;
            height: 36px;
            border-width: 1px;
          }

          .mobile-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(4px);
            z-index: 9998;
          }

          .nav-links-mobile {
            position: fixed;
            top: 68px;
            right: 4%;
            width: calc(100% - 32px);
            max-width: 340px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            padding: 12px;
            gap: 4px;
            box-shadow: 0 20px 40px rgba(12, 28, 140, 0.15);
            z-index: 9999;
            animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
          }

          .nav-links-mobile::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #0c1c8c, #d97706, #0c1c8c);
          }

          @keyframes slideIn {
            from { transform: translateY(-8px) scale(0.97); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }

          .nav-link-mobile {
            padding: 10px 12px;
            border-radius: 10px;
            color: #334155;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
          }

          .nav-link-mobile:hover, .nav-link-mobile.active {
            background: #f1f5f9;
            color: #0c1c8c;
          }

          .nav-register-mobile {
            margin-top: 4px;
            background: #0c1c8c;
            color: #ffffff !important;
            text-align: center;
            border-radius: 10px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            font-size: 0.8rem;
            letter-spacing: 1px;
            padding: 12px;
          }

          .nav-register-mobile:hover {
            background: #09146c;
          }
        }
      `}</style>

      <nav className="league-nav">
        <Link to="/" className="brand-container">
          <img src={logo} alt="League Logo" className="nav-logo-img" />
          <div className="league-logo-text">
            <div className="logo-main">
              <span>STACON</span> 
              <span className="logo-accent">LEAGUE</span>
            </div>
            <span className="logo-sub">Reka Entanga Etambure</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links-desktop">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
          <Link to="/register" className="nav-link nav-register">Register</Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="menu-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        
        {/* Mobile Drawer & Overlay */}
        {isOpen && (
          <>
            <div className="mobile-backdrop" onClick={() => setIsOpen(false)} />
            <div className="nav-links-mobile">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`nav-link-mobile ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link 
                to="/register" 
                className="nav-link-mobile nav-register-mobile"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Navbar;