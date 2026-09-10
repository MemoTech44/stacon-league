import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, addDoc, getDocs, query, orderBy, 
  deleteDoc, doc, updateDoc, where 
} from 'firebase/firestore';
import { 
  Trash2, Edit2, Check, X, Loader2, Clock, MapPin, Calendar, Plus
} from 'lucide-react';

const FixturesManager = () => {
  const [fixtures, setFixtures] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedSeason, setSelectedSeason] = useState("Season 2");

  const seasons = ["Season 1", "Season 2", "Season 3", "Season 4"];

  const [formData, setFormData] = useState({
    matchday: '1',
    venue: '',
    date: '',
    homeTeam: '',
    awayTeam: '',
    time: ''
  });

  useEffect(() => { fetchData(); }, [selectedSeason]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clubSnap = await getDocs(collection(db, "clubs"));
      setClubs(clubSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const fixQuery = query(
        collection(db, "fixtures"), 
        where("season", "==", selectedSeason),
        orderBy("matchday", "asc"), 
        orderBy("time", "asc")
      );
      const fixDocs = await getDocs(fixQuery);
      setFixtures(fixDocs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "fixtures"), {
        ...formData,
        season: selectedSeason,
        matchday: formData.matchday,
        status: 'upcoming'
      });
      setFormData(prev => ({ ...prev, homeTeam: '', awayTeam: '', time: '' }));
      fetchData();
    } catch (err) { alert("Failed to add fixture"); }
  };

  const handleUpdate = async (id) => {
    await updateDoc(doc(db, "fixtures", id), { 
        ...editFormData,
        matchday: editFormData.matchday
    });
    setEditingId(null);
    fetchData();
  };

  const grouped = fixtures.reduce((acc, fix) => {
    const md = fix.matchday || "Unassigned"; 
    if (!acc[md]) acc[md] = [];
    acc[md].push(fix);
    return acc;
  }, {});

  return (
    <div className="fixtures-container">
      <style>{`
        .fixtures-container {
          animation: fadeIn 0.5s ease;
          padding: 20px 10px 50px 10px;
          max-width: 900px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
          overflow-x: hidden;
        }

        .season-tabs-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
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

        .season-tabs::-webkit-scrollbar {
          display: none;
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

        .admin-card {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          padding: 24px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          margin-bottom: 40px;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
        }

        .input-group {
          width: 100%;
        }

        .input-group label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #facc15;
          text-transform: uppercase;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
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

        select.custom-input {
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23facc15' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px;
        }

        select.custom-input option {
          background-color: #0b1329;
          color: #ffffff;
          padding: 12px;
        }

        .custom-input:focus {
          border-color: #facc15;
          box-shadow: 0 0 15px rgba(250, 204, 21, 0.15);
        }

        .fixture-card {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .fixture-card:hover {
          border-color: rgba(250, 204, 21, 0.3);
        }

        .match-row {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-width: 0;
        }

        .team-name-left {
          font-size: 1.1rem;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.5px;
          color: #ffffff;
          text-align: right;
          flex: 1;
          text-transform: uppercase;
          word-break: break-word;
        }

        .team-name-right {
          font-size: 1.1rem;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.5px;
          color: #ffffff;
          text-align: left;
          flex: 1;
          text-transform: uppercase;
          word-break: break-word;
        }

        .vs-badge {
          background: rgba(250, 204, 21, 0.15);
          border: 1px solid rgba(250, 204, 21, 0.3);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 900;
          color: #facc15;
          flex-shrink: 0;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          color: #94a3b8;
          transition: 0.2s;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .icon-btn-danger {
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
          border-color: rgba(248, 113, 113, 0.2);
        }

        .icon-btn-danger:hover {
          background: rgba(248, 113, 113, 0.2);
        }

        .edit-form-wrapper {
          display: flex;
          gap: 10px;
          width: 100%;
          align-items: center;
          flex-wrap: wrap;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .admin-card {
            padding: 20px 16px;
          }

          .fixture-card {
            flex-direction: column;
            gap: 12px;
            padding: 16px;
          }

          .match-row {
            flex-direction: row !important;
            width: 100%;
            gap: 6px;
            justify-content: center;
          }

          .team-name-left, .team-name-right {
            font-family: 'Inter', sans-serif !important;
            font-weight: 500 !important;
            font-size: 0.8rem !important;
            letter-spacing: 0 !important;
          }
          
          .team-name-left {
            text-align: right !important;
          }
          
          .team-name-right {
            text-align: left !important;
          }
          
          .vs-badge {
            padding: 3px 6px;
            font-size: 0.6rem;
          }

          .time-slot {
            width: 100% !important;
            justify-content: center !important;
            margin-bottom: 4px;
          }

          .action-slot {
            width: 100% !important;
            justify-content: center !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 12px;
            margin-top: 4px;
          }
        }
      `}</style>
      
      {/* 1. Centered Season Tabs */}
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

      {/* 2. Admin Entry Card */}
      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#facc15', padding: '8px', borderRadius: '10px', color: '#04060d', display: 'flex', alignItems: 'center' }}>
            <Plus size={18}/>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.5px', color: '#ffffff' }}>Match Setup</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Assign matches to {selectedSeason}</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="form-grid">
          <div className="input-group">
             <label>Matchday</label>
             <input type="text" placeholder="e.g. 1 or Gala" className="custom-input" value={formData.matchday} onChange={e => setFormData({...formData, matchday: e.target.value})} required />
          </div>
          <div className="input-group">
             <label>Venue</label>
             <input placeholder="Stadium name" className="custom-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} required />
          </div>
          <div className="input-group">
             <label>Date</label>
             <input type="date" className="custom-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>
          <div className="input-group">
             <label>Home Team</label>
             <select className="custom-input" value={formData.homeTeam} onChange={e => setFormData({...formData, homeTeam: e.target.value})} required>
                <option value="">Select</option>
                {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
             </select>
          </div>
          <div className="input-group">
             <label>Away Team</label>
             <select className="custom-input" value={formData.awayTeam} onChange={e => setFormData({...formData, awayTeam: e.target.value})} required>
                <option value="">Select</option>
                {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
             </select>
          </div>
          <div className="input-group">
             <label>Time</label>
             <div style={{ display: 'flex', gap: '8px' }}>
                <input type="time" className="custom-input" style={{ flex: 1 }} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
                <button type="submit" style={{ 
                  background: '#facc15', 
                  color: '#04060d', 
                  border: 'none', 
                  padding: '0 20px', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  cursor: 'pointer', 
                  transition: '0.2s',
                  fontSize: '0.85rem'
                }}>Add</button>
             </div>
          </div>
        </form>
      </div>

      {/* 3. Fixtures Display */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" color="#facc15" size={32} />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px 20px', 
          background: 'rgba(15, 23, 42, 0.65)', 
          backdropFilter: 'blur(16px)',
          borderRadius: '24px', 
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}>
            <Calendar size={36} style={{ color: '#facc15', marginBottom: '12px' }}/>
            <p style={{ fontWeight: 700, color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>No matches found for this season yet.</p>
        </div>
      ) : (
        Object.keys(grouped).map(md => (
          <div key={md} style={{ marginBottom: '40px' }}>
            
            {/* Centered Matchday Label */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ 
                background: '#facc15', 
                color: '#04060d', 
                padding: '6px 18px', 
                borderRadius: '20px', 
                fontWeight: 900, 
                fontSize: '0.75rem', 
                letterSpacing: '1px', 
                textTransform: 'uppercase' 
              }}>
                {!isNaN(md) ? `Matchday ${md}` : md}
              </span>
              <div style={{ 
                marginTop: '10px', 
                fontSize: '0.8rem', 
                color: '#94a3b8', 
                fontWeight: 600, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap' 
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} color="#facc15"/> {grouped[md][0].venue}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} color="#facc15"/> {grouped[md][0].date}</span>
              </div>
            </div>

            {/* List of Match Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {grouped[md].map(f => (
                <div key={f.id} className="fixture-card">
                  {editingId === f.id ? (
                    <div className="edit-form-wrapper">
                      <input type="text" className="custom-input" style={{ flex: 1, minWidth: '80px' }} value={editFormData.matchday} onChange={e => setEditFormData({...editFormData, matchday: e.target.value})} placeholder="Matchday" />
                      <input type="time" className="custom-input" style={{ flex: 1, minWidth: '80px' }} value={editFormData.time} onChange={e => setEditFormData({...editFormData, time: e.target.value})} />
                      <select className="custom-input" style={{ flex: 2, minWidth: '100px' }} value={editFormData.homeTeam} onChange={e => setEditFormData({...editFormData, homeTeam: e.target.value})}>
                        {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <select className="custom-input" style={{ flex: 2, minWidth: '100px' }} value={editFormData.awayTeam} onChange={e => setEditFormData({...editFormData, awayTeam: e.target.value})}>
                        {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <button onClick={() => handleUpdate(f.id)} className="icon-btn" style={{ color: '#4ade80' }}><Check size={18}/></button>
                      <button onClick={() => setEditingId(null)} className="icon-btn icon-btn-danger"><X size={18}/></button>
                    </div>
                  ) : (
                    <>
                      <div className="time-slot" style={{ width: '80px', fontSize: '0.85rem', fontWeight: 800, color: '#facc15', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <Clock size={14}/> {f.time}
                      </div>

                      <div className="match-row">
                        <span className="team-name-left">{f.homeTeam}</span>
                        <div className="vs-badge">VS</div>
                        <span className="team-name-right">{f.awayTeam}</span>
                      </div>

                      <div className="action-slot" style={{ display: 'flex', gap: '8px', width: '80px', justifyContent: 'flex-end', flexShrink: 0 }}>
                        <button onClick={() => { setEditingId(f.id); setEditFormData(f); }} className="icon-btn" title="Edit Fixture"><Edit2 size={15}/></button>
                        <button onClick={async () => { if(window.confirm("Delete fixture?")) { await deleteDoc(doc(db, "fixtures", f.id)); fetchData(); } }} className="icon-btn icon-btn-danger" title="Delete Fixture"><Trash2 size={15}/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FixturesManager;