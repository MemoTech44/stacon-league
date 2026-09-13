import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, Shield, Heart, Users, Calendar, Trophy, Activity, Image as ImageIcon, Award } from 'lucide-react';

// Assets imported from project directory
import bachweziImg from '../assets/bachwezi.jpg';
import celImg from '../assets/cel.jpg';
import chrisImg from '../assets/chris.jpg';
import demImg from '../assets/dem.jpg';
import embengoImg from '../assets/embengo.jpg';
import esImg from '../assets/es.jpg';
import essawaImg from '../assets/essawa.jpg';
import fallImg from '../assets/fall.jpg';
import galImg from '../assets/gal.jpg';
import hamImg from '../assets/ham.jpg';
import kitImg from '../assets/kit.jpg';
import logoImg from '../assets/logo.png';
import netImg from '../assets/net.jpeg';
import netwImg from '../assets/netw.jpg';
import topImg from '../assets/top.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Banner sliding images dataset utilizing different asset options
  const bannerSlides = [
    { id: 1, image: bachweziImg, caption: "STACON League Action & Intensity" },
    { id: 2, image: essawaImg, caption: "Essawa Moments & Glory" },
    { id: 3, image: embengoImg, caption: "Embengo Heritage & Spirit" },
    { id: 4, image: fallImg, caption: "Championship Glory & Triumphs" },
    { id: 5, image: topImg, caption: "Top Tier Competition & Teams" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Restricted to exactly two visual highlights for the homepage section
  const galleryHighlights = [
    { id: 1, url: celImg, caption: "Class & Elegance on Display" },
    { id: 2, url: chrisImg, caption: "Star Player Performance" }
  ];

  // Additional asset references for remaining sections and other pages
  const sideAssets = [demImg, esImg, galImg, hamImg, kitImg, netImg, netwImg];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News
        const newsSnap = await getDocs(collection(db, "news"));
        const fetchedNews = newsSnap.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            displayDate: data.date || "Latest"
          };
        });
        fetchedNews.sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : (a.createdAt?.seconds * 1000 || 0);
          const timeB = b.date ? new Date(b.date).getTime() : (b.createdAt?.seconds * 1000 || 0);
          return timeB - timeA;
        });
        setNews(fetchedNews.slice(0, 2));

        // Fetch Standings / Table (Top 5)
        const tableSnap = await getDocs(collection(db, "table"));
        const fetchedTable = tableSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedTable.sort((a, b) => (b.points || 0) - (a.points || 0) || (b.gd || 0) - (b.gd || 0));
        setStandings(fetchedTable.slice(0, 5));

        // Fetch Fixtures
        const fixturesSnap = await getDocs(collection(db, "fixtures"));
        const fetchedFixtures = fixturesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFixtures(fetchedFixtures.slice(0, 3));

        // Fetch Results
        const resultsSnap = await getDocs(collection(db, "results"));
        const fetchedResults = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(fetchedResults.slice(0, 3));

        // Fetch Sponsors & Partners
        const sponsorsSnap = await getDocs(collection(db, "sponsors"));
        const fetchedSponsors = sponsorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSponsors(fetchedSponsors);

      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .home-root { 
          background-color: #f8fafc; 
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          overflow-x: hidden; 
        }
        
        .hero-viewport { 
          position: relative; 
          background: #f8f8fa;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 140px 24px 80px;
          text-align: center;
          overflow: hidden;
          min-height: 520px;
        }

        .hero-bg-static {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-bg-static img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 2.85;
        }

        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(6, 13, 61, 0.95) 0%, rgba(12, 28, 140, 0.85) 100%);
          z-index: 2;
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 900px;
        }

        .welcome-prefix {
          font-family: 'Cinzel', serif;
          color: #f3e73f;
          font-weight: 700;
          letter-spacing: 5px;
          text-transform: uppercase;
          font-size: clamp(0.85rem, 2vw, 1.15rem);
          margin: 0 0 10px 0;
        }
        
        .hero-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(3.2rem, 9vw, 6rem); 
          letter-spacing: 2px;
          margin: 0 0 10px 0; 
          line-height: 0.92;
          color: #ffffff;
          text-transform: uppercase;
          text-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .hero-subtitle {
          font-family: 'Cinzel', serif;
          color: #f3e73f;
          font-weight: 800;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-size: clamp(0.85rem, 1.8vw, 1.15rem);
          margin: 0 auto 28px;
        }

        .gold-heading {
          font-family: 'Bebas Neue', cursive;
          color: #0c1c8c;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin: 0;
          line-height: 1;
        }

        .hero-description-box {
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          
          backdrop-filter: blur(10px);
          border: 1px solid rgba(217, 119, 6, 0.3);
          padding: 30px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .hero-description {
          color: #f1f5f9;
          font-size: clamp(0.95rem, 1.7vw, 1.1rem);
          line-height: 1.8;
          font-weight: 400;
          margin: 0;
        }

        .sponsor-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #f3e73f;
          color: #2c0669;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px 32px;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 2px solid #f3e73f;
        }

        .glass-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 15px 35px rgba(12, 28, 140, 0.06);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-4px);
          border-color: #cbd5e1;
          box-shadow: 0 20px 45px rgba(12, 28, 140, 0.1);
        }

        .value-pillar {
          padding: 36px 24px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .value-pillar:hover {
          transform: translateY(-5px);
          border-color: #f3e73f;
          box-shadow: 0 18px 40px rgba(12, 28, 140, 0.09);
        }

        .icon-box-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid #fde68a;
        }

        .value-title {
          font-family: 'Cinzel', serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0c1c8c;
          margin: 0 0 12px 0;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .pulse-card { 
          transition: all 0.3s ease; 
          border: 1px solid #e2e8f0; 
          background: #ffffff;
          display: flex;
          gap: 18px;
          padding: 20px;
          border-radius: 24px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
          overflow: hidden;
        }

        .page-banner-wrapper {
          padding: 0 4%;
          max-width: 1280px;
          margin: 20px auto 40px;
          box-sizing: border-box;
        }

        .page-banner {
          width: 100%;
          height: 400px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          border: 4px solid #ffffff;
          box-shadow: 0 20px 50px rgba(12, 28, 140, 0.15);
        }

        .banner-slide-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transform: scale(1.05);
          transition: opacity 1.2s ease-in-out, transform 6s ease-out;
        }

        .banner-slide-img.active {
          opacity: 1;
          transform: scale(1);
        }

        .banner-overlay-content {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6, 13, 61, 0.9) 0%, rgba(12, 28, 140, 0.3) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 30px;
          color: #ffffff;
          z-index: 5;
        }

        .slide-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
        }

        .slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slide-dot.active {
          width: 28px;
          background: #0c1c8c;
        }
        
        .pulse-card:hover { 
          transform: translateY(-4px); 
          border-color: #cbd5e1;
          box-shadow: 0 16px 40px rgba(12, 28, 140, 0.1); 
        }

        .snippet-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .snippet-table th {
          background: #f1f5f9;
          color: #0c1c8c;
          padding: 12px;
          font-weight: 700;
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .snippet-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          font-weight: 500;
        }

        .snippet-table tr:last-child td {
          border-bottom: none;
        }

        .home-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .home-gallery-card {
          position: relative;
          height: 280px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.06);
          cursor: pointer;
        }

        .home-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .home-gallery-card:hover img {
          transform: scale(1.07);
        }

        .home-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6, 13, 61, 0.9) 0%, rgba(12, 28, 140, 0.2) 65%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .hero-viewport { 
            padding: 110px 16px 60px; 
            min-height: auto;
          }
          
          .page-banner-wrapper {
            padding: 0 16px;
            margin-bottom: 30px;
          }

          .page-banner {
            height: 240px;
            border-radius: 20px;
          }

          .home-gallery-grid {
            grid-template-columns: 1fr;
          }

          .pulse-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
          }
          .pulse-card img {
            width: 100% !important;
            height: 180px !important;
            border-radius: 16px !important;
          }
          
          .content-section {
            padding: 20px 16px 60px !important;
          }

          .glass-card {
            border-radius: 20px;
            padding: 20px !important;
          }

          .value-pillar {
            padding: 28px 20px;
            border-radius: 20px;
          }

          .home-gallery-card {
            height: 220px;
            border-radius: 20px;
          }
        }
      `}</style>

      {/* HERO SECTION WITH THEME DESIGN */}
      <section className="hero-viewport">
        <div className="hero-bg-static">
          <img src={bachweziImg} alt="STACON League Bachwezi Background" />
        </div>
        <div className="hero-overlay-gradient"></div>

        <div className="hero-content-wrapper">
          <p className="welcome-prefix">Welcome To</p>
          <h1 className="hero-title">STACON League</h1>
          <p className="hero-subtitle">REKA ENTANGA ETAMBURE</p>
          
          <div className="hero-description-box">
            <p className="hero-description">
              The STACON League is more than a football championship—it is a celebration of heritage, friendship, achievement, and the enduring bonds forged within the walls of our school. Bringing together alumni from different generations, classes, and eras, the League transforms the beautiful game into a powerful platform for reconnection, healthy rivalry, and lifelong camaraderie.
            </p>
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <Link to="/contact" className="sponsor-btn">
                Become a Sponsor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER SECTION WITH SLIDING IMAGES */}
      <div className="page-banner-wrapper">
        <div className="page-banner">
          {bannerSlides.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.caption}
              className={`banner-slide-img ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
          <div className="banner-overlay-content">
            <h4 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.95rem, 2vw, 1.3rem)', fontWeight: 700, color: '#f3e73f', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {bannerSlides[currentSlide].caption}
            </h4>
          </div>
        </div>

        <div className="slide-dots">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* CORE PILLARS SECTION */}
      <section style={{ padding: '20px 4% 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', fontFamily: 'Cinzel, serif', letterSpacing: '3px', textTransform: 'uppercase' }}>Our Foundation</span>
          <h2 className="gold-heading" style={{ marginTop: '6px' }}>Core Pillars</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="value-pillar">
            <div className="icon-box-wrapper">
              <Shield color="#0c1c8c" size={30} />
            </div>
            <h4 className="value-title">Heritage & Integrity</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.7 }}>
              Upholding strict standards of fair play and respecting the rich traditions of Standard College Ntungamo across every season.
            </p>
          </div>

          <div className="value-pillar">
            <div className="icon-box-wrapper">
              <Users color="#0c1c8c" size={30} />
            </div>
            <h4 className="value-title">Alumni Unity</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.7 }}>
              Acting as a vibrant networking bridge connecting veteran alumni with recent graduates through community initiatives and football camaraderie.
            </p>
          </div>

          <div className="value-pillar">
            <div className="icon-box-wrapper">
              <Heart color="#0c1c8c" size={30} />
            </div>
            <h4 className="value-title">Unmatched Passion</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.7 }}>
              Delivering an intense, high-energy league structure where every match day brings out the absolute best in our players and supporters.
            </p>
          </div>
        </div>
      </section>

      {/* LEAGUE SNIPPETS SECTION: TABLE, FIXTURES, & RESULTS */}
      <section style={{ padding: '10px 4% 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* STANDINGS */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={18} color="#0c1c8c" />
                  </div>
                  <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#0c1c8c' }}>League Standings</h3>
                </div>
                <Link to="/table" style={{ color: '#0c1c8c', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Full Table <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>Loading table...</p>
              ) : standings.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>No standings available yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="snippet-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>Pos</th>
                        <th>Team</th>
                        <th style={{ textAlign: 'center', width: '50px' }}>PL</th>
                        <th style={{ textAlign: 'center', width: '50px' }}>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={team.id || index}>
                          <td style={{ fontWeight: 700, color: index < 3 ? '#0c1c8c' : '#475569' }}>{team.position || index + 1}</td>
                          <td style={{ fontWeight: 600 }}>{team.teamName || team.name || 'Team'}</td>
                          <td style={{ textAlign: 'center' }}>{team.played ?? team.p ?? 0}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#0c1c8c' }}>{team.points ?? team.pts ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* FIXTURES */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} color="#0c1c8c" />
                  </div>
                  <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#0c1c8c' }}>Upcoming Fixtures</h3>
                </div>
                <Link to="/fixtures" style={{ color: '#0c1c8c', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  All Fixtures <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>Loading fixtures...</p>
              ) : fixtures.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>No upcoming fixtures scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {fixtures.map((fix, index) => (
                    <div key={fix.id || index} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        <span>{fix.date || 'TBD'}</span>
                        <span>{fix.time || ''}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fix.homeTeam || fix.home || 'Home Team'}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', padding: '2px 8px', background: '#e2e8f0', borderRadius: '6px', margin: '0 8px' }}>VS</span>
                        <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fix.awayTeam || fix.away || 'Away Team'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RESULTS */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color="#0c1c8c" />
                  </div>
                  <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#0c1c8c' }}>Latest Results</h3>
                </div>
                <Link to="/results" style={{ color: '#0c1c8c', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  All Results <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>Loading results...</p>
              ) : results.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>No recent match results recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.map((res, index) => (
                    <div key={res.id || index} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>
                        {res.date || 'Recent Match'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.homeTeam || res.home || 'Home'}</span>
                        <span style={{ margin: '0 10px', padding: '4px 10px', background: '#0c1c8c', color: '#ffffff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, minWidth: '45px', textAlign: 'center', boxShadow: '0 4px 12px rgba(12,28,140,0.2)' }}>
                          {res.homeScore ?? res.homeGoals ?? '0'} - {res.awayScore ?? res.awayGoals ?? '0'}
                        </span>
                        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.awayTeam || res.away || 'Away'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* EXACTLY TWO GALLERY HIGHLIGHTS FOR THE HOMEPAGE */}
      <section style={{ padding: '10px 4% 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', fontFamily: 'Cinzel, serif', letterSpacing: '3px', textTransform: 'uppercase' }}>Visual Memories</span>
            <h2 className="gold-heading" style={{ marginTop: '4px' }}>League Moments</h2>
          </div>
          <Link to="/GalleryView" style={{ color: '#0c1c8c', fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Full Gallery <ArrowRight size={15} />
          </Link>
        </div>

        <div className="home-gallery-grid">
          {galleryHighlights.map((item) => (
            <div key={item.id} className="home-gallery-card" onClick={() => navigate('/GalleryView')}>
              <img src={item.url} alt={item.caption} />
              <div className="home-gallery-overlay">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <ImageIcon size={15} color="#f3e73f" />
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700, color: '#f3e73f', letterSpacing: '1px', textTransform: 'uppercase' }}>STACON Gallery</span>
                </div>
                <h4 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>{item.caption}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST NEWS SECTION */}
      <section className="content-section" style={{ padding: '10px 4% 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f3e73f', fontFamily: 'Cinzel, serif', letterSpacing: '3px', textTransform: 'uppercase' }}>Stay Updated</span>
            <h2 className="gold-heading" style={{ marginTop: '4px' }}>Latest News</h2>
          </div>
          <Link to="/news" style={{ color: '#0c1c8c', fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All News <ArrowRight size={15} />
          </Link>
        </div>
        
        {loading ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '0.95rem' }}>
            Loading latest news...
          </div>
        ) : news.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '0.95rem' }}>
            No news articles published yet.
          </div>
        ) : (
          <div className="news-grid">
            {news.map((item, index) => (
              <div key={item.id} onClick={() => navigate('/news')} className="pulse-card">
                <img src={item.image || item.imageUrl || sideAssets[index % sideAssets.length]} style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }} alt={item.title || "News Image"} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', marginBottom: '4px' }}>{item.displayDate}</span>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>{item.title || 'STACON League Update'}</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content || item.description || 'Click to read more about this update.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SPONSORS AND PARTNERS SECTION */}
      <section style={{ padding: '20px 4% 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', fontFamily: 'Cinzel, serif', letterSpacing: '3px', textTransform: 'uppercase' }}>Valued Supporters</span>
          <h2 className="gold-heading" style={{ marginTop: '6px' }}>Sponsors & Partners</h2>
        </div>

        {loading ? (
          <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>Loading sponsors and partners...</p>
        ) : sponsors.length === 0 ? (
          <p style={{ color: '#475569', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>No sponsors or partners listed at the moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden', padding: '10px' }}>
                  <img 
                    src={sponsor.logo || sponsor.imageUrl || logoImg} 
                    alt={sponsor.name || sponsor.companyName || 'Sponsor Logo'} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                </div>
                <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 700, color: '#0c1c8c', margin: '0 0 10px 0' }}>
                  {sponsor.name || sponsor.companyName || 'Partner Name'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  {sponsor.description || sponsor.bio || 'Proudly supporting the STACON League vision and community development.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;