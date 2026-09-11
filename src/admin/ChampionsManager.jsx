import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // Ensure 'storage' is exported from your firebase config
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Helmet } from 'react-helmet-async';
import { Loader2, Trophy, Plus, Trash2, Upload } from 'lucide-react';

const ChampionsManager = () => {
  const [champions, setChampions] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [teamName, setTeamName] = useState('');
  const [season, setSeason] = useState('');
  const [category, setCategory] = useState('League');
  const [celebrationFile, setCelebrationFile] = useState(null);

  const categories = ['League', 'Gala', 'Stacon Cup'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clubsSnapshot = await getDocs(collection(db, "clubs"));
      const clubsList = clubsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClubs(clubsList);
      if (clubsList.length > 0 && !teamName) {
        setTeamName(clubsList[0].name || clubsList[0].teamName || '');
      }

      const champSnapshot = await getDocs(collection(db, "champions"));
      const champList = champSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      champList.sort((a, b) => {
        return (b.season || '').localeCompare(a.season || '');
      });

      setChampions(champList);
    } catch (error) {
      console.error("Error fetching champions data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChampion = async (e) => {
    e.preventDefault();
    if (!teamName || !season) {
      alert("Please select a team and enter a season.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedClub = clubs.find(c => (c.name || c.teamName) === teamName);
      const logoUrl = selectedClub ? (selectedClub.logoUrl || selectedClub.logo || '') : '';

      let celebrationPhotoUrl = '';

      // Upload file to Firebase Storage if selected
      if (celebrationFile) {
        const fileRef = ref(storage, `champions/${Date.now()}_${celebrationFile.name}`);
        const snapshot = await uploadBytes(fileRef, celebrationFile);
        celebrationPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "champions"), {
        teamName,
        season,
        category,
        celebrationPhotoUrl,
        logoUrl,
        createdAt: serverTimestamp()
      });

      setTeamName('');
      setSeason('');
      setCelebrationFile(null);
      // Reset file input element visually if needed
      e.target.reset();
      
      await fetchData();
      alert("Champion recorded successfully!");
    } catch (error) {
      console.error("Error adding champion:", error);
      alert("Failed to record champion.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this champion record?")) return;
    try {
      await deleteDoc(doc(db, "champions", id));
      setChampions(champions.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting champion:", error);
      alert("Failed to delete record.");
    }
  };

  return (
    <div style={{ paddingBottom: '60px', textAlign: 'left' }}>
      <Helmet>
        <title>Manage Champions | Admin Dashboard</title>
      </Helmet>

      <div style={{ 
        background: 'linear-gradient(135deg, rgba(12, 28, 140, 0.4) 0%, rgba(6, 13, 61, 0.8) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(243, 231, 63, 0.2)',
        padding: '30px',
        marginBottom: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#f3e73f', fontSize: '1.1rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={20} /> Record New Champion
        </h3>

        <form onSubmit={handleAddChampion} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Select Registered Team
            </label>
            <select 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(6, 13, 61, 0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
              required
            >
              <option value="" disabled>-- Choose Club --</option>
              {clubs.map(club => {
                const name = club.name || club.teamName;
                return <option key={club.id} value={name} style={{ background: '#060d3d', color: '#fff' }}>{name}</option>;
              })}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Season / Year
            </label>
            <input 
              type="text" 
              placeholder="e.g. Season 2 or 2025/2026" 
              value={season} 
              onChange={(e) => setSeason(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(6, 13, 61, 0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Category
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(6, 13, 61, 0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ background: '#060d3d', color: '#fff' }}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Celebration Photo
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setCelebrationFile(e.target.files[0])}
              style={{ width: '100%', padding: '9px 16px', borderRadius: '12px', background: 'rgba(6, 13, 61, 0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ 
                width: '100%', padding: '13px 20px', borderRadius: '12px', border: 'none', background: '#f3e73f', color: '#060d3d', 
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(243, 231, 63, 0.3)'
              }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Champion
            </button>
          </div>
        </form>
      </div>

      <h3 style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: '1.1rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Existing Champions Registry ({champions.length})
      </h3>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={36} color="#f3e73f" />
        </div>
      ) : champions.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No champions have been registered yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {champions.map(champ => (
            <div key={champ.id} style={{ background: 'rgba(12, 28, 140, 0.25)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ height: '140px', background: '#081146', position: 'relative' }}>
                <img 
                  src={champ.celebrationPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(champ.teamName)}&background=0c1c8c&color=fff&size=400`} 
                  alt={champ.teamName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(6,13,61,0.8)', color: '#f3e73f', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Cinzel' }}>
                  {champ.category || 'League'}
                </span>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#ffffff', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}>
                    <img src={champ.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(champ.teamName)}&background=f8fafc&color=0c1c8c`} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '0.65rem', color: '#f3e73f', fontWeight: 700, letterSpacing: '1px' }}>{champ.season}</span>
                    <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#ffffff', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{champ.teamName}</h4>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(champ.id)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s' }}
                >
                  <Trash2 size={14} /> Remove Record
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChampionsManager;