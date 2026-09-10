import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Search, 
  Trophy, 
  User, 
  Loader2, 
  TrendingUp,
  Calendar,
  UserX,
  ChevronRight,
  Award,
  X
} from 'lucide-react';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Lock body scroll when modal is open matching executive/about behavior
  useEffect(() => {
    if (selectedPlayer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPlayer]);

  // Fast fetch data implementation
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const q = query(collection(db, "players"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const rawData = doc.data();
          return {
            id: doc.id,
            ...rawData,
            goals: parseInt(rawData.goals || 0),
            yellowCards: parseInt(rawData.yellowCards || rawData.yellow_cards || 0),
            redCards: parseInt(rawData.redCards || rawData.red_cards || 0),
            photo: rawData.photoUrl || rawData.photo || null,
            yearsAtSchool: rawData.studyPeriod || rawData.yearsAtStJerome || rawData.years || rawData.years_at_st_jerome || rawData.classOf || null
          };
        });
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  // Optimized high-performance memoized filter calculation
  const filteredPlayers = useMemo(() => {
    let result = players;
    if (viewMode === 'scorers') {
      result = result.filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.team && p.team.toLowerCase().includes(term))
      );
    }
    return result;
  }, [searchTerm, viewMode, players]);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      setSelectedPlayer(null);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={48} color="#0c1c8c" />
      <p style={{ marginTop: '20px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }}>
        SYNCING ROSTER...
      </p>
    </div>
  );

  return (
    <div className="players-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .players-page { 
          background-color: #f8fafc; 
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          min-height: 100vh; 
          padding: 120px 5% 100px; 
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .container { max-width: 1280px; margin: 0 auto; }
        
        .color-blue { color: #0c1c8c; }
        .color-yellow { color: #c59b27; }
        .color-red { color: #b91c1c; }

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

        .controls-bar { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 15px; 
          justify-content: space-between; 
          align-items: center;
          background: #ffffff; 
          padding: 18px 22px; 
          border-radius: 20px;
          margin-bottom: 35px; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04); 
          border: 1px solid #e2e8f0;
        }

        .search-box { position: relative; width: 320px; max-width: 100%; }
        
        .search-box input { 
          width: 100%; 
          padding: 12px 16px 12px 42px; 
          border-radius: 14px; 
          border: 1px solid #e2e8f0; 
          background: #f8fafc; 
          color: #0f172a;
          font-weight: 600; 
          font-family: inherit;
          transition: all 0.3s ease; 
          font-size: 0.9rem; 
          box-sizing: border-box;
        }

        .search-box input::placeholder { color: #94a3b8; }

        .search-box input:focus { 
          outline: none; 
          border-color: #0c1c8c; 
          background: #ffffff; 
          box-shadow: 0 0 15px rgba(12, 28, 140, 0.08); 
        }

        .search-box svg { 
          position: absolute; 
          left: 14px; 
          top: 50%;
          transform: translateY(-50%); 
          color: #0c1c8c; 
        }

        .filter-group { display: flex; gap: 10px; }

        .toggle-btn { 
          padding: 11px 20px; 
          border-radius: 14px; 
          border: 1px solid #e2e8f0; 
          font-weight: 700; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          font-family: 'Cinzel', serif;
          transition: all 0.3s ease; 
          white-space: nowrap; 
        }

        .toggle-btn.active-all, .toggle-btn.active-scorers {
          background: #0c1c8c;
          color: #ffffff;
          border-color: #0c1c8c;
          box-shadow: 0 4px 15px rgba(12, 28, 140, 0.2);
        }

        .toggle-btn.inactive {
          background: #f8fafc;
          color: #475569;
        }

        .toggle-btn.inactive:hover {
          color: #0c1c8c;
          border-color: #0c1c8c;
        }

        .table-wrapper { 
          background: #ffffff; 
          border-radius: 24px; 
          overflow: hidden; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04); 
          border: 1px solid #e2e8f0; 
        }

        table { width: 100%; border-collapse: collapse; }

        th { 
          padding: 22px 20px; 
          font-size: 0.75rem; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          font-weight: 700; 
          font-family: 'Cinzel', serif;
          color: #0c1c8c; 
          background: #f8fafc; 
          text-align: left; 
          border-bottom: 1px solid #e2e8f0;
        }

        td { 
          padding: 18px 20px; 
          border-bottom: 1px solid #f1f5f9; 
          font-weight: 600; 
          color: #334155; 
          transition: background 0.2s ease; 
        }

        tr:hover td { 
          background: rgba(12, 28, 140, 0.02); 
          cursor: pointer; 
        }

        .player-identity { display: flex; align-items: center; gap: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; }

        .row-avatar { 
          width: 44px; 
          height: 44px; 
          border-radius: 50%; 
          object-fit: cover; 
          object-position: top; 
          background: #f1f5f9; 
          border: 2px solid #e2e8f0; 
        }

        .club-text { 
          color: #475569; 
          font-size: 0.9rem; 
          font-weight: 600; 
          text-transform: uppercase;
        }

        .card-badge-yellow {
          display: inline-block;
          width: 12px;
          height: 16px;
          background: #eab308;
          border-radius: 2px;
          vertical-align: middle;
          margin-right: 6px;
        }

        .card-badge-red {
          display: inline-block;
          width: 12px;
          height: 16px;
          background: #b91c1c;
          border-radius: 2px;
          vertical-align: middle;
          margin-right: 6px;
        }

        /* Modal Styling matching Executive */
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

        .photo-container {
          position: relative;
          width: 130px;
          height: 130px;
          margin: 0 auto;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(135deg, #0c1c8c, #c59b27);
          box-shadow: 0 8px 20px rgba(12, 28, 140, 0.15);
        }

        .modal-member-photo { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          object-position: top;
          border-radius: 50%; 
          background: #ffffff;
          display: block;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .member-role { 
          color: #0c1c8c; 
          font-size: 0.75rem; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          background: #f8fafc; 
          padding: 8px 18px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .member-role::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #c59b27;
        }

        @media (max-width: 900px) {
          .players-page { padding-top: 100px; padding-left: 16px; padding-right: 16px; }
          .controls-bar { 
            flex-direction: row; 
            flex-wrap: nowrap; 
            padding: 12px 14px; 
            gap: 10px; 
            border-radius: 16px;
          }
          .search-box { flex: 1; min-width: 0; }
          .search-box input { 
            padding: 10px 12px 10px 36px; 
            font-size: 0.8rem; 
            border-radius: 12px; 
          }
          .search-box svg { left: 10px; width: 16px; height: 16px; }
          
          .filter-group { display: flex; gap: 6px; flex-shrink: 0; }
          .toggle-btn { 
            padding: 10px 14px; 
            font-size: 0.7rem; 
            border-radius: 12px; 
            gap: 4px;
          }
          .toggle-btn svg { width: 14px; height: 14px; }

          .hide-on-mobile { display: none; }
          td { padding: 14px; }
          .player-identity { font-weight: 600; color: #0f172a; font-size: 0.85rem; }
          .club-text { font-size: 0.8rem; font-weight: 500; color: #475569; }
        }
      `}</style>

      <div className="container">
        <header className="header-box">
          <span className="header-tag">Registry & Analytics</span>
          <h1>PLAYERS & <span className="color-yellow">ROSTER</span></h1>
          <div className="header-underline"></div>
          <div className="header-description">
            Browse through our elite community of athletes, verify player affiliations, and track individual 
            match statistics and disciplinary records for the current season.
          </div>
        </header>

        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search players or teams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button 
              className={`toggle-btn ${viewMode === 'all' ? 'active-all' : 'inactive'}`}
              onClick={() => setViewMode('all')} 
            >
              <User size={15} /> ALL
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'scorers' ? 'active-scorers' : 'inactive'}`}
              onClick={() => setViewMode('scorers')} 
            >
              <Trophy size={15} /> SCORERS
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {filteredPlayers.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
              <UserX size={56} color="#0c1c8c" style={{ margin: '0 auto 15px' }} />
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0c1c8c', margin: '0 0 5px 0' }}>
                No Results Found
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>Try searching for a different name or team.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Team Name</th>
                  <th className="hide-on-mobile">Position</th>
                  <th className="hide-on-mobile" style={{ textAlign: 'center' }}>Goals</th>
                  <th className="hide-on-mobile" style={{ textAlign: 'center' }}>YC</th>
                  <th className="hide-on-mobile" style={{ textAlign: 'center' }}>RC</th>
                  <th className="hide-on-mobile" style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(player => (
                  <tr key={player.id} onClick={() => setSelectedPlayer(player)}>
                    <td>
                      <div className="player-identity">
                        <img 
                          src={player.photo || `https://ui-avatars.com/api/?name=${player.name}&background=f1f5f9&color=0c1c8c`} 
                          className="row-avatar hide-on-mobile" 
                          alt={player.name} 
                        />
                        {player.name ? player.name.toUpperCase() : ''}
                      </div>
                    </td>
                    <td>
                      <span className="club-text">
                        {player.team ? player.team.toUpperCase() : "INDEPENDENT"}
                      </span>
                    </td>
                    <td className="hide-on-mobile" style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem' }}>{player.position ? player.position.toUpperCase() : 'N/A'}</td>
                    <td className="hide-on-mobile" style={{ textAlign: 'center', fontWeight: 800, color: player.goals > 0 ? '#0c1c8c' : '#94a3b8' }}>
                      {player.goals > 0 ? player.goals : '—'}
                    </td>
                    <td className="hide-on-mobile" style={{ textAlign: 'center', fontWeight: 800, color: player.yellowCards > 0 ? '#ca8a04' : '#94a3b8' }}>
                      {player.yellowCards > 0 ? player.yellowCards : '—'}
                    </td>
                    <td className="hide-on-mobile" style={{ textAlign: 'center', fontWeight: 800, color: player.redCards > 0 ? '#b91c1c' : '#94a3b8' }}>
                      {player.redCards > 0 ? player.redCards : '—'}
                    </td>
                    <td className="hide-on-mobile" style={{ textAlign: 'center' }}>
                      <div style={{ color: '#0c1c8c', display: 'flex', justifyContent: 'center' }}>
                        <ChevronRight size={18} strokeWidth={3} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PLAYER DETAILS MODAL */}
        {selectedPlayer && (
          <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container">
              <button className="close-btn" onClick={() => setSelectedPlayer(null)}>
                <X size={20} color="#0c1c8c" />
              </button>

              <div className="modal-scroll">
                <div style={{ background: '#f1f5f9', padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="photo-container" style={{ margin: '0 auto 15px' }}>
                    {selectedPlayer.photo ? (
                      <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="modal-member-photo" />
                    ) : (
                      <div className="photo-placeholder">
                        <User size={80} color="#0c1c8c" />
                      </div>
                    )}
                  </div>
                  <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '2.2rem', color: '#0c1c8c', margin: '0 0 5px 0', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    {selectedPlayer.name ? selectedPlayer.name.toUpperCase() : ''}
                  </h2>
                  <div className="member-role" style={{ margin: 0 }}>
                    <Award size={14} className="color-yellow" />
                    {selectedPlayer.position ? selectedPlayer.position.toUpperCase() : 'FIELD PLAYER'}
                  </div>
                </div>

                <div style={{ padding: '30px' }}>
                  <div style={{ marginBottom: '25px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c59b27', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Affiliated Club</span>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase' }}>
                      {selectedPlayer.team ? selectedPlayer.team.toUpperCase() : "INDEPENDENT CLUB"}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <TrendingUp size={18} color="#0c1c8c" style={{ marginBottom: '6px' }} />
                      <span style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Goals Scored</span>
                      <b style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0c1c8c', lineHeight: 1 }}>{selectedPlayer.goals}</b>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <Calendar size={18} color="#0c1c8c" style={{ marginBottom: '6px' }} />
                      <span style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Years Active</span>
                      <b style={{ fontSize: '0.85rem', color: '#0c1c8c', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                        {selectedPlayer.yearsAtSchool || 'N/A'}
                      </b>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span className="card-badge-yellow" style={{ margin: 0 }}></span>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase' }}>Yellow Cards</span>
                      </div>
                      <b style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0f172a', lineHeight: 1 }}>{selectedPlayer.yellowCards}</b>
                    </div>

                    <div style={{ background: 'rgba(185, 28, 28, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(185, 28, 28, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span className="card-badge-red" style={{ margin: 0 }}></span>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Red Cards</span>
                      </div>
                      <b style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0f172a', lineHeight: 1 }}>{selectedPlayer.redCards}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;