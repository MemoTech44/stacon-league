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
  Newspaper
} from 'lucide-react';

const NewsManager = () => {
  const [news, setNews] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const newsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setExistingImageUrl(item.imageUrl || '');
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImage(null);
    setExistingImageUrl('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handlePostNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = existingImageUrl;
      if (image) {
        const imageRef = ref(storage, `news/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (editingId) {
        await updateDoc(doc(db, "news", editingId), {
          title, content, imageUrl, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "news"), {
          title, content, imageUrl, createdAt: serverTimestamp(),
        });
      }
      resetForm();
      fetchNews();
    } catch (error) {
      console.error(error);
      alert("Error saving article.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this news post?")) {
      try {
        await deleteDoc(doc(db, "news", id));
        fetchNews();
      } catch (error) { alert("Error deleting."); }
    }
  };

  return (
    <div className="news-container">
      <style>{`
        .news-container { 
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
          background: rgba(15, 23, 42, 0.65); 
          backdrop-filter: blur(16px);
          border-radius: 24px; 
          padding: 24px; 
          border: 1px solid rgba(255, 255, 255, 0.08); 
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
          color: #facc15; 
          font-size: 0.75rem; 
          text-transform: uppercase; 
          margin-bottom: 10px; 
          letter-spacing: 1px;
        }

        .custom-input { 
          width: 100%; 
          padding: 14px 16px; 
          border-radius: 12px; 
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(4, 6, 13, 0.6); 
          color: #ffffff;
          font-family: inherit; 
          font-size: 0.95rem; 
          transition: all 0.3s ease;
          outline: none; 
          box-sizing: border-box;
        }

        .custom-input:focus { 
          border-color: #facc15; 
          background: rgba(4, 6, 13, 0.85); 
          box-shadow: 0 0 15px rgba(250, 204, 21, 0.15);
        }

        .upload-trigger {
          border: 2px dashed rgba(255, 255, 255, 0.15); 
          border-radius: 16px; 
          padding: 24px;
          text-align: center; 
          cursor: pointer; 
          transition: all 0.3s ease; 
          background: rgba(4, 6, 13, 0.4);
        }

        .upload-trigger:hover { 
          border-color: #facc15; 
          background: rgba(250, 204, 21, 0.03); 
        }

        .news-feed { display: flex; flex-direction: column; gap: 20px; width: 100%; }

        .article-card { 
          background: rgba(15, 23, 42, 0.65); 
          backdrop-filter: blur(16px);
          border-radius: 20px; 
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 20px; 
          transition: all 0.3s ease; 
          display: flex; 
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }

        .article-card:hover { 
          border-color: rgba(250, 204, 21, 0.4); 
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        /* Fixed structural layout for desktop & mobile */
        .article-main { 
          display: flex; 
          flex-direction: row; 
          align-items: center; 
          justify-content: space-between; 
          gap: 16px; 
          width: 100%;
        }

        .article-content-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0; /* Prevents flex children from overflowing */
        }
        
        .article-thumb { 
          width: 80px; 
          height: 80px; 
          min-width: 80px;
          border-radius: 14px; 
          object-fit: cover; 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .article-text {
          min-width: 0;
          flex: 1;
          text-align: left;
        }

        .article-title {
          margin: 0 0 6px 0;
          font-size: 1.2rem;
          font-family: 'Bebas Neue', sans-serif;
          color: #ffffff;
          letter-spacing: 0.5px;
          line-height: 1.2;
          word-break: break-word;
        }

        .article-meta {
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
          background: rgba(250, 204, 21, 0.1); 
          color: #facc15; 
          border-color: rgba(250, 204, 21, 0.2);
        }
        .btn-view:hover { background: rgba(250, 204, 21, 0.2); }

        .btn-edit { 
          background: rgba(255, 255, 255, 0.05); 
          color: #e2e8f0; 
          border-color: rgba(255, 255, 255, 0.1);
        }
        .btn-edit:hover { background: rgba(255, 255, 255, 0.15); }

        .btn-del { 
          background: rgba(248, 113, 113, 0.1); 
          color: #f87171; 
          border-color: rgba(248, 113, 113, 0.2);
        }
        .btn-del:hover { background: rgba(248, 113, 113, 0.2); }

        .publish-btn {
          background: #facc15; 
          color: #04060d; 
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
          box-shadow: 0 4px 20px rgba(250, 204, 21, 0.2);
          transition: all 0.3s ease;
        }

        .publish-btn:hover:not(:disabled) {
          background: #ffe066;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(250, 204, 21, 0.3);
        }

        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        /* Mobile specific adjustments */
        @media (max-width: 640px) {
          .article-main { 
            flex-direction: column; 
            align-items: flex-start; 
          }
          .article-content-wrapper {
            width: 100%;
          }
          .article-thumb { 
            width: 100px; 
            height: 100px; 
            min-width: 100px;
          }
          .action-tray { 
            width: 100%; 
            justify-content: flex-end; 
            margin-top: 10px; 
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 10px;
          }
        }
      `}</style>

      {/* Header Controls */}
      <div className="header-section">
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#ffffff', margin: 0, letterSpacing: '1px' }}>
            League Newsroom
          </h3>
          <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
            {news.length} {news.length === 1 ? 'Article' : 'Articles'} Published
          </p>
        </div>
        
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          style={{ 
            background: isAdding ? 'rgba(248, 113, 113, 0.15)' : '#facc15', 
            color: isAdding ? '#f87171' : '#04060d',
            border: isAdding ? '1px solid rgba(248, 113, 113, 0.3)' : 'none', 
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
            boxShadow: isAdding ? 'none' : '0 4px 15px rgba(250, 204, 21, 0.2)'
          }}
        >
          {isAdding ? <><X size={18} /> Close Editor</> : <><Plus size={18} /> Create Post</>}
        </button>
      </div>

      {/* Editor Form */}
      {isAdding && (
        <form className="editor-card" onSubmit={handlePostNews}>
          <div className="form-grid">
            <div className="input-group">
              <label><FileText size={16}/> Headline Title</label>
              <input 
                className="custom-input"
                placeholder="Enter article title..."
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label><Newspaper size={16}/> Article Content</label>
              <textarea 
                className="custom-input"
                rows="6" 
                placeholder="Write the complete article content here..."
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label><ImageIcon size={16}/> Featured Image</label>
              <div className="upload-trigger" onClick={() => document.getElementById('newsImg').click()}>
                 <ImageIcon size={26} color="#facc15" style={{ marginBottom: '8px' }}/>
                 <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>
                   {image ? `Selected: ${image.name}` : existingImageUrl ? "Click to replace existing image" : "Upload article thumbnail"}
                 </p>
                 <input id="newsImg" type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </div>
            </div>

            <button className="publish-btn" disabled={loading} type="submit">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18}/> {editingId ? "Update Article" : "Publish Article"}</>}
            </button>
          </div>
        </form>
      )}

      {/* News Feed List */}
      <div className="news-feed">
        {news.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            background: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(16px)',
            borderRadius: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8', 
            fontWeight: 600,
            fontSize: '0.9rem' 
          }}>
            No news articles found in the database.
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="article-card">
              <div className="article-main">
                <div className="article-content-wrapper">
                  <img 
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300'} 
                    alt="Article thumbnail" 
                    className="article-thumb" 
                  />
                  <div className="article-text">
                    <h4 className="article-title">
                      {item.title}
                    </h4>
                    <div className="article-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#facc15" /> 
                        {item.createdAt ? item.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Processing...'}
                      </span>
                      <span style={{ color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.5px' }}>● Official</span>
                    </div>
                  </div>
                </div>
                
                <div className="action-tray">
                  <button className="icon-btn btn-view" title="Preview Story" onClick={() => setViewingId(viewingId === item.id ? null : item.id)}>
                    {viewingId === item.id ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button className="icon-btn btn-edit" title="Edit Article" onClick={() => handleEditClick(item)}>
                    <Edit3 size={18} />
                  </button>
                  <button className="icon-btn btn-del" title="Delete Article" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {viewingId === item.id && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '20px', 
                  background: 'rgba(4, 6, 13, 0.6)', 
                  borderRadius: '14px', 
                  textAlign: 'left', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#cbd5e1', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {item.content}
                  </p>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt="Article attachment" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'cover', 
                        marginTop: '16px', 
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)' 
                      }} 
                    />
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

export default NewsManager;