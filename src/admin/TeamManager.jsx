import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Trash2, Shield, Plus, Loader2, Edit3, X } from 'lucide-react';

const TeamManager = () => {
  const [teams, setTeams] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form State (Treasurer and Rep removed)
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState('');
  const [chairman, setChairman] = useState('');
  const [coach, setCoach] = useState('');
  const [captain, setCaptain] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    const teamData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeams(teamData.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleEditClick = (team) => {
    setEditingId(team.id);
    setTeamName(team.name || '');
    setExistingLogoUrl(team.logoUrl || '');
    setChairman(team.chairman || '');
    setCoach(team.coach || '');
    setCaptain(team.captain || '');
    setDescription(team.description || '');
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTeamName('');
    setLogo(null);
    setEditingId(null);
    setExistingLogoUrl('');
    setChairman('');
    setCoach('');
    setCaptain('');
    setDescription('');
    setIsAdding(false);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = existingLogoUrl;

      if (logo) {
        const logoRef = ref(storage, `logos/${Date.now()}_${logo.name}`);
        await uploadBytes(logoRef, logo);
        logoUrl = await getDownloadURL(logoRef);
      }

      const teamPayload = {
        name: teamName,
        logoUrl,
        chairman,
        coach,
        captain,
        description,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, "clubs", editingId), teamPayload);
      } else {
        await addDoc(collection(db, "clubs"), {
          ...teamPayload,
          played: 0, won: 0, drawn: 0, lost: 0,
          gf: 0, ga: 0, gd: 0, pts: 0,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      fetchTeams();
    } catch (error) {
      console.error("Error saving team:", error);
      alert("Failed to save team details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deleting this team will remove all their data and stats. Proceed?")) {
      try {
        await deleteDoc(doc(db, "clubs", id));
        fetchTeams();
      } catch (error) {
        alert("Error deleting team.");
      }
    }
  };

  return (
    <div className="team-manager-container">
      <style>{`
        .team-manager-container {
          padding: 20px 10px 50px 10px;
          max-width: 900px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
          animation: fadeIn 0.5s ease;
          color: #ffffff;
        }

        .team-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
          gap: 15px; 
          margin-top: 20px; 
        }

        .team-admin-card { 
          background: rgba(15, 23, 42, 0.65); 
          backdrop-filter: blur(16px);
          padding: 20px; 
          border-radius: 20px; 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          text-align: center; 
          position: relative; 
          transition: all 0.2s ease; 
        }
        
        .team-admin-card:hover { 
          border-color: rgba(250, 204, 21, 0.4); 
          transform: translateY(-3px); 
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
        }

        .team-admin-card img { 
          width: 70px; 
          height: 70px; 
          object-fit: contain; 
          margin-bottom: 15px; 
        }
        
        .add-team-form { 
          background: rgba(15, 23, 42, 0.85); 
          backdrop-filter: blur(16px);
          padding: 30px 20px; 
          border-radius: 20px; 
          border: 1px solid rgba(250, 204, 21, 0.3); 
          margin-bottom: 30px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .form-row { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
          margin-bottom: 12px; 
        }

        .input-group { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
          margin-bottom: 12px; 
        }

        .input-group label { 
          font-weight: 800; 
          font-size: 0.7rem; 
          color: #facc15; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
        }
        
        .input-style { 
          width: 100%; 
          padding: 12px 14px; 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 12px; 
          font-family: inherit; 
          background: #0b1329; 
          color: #ffffff;
          font-size: 0.85rem;
          box-sizing: border-box;
          transition: all 0.3s ease; 
        }

        .input-style:focus { 
          border-color: #facc15; 
          outline: none; 
          box-shadow: 0 0 15px rgba(250, 204, 21, 0.15); 
        }
        
        .upload-area { 
          border: 2px dashed rgba(255, 255, 255, 0.15); 
          padding: 18px; 
          border-radius: 12px; 
          text-align: center; 
          cursor: pointer; 
          background: #0b1329; 
          transition: 0.2s; 
        }

        .upload-area:hover { 
          border-color: #facc15; 
          background: rgba(250, 204, 21, 0.05); 
        }
        
        .action-overlay { 
          display: flex; 
          gap: 6px; 
          position: absolute; 
          top: 15px; 
          right: 15px; 
        }

        .mini-btn { 
          width: 32px; 
          height: 32px; 
          border-radius: 10px; 
          border: none; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: 0.2s; 
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 640px) { 
          .form-row { grid-template-columns: 1fr; } 
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#ffffff', fontWeight: 900, fontSize: '1.5rem', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.5px' }}>CLUB ROSTER</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>Manage member profiles and credentials</p>
        </div>
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          style={{ 
            background: isAdding ? 'rgba(248, 113, 113, 0.15)' : '#facc15', 
            color: isAdding ? '#f87171' : '#04060d', 
            border: isAdding ? '1px solid rgba(248, 113, 113, 0.3)' : 'none', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            fontWeight: '900', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.8rem',
            boxShadow: isAdding ? 'none' : '0 4px 15px rgba(250, 204, 21, 0.25)' 
          }}
        >
          {isAdding ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Register New Club</>}
        </button>
      </div>

      {isAdding && (
        <form className="add-team-form" onSubmit={handleSaveTeam}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '8px', borderRadius: '10px' }}><Shield color="#facc15" size={20} /></div>
            <h3 style={{ margin: 0, color: '#facc15', fontWeight: 900, fontSize: '1rem' }}>{editingId ? 'UPDATE CLUB PROFILE' : 'NEW CLUB REGISTRATION'}</h3>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Official Club Name</label>
              <input className="input-style" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Ndama Veterans FC" required />
            </div>
            <div className="input-group">
              <label>Club Crest / Logo</label>
              <div className="upload-area" onClick={() => document.getElementById('logoInput').click()}>
                <p style={{margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  {logo ? logo.name : existingLogoUrl ? "Change Current Logo" : "Upload High-Res Logo"}
                </p>
                <input id="logoInput" type="file" hidden accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
              </div>
            </div>
          </div>

          <div style={{ margin: '15px 0', padding: '15px', background: 'rgba(11, 19, 41, 0.5)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.65rem', fontWeight: 900, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leadership & Roles</p>
            <div className="form-row">
              <div className="input-group">
                <label>Chairman</label>
                <input className="input-style" type="text" value={chairman} onChange={(e) => setChairman(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="input-group">
                <label>Head Coach</label>
                <input className="input-style" type="text" value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Full Name" />
              </div>
            </div>
            <div className="input-group">
              <label>Club Captain</label>
              <input className="input-style" type="text" value={captain} onChange={(e) => setCaptain(e.target.value)} placeholder="Full Name" />
            </div>
          </div>

          <div className="input-group">
            <label>Club Biography / Description</label>
            <textarea 
              className="input-style" 
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story of this club..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: '#facc15', color: '#04060d', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem', marginTop: '10px', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)' }}
          >
            {loading ? <Loader2 className="animate-spin" style={{margin: '0 auto'}} /> : editingId ? "Save Profile Changes" : "Confirm Registration"}
          </button>
        </form>
      )}

      <div className="team-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-admin-card">
            <div className="action-overlay">
              <button className="mini-btn" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={() => handleEditClick(team)}>
                <Edit3 size={14} />
              </button>
              <button className="mini-btn" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }} onClick={() => handleDelete(team.id)}>
                <Trash2 size={14} />
              </button>
            </div>

            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} />
            ) : (
              <div style={{ padding: '15px' }}><Shield size={50} color="#94a3b8" /></div>
            )}
            
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{team.name}</h4>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{team.captain || 'No Captain Assigned'}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#0b1329', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#facc15' }}>PTS: {team.pts || 0}</div>
              <div style={{ background: '#0b1329', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#ffffff' }}>GD: {team.gd || 0}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManager;