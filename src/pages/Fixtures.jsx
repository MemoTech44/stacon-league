import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { toJpeg } from 'html-to-image';
import { 
  Search, 
  Calendar, 
  Loader2, 
  Shield, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CalendarX,
  Download,
  LayoutGrid,
  Trophy
} from 'lucide-react';

const allSeasonsList = ["Season 1", "Season 2", "Season 3", "Season 4", "Season 5", "Season 6", "Season 7", "Season 8", "Season 9", "Season 10"];

const FixturesAndResults = () => {
  const [fixtures, setFixtures] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'results'
  const [currentSeason, setCurrentSeason] = useState("Season 7");
  const [selectedSeason, setSelectedSeason] = useState("Season 7");
  const [selectedMatchday, setSelectedMatchday] = useState('All');

  const resultsRef = useRef(null);

  // Seasons that actually have data (a completed fixture or a legacy stats entry),
  // so the season-picker never shows empty placeholders.
  const [seasonsWithData, setSeasonsWithData] = useState([]);

  // Read the league-wide current season the admin set (same doc FixturesManager
  // and ResultsManager write to) and default the filters to it.
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "leagueConfig"));
        if (snap.exists() && snap.data().currentSeason) {
          const active = snap.data().currentSeason;
          setCurrentSeason(active);
          setSelectedSeason(active);
        }
      } catch (error) {
        console.error("Error fetching current season:", error);
      }
    };
    fetchCurrentSeason();
  }, []);

  // Fetch clubs/logos and fixtures data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch club logos
        const teamsSnapshot = await getDocs(collection(db, "clubs"));
        const logos = {};
        teamsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          logos[data.name] = data.logoUrl || data.logo;
        });
        setTeamLogos(logos);

        // Fetch all fixtures
        const q = query(collection(db, "fixtures"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const rawData = doc.data();
          return {
            id: doc.id,
            ...rawData,
            homeTeam: rawData.homeTeam || rawData.home || 'TBD',
            awayTeam: rawData.awayTeam || rawData.away || 'TBD',
            homeLogo: rawData.homeLogo || logos[rawData.homeTeam] || null,
            awayLogo: rawData.awayLogo || logos[rawData.awayTeam] || null,
            venue: rawData.venue || rawData.location || 'Equinox Sports Centre',
            date: rawData.date || rawData.matchDate || 'TBD',
            time: rawData.time || rawData.kickoff || '00:00',
            status: rawData.status || 'Upcoming',
            season: rawData.season || 'Season 2',
            homeScore: rawData.homeScore !== undefined && rawData.homeScore !== null ? parseInt(rawData.homeScore) : null,
            awayScore: rawData.awayScore !== undefined && rawData.awayScore !== null ? parseInt(rawData.awayScore) : null,
            matchday: rawData.matchday || rawData.matchDay || rawData.round || '1'
          };
        });
        setFixtures(data);

        // Also check which seasons have legacy stats saved directly on clubs,
        // so past seasons with no fixture docs still show up as selectable.
        const clubsSnapshot = await getDocs(collection(db, "clubs"));
        const legacySeasons = new Set();
        clubsSnapshot.docs.forEach(d => {
          const stats = d.data().stats || {};
          Object.keys(stats).forEach(s => legacySeasons.add(s));
        });
        const fixtureSeasons = new Set(data.map(f => f.season));
        const combined = new Set([...legacySeasons, ...fixtureSeasons]);
        setSeasonsWithData(allSeasonsList.filter(s => combined.has(s)));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // The list of season pills to show: any season with data, plus the current
  // season even before it has a result, deduped and in order.
  const seasonOptions = useMemo(() => {
    const combined = new Set([...seasonsWithData, currentSeason]);
    return allSeasonsList.filter(s => combined.has(s));
  }, [seasonsWithData, currentSeason]);

  // Reset the gameweek filter whenever the season or tab changes, since the
  // set of available gameweeks is different for each combination.
  useEffect(() => {
    setSelectedMatchday('All');
  }, [selectedSeason, activeTab]);

  // Fixtures scoped to the selected season only
  const seasonScopedFixtures = useMemo(() => 
    fixtures.filter(f => f.season === selectedSeason)
  , [fixtures, selectedSeason]);

  // Gameweeks available to pick from, matching whatever the active tab shows
  // (all fixtures, upcoming only, or completed results only) for that season
  const matchdayOptions = useMemo(() => {
    let base = seasonScopedFixtures;
    if (activeTab === 'upcoming') {
      base = base.filter(f => f.status && f.status.toLowerCase() === 'upcoming');
    } else if (activeTab === 'results') {
      base = base.filter(f => f.status && (f.status.toLowerCase() === 'completed' || f.status.toLowerCase() === 'ft'));
    }
    return [...new Set(base.map(m => m.matchday))].sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a).localeCompare(String(b));
    });
  }, [seasonScopedFixtures, activeTab]);

  // Filter logic for Upcoming / All Fixtures view — season + gameweek + search
  const filteredFixtures = useMemo(() => {
    let result = seasonScopedFixtures;
    if (activeTab === 'upcoming') {
      result = result.filter(f => f.status && f.status.toLowerCase() === 'upcoming');
    }

    if (selectedMatchday !== 'All') {
      result = result.filter(f => String(f.matchday) === String(selectedMatchday));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(f => 
        (f.homeTeam && f.homeTeam.toLowerCase().includes(term)) ||
        (f.awayTeam && f.awayTeam.toLowerCase().includes(term)) ||
        (f.venue && f.venue.toLowerCase().includes(term))
      );
    }
    return result;
  }, [searchTerm, activeTab, seasonScopedFixtures, selectedMatchday]);

  // Group the All Fixtures / Upcoming list by matchday so venue & date
  // are shown once per group instead of being repeated on every single match row
  const groupedFixtures = useMemo(() => {
    const groups = {};
    filteredFixtures.forEach(f => {
      const key = `${f.season}||${f.matchday}`;
      if (!groups[key]) {
        groups[key] = { season: f.season, matchday: f.matchday, venue: f.venue, date: f.date, matches: [] };
      }
      groups[key].matches.push(f);
    });

    return Object.values(groups).sort((a, b) => {
      // Most recent date first, then by matchday number/label
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      const numA = Number(a.matchday);
      const numB = Number(b.matchday);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.matchday).localeCompare(String(b.matchday));
    }).map(group => ({
      ...group,
      matches: group.matches.sort((m1, m2) => (m1.time || '').localeCompare(m2.time || ''))
    }));
  }, [filteredFixtures]);

  // Filter logic for Results View grouped by matchday — season + gameweek
  const resultsData = useMemo(() => {
    let result = seasonScopedFixtures.filter(f => 
      f.status.toLowerCase() === 'completed' || f.status.toLowerCase() === 'ft'
    );

    if (selectedMatchday !== 'All') {
      result = result.filter(m => String(m.matchday) === String(selectedMatchday));
    }
    return result;
  }, [seasonScopedFixtures, selectedMatchday]);

  const groupedByMatchday = useMemo(() => {
    return resultsData.reduce((acc, match) => {
      const md = match.matchday;
      if (!acc[md]) acc[md] = [];
      acc[md].push(match);
      return acc;
    }, {});
  }, [resultsData]);

  // Download Results as JPG
  const downloadResults = async () => {
    if (resultsRef.current === null) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(resultsRef.current, { 
        quality: 0.95, 
        backgroundColor: '#f8fafc',
        cacheBust: true,
        style: { padding: '24px', borderRadius: '24px' }
      });

      const link = document.createElement('a');
      link.download = `Stacon ${selectedSeason}-MD${selectedMatchday}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert("Failed to generate image. Please check your connection.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={48} color="#0c1c8c" />
      <p style={{ marginTop: '20px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }}>
        SYNCING TOURNAMENT DATA...
      </p>
    </div>
  );

  return (
    <div className="fixtures-results-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .fixtures-results-page { 
          background-color: #f8fafc; 
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          min-height: 100vh; 
          padding: 120px 5% 100px; 
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .container { max-width: 1180px; margin: 0 auto; }
        
        .color-blue { color: #0c1c8c; }
        .color-yellow { color: #c59b27; }
        .color-red { color: #b91c1c; }

        .header-box { text-align: center; margin-bottom: 44px; }
        
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

        /* Main View Switcher Tabs (All Fixtures / Upcoming / Match Results) */
        .main-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 12px 26px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          font-weight: 800;
          cursor: pointer;
          font-size: 0.75rem;
          letter-spacing: 1px;
          font-family: 'Cinzel', serif;
          transition: all 0.25s ease;
          background: #ffffff;
          color: #475569;
        }

        .tab-btn:hover {
          color: #0c1c8c;
          border-color: #0c1c8c;
        }

        .tab-btn.active {
          background: #0c1c8c;
          color: #ffffff;
          border-color: #0c1c8c;
          box-shadow: 0 4px 15px rgba(12, 28, 140, 0.2);
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
          transition: all 0.25s ease; 
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

        .match-count {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #64748b;
        }

        /* Unified filter panel: season pills + gameweek pills + (search or download) */
        .results-control-panel {
          background: #ffffff;
          padding: 22px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        .season-selector { 
          display: flex; 
          gap: 6px; 
          background: #f8fafc; 
          padding: 6px; 
          border-radius: 18px; 
          border: 1px solid #e2e8f0; 
          flex-wrap: wrap;
          justify-content: center;
        }

        .season-pill { 
          padding: 10px 20px; 
          border-radius: 12px; 
          border: none; 
          background: transparent; 
          cursor: pointer; 
          font-weight: 800; 
          color: #64748b; 
          transition: all 0.25s ease; 
          font-size: 0.75rem; 
          letter-spacing: 0.5px;
          font-family: 'Cinzel', serif;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .season-pill:hover { color: #0c1c8c; }

        .season-pill.active { 
          background: #0c1c8c; 
          color: #ffffff; 
          box-shadow: 0 4px 15px rgba(12, 28, 140, 0.2);
        }

        .current-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c59b27;
          display: inline-block;
        }

        .filter-container { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }

        .filter-btn { 
          padding: 10px 18px; 
          border-radius: 14px; 
          border: 1px solid #e2e8f0; 
          background: #f8fafc; 
          font-weight: 700; 
          color: #64748b; 
          cursor: pointer; 
          font-size: 0.75rem; 
          transition: all 0.2s ease; 
          display: flex;
          align-items: center;
          font-family: 'Cinzel', serif;
          text-transform: uppercase;
        }

        .filter-btn:hover { 
          border-color: #0c1c8c; 
          color: #0c1c8c;
        }

        .filter-btn.active { 
          background: rgba(12, 28, 140, 0.08); 
          color: #0c1c8c; 
          border-color: #0c1c8c; 
        }

        .panel-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          flex-wrap: wrap;
          gap: 10px;
        }

        .download-btn {
          background: rgba(12, 28, 140, 0.06);
          color: #0c1c8c;
          border: 1px solid rgba(12, 28, 140, 0.2);
          padding: 11px 20px;
          border-radius: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.5px;
          transition: all 0.25s ease;
        }

        .download-btn:hover:not(:disabled) {
          background: #0c1c8c;
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(12, 28, 140, 0.15);
        }

        .download-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .table-wrapper { 
          background: transparent;
        }

        /* Results / Fixtures Cards Layout (grouped by matchday) */
        .md-section { margin-bottom: 36px; }
        .md-header { text-align: center; margin-bottom: 18px; }

        .md-badge { 
          font-family: 'Cinzel', serif;
          background: linear-gradient(135deg, rgba(12, 28, 140, 0.08), rgba(197, 155, 39, 0.08)); 
          color: #0c1c8c; 
          padding: 8px 24px; 
          border-radius: 30px; 
          font-weight: 700; 
          font-size: 0.8rem; 
          text-transform: uppercase; 
          letter-spacing: 2px; 
          border: 1px solid #e2e8f0;
          display: inline-block;
        }

        .md-meta { 
          display: flex; 
          justify-content: center; 
          gap: 20px; 
          margin-top: 10px; 
          color: #475569; 
          font-weight: 600; 
          font-size: 0.85rem; 
          flex-wrap: wrap;
        }

        .match-card {
          background: #ffffff; 
          border-radius: 16px; 
          padding: 12px 22px; 
          margin-bottom: 10px;
          display: grid; 
          grid-template-columns: 1fr 90px 1fr; 
          align-items: center;
          border: 1px solid #e2e8f0; 
          box-shadow: 0 6px 16px rgba(12, 28, 140, 0.04); 
        }

        .team { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .team.home { justify-content: flex-end; text-align: right; }
        .team.away { justify-content: flex-start; text-align: left; }
        
        .team-name { 
          font-family: 'Bebas Neue', cursive;
          font-size: 1.1rem; 
          color: #0f172a; 
          letter-spacing: 0.8px;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logo-frame { 
          width: 30px; 
          height: 30px; 
          background: #f8fafc; 
          border-radius: 9px; 
          padding: 4px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 1px solid #e2e8f0; 
          flex-shrink: 0; 
        }

        .logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }

        .center-divider { 
          text-align: center; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 2px; 
          padding: 0 8px;
          border-left: 1px solid #e2e8f0; 
          border-right: 1px solid #e2e8f0; 
        }

        .score-val { 
          font-family: 'Bebas Neue', cursive;
          font-size: 1.3rem; 
          color: #0c1c8c; 
          letter-spacing: 0.8px; 
          line-height: 1;
        }

        .ft-tag { 
          font-size: 0.55rem; 
          font-weight: 900; 
          color: #94a3b8; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          font-family: 'Cinzel', serif;
        }

        .export-header {
          text-align: center;
          padding-bottom: 20px;
          margin-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
        }

        @media (max-width: 900px) {
          .fixtures-results-page { padding-top: 100px; padding-left: 16px; padding-right: 16px; }
          .search-box { width: 100%; }
          .match-card { grid-template-columns: 1fr 60px 1fr; padding: 10px 12px; }
          .team-name { font-size: 0.85rem; }
          .logo-frame { width: 26px; height: 26px; }
          .season-selector { width: 100%; justify-content: space-between; overflow-x: auto; }
          .season-pill { padding: 8px 12px; font-size: 0.65rem; }
        }
      `}</style>

      <div className="container">
        <header className="header-box">
          <span className="header-tag">Tournament Hub</span>
          <h1>FIXTURES & <span className="color-yellow">RESULTS</span></h1>
          <div className="header-underline"></div>
        </header>

        {/* Main Section Switcher */}
        <div className="main-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Calendar size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} /> ALL FIXTURES
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Clock size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} /> UPCOMING MATCHES
          </button>
          <button 
            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <Trophy size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} /> MATCH RESULTS
          </button>
        </div>

        {/* UNIFIED SEASON + GAMEWEEK FILTER PANEL — shared by all three tabs */}
        <div className="results-control-panel">
          <div className="season-selector">
            {seasonOptions.map(s => (
              <button 
                key={s} 
                className={`season-pill ${selectedSeason === s ? 'active' : ''}`} 
                onClick={() => setSelectedSeason(s)}
              >
                {s}
                {s === currentSeason && <span className="current-dot" title="Current season" />}
              </button>
            ))}
          </div>

          <div className="filter-container">
            <button 
              className={`filter-btn ${selectedMatchday === 'All' ? 'active' : ''}`} 
              onClick={() => setSelectedMatchday('All')}
            >
              <LayoutGrid size={13} style={{ marginRight: '6px' }}/> All Gameweeks
            </button>
            {matchdayOptions.map(md => (
              <button 
                key={md} 
                className={`filter-btn ${selectedMatchday === md ? 'active' : ''}`} 
                onClick={() => setSelectedMatchday(md)}
              >
                {isNaN(md) ? md : `GAMEWEEK ${md}`}
              </button>
            ))}
          </div>

          {activeTab !== 'results' && (
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search teams or venues..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className="panel-footer">
            <span className="match-count">
              Showing {activeTab === 'results' ? resultsData.length : filteredFixtures.length} matches
            </span>
            {activeTab === 'results' && resultsData.length > 0 && (
              <button className="download-btn" onClick={downloadResults} disabled={downloading}>
                {downloading ? <Loader2 className="animate-spin" size={15}/> : <Download size={15}/>}
                SAVE AS JPG
              </button>
            )}
          </div>
        </div>

        {/* DISPLAY: ALL FIXTURES / UPCOMING — grouped by gameweek, venue & date shown once per group */}
        {activeTab !== 'results' ? (
          <div className="table-wrapper">
            {groupedFixtures.length === 0 ? (
              <div className="empty-state">
                <CalendarX size={56} color="#0c1c8c" style={{ margin: '0 auto 15px' }} />
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0c1c8c', margin: '0 0 5px 0' }}>
                  No Matches Found
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>Try a different season, gameweek, or search term.</p>
              </div>
            ) : (
              groupedFixtures.map(group => (
                <div key={`${group.season}-${group.matchday}`} className="md-section">
                  <div className="md-header">
                    <span className="md-badge">
                      {group.season} • {isNaN(group.matchday) ? group.matchday : `GAMEWEEK ${group.matchday}`}
                    </span>
                    <div className="md-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="#c59b27"/> {group.venue}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="#c59b27"/> {group.date}</span>
                    </div>
                  </div>

                  {group.matches.map(fixture => (
                    <div key={fixture.id} className="match-card">
                      {/* HOME */}
                      <div className="team home">
                        <span className="team-name">{fixture.homeTeam}</span>
                        <div className="logo-frame">
                          <img 
                            src={fixture.homeLogo || teamLogos[fixture.homeTeam] || `https://ui-avatars.com/api/?name=${fixture.homeTeam}&background=f8fafc&color=0c1c8c`} 
                            crossOrigin="anonymous"
                            alt={fixture.homeTeam} 
                            className="logo-img" 
                          />
                        </div>
                      </div>

                      {/* SCORE / TIME DIVIDER */}
                      <div className="center-divider">
                        <span className="ft-tag">{fixture.time}</span>
                        <span className="score-val">
                          {fixture.homeScore !== null && fixture.awayScore !== null
                            ? `${fixture.homeScore} - ${fixture.awayScore}`
                            : 'VS'}
                        </span>
                      </div>

                      {/* AWAY */}
                      <div className="team away">
                        <div className="logo-frame">
                          <img 
                            src={fixture.awayLogo || teamLogos[fixture.awayTeam] || `https://ui-avatars.com/api/?name=${fixture.awayTeam}&background=f8fafc&color=0c1c8c`} 
                            crossOrigin="anonymous"
                            alt={fixture.awayTeam} 
                            className="logo-img" 
                          />
                        </div>
                        <span className="team-name">{fixture.awayTeam}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        ) : (
          /* DISPLAY: RESULTS ARCHIVE VIEW */
          <div>
            {resultsData.length === 0 ? (
              <div className="empty-state">
                <Trophy size={48} className="color-yellow" style={{ marginBottom: '15px' }}/>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0c1c8c', margin: '0 0 5px 0' }}>No Records Found</h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>No completed results recorded for {selectedSeason}{selectedMatchday !== 'All' ? `, gameweek ${selectedMatchday}` : ''}.</p>
              </div>
            ) : (
              <div ref={resultsRef}>
                {downloading && (
                  <div className="export-header">
                    <span style={{ fontFamily: 'Cinzel', color: '#0c1c8c', fontSize: '0.8rem', letterSpacing: '2px', display: 'block' }}>ST. JEROME LEAGUE</span>
                    <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: '#0c1c8c', margin: '2px 0 0 0' }}>
                      {selectedSeason} {selectedMatchday !== 'All' ? `— GAMEWEEK ${selectedMatchday}` : '— All Results'}
                    </h2>
                  </div>
                )}

                {Object.keys(groupedByMatchday).sort((a, b) => {
                  const numA = Number(a);
                  const numB = Number(b);
                  if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                  return String(a).localeCompare(String(b));
                }).map(md => (
                  <div key={md} className="md-section">
                    <div className="md-header">
                      <span className="md-badge">{isNaN(md) ? md : `GAMEWEEK ${md}`}</span>
                      <div className="md-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="#c59b27"/> {groupedByMatchday[md][0].venue || "Equinox Sports Centre"}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Trophy size={15} color="#c59b27"/> {groupedByMatchday[md][0].date}</span>
                      </div>
                    </div>

                    {groupedByMatchday[md].map(match => (
                      <div key={match.id} className="match-card">
                        {/* HOME */}
                        <div className="team home">
                          <span className="team-name">{match.homeTeam}</span>
                          <div className="logo-frame">
                            <img 
                              src={match.homeLogo || teamLogos[match.homeTeam] || `https://ui-avatars.com/api/?name=${match.homeTeam}&background=f8fafc&color=0c1c8c`} 
                              crossOrigin="anonymous"
                              alt={match.homeTeam} 
                              className="logo-img" 
                            />
                          </div>
                        </div>

                        {/* SCORE DIVIDER */}
                        <div className="center-divider">
                          <span className="ft-tag">FT</span>
                          <span className="score-val">{match.homeScore} - {match.awayScore}</span>
                        </div>

                        {/* AWAY */}
                        <div className="team away">
                          <div className="logo-frame">
                            <img 
                              src={match.awayLogo || teamLogos[match.awayTeam] || `https://ui-avatars.com/api/?name=${match.awayTeam}&background=f8fafc&color=0c1c8c`} 
                              crossOrigin="anonymous"
                              alt={match.awayTeam} 
                              className="logo-img" 
                            />
                          </div>
                          <span className="team-name">{match.awayTeam}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FixturesAndResults;