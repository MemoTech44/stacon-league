import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image, Trash2, ExternalLink, Save } from 'lucide-react';

const GalleryAdmin = () => {
  const [matchdays, setMatchdays] = useState([]);
  const [title, setTitle] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState(['', '', '', '']);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMatchdays();
  }, []);

  const fetchMatchdays = async () => {
    try {
      const q = query(collection(db, "matchdayGalleries"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setMatchdays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching matchdays:", error);
    }
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedFiles = [...imageFiles];
      updatedFiles[index] = file;
      setImageFiles(updatedFiles);

      const updatedPreviews = [...previews];
      updatedPreviews[index] = URL.createObjectURL(file);
      setPreviews(updatedPreviews);
    }
  };

  const handleAddMatchday = async (e) => {
    e.preventDefault();
    if (!title || !driveLink) {
      alert("Please provide a title and a Google Drive link.");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = [];
      
      // Loop through all 4 inputs with distinct index-based tracking
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          // Unique path using index and distinct timestamp offset
          const storageRef = ref(storage, `gallery_previews/${Date.now()}_${i}_file`);
          const snapshot = await uploadBytes(storageRef, imageFiles[i]);
          const url = await getDownloadURL(snapshot.ref);
          uploadedUrls.push(url);
        } else {
          uploadedUrls.push('https://via.placeholder.com/300?text=Matchday+Photo');
        }
      }

      await addDoc(collection(db, "matchdayGalleries"), {
        title,
        driveLink,
        previewImages: uploadedUrls,
        createdAt: Date.now()
      });

      setTitle('');
      setDriveLink('');
      setImageFiles([null, null, null, null]);
      setPreviews(['', '', '', '']);
      fetchMatchdays();
      alert("Matchday gallery added successfully!");
    } catch (error) {
      console.error("Error adding matchday gallery:", error);
      alert(`Failed to upload matchday gallery: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this matchday entry?")) {
      try {
        await deleteDoc(doc(db, "matchdayGalleries", id));
        setMatchdays(matchdays.filter(m => m.id !== id));
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', color: '#fff', textAlign: 'left' }}>
      <h2 style={{ color: '#facc15', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem' }}>Manage Matchday Galleries</h2>
      
      <form onSubmit={handleAddMatchday} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px' }}>Matchday Title (e.g., Matchday 5: Sat 12 Aug)</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Matchday Title..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '5px' }}>Google Drive Link (Full Folder Link)</label>
          <input 
            type="url" 
            value={driveLink} 
            onChange={(e) => setDriveLink(e.target.value)} 
            placeholder="https://drive.google.com/drive/folders/..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' }}
            required
          />
        </div>

        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Upload Exactly 4 Preview Thumbnails</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {[0, 1, 2, 3].map(index => (
            <label key={index} style={{ border: '1px dashed rgba(250,204,21,0.4)', borderRadius: '10px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: '#0b1329', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
              {previews[index] ? (
                <img src={previews[index]} alt="preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
              ) : (
                <>
                  <Image size={24} color="#facc15" />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Photo {index + 1}</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} style={{ display: 'none' }} />
            </label>
          ))}
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          style={{ background: '#facc15', color: '#04060d', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save size={18} /> {uploading ? 'Uploading Matchday...' : 'Publish Matchday Gallery'}
        </button>
      </form>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Existing Matchday Galleries</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {matchdays.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#facc15' }}>{m.title}</h4>
              <a href={m.driveLink} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                <ExternalLink size={12} /> View Google Drive Folder
              </a>
            </div>
            <button onClick={() => handleDelete(m.id)} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid #f87171', color: '#f87171', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryAdmin;