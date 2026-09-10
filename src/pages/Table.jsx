import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Trophy, Loader2, Shield, Sparkles } from 'lucide-react';

import heroImg from '../assets/top.jpg';

const Table = () => {
  const [leagueData, setLeagueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState("Season 2");

  // Capped up to Season 4
  const seasons = ["Season 1", "Season 2", "Season 3", "Season 4"];

  useEffect(() => {
    const generateTableData = async () => {
      setLoading(true);
      try {
        const clubsSnapshot = await getDocs(collection(db, "clubs"));
        const teamsMap = {};
        
        clubsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          teamsMap[data.name] = {
            id: doc.id,
            name: data.name,
            logo: data.logoUrl || data.logo || null,
            p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
          };
        });

        const fixturesQuery = query(
          collection(db, "fixtures"),
          where("season", "==", selectedSeason),
          where("status", "==", "completed")
        );
        const fixturesSnapshot = await getDocs(fixturesQuery);

        // Check if any matches have been completed for this season
        const hasSeasonStarted = fixturesSnapshot.docs.length > 0;

        fixturesSnapshot.docs.forEach(doc => {
          const match = doc.data();
          const home = teamsMap[match.homeTeam];
          const away = teamsMap[match.awayTeam];

          if (home && away) {
            const hScore = Number(match.homeScore);
            const aScore = Number(match.awayScore);

            home.p += 1;
            away.p += 1;
            home.gf += hScore;
            home.ga += aScore;
            away.gf += aScore;
            away.ga += hScore;

            if (hScore > aScore) {
              home.w += 1; home.pts += 3;
              away.l += 1;
            } else if (hScore < aScore) {
              away.w += 1; away.pts += 3;
              home.l += 1;
            } else {
              home.d += 1; home.pts += 1;
              away.d += 1; away.pts += 1;
            }
            home.gd = home.gf - home.ga;
            away.gd = away.gf - away.ga;
          }
        });

        let sortedTeams = Object.values(teamsMap);

        if (!hasSeasonStarted) {
          // Default order: Alphabetical by team name if season hasn't started
          sortedTeams.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          // Standard league standings sorting order
          sortedTeams.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
          });
        }

        setLeagueData(sortedTeams.map((t, i) => ({ ...t, pos: i + 1 })));
      } catch (error) {
        console.error("Error calculating table:", error);
      } finally {
        setLoading(false);
      }
    };

    generateTableData();
  }, [selectedSeason]);

  return (
    <div className="table-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .table-page { 
          background-color: #f8fafc; 
          min-height: 100vh; 
          padding: 120px 5% 100px; 
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
          margin-bottom: 50px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.06);
          height: 320px;
          position: relative;
        }

        .page-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.6s ease;
        }

        .page-banner:hover img {
          transform: scale(1.05);
        }

        /* Controls / Season Filter Section */
        .selector-wrapper { 
          display: flex; 
          justify-content: center; 
          margin-bottom: 40px;
        }

        .season-filter { 
          display: flex; 
          gap: 6px; 
          background: #ffffff; 
          padding: 8px; 
          border-radius: 20px; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 10px 25px rgba(12, 28, 140, 0.04); 
        }

        .season-tab { 
          padding: 10px 22px; 
          border-radius: 14px; 
          border: none; 
          background: transparent; 
          cursor: pointer; 
          font-weight: 800; 
          color: #64748b; 
          transition: all 0.3s ease; 
          font-size: 0.75rem; 
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .season-tab:hover { color: #0c1c8c; }

        .season-tab.active { 
          background: #0c1c8c; 
          color: #ffffff; 
          box-shadow: 0 4px 15px rgba(12, 28, 140, 0.2);
        }

        /* Table Card & Content */
        .table-card { 
          background: #ffffff; 
          border-radius: 28px; 
          overflow: hidden; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04); 
          border: 1px solid #e2e8f0; 
          padding: 30px;
          width: 100%;
          box-sizing: border-box;
          position: relative;
          transition: all 0.35s ease;
        }

        .table-card::before {
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

        .table-card:hover {
          border-color: #0c1c8c;
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1);
        }

        .table-card:hover::before {
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        table { width: 100%; border-collapse: collapse; min-width: 650px; }
        
        th { 
          background: #f8fafc; 
          padding: 14px 12px; 
          font-size: 0.7rem; 
          font-weight: 700; 
          color: #64748b; 
          text-transform: uppercase; 
          border-bottom: 1px solid #e2e8f0; 
          letter-spacing: 1px;
          text-align: center;
        }
        
        td { 
          padding: 14px 12px; 
          border-bottom: 1px solid #f1f5f9; 
          font-weight: 500; 
          text-align: center; 
          color: #0f172a; 
          font-size: 0.85rem; 
        }

        .w-pos { 
          width: 50px; 
          font-family: 'Bebas Neue', cursive; 
          font-size: 1.2rem; 
          color: #0c1c8c; 
        }

        .w-team { text-align: left; padding-left: 10px; }

        .w-pts { 
          background: rgba(197, 155, 39, 0.08); 
          color: #0c1c8c; 
          font-family: 'Bebas Neue', cursive; 
          font-size: 1.25rem; 
          width: 70px; 
          font-weight: 700;
        }

        .col-team-cell { display: flex; align-items: center; gap: 12px; }
        
        .team-name-text { 
          font-family: 'Bebas Neue', cursive;
          font-size: 1.2rem;
          font-weight: normal; 
          color: #0f172a; 
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .team-logo-container { 
          width: 40px; 
          height: 40px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: #f8fafc; 
          border-radius: 12px; 
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          padding: 6px;
          box-shadow: inset 0 0 8px rgba(0,0,0,0.02);
        }

        .team-logo { max-width: 100%; max-height: 100%; object-fit: contain; }
        
        tr.leader td { background: rgba(197, 155, 39, 0.05); }

        .legend { 
          display: flex; 
          justify-content: center; 
          gap: 20px; 
          margin-top: 30px; 
          padding: 16px 24px; 
          background: #ffffff; 
          border-radius: 20px; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 8px 20px rgba(12, 28, 140, 0.04);
          flex-wrap: wrap;
          font-size: 0.75rem; 
          color: #475569; 
          font-weight: 600;
        }

        .legend b { color: #0c1c8c; }

        @media (max-width: 768px) {
          .table-page { padding-top: 90px; padding-left: 16px; padding-right: 16px; }
          .header-box { margin-bottom: 30px; }
          .header-box h1 { font-size: 2.6rem; }
          .page-banner { height: 200px; margin-bottom: 35px; }
          
          .season-filter { padding: 4px; border-radius: 14px; gap: 4px; width: 100%; max-width: 360px; justify-content: space-between; }
          .season-tab { padding: 6px 10px; font-size: 0.65rem; border-radius: 10px; flex: 1; text-align: center; }

          .table-card { padding: 15px; }
          .team-name-text { font-size: 0.95rem; }
          .team-logo-container { width: 32px; height: 32px; border-radius: 8px; padding: 4px; }
        }
      `}</style>

      <div className="container">
        {/* HEADER SECTION */}
        <header className="header-box">
          <span className="header-tag">League Archives & Statistics</span>
          <h1>LEAGUE <span className="color-yellow">STANDINGS</span></h1>
          <div className="header-underline"></div>
          <p className="header-description">
            Track the competitive journey and live performance metrics of all elite teams across active and historical seasons in the <strong className="color-blue">Stacon League</strong>.
          </p>
        </header>

        {/* PAGE BANNER */}
        <div className="page-banner">
          <img 
            src={heroImg} 
            alt="Stacon League Standings Action" 
            loading="lazy"
          />
        </div>

        {/* SEASON SELECTOR CONTROLS */}
        <div className="selector-wrapper">
          <div className="season-filter">
            {seasons.map(s => (
              <button 
                key={s} 
                onClick={() => setSelectedSeason(s)} 
                className={`season-tab ${selectedSeason === s ? 'active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="table-card">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 className="animate-spin" size={40} color="#0c1c8c" style={{ margin: 'auto' }}/>
              <p style={{ marginTop: '15px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontSize: '0.8rem' }}>
                LOADING STANDINGS...
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th className="w-pos">Pos</th>
                    <th className="w-team">Club</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th className="w-pts">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueData.map((team) => (
                    <tr key={team.id} className={team.pos === 1 ? 'leader' : ''}>
                      <td className="w-pos">{team.pos}</td>
                      <td className="w-team">
                        <div className="col-team-cell">
                          <div className="team-logo-container">
                            {team.logo ? (
                              <img src={team.logo} className="team-logo" crossOrigin="anonymous" alt=""/>
                            ) : (
                              <Shield size={14} color="#0c1c8c"/>
                            )}
                          </div>
                          <span className="team-name-text">{team.name}</span>
                        </div>
                      </td>
                      <td>{team.p}</td>
                      <td>{team.w}</td>
                      <td>{team.d}</td>
                      <td>{team.l}</td>
                      <td>{team.gf}</td>
                      <td>{team.ga}</td>
                      <td style={{ color: team.gd > 0 ? '#10b981' : team.gd < 0 ? '#ef4444' : 'inherit', fontWeight: 700 }}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </td>
                      <td className="w-pts">{team.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LEGEND FOOTER */}
        <div className="legend">
          <span><b>P</b> Played</span>
          <span><b>W</b> Won</span>
          <span><b>D</b> Drawn</span>
          <span><b>L</b> Lost</span>
          <span><b>GF</b> Goals For</span>
          <span><b>GA</b> Goals Against</span>
          <span><b>GD</b> Goal Difference</span>
          <span><b>Pts</b> Points</span>
        </div>
      </div>
    </div>
  );
};

export default Table;