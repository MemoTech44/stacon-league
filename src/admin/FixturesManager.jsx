import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Plus, AlertCircle, Loader2, CheckCircle2, Lock, ChevronDown, Edit3, Trash2, X, Calendar, MapPin, Clock } from 'lucide-react';

// Custom Select Component styled for the dark theme (matches ResultsManager)
const CustomSelect = ({ value, onChange, options, placeholder = "Select Option", disabled = false }) => {
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          padding: '12px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: disabled ? 'rgba(15, 23, 42, 0.5)' : '#0f172a',
          fontSize: '0.9rem',
          color: selectedOption ? '#ffffff' : '#94a3b8',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <ChevronDown size={16} color="#facc15" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
      </div>

      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 100,
          padding: '4px'
        }}>
          <div
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8' }}
          >
            {placeholder}
          </div>
          {options.map((opt) => {
            const isSelected = value === opt.id || value === opt.name;
            return (
              <div
                key={opt.id || opt.name}
                onClick={() => { onChange(opt.name); setIsOpen(false); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: isSelected ? '#facc15' : '#ffffff',
                  background: isSelected ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                  fontWeight: isSelected ? 800 : 400
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

const allSeasonsList = ["Season 1", "Season 2", "Season 3", "Season 4", "Season 5", "Season 6", "Season 7", "Season 8", "Season 9", "Season 10"];

const FixturesManager = () => {
  const [currentSeason, setCurrentSeason] = useState('');
  const [seasonPicker, setSeasonPicker] = useState('');
  const [fixtures, setFixtures] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingSeason, setSavingSeason] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State & Edit Tracking
  const [editingId, setEditingId] = useState(null);
  const [matchday, setMatchday] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [time, setTime] = useState('');

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5);

  useEffect(() => {
    fetchActiveSeasonAndData();
  }, []);

  const fetchActiveSeasonAndData = async () => {
    setLoading(true);
    try {
      const seasonDocRef = doc(db, "settings", "leagueConfig");
      const seasonSnap = await getDoc(seasonDocRef);

      let active = "Season 7";
      if (seasonSnap.exists()) {
        const data = seasonSnap.data();
        active = data.currentSeason || active;
      }
      setCurrentSeason(active);
      setSeasonPicker(active);

      await refreshFixturesForSeason(active);

      const clubDocs = await getDocs(collection(db, "clubs"));
      setClubs(clubDocs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching active season data:", err);
      setError("Failed to load active season configuration.");
    } finally {
      setLoading(false);
    }
  };

  const refreshFixturesForSeason = async (season) => {
    const fixQuery = query(collection(db, "fixtures"), where("season", "==", season));
    const fixDocs = await getDocs(fixQuery);
    setFixtures(fixDocs.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSetCurrentSeason = async () => {
    if (!seasonPicker || seasonPicker === currentSeason) return;
    setSavingSeason(true);
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(db, "settings", "leagueConfig"), { currentSeason: seasonPicker }, { merge: true });
      setCurrentSeason(seasonPicker);
      await refreshFixturesForSeason(seasonPicker);
      setSuccess(`Current season set to ${seasonPicker}. New fixtures will now be scheduled under this season league-wide.`);
    } catch (err) {
      console.error(err);
      setError("Failed to update the current season.");
    } finally {
      setSavingSeason(false);
    }
  };

  // Sync venue and date automatically if other matches for this matchday already exist (ignoring editing fixture)
  useEffect(() => {
    if (matchday && currentSeason) {
      const existingMatch = fixtures.find(f => String(f.matchday) === String(matchday) && f.season === currentSeason && f.id !== editingId);
      if (existingMatch) {
        if (existingMatch.date) setDate(existingMatch.date);
        if (existingMatch.venue) setVenue(existingMatch.venue);
      }
    }
  }, [matchday, currentSeason, fixtures, editingId]);

  // Locked matchday check (ignoring current editing item)
  const lockedMatch = matchday
    ? fixtures.find(f => String(f.matchday) === String(matchday) && f.season === currentSeason && f.id !== editingId)
    : null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (homeTeam === awayTeam) {
      setError("A team cannot play against itself.");
      return;
    }

    if (!homeTeam || !awayTeam || !matchday || !date || !venue || !time) {
      setError("Please fill in all required fields.");
      return;
    }

    if (date < todayStr) {
      setError("Cannot schedule a fixture on a past date.");
      return;
    }

    const conflictingMatchday = fixtures.find(f => String(f.matchday) === String(matchday) && f.id !== editingId);
    if (conflictingMatchday) {
      if (conflictingMatchday.date !== date || conflictingMatchday.venue !== venue) {
        setError(`Matchday ${matchday} is locked to Venue: "${conflictingMatchday.venue}" on Date: "${conflictingMatchday.date}".`);
        return;
      }
    }

    try {
      setLoading(true);
      if (editingId) {
        // Update existing fixture
        const fixRef = doc(db, "fixtures", editingId);
        await updateDoc(fixRef, {
          matchday: Number(matchday) || matchday,
          homeTeam,
          awayTeam,
          date,
          venue,
          time
        });
        setSuccess("Fixture successfully updated!");
        setEditingId(null);
      } else {
        // Create new fixture
        await addDoc(collection(db, "fixtures"), {
          season: currentSeason,
          matchday: Number(matchday) || matchday,
          homeTeam,
          awayTeam,
          date,
          venue,
          time,
          status: 'Upcoming',
          createdAt: serverTimestamp()
        });
        setSuccess("Fixture successfully scheduled!");
      }

      // Reset form inputs
      setMatchday('');
      setDate('');
      setVenue('');
      setHomeTeam('');
      setAwayTeam('');
      setTime('');

      await refreshFixturesForSeason(currentSeason);
    } catch (err) {
      console.error(err);
      setError("Failed to save fixture. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (fixture) => {
    setEditingId(fixture.id);
    setMatchday(fixture.matchday);
    setDate(fixture.date);
    setVenue(fixture.venue);
    setHomeTeam(fixture.homeTeam);
    setAwayTeam(fixture.awayTeam);
    setTime(fixture.time);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMatchday('');
    setDate('');
    setVenue('');
    setHomeTeam('');
    setAwayTeam('');
    setTime('');
    setError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "fixtures", deleteTarget.id));
      setSuccess("Fixture deleted successfully.");
      setDeleteTarget(null);
      await refreshFixturesForSeason(currentSeason);
    } catch (err) {
      console.error(err);
      setError("Failed to delete fixture.");
    } finally {
      setLoading(false);
    }
  };

  // Group fixtures by matchday for clean display list
  const groupedFixtures = fixtures.reduce((acc, fix) => {
    const md = fix.matchday || 'Unassigned';
    if (!acc[md]) acc[md] = [];
    acc[md].push(fix);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', color: '#fff' }}>
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#facc15', marginBottom: '20px', letterSpacing: '1px' }}>
        Fixture Manager {currentSeason ? `(${currentSeason})` : ''}
      </h2>

      {/* CURRENT SEASON CONTROL */}
      <div style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>
          League-Wide Active Season
        </span>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 0, marginBottom: '14px' }}>
          This is the season new fixtures are scheduled under, and the season the public site treats as "current."
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <select
              value={seasonPicker}
              onChange={(e) => setSeasonPicker(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            >
              {allSeasonsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={handleSetCurrentSeason}
            disabled={savingSeason || !seasonPicker || seasonPicker === currentSeason}
            style={{
              background: seasonPicker === currentSeason ? 'rgba(255,255,255,0.08)' : '#facc15',
              color: seasonPicker === currentSeason ? '#94a3b8' : '#04060d',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: seasonPicker === currentSeason ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            {savingSeason ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            {seasonPicker === currentSeason ? 'This Is Current' : 'Set as Current Season'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '12px', borderRadius: '12px', color: '#ef4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', padding: '12px', borderRadius: '12px', color: '#22c55e', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
          {success}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      <form onSubmit={handleFormSubmit} style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: editingId ? '#facc15' : '#fff' }}>
            {editingId ? 'Edit Fixture' : 'Schedule New Fixture'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
            >
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Matchday</label>
            <input
              type="text"
              placeholder="e.g. 1 or Gala"
              value={matchday}
              onChange={(e) => setMatchday(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
              Date {lockedMatch && <Lock size={11} color="#facc15" />}
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              disabled={!!lockedMatch}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: lockedMatch ? 'rgba(30, 41, 59, 0.25)' : 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: lockedMatch ? '#94a3b8' : '#fff', outline: 'none', boxSizing: 'border-box', cursor: lockedMatch ? 'not-allowed' : 'text' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
              Venue {lockedMatch && <Lock size={11} color="#facc15" />}
            </label>
            <input
              type="text"
              placeholder="e.g. Prime Arena Kawempe"
              value={venue}
              disabled={!!lockedMatch}
              onChange={(e) => setVenue(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: lockedMatch ? 'rgba(30, 41, 59, 0.25)' : 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: lockedMatch ? '#94a3b8' : '#fff', outline: 'none', boxSizing: 'border-box', cursor: lockedMatch ? 'not-allowed' : 'text' }}
            />
          </div>
        </div>

        {lockedMatch && (
          <p style={{ fontSize: '0.75rem', color: '#facc15', marginTop: '-8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} /> Matchday {matchday} already has fixtures — date and venue are locked to keep the round consistent. Only the kickoff time can differ per match.
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '16px', marginBottom: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Home Team</label>
            <CustomSelect value={homeTeam} onChange={setHomeTeam} options={clubs} placeholder="Select Home Team" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Away Team</label>
            <CustomSelect value={awayTeam} onChange={setAwayTeam} options={clubs} placeholder="Select Away Team" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !currentSeason}
          style={{ width: '100%', background: '#facc15', color: '#04060d', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> {editingId ? 'Update Fixture' : `Schedule Fixture (${currentSeason})`}</>}
        </button>
      </form>

      {/* SCHEDULED FIXTURES LIST GROUPED BY MATCHDAY */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#facc15', marginBottom: '16px', letterSpacing: '1px' }}>
          Scheduled Fixtures ({currentSeason})
        </h3>

        {Object.keys(groupedFixtures).length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No fixtures scheduled for {currentSeason} yet.</p>
        ) : (
          Object.entries(groupedFixtures).map(([matchdayKey, matchGroup]) => {
            const firstMatch = matchGroup[0];
            return (
              <div key={matchdayKey} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                {/* Matchday Header with Venue/Date once */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: 900, color: '#facc15', fontSize: '0.95rem', textTransform: 'uppercase' }}>
                    Matchday {matchdayKey}
                  </span>
                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#facc15" /> {firstMatch.date || 'TBD'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#facc15" /> {firstMatch.venue || 'TBD'}
                    </span>
                  </div>
                </div>

                {/* Fixtures in this matchday */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {matchGroup.map((fix) => (
                    <div key={fix.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.4)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#facc15', background: 'rgba(250,204,21,0.1)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Clock size={12} /> {fix.time || 'TBD'}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {fix.homeTeam} <span style={{ color: '#94a3b8', fontWeight: 400, margin: '0 6px' }}>vs</span> {fix.awayTeam}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: fix.status === 'Completed' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)', color: fix.status === 'Completed' ? '#22c55e' : '#60a5fa', fontWeight: 700 }}>
                          {fix.status || 'Upcoming'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleEditClick(fix)}
                          style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)', color: '#facc15', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(fix)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#ef4444', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} /> Confirm Delete
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteTarget.homeTeam} vs {deleteTarget.awayTeam}</strong> (Matchday {deleteTarget.matchday})?
            </p>

            {deleteTarget.status === 'Completed' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '12px', borderRadius: '12px', color: '#ef4444', fontSize: '0.8rem', marginBottom: '20px', lineHeight: 1.4 }}>
                ⚠️ <strong>Warning:</strong> This fixture is already marked as <strong>Completed</strong>. Deleting it will remove the fixture record, but club standings points and scorer goals recorded by the ResultsManager won't automatically be reversed.
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixturesManager;