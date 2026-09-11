import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  X, 
  Edit3, 
  Eye, 
  EyeOff, 
  Send, 
  Clock, 
  FileText,
  Briefcase
} from 'lucide-react';

const SponsorsManager = () => {
  const [sponsors, setSponsors] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState('');

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const q = query(collection(db, "sponsors"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const sponsorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSponsors(sponsorsData);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setExistingLogoUrl(item.logoUrl || '');
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLogo(null);
    setExistingLogoUrl('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoUrl = existingLogoUrl;
      
      if (logo && storage) {
        const logoRef = ref(storage, `sponsors/${Date.now()}_${logo.name}`);
        const snapshot = await uploadBytes(logoRef, logo);
        logoUrl = await getDownloadURL(snapshot.ref);
      }

      if (editingId) {
        await updateDoc(doc(db, "sponsors", editingId), {
          name, 
          description, 
          logoUrl, 
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "sponsors"), {
          name, 
          description, 
          logoUrl, 
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
      fetchSponsors();
    } catch (error) {
      console.error("Error saving sponsor:", error);
      alert("Error saving sponsor. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this sponsor?")) {
      try {
        await deleteDoc(doc(db, "sponsors", id));
        fetchSponsors();
      } catch (error) { 
        console.error("Error deleting:", error);
        alert("Error deleting sponsor."); 
      }
    }
  };

  return (
    <div className="sponsors-container">
      <style>{`
        .sponsors-container { 
          animation: fadeIn 0.5s ease; 
          padding-bottom: 50px; 
          width: 100%; 
          max-width: 100%;
          box-sizing: border-box; 
          overflow-x: hidden;
        }
        
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .editor-card { 
          background: linear-gradient(135deg, rgba(12, 28, 140, 0.35) 0%, rgba(6, 13, 61, 0.8) 100%); 
          backdrop-filter: blur(16px);
          border-radius: 24px; 
          padding: 24px; 
          border: 1px solid rgba(243, 231, 63, 0.2); 
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          margin-bottom: 40px; 
          text-align: left;
        }

        .form-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        
        .input-group label { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-weight: 800; 
          color: #f3e73f; 
          font-size: 0.75rem; 
          text-transform: uppercase; 
          margin-bottom: 10px; 
          letter-spacing: 1px;
        }

        .custom-input { 
          width: 100%; 
          padding: 14px 16px; 
          border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(6, 13, 61, 0.7); 
          color: #ffffff;
          font-family: inherit; 
          font-size: 0.95rem; 
          transition: all 0.3s ease;
          outline: none; 
          box-sizing: border-box;
        }

        .custom-input:focus { 
          border-color: #f3e73f; 
          background: rgba(6, 13, 61, 0.95); 
          box-shadow: 0 0 15px rgba(243, 231, 63, 0.2);
        }

        .upload-trigger {
          border: 2px dashed rgba(243, 231, 63, 0.3); 
          border-radius: 16px; 
          padding: 24px;
          text-align: center; 
          cursor: pointer; 
          transition: all 0.3s ease; 
          background: rgba(6, 13, 61, 0.5);
        }

        .upload-trigger:hover { 
          border-color: #f3e73f; 
          background: rgba(243, 231, 63, 0.08); 
        }

        .sponsors-feed { display: flex; flex-direction: column; gap: 20px; width: 100%; }

        .sponsor-card { 
          background: linear-gradient(135deg, rgba(12, 28, 140, 0.3) 0%, rgba(6, 13, 61, 0.75) 100%); 
          backdrop-filter: blur(16px);
          border-radius: 20px; 
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px; 
          transition: all 0.3s ease; 
          display: flex; 
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }

        .sponsor-card:hover { 
          border-color: rgba(243, 231, 63, 0.4); 
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .sponsor-main { 
          display: flex; 
          flex-direction: row; 
          align-items: center; 
          justify-content: space-between; 
          gap: 16px; 
          width: 100%;
        }

        .sponsor-content-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }
        
        .sponsor-thumb { 
          width: 80px; 
          height: 80px; 
          min-width: 80px;
          border-radius: 14px; 
          object-fit: contain; 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 4px;
        }

        .sponsor-text {
          min-width: 0;
          flex: 1;
          text-align: left;
        }

        .sponsor-title {
          margin: 0 0 6px 0;
          font-size: 1.2rem;
          font-family: 'Bebas Neue', sans-serif;
          color: #ffffff;
          letter-spacing: 0.5px;
          line-height: 1.2;
          word-break: break-word;
        }

        .sponsor-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 700;
          flex-wrap: wrap;
        }

        .action-tray { 
          display: flex; 
          gap: 8px; 
          flex-shrink: 0;
        }
        .icon-btn { 
          width: 40px; 
          height: 40px; 
          border-radius: 10px; 
          border: 1px solid transparent;
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer; 
          transition: all 0.2s ease;
        }
        .btn-view { 
          background: rgba(243, 231, 63, 0.12); 
          color: #f3e73f; 
          border-color: rgba(243, 231, 63, 0.3);
        }
        .btn-view:hover { background: rgba(243, 231, 63, 0.25); }

        .btn-edit { 
          background: rgba(255, 255, 255, 0.08); 
          color: #e2e8f0; 
          border-color: rgba(255, 255, 255, 0.15);
        }
        .btn-edit:hover { background: rgba(255, 255, 255, 0.2); }

        .btn-del { 
          background: rgba(248, 113, 113, 0.15); 
          color: #f87171; 
          border-color: rgba(248, 113, 113, 0.3);
        }
        .btn-del:hover { background: rgba(248, 113, 113, 0.25); }

        .publish-btn {
          background: #f3e73f; 
          color: #060d3d; 
          padding: 16px; 
          border-radius: 12px;
          border: none; 
          font-weight: 800; 
          font-size: 0.9rem; 
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px;
          box-shadow: 0 4px 20px rgba(243, 231, 63, 0.3);
          transition: all 0.3s ease;
        }

        .publish-btn:hover:not(:disabled) {
          background: #fff066;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(243, 231, 63, 0.45);
        }

        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        @media (max-width: 640px) {
          .sponsor-main { 
            flex-direction: column; 
            align-items: flex-start; 
          }
          .sponsor-content-wrapper {
            width: 100%;
          }
          .sponsor-thumb { 
            width: 100px; 
            height: 100px; 
            min-width: 100px;
          }
          .action-tray { 
            width: 100%; 
            justify-content: flex-end; 
            margin-top: 10px; 
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 10px;
          }
        }
      `}</style>

      {/* Header Controls */}
      <div className="header-section">
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#ffffff', margin: 0, letterSpacing: '1px' }}>
            Sponsors Manager
          </h3>
          <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
            {sponsors.length} {sponsors.length === 1 ? 'Sponsor' : 'Sponsors'} Registered
          </p>
        </div>
        
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          style={{ 
            background: isAdding ? 'rgba(248, 113, 113, 0.2)' : '#f3e73f', 
            color: isAdding ? '#f87171' : '#060d3d',
            border: isAdding ? '1px solid rgba(248, 113, 113, 0.4)' : 'none', 
            padding: '12px 20px', 
            borderRadius: '12px', 
            fontWeight: '800', 
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: isAdding ? 'none' : '0 4px 15px rgba(243, 231, 63, 0.25)'
          }}
        >
          {isAdding ? <><X size={18} /> Close Editor</> : <><Plus size={18} /> Add Sponsor</>}
        </button>
      </div>

      {/* Editor Form */}
      {isAdding && (
        <form className="editor-card" onSubmit={handleSaveSponsor}>
          <div className="form-grid">
            <div className="input-group">
              <label><Briefcase size={16}/> Company Name</label>
              <input 
                className="custom-input"
                placeholder="Enter sponsor company name..."
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label><FileText size={16}/> Company Description</label>
              <textarea 
                className="custom-input"
                rows="4" 
                placeholder="Write a brief overview of the sponsor company..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label><ImageIcon size={16}/> Company Logo</label>
              <div className="upload-trigger" onClick={() => document.getElementById('sponsorLogo').click()}>
                 <ImageIcon size={26} color="#f3e73f" style={{ marginBottom: '8px' }}/>
                 <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>
                   {logo ? `Selected: ${logo.name}` : existingLogoUrl ? "Click to replace existing logo" : "Upload company logo"}
                 </p>
                 <input id="sponsorLogo" type="file" hidden accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
              </div>
            </div>

            <button className="publish-btn" disabled={loading} type="submit">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18}/> {editingId ? "Update Sponsor" : "Save Sponsor"}</>}
            </button>
          </div>
        </form>
      )}

      {/* Sponsors Feed List */}
      <div className="sponsors-feed">
        {sponsors.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            background: 'linear-gradient(135deg, rgba(12, 28, 140, 0.3) 0%, rgba(6, 13, 61, 0.75) 100%)', 
            backdropFilter: 'blur(16px)',
            borderRadius: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8', 
            fontWeight: 600,
            fontSize: '0.9rem' 
          }}>
            No sponsors found in the database.
          </div>
        ) : (
          sponsors.map((item) => (
            <div key={item.id} className="sponsor-card">
              <div className="sponsor-main">
                <div className="sponsor-content-wrapper">
                  <img 
                    src={item.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300'} 
                    alt="Sponsor logo" 
                    className="sponsor-thumb" 
                  />
                  <div className="sponsor-text">
                    <h4 className="sponsor-title">
                      {item.name}
                    </h4>
                    <div className="sponsor-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#f3e73f" /> 
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                      </span>
                      <span style={{ color: '#f3e73f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>● Partner</span>
                    </div>
                  </div>
                </div>
                
                <div className="action-tray">
                  <button className="icon-btn btn-view" title="Preview Description" onClick={() => setViewingId(viewingId === item.id ? null : item.id)}>
                    {viewingId === item.id ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button className="icon-btn btn-edit" title="Edit Sponsor" onClick={() => handleEditClick(item)}>
                    <Edit3 size={18} />
                  </button>
                  <button className="icon-btn btn-del" title="Delete Sponsor" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {viewingId === item.id && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '20px', 
                  background: 'rgba(6, 13, 61, 0.75)', 
                  borderRadius: '14px', 
                  textAlign: 'left', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#e2e8f0', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {item.description}
                  </p>
                  {item.logoUrl && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <img 
                        src={item.logoUrl} 
                        alt="Company logo preview" 
                        style={{ 
                          maxHeight: '120px', 
                          objectFit: 'contain', 
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '10px',
                          background: 'rgba(255, 255, 255, 0.05)'
                        }} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SponsorsManager;