import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Trash2, UserPlus, Loader2, Camera, UserCircle, Edit3, X, Award } from 'lucide-react';

const ExecutiveManager = () => {
  const [members, setMembers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [rank, setRank] = useState(1); 
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Image Preview Logic
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, "members"));
      const querySnapshot = await getDocs(q);
      const memberData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const sortedData = memberData.sort((a, b) => {
        const rankA = a.rank !== undefined ? Number(a.rank) : 99;
        const rankB = b.rank !== undefined ? Number(b.rank) : 99;
        return rankA - rankB;
      });
      
      setMembers(sortedData);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setName(member.name);
    setPosition(member.position);
    setRank(member.rank || 1);
    setPreviewUrl(member.imageUrl);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = previewUrl;
      if (image) {
        const imageRef = ref(storage, `executives/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const data = { 
        name, 
        position, 
        rank: Number(rank), 
        imageUrl: imageUrl || "" 
      };

      if (editingId) {
        await updateDoc(doc(db, "members", editingId), data);
      } else {
        await addDoc(collection(db, "members"), { ...data, createdAt: new Date() });
      }

      setName(''); setPosition(''); setRank(1); setImage(null);
      setEditingId(null); setIsAdding(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Error saving member details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this person from the Executive Board?")) {
      try {
        await deleteDoc(doc(db, "members", id));
        fetchMembers();
      } catch (error) {
        alert("Error removing member.");
      }
    }
  };

  return (
    <div className="exec-manager-container">
      <style>{`
        .exec-manager-container {
          padding: 20px 10px 50px 10px;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
          animation: fadeIn 0.5s ease;
          color: #ffffff;
          text-align: center;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
          text-align: left;
        }

        .exec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .exec-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          padding: 30px 20px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .exec-card:hover {
          transform: translateY(-4px);
          border-color: rgba(250, 204, 21, 0.3);
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        }

        .rank-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #0b1329;
          color: #facc15;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .exec-photo {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 20px;
          border: 2px solid #facc15;
          background: #0b1329;
        }

        .exec-form {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(16px);
          padding: 25px;
          border-radius: 24px;
          border: 1px solid rgba(250, 204, 21, 0.3);
          margin-bottom: 35px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          text-align: left;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .input-style {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0b1329;
          color: #ffffff;
          font-weight: 400;
          font-size: 0.85rem;
          outline: none;
          transition: 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .input-style:focus {
          border-color: #facc15;
          box-shadow: 0 0 10px rgba(250, 204, 21, 0.15);
        }

        .preview-box {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 0 auto 10px;
          border: 2px dashed rgba(250, 204, 21, 0.4);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b1329;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .icon-btn:hover {
          background: rgba(250, 204, 21, 0.15);
          border-color: #facc15;
          color: #facc15;
        }

        .icon-btn.delete:hover {
          background: rgba(248, 113, 113, 0.15);
          border-color: #f87171;
          color: #f87171;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .section-header { flex-direction: column; gap: 15px; text-align: center; }
          .exec-grid { grid-template-columns: 1fr; }
          .input-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header Section */}
      <div className="section-header">
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', margin: 0, letterSpacing: '0.5px' }}>League Excom</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Total Board Members: {members.length}</p>
        </div>
        
        <button 
          onClick={() => { if(isAdding) setEditingId(null); setIsAdding(!isAdding); }}
          style={{ 
            background: '#facc15', color: '#04060d', border: 'none', 
            padding: '10px 18px', borderRadius: '12px', fontWeight: '900', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.8rem', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)' 
          }}
        >
          {isAdding ? <><X size={16} /> Cancel</> : <><UserPlus size={16} /> Add Member</>}
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form className="exec-form" onSubmit={handleSaveMember}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div className="preview-box">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={50} color="#94a3b8" />
              )}
            </div>
            <label style={{ 
              background: '#facc15', color: '#04060d', padding: '8px 16px', 
              borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '900',
              display: 'inline-flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase'
            }}>
              <Camera size={14} />
              Choose Face Photo
              <input type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </label>
          </div>

          <div className="input-row">
            <input className="input-style" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="input-style" type="text" placeholder="Position (e.g. Chairman)" value={position} onChange={(e) => setPosition(e.target.value)} required />
          </div>

          <div className="input-row" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: '900', color: '#facc15', textTransform: 'uppercase' }}>Hierarchy Rank (1 = Top)</label>
              <input className="input-style" type="number" value={rank} onChange={(e) => setRank(e.target.value)} min="1" />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Smaller numbers appear first in the list.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              background: '#facc15', color: '#04060d', padding: '12px', 
              border: 'none', borderRadius: '12px', fontWeight: '900', 
              cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem',
              boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={16} style={{ margin: '0 auto' }} /> : editingId ? "Update Executive Info" : "Save Board Member"}
          </button>
        </form>
      )}

      {/* Grid Display */}
      <div className="exec-grid">
        {members.map((member) => (
          <div key={member.id} className="exec-card">
            <div className="rank-badge">
              <Award size={12} color="#facc15" /> RANK {member.rank || '--'}
            </div>
            
            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => handleEdit(member)} 
                className="icon-btn"
                title="Edit Member"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(member.id)} 
                className="icon-btn delete"
                title="Delete Member"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {member.imageUrl ? (
              <img src={member.imageUrl} alt={member.name} className="exec-photo" />
            ) : (
              <div className="exec-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCircle size={60} color="#94a3b8" />
              </div>
            )}
            
            {/* Name unbolded for cleaner mobile layout */}
            <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontWeight: 'normal', textTransform: 'uppercase', fontSize: '1rem' }}>
              {member.name}
            </h4>
            <p style={{ color: '#93c5fd', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>
              {member.position}
            </p>
          </div>
        ))}
      </div>

      {members.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '20px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <UserCircle size={40} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No board members added to the database yet.</p>
        </div>
      )}
    </div>
  );
};

export default ExecutiveManager;