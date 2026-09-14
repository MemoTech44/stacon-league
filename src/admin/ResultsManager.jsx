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
          {options.map((opt) => {
            const isSelected = value === opt.id || value === opt.name;
            return (
              <div
                key={opt.id || opt.name}
                onClick={() => {
                  onChange(opt.name); // Store team/player name or ID as configured
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

// Generic Custom Dropdown for Matchdays
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minWidth: '150px' }}>
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 100,
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
  
  // Tabs & Settings
  const [activeTab, setActiveTab] = useState("fixtures"); // "fixtures", "legacy_setup", or "add_matchday"
  
  // Current Live Season & Selected Matchday
  const [currentLiveSeason, setCurrentLiveSeason] = useState("Season 7");
  const [selectedMatchday, setSelectedMatchday] = useState("1");
  const [availableMatchdays, setAvailableMatchdays] = useState(["1", "2", "3", "4", "Gala"]);

  // Modal / Inline trigger for creating a new custom matchday
  const [showAddMatchdayModal, setShowAddMatchdayModal] = useState(false);
  const [newMatchdayName, setNewMatchdayName] = useState("");

  // Legacy Season Setup State (For past seasons)
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
    if (activeTab === "fixtures" || activeTab === "add_matchday") {
      fetchData();
    } else if (activeTab === "legacy_setup") {
      fetchClubsAndPlayers();
      fetchLegacySeasonData(legacySeason);
    }
  }, [selectedMatchday, activeTab]);

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
        if (data.currentSeason) {
          setCurrentLiveSeason(data.currentSeason);
        }
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
    }
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      const fixQuery = query(
        collection(db, "fixtures"), 
        where("season", "==", currentLiveSeason),
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

      const allSeasonFixturesQuery = query(collection(db, "fixtures"), where("season", "==", currentLiveSeason));
      const allSeasonSnap = await getDocs(allSeasonFixturesQuery);
      const dbMatchdays = Array.from(new Set(allSeasonSnap.docs.map(d => d.data().matchday).filter(Boolean)));
      
      const defaultMDs = ["1", "2", "3", "4", "Gala"];
      const combined = Array.from(new Set([...defaultMDs, ...dbMatchdays]));
      combined.sort((a, b) => {
        if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
        return a.localeCompare(b);
      });
      setAvailableMatchdays(combined);

      await fetchClubsAndPlayers();
    } catch (error) {
      console.error(error);
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
      // Always pull a fresh club list so dropdown options and existing stats are in sync
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
    setHomeScore(f.homeScore || 0);
    setAwayScore(f.awayScore || 0);
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
            [`stats.${currentLiveSeason}.played`]: increment(1),
            [`stats.${currentLiveSeason}.points`]: increment(hPoints),
            [`stats.${currentLiveSeason}.gf`]: increment(Number(homeScore)),
            [`stats.${currentLiveSeason}.ga`]: increment(Number(awayScore)),
          });
          batch.update(doc(db, "clubs", awayClub.id), {
            [`stats.${currentLiveSeason}.played`]: increment(1),
            [`stats.${currentLiveSeason}.points`]: increment(aPoints),
            [`stats.${currentLiveSeason}.gf`]: increment(Number(awayScore)),
            [`stats.${currentLiveSeason}.ga`]: increment(Number(homeScore)),
          });
        }

        matchScorers.forEach(s => {
          if (s.playerId) {
            batch.update(doc(db, "players", s.playerId), { 
              [`goals.${currentLiveSeason}`]: increment(1) 
            });
          }
        });
      }

      await batch.commit();
      setActiveFixture(null);
      fetchData();
      alert("Matchday results updated successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLegacySeason = async () => {
    setLoading(true);
    const batch = writeBatch(db);

    try {
      for (const item of legacyStandings) {
        if (!item.clubName) continue;
        const targetClub = clubs.find(c => c.name.toLowerCase() === item.clubName.toLowerCase());
        
        const statPayload = {
          played: Number(item.played || 0),
          won: Number(item.won || 0),
          drawn: Number(item.drawn || 0),
          lost: Number(item.lost || 0),
          points: Number(item.points || 0),
          gf: Number(item.gf || 0),
          ga: Number(item.ga || 0),
          position: Number(item.position || 0)
        };

        if (targetClub) {
          batch.update(doc(db, "clubs", targetClub.id), {
            [`stats.${legacySeason}`]: statPayload
          });
        } else {
          const newClubRef = doc(collection(db, "clubs"));
          batch.set(newClubRef, {
            name: item.clubName,
            stats: {
              [legacySeason]: statPayload
            }
          });
        }
      }

      // Clear out previously saved scorer entries for this season so edits
      // (renames, removals, changed goal counts) don't leave stale duplicates behind
      const existingScorersSnap = await getDocs(
        query(collection(db, "topScorers"), where("season", "==", legacySeason))
      );
      existingScorersSnap.docs.forEach(d => batch.delete(doc(db, "topScorers", d.id)));

      for (const scorer of legacyScorers) {
        if (!scorer.name) continue;
        const scorerRef = doc(collection(db, "topScorers"));
        batch.set(scorerRef, {
          name: scorer.name,
          club: scorer.club,
          goals: Number(scorer.goals || 0),
          appearances: Number(scorer.appearances || 0),
          season: legacySeason
        });
      }

      await batch.commit();
      alert(`Successfully saved historical data and final standings for ${legacySeason}!`);
      fetchLegacySeasonData(legacySeason);
    } catch (error) {
      console.error("Error saving legacy season:", error);
      alert("Failed to save legacy season data.");
    } finally {
      setLoading(false);
    }
  };

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

          {/* Select Legacy Season */}
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

          {/* SECTION 1: Team Standings & Outcomes (With CustomSelect for registered clubs) */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Team Standings & Stats ({legacySeason})
              </span>
              <button 
                onClick={() => setLegacyStandings([...legacyStandings, { clubName: '', position: legacyStandings.length + 1, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0 }])}
                style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14}/> Add Team Entry
              </button>
            </div>

            {legacyStandings.map((item, idx) => (
              <div key={idx} style={{ background: '#0b1329', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Club Name</span>
                    <CustomSelect 
                      value={item.clubName}
                      onChange={(val) => {
                        const copy = [...legacyStandings];
                        copy[idx].clubName = val;
                        setLegacyStandings(copy);
                      }}
                      options={clubs}
                      placeholder="Select Club"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Position</span>
                    <input 
                      type="number" 
                      value={item.position} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].position = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Played</span>
                    <input 
                      type="number" 
                      value={item.played} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].played = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Won</span>
                    <input 
                      type="number" 
                      value={item.won} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].won = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Drawn</span>
                    <input 
                      type="number" 
                      value={item.drawn} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].drawn = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Lost</span>
                    <input 
                      type="number" 
                      value={item.lost} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].lost = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Points</span>
                    <input 
                      type="number" 
                      value={item.points} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].points = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center', color: '#facc15', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Goals For</span>
                    <input 
                      type="number" 
                      value={item.gf} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].gf = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Goals Agst</span>
                    <input 
                      type="number" 
                      value={item.ga} 
                      onChange={e => {
                        const copy = [...legacyStandings];
                        copy[idx].ga = e.target.value;
                        setLegacyStandings(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ paddingTop: '16px' }}>
                    <button 
                      onClick={() => {
                        const copy = [...legacyStandings];
                        copy.splice(idx, 1);
                        setLegacyStandings(copy);
                      }}
                      style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 2: Top Scorers (Using CustomSelect for Club selection) */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Top Scorers / Golden Boot ({legacySeason})
              </span>
              <button 
                onClick={() => setLegacyScorers([...legacyScorers, { name: '', club: '', goals: 0, appearances: 0 }])}
                style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14}/> Add Top Scorer
              </button>
            </div>

            {legacyScorers.map((scorer, idx) => (
              <div key={idx} style={{ background: '#0b1329', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Player</span>
                    <CustomSelect 
                      value={scorer.name}
                      onChange={(val) => {
                        const copy = [...legacyScorers];
                        copy[idx].name = val;
                        setLegacyScorers(copy);
                      }}
                      options={players.map(p => ({ id: p.id, name: p.name || p.username || 'Player' }))}
                      placeholder="Select Player"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Club</span>
                    <CustomSelect 
                      value={scorer.club}
                      onChange={(val) => {
                        const copy = [...legacyScorers];
                        copy[idx].club = val;
                        setLegacyScorers(copy);
                      }}
                      options={clubs}
                      placeholder="Select Club"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Goals</span>
                    <input 
                      type="number" 
                      value={scorer.goals} 
                      onChange={e => {
                        const copy = [...legacyScorers];
                        copy[idx].goals = e.target.value;
                        setLegacyScorers(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center', color: '#facc15', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Apps</span>
                    <input 
                      type="number" 
                      value={scorer.appearances} 
                      onChange={e => {
                        const copy = [...legacyScorers];
                        copy[idx].appearances = e.target.value;
                        setLegacyScorers(copy);
                      }}
                      className="custom-input"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ paddingTop: '16px' }}>
                    <button 
                      onClick={() => {
                        const copy = [...legacyScorers];
                        copy.splice(idx, 1);
                        setLegacyScorers(copy);
                      }}
                      style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSaveLegacySeason}
            disabled={loading}
            style={{ width: '100%', background: '#facc15', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 900, color: '#04060d', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)' }}
          >
            {loading ? "Saving Legacy Data..." : `Save Final Standings & Scorers for ${legacySeason}`}
          </button>
        </div>
      ) : (
        <div>
          {/* Matchday Selector Toolbar */}
          <div className="card" style={{ marginBottom: '20px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Active Season</span>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#facc15' }}>{currentLiveSeason}</span>
            </div>
            <div style={{ minWidth: '180px' }}>
              <DropdownSelector 
                label="Matchday"
                value={selectedMatchday}
                onChange={(val) => setSelectedMatchday(val)}
                options={availableMatchdays}
              />
            </div>
          </div>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 10px auto' }} />
              Loading fixtures for Matchday {selectedMatchday}...
            </div>
          ) : fixtures.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Calendar size={36} color="#facc15" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
              <p style={{ fontWeight: 600 }}>No fixtures found for Matchday {selectedMatchday} in {currentLiveSeason}.</p>
              <button 
                onClick={() => setActiveTab("add_matchday")}
                style={{ marginTop: '12px', background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Add or Select Another Matchday
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {fixtures.map((fixture) => (
                <div key={fixture.id} className={`card ${fixture.status === 'completed' ? 'completed-card' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>{fixture.date || 'TBD'} {fixture.time ? `• ${fixture.time}` : ''}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: fixture.status === 'completed' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: fixture.status === 'completed' ? '#facc15' : '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                      {fixture.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                      {fixture.homeTeam}
                    </div>
                    <div style={{ padding: '0 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: fixture.status === 'completed' ? '#facc15' : '#94a3b8' }}>
                        {fixture.status === 'completed' ? `${fixture.homeScore} - ${fixture.awayScore}` : 'VS'}
                      </span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                      {fixture.awayTeam}
                    </div>
                  </div>

                  {activeFixture === fixture.id ? (
                    <div style={{ background: '#0b1329', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Home Score</span>
                          <input 
                            type="number" 
                            value={homeScore} 
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="custom-input"
                            style={{ textAlign: 'center', fontWeight: 'bold' }}
                          />
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Away Score</span>
                          <input 
                            type="number" 
                            value={awayScore} 
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="custom-input"
                            style={{ textAlign: 'center', fontWeight: 'bold' }}
                          />
                        </div>
                      </div>

                      {/* Scorers Section */}
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>Match Scorers</span>
                          <button 
                            onClick={() => setMatchScorers([...matchScorers, { playerId: '', minute: '' }])}
                            style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            + Add Scorer
                          </button>
                        </div>
                        {matchScorers.map((scorer, sIdx) => (
                          <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                            <CustomSelect 
                              value={scorer.playerId}
                              onChange={(val) => {
                                const copy = [...matchScorers];
                                copy[sIdx].playerId = val;
                                setMatchScorers(copy);
                              }}
                              options={players.map(p => ({ id: p.id, name: p.name || p.username || 'Player' }))}
                              placeholder="Select Scorer"
                            />
                            <input 
                              type="text" 
                              placeholder="Min (e.g. 45')" 
                              value={scorer.minute}
                              onChange={(e) => {
                                const copy = [...matchScorers];
                                copy[sIdx].minute = e.target.value;
                                setMatchScorers(copy);
                              }}
                              className="custom-input"
                            />
                            <button 
                              onClick={() => {
                                const copy = [...matchScorers];
                                copy.splice(sIdx, 1);
                                setMatchScorers(copy);
                              }}
                              style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Admin Note</span>
                        <input 
                          type="text" 
                          placeholder="Optional notes or MOTM details" 
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="custom-input"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleUpdate(fixture)}
                          disabled={loading}
                          style={{ flex: 1, background: '#facc15', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 900, color: '#04060d', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          {loading ? "Saving..." : "Save Result"}
                        </button>
                        <button 
                          onClick={() => setActiveFixture(null)}
                          style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', padding: '10px 16px', borderRadius: '10px', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openEditor(fixture)}
                        style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)', color: '#facc15', padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit3 size={13} /> {fixture.status === 'completed' ? 'Edit Result' : 'Add Result'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsManager;