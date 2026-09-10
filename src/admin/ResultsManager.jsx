import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { 
  collection, getDocs, updateDoc, doc, writeBatch, 
  query, where, increment 
} from 'firebase/firestore';
import { 
  Trash2, Loader2, X, Edit3, MessageSquare, ChevronDown 
} from 'lucide-react';

// Custom Select Component styled for the dark theme
const CustomSelect = ({ value, onChange, options, placeholder = "Select Player" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="custom-input" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0b1329',
          fontSize: '0.85rem',
          color: selectedOption ? '#ffffff' : '#94a3b8',
          boxSizing: 'border-box'
        }}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <ChevronDown size={16} color="#facc15" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#0b1329',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 100,
          padding: '4px'
        }}>
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#94a3b8',
              background: 'transparent'
            }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: value === opt.id ? '#facc15' : '#ffffff',
                background: value === opt.id ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                fontWeight: value === opt.id ? 800 : 400,
                transition: '0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = value === opt.id ? 'rgba(250, 204, 21, 0.1)' : 'transparent'}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ResultsManager = () => {
  const [fixtures, setFixtures] = useState([]);
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeFixture, setActiveFixture] = useState(null);
  
  // Filters
  const [selectedSeason, setSelectedSeason] = useState("Season 2");
  const [selectedMatchday, setSelectedMatchday] = useState("1");

  // Form State
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchScorers, setMatchScorers] = useState([]);
  const [adminNote, setAdminNote] = useState("");

  const seasons = ["Season 1", "Season 2", "Season 3", "Season 4"];
  const defaultMatchdays = ["1", "2", "3", "4", "Gala"];

  useEffect(() => {
    fetchData();
  }, [selectedSeason, selectedMatchday]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const fixQuery = query(
        collection(db, "fixtures"), 
        where("season", "==", selectedSeason),
        where("matchday", "==", selectedMatchday)
      );
      const fixSnap = await getDocs(fixQuery);
      
      const fetchedFixtures = fixSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetchedFixtures.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        if (dateB - dateA !== 0) return dateB - dateA;
        return (a.time || "").localeCompare(b.time || "");
      });

      setFixtures(fetchedFixtures);
      
      const playerSnap = await getDocs(collection(db, "players"));
      setPlayers(playerSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const clubSnap = await getDocs(collection(db, "clubs"));
      setClubs(clubSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const openEditor = (f) => {
    // Check if fixture date has arrived before opening editor
    if (f.date) {
      // Create date objects stripped of time to safely compare calendar days
      const matchDate = new Date(f.date);
      matchDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (matchDate > today) {
        alert(`Cannot record results. This match is scheduled for ${f.date}, which has not yet been reached.`);
        return;
      }
    }

    setActiveFixture(f.id);
    setHomeScore(f.homeScore || 0);
    setAwayScore(f.awayScore || 0);
    setMatchScorers(f.scorers || []);
    setAdminNote(f.adminNote || "");
  };

  const handleUpdate = async (fixture) => {
    // Double check date restriction on submit
    if (fixture.date) {
      const matchDate = new Date(fixture.date);
      matchDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (matchDate > today) {
        alert("Action blocked: This match date has not arrived yet.");
        return;
      }
    }

    setLoading(true);
    const batch = writeBatch(db);

    try {
      const fixtureRef = doc(db, "fixtures", fixture.id);
      
      batch.update(fixtureRef, { 
        status: 'completed',
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        scorers: matchScorers,
        adminNote: adminNote
      });

      if (fixture.status !== 'completed') {
        const hPoints = homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
        const aPoints = awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0;
        
        const homeClub = clubs.find(c => c.name === fixture.homeTeam);
        const awayClub = clubs.find(c => c.name === fixture.awayTeam);

        if (homeClub && awayClub) {
          batch.update(doc(db, "clubs", homeClub.id), {
            [`stats.${selectedSeason}.played`]: increment(1),
            [`stats.${selectedSeason}.points`]: increment(hPoints),
            [`stats.${selectedSeason}.gf`]: increment(Number(homeScore)),
            [`stats.${selectedSeason}.ga`]: increment(Number(awayScore)),
          });
          batch.update(doc(db, "clubs", awayClub.id), {
            [`stats.${selectedSeason}.played`]: increment(1),
            [`stats.${selectedSeason}.points`]: increment(aPoints),
            [`stats.${selectedSeason}.gf`]: increment(Number(awayScore)),
            [`stats.${selectedSeason}.ga`]: increment(Number(homeScore)),
          });
        }

        matchScorers.forEach(s => {
          if (s.playerId) {
            batch.update(doc(db, "players", s.playerId), { 
              [`goals.${selectedSeason}`]: increment(1) 
            });
          }
        });
      }

      await batch.commit();
      setActiveFixture(null);
      fetchData();
      alert("Season data updated successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const availableMatchdaysFromDb = Array.from(new Set(fixtures.map(f => f.matchday)));
  const combinedMatchdays = Array.from(new Set([...defaultMatchdays, ...availableMatchdaysFromDb]));

  return (
    <div className="results-container">
      <style>{`
        .results-container {
          padding: 20px 10px 50px 10px;
          max-width: 900px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
          animation: fadeIn 0.5s ease;
        }

        .season-tabs-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          width: 100%;
        }

        .season-tabs {
          display: flex;
          gap: 6px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .season-btn {
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          font-weight: 800;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .scroll-wrapper {
          display: flex;
          justify-content: center;
          overflow-x: auto;
          padding: 10px 0 25px 0;
          scrollbar-width: none;
        }

        .md-btn {
          padding: 10px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 800;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .card {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .completed-card {
          border-left: 5px solid #facc15;
        }

        .custom-input {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0b1329;
          color: #ffffff;
          font-size: 0.85rem;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .custom-input:focus {
          border-color: #facc15;
          box-shadow: 0 0 15px rgba(250, 204, 21, 0.15);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .teams-display-row {
            flex-direction: row !important;
            gap: 6px !important;
            justify-content: center !important;
          }
          .team-name-mobile {
            font-family: 'Inter', sans-serif !important;
            font-weight: 500 !important;
            font-size: 0.8rem !important;
            letter-spacing: 0 !important;
          }
        }
      `}</style>
      
      {/* Centered Season Tabs */}
      <div className="season-tabs-wrapper">
        <div className="season-tabs">
          {seasons.map(s => (
            <button 
              key={s} 
              onClick={() => setSelectedSeason(s)} 
              className="season-btn"
              style={{
                background: selectedSeason === s ? '#facc15' : 'transparent',
                color: selectedSeason === s ? '#04060d' : '#94a3b8',
                boxShadow: selectedSeason === s ? '0 4px 15px rgba(250, 204, 21, 0.25)' : 'none'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Centered Matchday Horizontal Filter */}
      <div className="scroll-wrapper">
        <div style={{ display: 'flex', gap: '8px' }}>
            {combinedMatchdays.map(m => (
            <button 
              key={m} 
              onClick={() => setSelectedMatchday(m)} 
              className="md-btn"
              style={{
                background: selectedMatchday === m ? '#facc15' : 'rgba(15, 23, 42, 0.65)',
                color: selectedMatchday === m ? '#04060d' : '#94a3b8',
                borderColor: selectedMatchday === m ? '#facc15' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {m.toLowerCase() === 'gala' ? 'Gala' : `MD ${m}`}
            </button>
            ))}
        </div>
      </div>

      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" color="#facc15" size={32} />
        </div>
      ) : fixtures.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px 20px', 
          background: 'rgba(15, 23, 42, 0.65)', 
          backdropFilter: 'blur(16px)',
          borderRadius: '24px', 
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}>
          <p style={{ fontWeight: 700, color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>No fixtures found for this selection.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {fixtures.map(f => (
            <div key={f.id} className={`card ${f.status === 'completed' ? 'completed-card' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }} className="teams-display-row">
                  <span style={{ flex: 1, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.5px', color: '#ffffff', textAlign: 'right', textTransform: 'uppercase', wordBreak: 'break-word' }} className="team-name-mobile">
                    {f.homeTeam}
                  </span>
                  <div style={{ background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.3)', color: '#facc15', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 900, flexShrink: 0 }}>
                    {f.status === 'completed' ? `${f.homeScore} - ${f.awayScore}` : 'VS'}
                  </div>
                  <span style={{ flex: 1, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.5px', color: '#ffffff', textAlign: 'left', textTransform: 'uppercase', wordBreak: 'break-word' }} className="team-name-mobile">
                    {f.awayTeam}
                  </span>
                </div>
                <div style={{ width: '100px', textAlign: 'right', flexShrink: 0 }}>
                  {activeFixture === f.id ? (
                    <button onClick={() => setActiveFixture(null)} style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '50%', width: '32px', height: '32px', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto' }}><X size={16}/></button>
                  ) : (
                    <button onClick={() => openEditor(f)} style={{ background: f.status === 'completed' ? 'rgba(255, 255, 255, 0.05)' : '#facc15', color: f.status === 'completed' ? '#94a3b8' : '#04060d', border: f.status === 'completed' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                      {f.status === 'completed' ? <Edit3 size={14}/> : 'Record'}
                    </button>
                  )}
                </div>
              </div>

              {f.status === 'completed' && activeFixture !== f.id && f.adminNote && (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={13} color="#facc15"/> {f.adminNote}
                </div>
              )}

              {activeFixture === f.id && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
                    <input type="number" value={homeScore} onChange={e => setHomeScore(e.target.value)} className="custom-input" style={{ width: '70px', height: '50px', fontSize: '1.4rem', textAlign: 'center', fontWeight: 'bold', color: '#facc15' }} />
                    <div style={{ fontWeight: 900, color: '#facc15', fontSize: '0.9rem' }}>VS</div>
                    <input type="number" value={awayScore} onChange={e => setAwayScore(e.target.value)} className="custom-input" style={{ width: '70px', height: '50px', fontSize: '1.4rem', textAlign: 'center', fontWeight: 'bold', color: '#facc15' }} />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <textarea 
                        placeholder="Add admin note (e.g. Team missed match)..." 
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="custom-input"
                        style={{ minHeight: '70px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scorers</span>
                      <button onClick={() => setMatchScorers([...matchScorers, { playerId: '' }])} style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>+ Scorer</button>
                    </div>
                    {matchScorers.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <CustomSelect 
                            value={s.playerId} 
                            onChange={(val) => {
                              const n = [...matchScorers];
                              n[idx].playerId = val;
                              setMatchScorers(n);
                            }} 
                            options={players.filter(p => {
                              // Safely compare player club properties ignoring trailing spaces or case differences
                              const pClub = (p.club || '').trim().toLowerCase();
                              const home = (f.homeTeam || '').trim().toLowerCase();
                              const away = (f.awayTeam || '').trim().toLowerCase();
                              return pClub === home || pClub === away;
                            })}
                            placeholder="Select Player"
                          />
                        </div>
                        <button onClick={() => {
                          const n = [...matchScorers]; n.splice(idx, 1); setMatchScorers(n);
                        }} style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={15}/></button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => handleUpdate(f)} disabled={loading} style={{ width: '100%', marginTop: '20px', background: '#facc15', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 900, color: '#04060d', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)' }}>
                    {loading ? "Processing..." : "Save Result & Update Season"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsManager;