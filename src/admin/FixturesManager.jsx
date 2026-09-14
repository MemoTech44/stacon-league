import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';

const FixturesManager = () => {
  const [currentSeason, setCurrentSeason] = useState('');
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [matchday, setMatchday] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [time, setTime] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5);

  useEffect(() => {
    fetchActiveSeasonAndData();
  }, []);

  // Fetch the exact active season configured by the admin from the database
  const fetchActiveSeasonAndData = async () => {
    setLoading(true);
    try {
      // Adjust doc path if your Season Control saves it differently (e.g., doc(db, "settings", "control"))
      const seasonDocRef = doc(db, "settings", "season");
      const seasonSnap = await getDoc(seasonDocRef);

      let active = "Season 7"; // Fallback if document hasn't been initialized
      if (seasonSnap.exists()) {
        const data = seasonSnap.data();
        active = data.currentSeason || data.season || active;
      }
      setCurrentSeason(active);

      // Fetch fixtures matching the database-driven active season
      const fixQuery = query(collection(db, "fixtures"), where("season", "==", active));
      const fixDocs = await getDocs(fixQuery);
      setFixtures(fixDocs.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch registered teams
      const teamDocs = await getDocs(collection(db, "teams"));
      setTeams(teamDocs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching active season data:", err);
      setError("Failed to load active season configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Sync venue and date automatically if other matches for this matchday already exist
  useEffect(() => {
    if (matchday && currentSeason) {
      const existingMatch = fixtures.find(f => String(f.matchday) === String(matchday) && f.season === currentSeason);
      if (existingMatch) {
        if (existingMatch.date) setDate(existingMatch.date);
        if (existingMatch.venue) setVenue(existingMatch.venue);
      }
    }
  }, [matchday, currentSeason, fixtures]);

  const handleCreateFixture = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Rule: Team cannot play against itself
    if (homeTeam === awayTeam) {
      setError("A team cannot play against itself.");
      return;
    }

    if (!homeTeam || !awayTeam || !matchday || !date || !venue || !time) {
      setError("Please fill in all required fields.");
      return;
    }

    // Rule: Cannot put fixtures behind the current date of entry
    if (date < todayStr) {
      setError("Cannot schedule a fixture on a past date.");
      return;
    }
    if (date === todayStr && time < currentTimeStr) {
      setError("Cannot schedule a fixture in the past time for today.");
      return;
    }

    // Rule: For a given matchday, venue and date must be identical
    const conflictingMatchday = fixtures.find(f => String(f.matchday) === String(matchday));
    if (conflictingMatchday) {
      if (conflictingMatchday.date !== date || conflictingMatchday.venue !== venue) {
        setError(`Matchday ${matchday} is locked to Venue: "${conflictingMatchday.venue}" on Date: "${conflictingMatchday.date}".`);
        return;
      }
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "fixtures"), {
        season: currentSeason,
        matchday: Number(matchday),
        homeTeam,
        awayTeam,
        date,
        venue,
        time,
        status: 'Upcoming',
        createdAt: serverTimestamp()
      });

      setSuccess("Fixture successfully scheduled!");
      setHomeTeam('');
      setAwayTeam('');
      setTime('');
      
      // Refresh fixtures list
      const fixQuery = query(collection(db, "fixtures"), where("season", "==", currentSeason));
      const fixDocs = await getDocs(fixQuery);
      setFixtures(fixDocs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError("Failed to create fixture. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', color: '#fff' }}>
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: '#facc15', marginBottom: '20px', letterSpacing: '1px' }}>
        Fixture Manager {currentSeason ? `(${currentSeason})` : ''}
      </h2>

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

      <form onSubmit={handleCreateFixture} style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Matchday</label>
            <input 
              type="number" 
              min="1" 
              placeholder="e.g. 1" 
              value={matchday} 
              onChange={(e) => setMatchday(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Date</label>
            <input 
              type="date" 
              min={todayStr} 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Venue</label>
            <input 
              type="text" 
              placeholder="e.g. Prime Arena Kawempe" 
              value={venue} 
              onChange={(e) => setVenue(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '16px', marginBottom: '20px', alignItems: 'end' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Home Team</label>
            <select 
              value={homeTeam} 
              onChange={(e) => setHomeTeam(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            >
              <option value="">Select Home Team</option>
              {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Away Team</label>
            <select 
              value={awayTeam} 
              onChange={(e) => setAwayTeam(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            >
              <option value="">Select Away Team</option>
              {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
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
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Schedule Fixture ({currentSeason})</>}
        </button>
      </form>
    </div>
  );
};

export default FixturesManager;