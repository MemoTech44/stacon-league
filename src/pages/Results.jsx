import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import { Loader2, Trophy, Award, Shield, Sparkles } from 'lucide-react';

const Champions = () => {
  const [champions, setChampions] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'League', 'Gala', 'Stacon Cup'];

  useEffect(() => {
    const fetchChampionsData = async () => {
      setLoading(true);
      try {
        // Fetch team logos and photos from clubs collection
        const teamsSnapshot = await getDocs(collection(db, "clubs"));
        const logos = {};
        teamsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const teamKey = data.name || data.teamName;
          if (teamKey) {
            logos[teamKey] = data.logoUrl || data.logo || data.photoUrl || data.teamPhoto || data.image;
          }
        });
        setTeamLogos(logos);

        // Fetch champions data from Firestore collection "champions"
        const q = query(collection(db, "champions"), orderBy("season", "desc"));
        const querySnapshot = await getDocs(q);
        const champData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setChampions(champData);
      } catch (error) {
        console.error("Error fetching champions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChampionsData();
  }, []);

  const filteredChampions = selectedCategory === 'All'
    ? champions
    : champions.filter(c => c.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <>
      <Helmet>
        <title>Wall of Champions | Stacon League</title>
      </Helmet>

      <div className="champions-page">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .champions-page { 
            background: #f8fafc; 
            min-height: 100vh; 
            padding: 120px 5% 80px; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            color: #0f172a;
            box-sizing: border-box;
          }

          .container { max-width: 1100px; margin: 0 auto; width: 100%; }
          .gold-text { color: #c59b27; }
          .color-blue { color: #0c1c8c; }

          /* Header Box */
          .header-box { text-align: center; margin-bottom: 45px; }

          .header-tag {
            font-family: 'Cinzel', serif;
            color: #0c1c8c;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .header-box h1 { 
            font-family: 'Bebas Neue', cursive;
            font-size: clamp(3rem, 7vw, 4.8rem); 
            color: #0c1c8c; 
            letter-spacing: 2px; 
            margin: 0 0 8px 0; 
            line-height: 1;
            font-weight: 400;
            text-transform: uppercase;
          }

          .header-underline { 
            width: 80px; 
            height: 4px; 
            background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c); 
            margin: 16px auto; 
            border-radius: 4px; 
          }

          .header-subtitle {
            font-family: 'Cinzel', serif;
            color: #c59b27;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-size: 0.9rem;
            margin: 0;
          }

          /* Category Filter */
          .filter-container { 
            display: flex; 
            gap: 8px; 
            flex-wrap: wrap; 
            justify-content: center; 
            margin-bottom: 45px;
          }

          .filter-btn { 
            padding: 12px 24px; 
            border-radius: 14px; 
            border: 1px solid #e2e8f0; 
            background: #ffffff; 
            font-weight: 700; 
            color: #64748b; 
            cursor: pointer; 
            font-size: 0.8rem; 
            transition: all 0.3s ease; 
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(12, 28, 140, 0.02);
          }

          .filter-btn:hover { 
            border-color: #0c1c8c; 
            color: #0c1c8c;
          }

          .filter-btn.active { 
            background: #0c1c8c; 
            color: #ffffff; 
            border-color: #0c1c8c; 
            box-shadow: 0 6px 20px rgba(12, 28, 140, 0.15); 
          }

          /* Champions Grid */
          .champs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 30px;
          }

          .champ-card {
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
            transition: all 0.35s ease;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          .champ-card:hover {
            transform: translateY(-6px);
            border-color: #0c1c8c;
            box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1);
          }

          .champ-image-container {
            width: 100%;
            height: 220px;
            position: relative;
            background: #0f172a;
            overflow: hidden;
          }

          .champ-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }

          .champ-card:hover .champ-image {
            transform: scale(1.05);
          }

          .champ-category-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(12, 28, 140, 0.85);
            backdrop-filter: blur(4px);
            color: #ffffff;
            font-family: 'Cinzel', serif;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 30px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .champ-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            justify-content: space-between;
          }

          .champ-top-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
          }

          .champ-logo-frame {
            width: 50px;
            height: 50px;
            background: #f8fafc;
            border-radius: 14px;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            flex-shrink: 0;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
          }

          .champ-logo-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .champ-meta {
            display: flex;
            flex-direction: column;
          }

          .champ-season {
            font-family: 'Cinzel', serif;
            font-size: 0.75rem;
            font-weight: 700;
            color: #c59b27;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }

          .champ-team-name {
            font-family: 'Bebas Neue', cursive;
            font-size: 1.8rem;
            color: #0c1c8c;
            margin: 0;
            line-height: 1.1;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .champ-details {
            border-top: 1px solid #f1f5f9;
            padding-top: 14px;
            margin-top: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #64748b;
            font-size: 0.85rem;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .champions-page { padding-top: 90px; padding-left: 16px; padding-right: 16px; }
            .champs-grid { grid-template-columns: 1fr; gap: 20px; }
            .filter-btn { padding: 10px 16px; font-size: 0.75rem; }
          }
        `}</style>

        <div className="container">
          <header className="header-box">
            <span className="header-tag">
              CHAMPIONS AND GLORY
            </span>
            <h1>WALL OF <span className="gold-text">FAME</span></h1>
            <div className="header-underline"></div>
          </header>

          <div className="filter-container">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`} 
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ height: '35vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={48} color="#0c1c8c" />
              <p style={{ marginTop: '20px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Loading Champions Wall...
              </p>
            </div>
          ) : filteredChampions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(12, 28, 140, 0.04)' }}>
              <Trophy size={56} className="gold-text" style={{ marginBottom: '15px' }} />
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#0c1c8c', margin: '0 0 5px 0' }}>No Champions Recorded</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
                No champion records have been added for {selectedCategory === 'All' ? 'any category' : selectedCategory} yet.
              </p>
            </div>
          ) : (
            <div className="champs-grid">
              {filteredChampions.map(champ => (
                <div key={champ.id} className="champ-card">
                  <div className="champ-image-container">
                    <img 
                      src={champ.celebrationPhotoUrl || champ.photoUrl || champ.teamPhotoUrl || champ.image || `https://ui-avatars.com/api/?name=${champ.teamName}&background=0c1c8c&color=fff&size=600`} 
                      alt={`${champ.teamName} Celebration`}
                      className="champ-image"
                      crossOrigin="anonymous"
                    />
                    <span className="champ-category-badge">
                      {champ.category || 'League Champion'}
                    </span>
                  </div>

                  <div className="champ-body">
                    <div>
                      <div className="champ-top-row">
                        <div className="champ-logo-frame">
                          <img 
                            src={teamLogos[champ.teamName] || champ.logoUrl || champ.teamLogo || champ.photoUrl || `https://ui-avatars.com/api/?name=${champ.teamName}&background=f8fafc&color=0c1c8c`} 
                            alt={champ.teamName} 
                            className="champ-logo-img"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="champ-meta">
                          <span className="champ-season">{champ.season || 'Season 1'}</span>
                          <h3 className="champ-team-name">{champ.teamName}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="champ-details">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trophy size={15} color="#c59b27" /> Winner Verified
                      </span>
                      <span style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: '0.75rem', color: '#0c1c8c' }}>
                        {champ.season || 'Season 1'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Champions;