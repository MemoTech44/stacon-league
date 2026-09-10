import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Target, Eye, Loader2, Shield, 
  History, UserCheck, Flag, Briefcase, ChevronRight, Sparkles, X, Calendar 
} from 'lucide-react';

import heroImg from '../assets/top.jpg';
import secondaryImg from '../assets/fall.jpg';

const About = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Body scroll lock logic matching News page modal behavior
  useEffect(() => {
    if (selectedTeam) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedTeam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, "clubs"));
        const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedTeams = teamsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setTeams(sortedTeams);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      setSelectedTeam(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url || url.includes('via.placeholder')) {
      return `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=75`;
    }
    return url;
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 className="animate-spin" size={48} color="#0c1c8c" />
        <p style={{ marginTop: '20px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }}>
          REFRESHING LEAGUE FEED...
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .about-page { 
          background-color: #f8fafc; 
          padding: 120px 5% 100px; 
          min-height: 100vh; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          color: #0f172a;
          box-sizing: border-box;
        }

        .container { max-width: 1100px; margin: 0 auto; }
        
        .color-blue { color: #0c1c8c; }
        .color-yellow { color: #c59b27; }
        .color-red { color: #b91c1c; }

        /* Header Styling */
        .header-box { text-align: center; margin-bottom: 50px; }
        
        .header-tag {
          font-family: 'Cinzel', serif;
          color: #0c1c8c;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .header-box h1 { 
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(2.5rem, 6vw, 4.8rem); 
          color: #0c1c8c; 
          letter-spacing: 1px; 
          margin: 0; 
          line-height: 1;
          font-weight: 400;
        }

        .header-underline { 
          width: 80px; 
          height: 4px; 
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c); 
          margin: 20px auto 25px; 
          border-radius: 4px; 
        }

        .header-description { 
          max-width: 720px; 
          margin: 0 auto; 
          color: #334155; 
          line-height: 1.7; 
          font-size: 1rem; 
          font-weight: 500;
        }

        /* Banner Wrapper */
        .page-banner {
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          margin-bottom: 60px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.06);
          height: 380px;
          position: relative;
        }

        .page-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.6s ease;
        }

        .page-banner:hover img {
          transform: scale(1.05);
        }

        /* Hero / History Card */
        .featured-hero { 
          display: grid; 
          grid-template-columns: 1fr; 
          background: #ffffff; 
          border-radius: 28px; 
          overflow: hidden; 
          margin-bottom: 60px; 
          border: 1px solid #e2e8f0; 
          transition: all 0.35s ease;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.06);
          position: relative;
        }

        .featured-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.3s ease;
          z-index: 2;
        }

        .featured-hero:hover { 
          border-color: #0c1c8c;
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.12);
        }

        .featured-hero:hover::before {
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
        }

        .featured-content {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .trending-badge { 
          background: #fef9c3; 
          color: #854d0e; 
          border: 1px solid #fde047;
          padding: 6px 14px; 
          border-radius: 50px; 
          font-size: 0.75rem; 
          font-weight: 800; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          width: fit-content; 
          margin-bottom: 20px; 
          letter-spacing: 1px;
        }

        .featured-content h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(1.8rem, 4vw, 2.2rem);
          color: #0c1c8c;
          letter-spacing: 0.8px;
          line-height: 1.1;
          margin: 0 0 15px 0;
          font-weight: 400;
        }

        /* Feature Grid (Mission & Vision) */
        .feature-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); 
          gap: 28px; 
          margin-bottom: 60px; 
        }

        .news-card { 
          background: #ffffff; 
          border-radius: 24px; 
          overflow: hidden; 
          border: 1px solid #e2e8f0; 
          transition: all 0.35s ease; 
          display: flex; 
          flex-direction: column; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
        }

        .news-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.3s ease;
          z-index: 2;
        }

        .news-card:hover { 
          transform: translateY(-8px); 
          border-color: #0c1c8c;
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1); 
        }

        .news-card:hover::before {
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
        }

        .card-body { 
          padding: 30px 25px; 
          flex-grow: 1; 
          display: flex;
          flex-direction: column;
        }

        .card-category {
          color: #c59b27; 
          font-weight: 800; 
          font-size: 0.7rem; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: block;
        }

        .card-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.6rem;
          color: #0c1c8c;
          letter-spacing: 0.6px;
          line-height: 1.2;
          margin: 0 0 15px 0;
          font-weight: 400;
        }

        /* League Format Sections */
        .format-section {
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          padding: 40px;
          margin-bottom: 60px;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 30px;
        }

        .format-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 25px;
          transition: all 0.3s ease;
        }

        .format-card:hover {
          transform: translateY(-5px);
          border-color: #0c1c8c;
          box-shadow: 0 12px 25px rgba(12, 28, 140, 0.06);
        }

        .format-card h4 {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.5rem;
          color: #0c1c8c;
          margin: 0 0 10px 0;
          letter-spacing: 0.5px;
        }

        .format-card p {
          color: #334155;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }

        /* Teams Grid */
        .teams-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
          gap: 28px; 
          margin-bottom: 40px;
        }

        .team-card { 
          background: #ffffff; 
          border-radius: 24px; 
          overflow: hidden; 
          border: 1px solid #e2e8f0; 
          transition: all 0.35s ease; 
          cursor: pointer; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          padding: 30px 20px;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
        }

        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.3s ease;
          z-index: 2;
        }

        .team-card:hover { 
          transform: translateY(-8px); 
          border-color: #0c1c8c;
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1); 
        }

        .team-card:hover::before {
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
        }

        .team-logo-container { 
          height: 80px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-bottom: 15px; 
          width: 100%;
        }

        .team-logo-container img {
          max-width: 75px; 
          max-height: 75px; 
          object-fit: contain; 
          object-position: center;
        }

        .team-name {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.4rem;
          color: #0c1c8c;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
          text-align: center;
        }

        .read-more-btn {
          margin-top: auto;
          display: flex; 
          align-items: center; 
          gap: 6px; 
          color: #0c1c8c; 
          font-weight: 800; 
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          transition: gap 0.2s ease;
        }

        .team-card:hover .read-more-btn {
          gap: 10px;
        }

        /* Modal Styling */
        .modal-backdrop { 
          position: fixed; 
          inset: 0; 
          background: rgba(12, 28, 140, 0.4); 
          backdrop-filter: blur(8px); 
          z-index: 9999; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 20px; 
        }

        .modal-container { 
          background: #ffffff; 
          color: #0f172a;
          width: 100%; 
          max-width: 520px; 
          max-height: 85vh; 
          border-radius: 28px; 
          overflow: hidden; 
          position: relative; 
          display: flex; 
          flex-direction: column; 
          border: 1px solid #e2e8f0;
          box-shadow: 0 25px 50px rgba(12, 28, 140, 0.15); 
        }
        
        .modal-scroll { 
          overflow-y: auto; 
          padding-bottom: 40px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .modal-scroll::-webkit-scrollbar { display: none; }

        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #0c1c8c;
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .featured-hero { grid-template-columns: 1fr; }
          .featured-content { padding: 30px 25px; }
          .header-box h1 { font-size: 2.8rem; }
          .page-banner { height: 240px; }
        }
      `}</style>

      <div className="about-page">
        <div className="container">
          
          {/* HEADER SECTION */}
          <header className="header-box">
            <span className="header-tag">The Pride of Stacon League</span>
            <h1>ABOUT <span className="color-yellow">US</span></h1>
            <div className="header-underline"></div>
            <p className="header-description">
              Elevating the standard of alumni sports and fellowship, the <strong style={{ color: '#0c1c8c' }}>Stacon League</strong> shines brighter and stands bolder—uniting elite talent, passion, and legacy under the esteemed mother body of the <strong style={{ color: '#0c1c8c' }}>Standard College Ntungamo</strong> alumni community.
            </p>
          </header>

          {/* PAGE BANNER */}
          <div className="page-banner">
            <img 
              src={secondaryImg} 
              alt="Stacon League Match Action" 
              loading="lazy"
            />
          </div>

          {/* EVOLUTION / HISTORY HERO */}
          <div className="featured-hero">
            <div className="featured-content">
              <div className="trending-badge">
                OUR EVOLUTION
              </div>
              <h2>From Passionate Sparks to Elite Competition</h2>
              <p style={{ color: '#334155', lineHeight: 1.6, margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                What began as a passionate spark has transformed into the ultimate premier showcase. The Stacon League defines modern alumni competition, offering an electric atmosphere, unrivaled organization, and deep brotherhood.
              </p>
            </div>
          </div>

          {/* MISSION & VISION GRID */}
          <div className="feature-grid">
            <div className="news-card" style={{ cursor: 'default' }}>
              <div className="card-body">
                <span className="card-category">Our Purpose</span>
                <h3 className="card-title">Our Mission</h3>
                <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                  To foster lifelong bonds, professional networking, and holistic wellness among alumni through competitive sportsmanship and impactful community engagement.
                </p>
              </div>
            </div>

            <div className="news-card" style={{ cursor: 'default' }}>
              <div className="card-body">
                <span className="card-category">Our Horizon</span>
                <h3 className="card-title">Our Vision</h3>
                <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                  To be the premier and most vibrant alumni sports association in East Africa, recognized for excellence, integrity, and sustainable impact.
                </p>
              </div>
            </div>
          </div>

          {/* TOURNAMENTS & LEAGUE FORMAT SECTION */}
          <div className="format-section">
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span className="header-tag">Tournament Architecture</span>
              <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0c1c8c', margin: '0 0 10px 0', letterSpacing: '1px' }}>
                HOW WE <span className="color-yellow" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>COMPETE</span>
              </h2>
              <div className="header-underline" style={{ margin: '15px auto 0' }}></div>
            </div>

            <div className="format-grid">
              <div className="format-card">
                <h4>Stacon Gala</h4>
                <p>
                  The grand season opener held entirely on a single day. Teams battle through intense group stages, quarter-finals, and semi-finals leading up to an explosive final. We have celebrated different winners across various exciting seasons.
                </p>
              </div>

              <div className="format-card">
                <h4>Stacon League</h4>
                <p>
                  Played across multiple thrilling matchdays in a full round-robin format where all participating teams face each other. The table leader advances automatically to the final. Second and third place clash in a playoff, with the winner securing the remaining spot in the ultimate championship showdown.
                </p>
              </div>

              <div className="format-card">
                <h4>Stacon Cup</h4>
                <p>
                  The prestigious knockout tournament held on the grand finale day of the league season. Strictly contested by elite teams that finished in 4th place and above on the final league standings.
                </p>
              </div>
            </div>
          </div>

          {/* REGISTERED CLUBS SECTION */}
          <div style={{ marginTop: '70px', marginBottom: '30px', textAlign: 'center' }}>
            <span className="header-tag">The Competitors</span>
            <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0c1c8c', margin: '0 0 10px 0', letterSpacing: '1px' }}>
              REGISTERED <span className="color-yellow" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>LEAGUE CLUBS</span>
            </h2>
            <div className="header-underline" style={{ margin: '15px auto 35px' }}></div>
          </div>

          <div className="teams-grid">
            {teams.map((team) => (
              <div key={team.id} className="team-card" onClick={() => setSelectedTeam(team)}>
                <div className="team-logo-container">
                  <img 
                    src={getImageUrl(team.logo || team.imageUrl)} 
                    alt={team.name} 
                    loading="lazy" 
                  />
                </div>
                <h3 className="team-name">{team.name}</h3>
                <div className="read-more-btn">
                  VIEW DETAILS <ChevronRight size={16} strokeWidth={3}/>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* TEAM DETAILS MODAL */}
      {selectedTeam && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-container">
            <button className="close-btn" onClick={() => setSelectedTeam(null)}>
              <X size={20} color="#0c1c8c" />
            </button>
            
            <div className="modal-scroll">
              <div style={{ background: '#f1f5f9', padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <img 
                  src={getImageUrl(selectedTeam.logo || selectedTeam.imageUrl)} 
                  style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 15px' }} 
                  alt={selectedTeam.name} 
                  loading="lazy"
                />
                <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '2.2rem', color: '#0c1c8c', margin: 0, letterSpacing: '0.8px' }}>
                  {selectedTeam.name}
                </h2>
              </div>

              <div style={{ padding: '30px' }}>
                {selectedTeam.captain && (
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c1c8c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Club Leadership</span>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
                      Captain: <span style={{ fontWeight: 500, color: '#334155' }}>{selectedTeam.captain}</span>
                    </p>
                  </div>
                )}

                {selectedTeam.founded && (
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c1c8c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Established</span>
                    <p style={{ margin: 0, color: '#334155', fontWeight: 500, fontSize: '0.95rem' }}>
                      {selectedTeam.founded}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c1c8c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>About Club</span>
                  <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                    {selectedTeam.description || selectedTeam.bio || "An elite franchise competing with pride, passion, and tactical excellence in the Stacon League."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default About;