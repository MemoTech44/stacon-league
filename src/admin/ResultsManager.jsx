import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { 
  collection, getDocs, updateDoc, doc, writeBatch, 
  query, where, increment, getDoc 
} from 'firebase/firestore';
import { 
  Trash2, Loader2, X, Edit3, MessageSquare, ChevronDown, Plus, Calendar 
} from 'lucide-react';

// Custom Select Component styled for the dark theme (used for Players and Clubs)
const CustomSelect = ({ value, onChange, options, placeholder = "Select Option" }) => {
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

  const selectedOption = options.find(opt => opt.id === value || opt.name === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1000 : 1 }}>
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 9999,
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
          {options.map((opt) => {
            const isSelected = value === opt.id || value === opt.name;
            return (
              <div
                key={opt.id || opt.name}
                onClick={() => {
                  onChange(opt.name);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: isSelected ? '#facc15' : '#ffffff',
                  background: isSelected ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                  fontWeight: isSelected ? 800 : 400,
                  transition: '0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={(e) => e.target.style.background = isSelected ? 'rgba(250, 204, 21, 0.1)' : 'transparent'}
              >
                {opt.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Generic Custom Dropdown for Matchdays with high stacking context
const DropdownSelector = ({ label, value, onChange, options }) => {
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

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minWidth: '150px', zIndex: isOpen ? 1000 : 10 }}>
      {label && <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</span>}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="custom-input" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0b1329',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#ffffff',
          boxSizing: 'border-box'
        }}
      >
        <span>{value}</span>
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
          boxShadow: '0 15px 40px rgba(0,0,0,0.9)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 99999,
          padding: '4px'
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: value === opt ? '#facc15' : '#ffffff',
                background: value === opt ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                fontWeight: value === opt ? 800 : 500,
                transition: '0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = value === opt ? 'rgba(250, 204, 21, 0.1)' : 'transparent'}
            >
              {opt}
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
  const [fetching, setFetching] = useState(false);
  const [activeFixture, setActiveFixture] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Tabs & Settings
  const [activeTab, setActiveTab] = useState("fixtures");
  
  const [currentLiveSeason, setCurrentLiveSeason] = useState(null);
  const [selectedMatchday, setSelectedMatchday] = useState("1");
  const [availableMatchdays, setAvailableMatchdays] = useState(["1", "2", "3", "4", "Gala"]);

  const [showAddMatchdayModal, setShowAddMatchdayModal] = useState(false);
  const [newMatchdayName, setNewMatchdayName] = useState("");

  // Legacy Season Setup State
  const [legacySeason, setLegacySeason] = useState("Season 1");
  const [legacyStandings, setLegacyStandings] = useState([
    { clubName: '', position: 1, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0 }
  ]);
  const [legacyScorers, setLegacyScorers] = useState([
    { name: '', club: '', goals: 0, appearances: 0 }
  ]);

  // Form State for Active Fixtures
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchScorers, setMatchScorers] = useState([]);
  const [adminNote, setAdminNote] = useState("");

  const allSeasonsList = ["Season 1", "Season 2", "Season 3", "Season 4", "Season 5", "Season 6", "Season 7", "Season 8", "Season 9", "Season 10"];

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (!currentLiveSeason) return;
    if (activeTab === "fixtures" || activeTab === "add_matchday") {
      fetchData();
    } else if (activeTab === "legacy_setup") {
      fetchClubsAndPlayers();
      fetchLegacySeasonData(legacySeason);
    }
  }, [selectedMatchday, activeTab, currentLiveSeason]);

  useEffect(() => {
    if (activeTab === "legacy_setup") {
      fetchLegacySeasonData(legacySeason);
    }
  }, [legacySeason]);

  const fetchSystemSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "leagueConfig"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setCurrentLiveSeason(data.currentSeason || "Season 7");
      } else {
        setCurrentLiveSeason("Season 7");
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
      setCurrentLiveSeason("Season 7");
    }
  };

  const fetchData = async () => {
    if (!currentLiveSeason) return;
    setFetching(true);
    setDebugInfo(null);
    try {
      const allSnap = await getDocs(collection(db, "fixtures"));
      const allFixtures = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const uniqueSeasons = [...new Set(allFixtures.map(f => f.season))];
      const forThisSeason = allFixtures.filter(f => f.season === currentLiveSeason);
      const uniqueMatchdays = [...new Set(forThisSeason.map(f => String(f.matchday)))];

      setDebugInfo({
        totalFixtures: allFixtures.length,
        uniqueSeasons,
        forThisSeason: forThisSeason.length,
        uniqueMatchdays,
        selectedMatchday,
        currentLiveSeason,
      });

      const fetchedFixtures = forThisSeason
        .filter(f => String(f.matchday) === String(selectedMatchday))
        .sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          if (dateA - dateB !== 0) return dateA - dateB;
          return (a.time || "").localeCompare(b.time || "");
        });

      setFixtures(fetchedFixtures);

      const defaultMDs = ["1", "2", "3", "4", "Gala"];
      const combined = Array.from(new Set([...defaultMDs, ...uniqueMatchdays]));
      combined.sort((a, b) => {
        if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
        return a.localeCompare(b);
      });
      setAvailableMatchdays(combined);

      await fetchClubsAndPlayers();
    } catch (error) {
      console.error(error);
      setDebugInfo({ error: error.message });
    } finally {
      setFetching(false);
    }
  };

  const fetchClubsAndPlayers = async () => {
    try {
      const playerSnap = await getDocs(collection(db, "players"));
      setPlayers(playerSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const clubSnap = await getDocs(collection(db, "clubs"));
      setClubs(clubSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLegacySeasonData = async (season) => {
    try {
      const clubSnap = await getDocs(collection(db, "clubs"));
      const clubsList = clubSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClubs(clubsList);

      const existingStandings = clubsList
        .filter(c => c.stats && c.stats[season])
        .map(c => {
          const s = c.stats[season];
          return {
            clubName: c.name,
            position: s.position || 0,
            played: s.played || 0,
            won: s.won || 0,
            drawn: s.drawn || 0,
            lost: s.lost || 0,
            points: s.points || 0,
            gf: s.gf || 0,
            ga: s.ga || 0
          };
        })
        .sort((a, b) => (a.position || 999) - (b.position || 999));

      setLegacyStandings(
        existingStandings.length > 0
          ? existingStandings
          : [{ clubName: '', position: 1, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0 }]
      );

      const scorersQuery = query(collection(db, "topScorers"), where("season", "==", season));
      const scorersSnap = await getDocs(scorersQuery);
      const existingScorers = scorersSnap.docs.map(d => {
        const data = d.data();
        return {
          name: data.name || '',
          club: data.club || '',
          goals: data.goals || 0,
          appearances: data.appearances || 0
        };
      });

      setLegacyScorers(
        existingScorers.length > 0
          ? existingScorers
          : [{ name: '', club: '', goals: 0, appearances: 0 }]
      );
    } catch (error) {
      console.error("Error loading legacy season data:", error);
    }
  };

  const handleAddNewMatchday = async () => {
    if (!newMatchdayName.trim()) {
      alert("Please enter a valid matchday name or number.");
      return;
    }
    const formattedMD = newMatchdayName.trim();
    if (!availableMatchdays.includes(formattedMD)) {
      setAvailableMatchdays([...availableMatchdays, formattedMD]);
    }
    setSelectedMatchday(formattedMD);
    setNewMatchdayName("");
    setShowAddMatchdayModal(false);
    setActiveTab("fixtures");
  };

  const openEditor = (f) => {
    if (f.date) {
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
    setHomeScore(f.homeScore ?? 0);
    setAwayScore(f.awayScore ?? 0);
    setMatchScorers(f.scorers || []);
    setAdminNote(f.adminNote || "");
  };

  const handleUpdate = async (fixture) => {
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

      const cleanScorers = matchScorers.map(s => ({
        name: s.name || s.playerId || '',
        playerId: s.playerId || '',
        minute: s.minute || ''
      }));

      batch.update(fixtureRef, { 
        status: 'completed',
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        scorers: cleanScorers,
        adminNote: adminNote
      });

      const isAlreadyCompleted = fixture.status && fixture.status.toLowerCase() === 'completed';

      if (!isAlreadyCompleted) {
        const hPoints = homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
        const aPoints = awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0;
        
        const homeClub = clubs.find(c => c.name === fixture.homeTeam);
        const awayClub = clubs.find(c => c.name === fixture.awayTeam);

        if (homeClub && awayClub) {
          batch.update(doc(db, "clubs", homeClub.id), {
            [`stats.${currentLiveSeason}.played`]: increment(1),
            [`stats.${currentLiveSeason}.won`]: increment(homeScore > awayScore ? 1 : 0),
            [`stats.${currentLiveSeason}.drawn`]: increment(homeScore === awayScore ? 1 : 0),
            [`stats.${currentLiveSeason}.lost`]: increment(homeScore < awayScore ? 1 : 0),
            [`stats.${currentLiveSeason}.points`]: increment(hPoints),
            [`stats.${currentLiveSeason}.gf`]: increment(Number(homeScore)),
            [`stats.${currentLiveSeason}.ga`]: increment(Number(awayScore)),
          });
          batch.update(doc(db, "clubs", awayClub.id), {
            [`stats.${currentLiveSeason}.played`]: increment(1),
            [`stats.${currentLiveSeason}.won`]: increment(awayScore > homeScore ? 1 : 0),
            [`stats.${currentLiveSeason}.drawn`]: increment(awayScore === homeScore ? 1 : 0),
            [`stats.${currentLiveSeason}.lost`]: increment(awayScore < homeScore ? 1 : 0),
            [`stats.${currentLiveSeason}.points`]: increment(aPoints),
            [`stats.${currentLiveSeason}.gf`]: increment(Number(awayScore)),
            [`stats.${currentLiveSeason}.ga`]: increment(Number(homeScore)),
          });
        }

        for (const s of cleanScorers) {
          if (!s.name) continue;

          const playerDoc = players.find(p =>
            (p.name || p.username || '').toLowerCase() === s.name.toLowerCase()
          );

          if (playerDoc) {
            batch.update(doc(db, "players", playerDoc.id), {
              [`goals.${currentLiveSeason}`]: increment(1)
            });
          }

          const scorerDocId = `${currentLiveSeason.replace(/\s/g, '_')}_${s.name.replace(/\s/g, '_')}`.toLowerCase();
          const scorerRef = doc(db, "topScorers", scorerDocId);
          const scorerSnap = await getDoc(scorerRef);

          if (scorerSnap.exists()) {
            batch.update(scorerRef, {
              goals: increment(1),
              season: currentLiveSeason,
              name: s.name,
              club: playerDoc ? (playerDoc.club || playerDoc.team || '') : ''
            });
          } else {
            batch.set(scorerRef, {
              goals: 1,
              season: currentLiveSeason,
              name: s.name,
              appearances: 0,
              club: playerDoc ? (playerDoc.club || playerDoc.team || '') : ''
            });
          }
        }
      }

      await batch.commit();
      setActiveFixture(null);
      fetchData();
      alert("Matchday results updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error saving result: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentLiveSeason) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', color: '#94a3b8' }}>
        <Loader2 className="animate-spin" size={32} style={{ marginRight: '12px' }} />
        Loading season configuration...
      </div>
    );
  }

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
          position: relative;
          z-index: 1;
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

      {/* Main Top Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab("fixtures")} 
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            background: activeTab === 'fixtures' ? '#facc15' : 'rgba(15, 23, 42, 0.65)',
            color: activeTab === 'fixtures' ? '#04060d' : '#94a3b8',
            border: activeTab === 'fixtures' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          Manage Results ({currentLiveSeason})
        </button>
        <button 
          onClick={() => setActiveTab("add_matchday")} 
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            background: activeTab === 'add_matchday' ? '#facc15' : 'rgba(15, 23, 42, 0.65)',
            color: activeTab === 'add_matchday' ? '#04060d' : '#94a3b8',
            border: activeTab === 'add_matchday' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Calendar size={15}/> Add Matchday
        </button>
        <button 
          onClick={() => setActiveTab("legacy_setup")} 
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            background: activeTab === 'legacy_setup' ? '#facc15' : 'rgba(15, 23, 42, 0.65)',
            color: activeTab === 'legacy_setup' ? '#04060d' : '#94a3b8',
            border: activeTab === 'legacy_setup' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          Setup Past Seasons
        </button>
      </div>

      {activeTab === "add_matchday" ? (
        <div className="card" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#facc15', margin: 0 }}>
              Add New Matchday
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '5px' }}>
              Create a new matchday entry for {currentLiveSeason} to input and edit fixture results.
            </p>
          </div>

          <div style={{ background: '#0b1329', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', marginBottom: '10px' }}>
              Matchday Name / Number
            </span>
            <input 
              type="text" 
              placeholder="e.g. 5, Quarter Finals, or Gala" 
              value={newMatchdayName} 
              onChange={(e) => setNewMatchdayName(e.target.value)}
              className="custom-input"
            />
          </div>

          <button 
            onClick={handleAddNewMatchday}
            style={{ width: '100%', background: '#facc15', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 900, color: '#04060d', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)' }}
          >
            Create & Select Matchday
          </button>
        </div>
      ) : activeTab === "legacy_setup" ? (
        <div className="card" style={{ padding: '25px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#facc15', margin: 0 }}>
              Historical Seasons Configuration
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '5px' }}>
              Define final team standings, positions, statistics, and top scorers for completed past seasons.
            </p>
          </div>

          <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', marginBottom: '6px' }}>Select Season to Configure</span>
            <select 
              value={legacySeason}
              onChange={(e) => setLegacySeason(e.target.value)}
              className="custom-input"
            >
              {allSeasonsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div>
          {/* Controls Header featuring DropdownSelector with elevated z-index */}
          <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', zIndex: 50, position: 'relative' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <DropdownSelector 
                label="Select Matchday" 
                value={selectedMatchday} 
                onChange={setSelectedMatchday} 
                options={availableMatchdays} 
              />
            </div>
          </div>

          {/* Fixtures List Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {fetching ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 10px' }} />
                Loading fixtures for matchday {selectedMatchday}...
              </div>
            ) : fixtures.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No fixtures found for Matchday {selectedMatchday} in {currentLiveSeason}.
              </div>
            ) : (
              fixtures.map((fixture) => {
                const isCompleted = fixture.status && fixture.status.toLowerCase() === 'completed';
                const isEditing = activeFixture === fixture.id;

                return (
                  <div key={fixture.id} className={`card ${isCompleted ? 'completed-card' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                        {fixture.date || 'TBD'} • {fixture.time || '00:00'} • {fixture.venue || 'Equinox Sports Centre'}
                      </span>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        background: isCompleted ? 'rgba(250, 204, 21, 0.1)' : 'rgba(148, 163, 184, 0.1)', 
                        color: isCompleted ? '#facc15' : '#94a3b8' 
                      }}>
                        {isCompleted ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>

                    <div className="teams-display-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ flex: 1, textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#ffffff' }} className="team-name-mobile">
                        {fixture.homeTeam}
                      </div>
                      <div style={{ padding: '0 20px', fontSize: '1.2rem', fontWeight: 900, color: '#facc15', fontFamily: "'Bebas Neue', sans-serif" }}>
                        {isCompleted ? `${fixture.homeScore} - ${fixture.awayScore}` : 'VS'}
                      </div>
                      <div style={{ flex: 1, textAlign: 'left', fontWeight: 800, fontSize: '1rem', color: '#ffffff' }} className="team-name-mobile">
                        {fixture.awayTeam}
                      </div>
                    </div>

                    {!isEditing ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => openEditor(fixture)}
                          style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Edit3 size={14} /> {isCompleted ? 'Edit Result' : 'Record Result'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: '#0b1329', padding: '15px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{fixture.homeTeam} Score</span>
                            <input 
                              type="number" 
                              value={homeScore} 
                              onChange={(e) => setHomeScore(e.target.value)}
                              className="custom-input"
                              style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 800 }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{fixture.awayTeam} Score</span>
                            <input 
                              type="number" 
                              value={awayScore} 
                              onChange={(e) => setAwayScore(e.target.value)}
                              className="custom-input"
                              style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 800 }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => setActiveFixture(null)}
                            style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleUpdate(fixture)}
                            disabled={loading}
                            style={{ background: '#facc15', color: '#04060d', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save Result'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsManager;