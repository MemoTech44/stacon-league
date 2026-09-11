import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Newspaper, Trophy, Users, UserCircle,
  MessageSquare, LogOut, Calendar, ClipboardCheck, 
  Menu, X, ChevronRight, Clock, Image as ImageIcon
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';

// Sub-components
import NewsManager from './NewsManager';
import FixturesManager from './FixturesManager';
import ResultsManager from './ResultsManager';
import TeamManager from './TeamManager';
import ChampionsManager from './ChampionsManager';
import SponsorManager from './SponsorManager';
import ExecutiveManager from './ExecutiveManager';
import ContactMessages from './ContactMessages';
import PlayerManager from './PlayerManager';
import GalleryAdmin from './GalleryAdmin';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ clubs: 0, news: 0, messages: 0, players: 0, galleries: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const pageInfo = {
    overview: { 
      title: "League Operations Hub", 
      desc: "The central control panel for managing Stacon League operations. Coordinate schedules, oversee player registrations, and publish news updates—all synchronized instantly with the live portal." 
    },
    news: { title: "News Manager", desc: "Compose, edit, and publish breaking news, official press releases, and announcements directly to the public portal." },
    fixtures: { title: "Match Fixtures", desc: "Organize the season by setting up upcoming match dates, kick-off times, and venues for all participating clubs." },
    results: { title: "Match Results", desc: "Finalize game days by recording official scores and individual match statistics to update standings in real-time." },
    clubs: { title: "Club Database", desc: "View and manage registered league teams, update official information, and manage club rosters." },
    players: { title: "Player Registry", desc: "Maintain the comprehensive registry of all active players, including registration numbers and squad affiliations." },
    champions: { title: "Champions Archive", desc: "Access the historical record of league champions, including past winners and their respective seasons." },
    sponsors: { title: "Sponsor Management", desc: "Manage sponsorships, update branding assets, and track partnership agreements." },
    gallery: { title: "Matchday Gallery", desc: "Manage Google Drive photo albums and preview images for matchday galleries displayed on the public portal." },
    exec: { title: "Executive Board", desc: "Manage the official profiles and hierarchy of the league leadership and technical committee." },
    inbox: { title: "Message Inbox", desc: "Review and respond to inquiries, feedback, and collaboration requests received through contact forms." }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (activeTab !== 'overview') return;
      setLoadingStats(true);
      try {
        const collections = ["clubs", "news", "messages", "players", "matchdayGalleries"];
        const results = await Promise.all(collections.map(col => getDocs(collection(db, col))));
        setStats({ 
          clubs: results[0].size, 
          news: results[1].size, 
          messages: results[2].size, 
          players: results[3].size,
          galleries: results[4].size 
        });
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoadingStats(false); 
      }
    };
    fetchStats();
  }, [activeTab]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning, Admin";
    if (hour < 18) return "Good Afternoon, Admin";
    return "Good Evening, Admin";
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'results', label: 'Results', icon: ClipboardCheck },
    { id: 'clubs', label: 'Clubs', icon: Trophy },
    { id: 'players', label: 'Players', icon: UserCircle },
    { id: 'champions', label: 'Champions', icon: Trophy },
    { id: 'sponsors', label: 'Sponsors', icon: Newspaper },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'exec', label: 'Execs', icon: Users },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
  ];

  return (
    <div className="admin-root">
      <Helmet>
        <title>Admin Dashboard | Stacon League</title>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .admin-root { 
          min-height: 100vh; 
          background: linear-gradient(135deg, rgba(6, 13, 61, 0.9) 0%, rgba(12, 28, 140, 0.2) 65%), #060d3d; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          padding-top: 100px; 
          display: flex; 
          flex-direction: column; 
          color: #e2e8f0;
        }
        
        .navbar { 
          position: fixed; 
          top: 0; 
          width: 100%; 
          height: 75px; 
          background: rgba(6, 13, 61, 0.85); 
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(243, 231, 63, 0.2); 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 5%; 
          z-index: 1000; 
          box-sizing: border-box;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .brand-mobile {
          font-family: 'Cinzel', serif;
          font-weight: 800;
          color: #f3e73f;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: none;
        }

        .desktop-links { 
          display: flex; 
          gap: 6px; 
          margin: 0 auto;
        }

        .link-btn { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          padding: 10px 14px; 
          border: 1px solid transparent; 
          background: transparent; 
          color: #e2e8f0; 
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; 
          font-size: 0.72rem; 
          border-radius: 12px; 
          cursor: pointer; 
          transition: all 0.3s ease; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
        }

        .link-btn.active { 
          background: rgba(243, 231, 63, 0.15); 
          color: #f3e73f; 
          border-color: rgba(243, 231, 63, 0.4);
          box-shadow: 0 0 15px rgba(243, 231, 63, 0.2);
        }

        .link-btn:hover:not(.active) { 
          background: rgba(255, 255, 255, 0.08); 
          color: #ffffff; 
          border-color: rgba(255, 255, 255, 0.15);
        }

        .mobile-drawer { 
          position: fixed; 
          top: 0; 
          left: 0;
          bottom: 0; 
          width: 290px; 
          background: #081146; 
          padding: 24px 20px; 
          border-right: 1px solid rgba(243, 231, 63, 0.2);
          box-shadow: 20px 0 50px rgba(0, 0, 0, 0.9); 
          z-index: 2000; 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .drawer-title {
          font-family: 'Cinzel', serif;
          color: #f3e73f;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(6, 13, 61, 0.85); 
          backdrop-filter: blur(6px); 
          z-index: 1500; 
          animation: fadeIn 0.2s ease;
        }

        .content-area { 
          max-width: 1200px; 
          margin: 0 auto; 
          width: 90%; 
          flex-grow: 1; 
          text-align: center; 
        }
        
        .page-header h2 { 
          font-family: 'Bebas Neue', cursive; 
          color: #ffffff; 
          font-size: clamp(2.5rem, 6vw, 4rem); 
          letter-spacing: 1.5px;
          margin: 0; 
          line-height: 1;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        
        .title-divider { 
          height: 4px; 
          width: 70px; 
          background: #f3e73f; 
          margin: 18px auto; 
          border-radius: 4px; 
          box-shadow: 0 0 15px rgba(243, 231, 63, 0.6);
        }

        .description-text { 
          color: #e2e8f0; 
          font-size: clamp(0.95rem, 2.5vw, 1.1rem); 
          max-width: 800px; 
          margin: 0 auto; 
          font-weight: 500; 
          line-height: 1.6; 
        }

        .footer { 
          background: rgba(6, 13, 61, 0.95); 
          border-top: 1px solid rgba(243, 231, 63, 0.15); 
          padding: 40px 20px; 
          margin-top: 60px; 
          text-align: center; 
        }

        .mobile-btn { 
          background: rgba(12, 28, 140, 0.5); 
          border: 1px solid rgba(243, 231, 63, 0.35); 
          padding: 10px; 
          border-radius: 12px; 
          cursor: pointer; 
          display: none; 
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .mobile-btn:hover {
          background: rgba(243, 231, 63, 0.15);
        }

        .time-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #f3e73f;
          font-size: 0.85rem;
          font-weight: 700;
          background: rgba(12, 28, 140, 0.4);
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid rgba(243, 231, 63, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          flex-wrap: wrap;
        }

        @media (max-width: 1200px) {
          .desktop-links { display: none; }
          .mobile-btn { display: flex; }
          .brand-mobile { display: block; }
          .admin-root { padding-top: 90px; }
          .page-header { margin-bottom: 30px !important; }
        }

        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
      `}</style>

      {/* Navigation Header */}
      <nav className="navbar">
        <span className="brand-mobile">Stacon League Admin</span>

        <button 
          className="mobile-btn" 
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} color="#f3e73f" />
        </button>

        <div className="desktop-links">
          {navItems.map(item => (
            <button 
              key={item.id} 
              className={`link-btn ${activeTab === item.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={15} /> {item.label}
            </button>
          ))}
          <button 
            onClick={() => signOut(auth).then(() => navigate('/admin/login'))} 
            className="link-btn" 
            style={{ color: '#f87171' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <aside className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Admin Navigation</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} color="#e2e8f0" />
          </button>
        </div>

        {navItems.map(item => (
          <button 
            key={item.id} 
            className={`link-btn ${activeTab === item.id ? 'active' : ''}`} 
            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
            style={{ justifyContent: 'flex-start', padding: '12px 16px', width: '100%', fontSize: '0.8rem' }}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
        
        <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={() => signOut(auth).then(() => navigate('/admin/login'))} 
            className="link-btn" 
            style={{ color: '#f87171', justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        <header className="page-header" style={{ marginBottom: '45px' }}>
          <h2>{pageInfo[activeTab].title}</h2>
          <div className="title-divider"></div>
          <p className="description-text">{pageInfo[activeTab].desc}</p>
          
          {activeTab === 'overview' && (
            <div style={{ marginTop: '25px', animation: 'fadeIn 0.5s ease' }}>
              <h4 style={{ 
                fontFamily: 'Cinzel, serif',
                color: '#f3e73f', 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                fontWeight: 700, 
                marginBottom: '12px', 
                fontSize: '0.8rem' 
              }}>
                {getGreeting()}
              </h4>
              
              <div className="time-badge">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#f3e73f" /> 
                  {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span>{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          )}
        </header>

        <section>
          {activeTab === 'overview' ? <Overview stats={stats} loading={loadingStats} setTab={setActiveTab} /> : 
           activeTab === 'news' ? <NewsManager /> :
           activeTab === 'fixtures' ? <FixturesManager /> :
           activeTab === 'results' ? <ResultsManager /> :
           activeTab === 'clubs' ? <TeamManager /> :
           activeTab === 'sponsors' ? <SponsorManager /> :
           activeTab === 'champions' ? <ChampionsManager /> : 
           activeTab === 'players' ? <PlayerManager /> :
           activeTab === 'gallery' ? <GalleryAdmin /> :
           activeTab === 'exec' ? <ExecutiveManager /> : <ContactMessages />}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div style={{ fontFamily: 'Cinzel, serif', color: '#f3e73f', fontSize: '0.9rem', marginBottom: '6px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Stacon League
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', margin: 0 }}>
          ADMINISTRATOR PORTAL • SECURE SESSION ACTIVE
        </p>
      </footer>
    </div>
  );
};

const Overview = ({ stats, loading, setTab }) => (
  <div style={{ paddingBottom: '60px' }}>
    <style>{`
      .action-banner { 
        background: linear-gradient(135deg, rgba(12, 28, 140, 0.45) 0%, rgba(6, 13, 61, 0.85) 100%); 
        backdrop-filter: blur(16px);
        border: 1px solid rgba(243, 231, 63, 0.25);
        border-radius: 28px; 
        padding: 40px 24px; 
        margin-bottom: 40px; 
        color: #ffffff; 
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6); 
      }

      .btn-primary-action {
        padding: 14px 28px; 
        border-radius: 12px; 
        border: none; 
        background: #f3e73f; 
        color: #060d3d; 
        font-weight: 800; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        gap: 8px; 
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(243, 231, 63, 0.3);
      }

      .btn-primary-action:hover {
        background: #fff066;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(243, 231, 63, 0.45);
      }

      .btn-secondary-action {
        padding: 14px 28px; 
        border-radius: 12px; 
        border: 1px solid rgba(243, 231, 63, 0.4); 
        background: rgba(12, 28, 140, 0.3); 
        color: #e2e8f0; 
        font-weight: 700; 
        cursor: pointer; 
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .btn-secondary-action:hover {
        border-color: #f3e73f;
        color: #f3e73f;
        background: rgba(243, 231, 63, 0.1);
      }

      .stat-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
        gap: 20px; 
      }

      .interactive-card { 
        background: linear-gradient(135deg, rgba(12, 28, 140, 0.3) 0%, rgba(6, 13, 61, 0.7) 100%); 
        backdrop-filter: blur(16px);
        padding: 32px 20px; 
        border-radius: 20px; 
        border: 1px solid rgba(255, 255, 255, 0.1); 
        text-align: center; 
        cursor: pointer; 
        transition: all 0.3s ease;
      }

      .interactive-card:hover { 
        transform: translateY(-6px); 
        border-color: #f3e73f; 
        box-shadow: 0 10px 30px rgba(243, 231, 63, 0.2); 
      }

      .interactive-card h4 { 
        color: #e2e8f0; 
        font-family: 'Cinzel', serif;
        font-size: 0.7rem; 
        text-transform: uppercase; 
        margin: 0 0 10px 0; 
        font-weight: 700; 
        letter-spacing: 1.5px; 
      }

      .interactive-card h2 { 
        font-family: 'Bebas Neue', cursive; 
        font-size: clamp(2.5rem, 4vw, 3.5rem); 
        color: #f3e73f; 
        margin: 0; 
        line-height: 1; 
      }

      @media (max-width: 640px) {
        .action-banner {
          padding: 30px 20px;
          border-radius: 20px;
        }
        .action-btns-wrapper {
          flex-direction: column;
          width: 100%;
        }
        .btn-primary-action, .btn-secondary-action {
          width: 100%;
        }
        .stat-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .interactive-card {
          padding: 24px 15px;
          border-radius: 16px;
        }
      }
    `}</style>
    
    <div className="action-banner">
      <h3 style={{
        fontFamily: 'Bebas Neue', 
        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
        margin: '0 0 12px 0', 
        letterSpacing: '1px'
      }}>
        Administrative Hub
      </h3>
      <p style={{
        color: '#e2e8f0', 
        fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', 
        maxWidth: '700px', 
        margin: '0 auto 30px', 
        lineHeight: '1.6', 
        fontWeight: 500
      }}>
        Direct access to the league database. All changes made to fixtures, news, or player records will be synchronized with the public website immediately.
      </p>
      <div className="action-btns-wrapper" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={() => setTab('results')} className="btn-primary-action">
          Record Results <ChevronRight size={18}/>
        </button>
        <button onClick={() => setTab('fixtures')} className="btn-secondary-action">
          Schedule Fixtures
        </button>
      </div>
    </div>

    <div className="stat-grid">
      <div className="interactive-card" onClick={() => setTab('clubs')}>
        <h4>Registered Clubs</h4>
        <h2>{loading ? '..' : stats.clubs}</h2>
      </div>
      <div className="interactive-card" onClick={() => setTab('players')}>
        <h4>Active Players</h4>
        <h2>{loading ? '..' : stats.players}</h2>
      </div>
      <div className="interactive-card" onClick={() => setTab('gallery')}>
        <h4>Galleries</h4>
        <h2>{loading ? '..' : stats.galleries}</h2>
      </div>
      <div className="interactive-card" onClick={() => setTab('news')}>
        <h4>League News</h4>
        <h2>{loading ? '..' : stats.news}</h2>
      </div>
      <div className="interactive-card" style={{ borderBottom: '3px solid #f3e73f' }} onClick={() => setTab('inbox')}>
        <h4>Fan Inbox</h4>
        <h2>{loading ? '..' : stats.messages}</h2>
      </div>
    </div>
  </div>
);

export default Dashboard;