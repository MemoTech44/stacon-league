import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';

import heroImg from '../assets/top.jpg';

const GalleryView = () => {
  const [matchdays, setMatchdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const q = query(collection(db, "matchdayGalleries"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setMatchdays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching galleries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  return (
    <div className="gallery-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .gallery-page { 
          background-color: #f8fafc; 
          min-height: 100vh; 
          padding: 120px 5% 100px; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          color: #0f172a;
          box-sizing: border-box;
        }

        .container { max-width: 1100px; margin: 0 auto; }
        
        .color-blue { color: #0c1c8c; }
        .color-yellow { color: #c59b27; }
        

        /* Header Styling */
        .header-box { text-align: center; margin-bottom: 50px; }
        
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
          background: linear-gradient(90deg, #0c1c8c, #c59b27); 
          margin: 20px auto 25px; 
          border-radius: 4px; 
        }

        .header-description { 
          max-width: 720px; 
          margin: 0 auto; 
          color: #334155; 
          line-height: 1.7; 
          font-size: 1rem; 
          font-weight: 500;
        }

        /* Banner Wrapper */
        .page-banner {
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          margin-bottom: 50px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.06);
          height: 320px;
          position: relative;
        }

        .page-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.6s ease;
        }

        .page-banner:hover img {
          transform: scale(1.05);
        }

        /* Loading / Empty State */
        .empty-state { 
          padding: 60px; 
          background: #ffffff; 
          border-radius: 28px; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          text-align: center;
        }
        .empty-text { color: #64748b; margin: 0; font-size: 0.95rem; font-weight: 500; }

        /* Gallery List */
        .gallery-list { 
          display: flex; 
          flex-direction: column; 
          gap: 35px; 
        }

        /* Gallery Card */
        .gallery-card { 
          background: #ffffff; 
          border-radius: 28px; 
          border: 1px solid #e2e8f0; 
          padding: 35px;
          text-align: left;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
          transition: all 0.35s ease;
        }

        .gallery-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.3s ease;
          z-index: 2;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
        }
        
        .gallery-card:hover {
          border-color: #0c1c8c;
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1);
          transform: translateY(-4px);
        }

        .card-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          flex-wrap: wrap; 
          gap: 20px; 
          margin-bottom: 25px; 
        }

        .card-title { 
          margin: 0; 
          font-size: 1.8rem; 
          color: #0f172a; 
          font-weight: 400; 
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1px;
        }

        .drive-link { 
          background: #0c1c8c; 
          color: #ffffff; 
          padding: 12px 24px; 
          border-radius: 14px; 
          font-weight: 800; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          text-decoration: none; 
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(12, 28, 140, 0.15);
        }

        .drive-link:hover {
          background: #1d4ed8;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.25);
          transform: translateY(-2px);
        }

        /* Thumbnail Grid */
        .thumb-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
          gap: 16px; 
        }

        .thumb-item { 
          border-radius: 18px; 
          overflow: hidden; 
          height: 200px; 
          border: 1px solid #e2e8f0; 
          background: #f1f5f9; 
          box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
        }

        .thumb-img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: transform 0.6s ease; 
        }
        
        .thumb-item:hover .thumb-img { 
          transform: scale(1.08); 
        }

        @media (max-width: 768px) {
          .gallery-page { padding-top: 90px; padding-left: 16px; padding-right: 16px; }
          .header-box { margin-bottom: 30px; }
          .header-box h1 { font-size: 2.6rem; }
          .page-banner { height: 200px; margin-bottom: 35px; }
          .gallery-card { padding: 20px; border-radius: 20px; }
          .card-title { font-size: 1.5rem; }
          .drive-link { width: 100%; justify-content: center; padding: 12px 18px; }
          .thumb-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
          .thumb-item { height: 140px; border-radius: 12px; }
        }
      `}</style>

      <div className="container">
        {/* HEADER SECTION */}
        <header className="header-box">
          <span className="header-tag">League Archives & Media</span>
          <h1>MATCHDAY <span className="color-yellow">GALLERY</span></h1>
          <div className="header-underline"></div>
          <p className="header-description">
            Relive the best moments and electrifying highlights! Access full matchday albums and download high-quality action shots from the <strong className="color-blue">Stacon League</strong>.
          </p>
        </header>

        {/* PAGE BANNER */}
        <div className="page-banner">
          <img 
            src={heroImg} 
            alt="Stacon League Matchday Action Gallery" 
            loading="lazy"
          />
        </div>

        {/* CONTENT SECTION */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
            <Loader2 className="animate-spin" size={40} color="#0c1c8c" style={{ margin: 'auto' }}/>
            <p style={{ marginTop: '15px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontSize: '0.8rem' }}>
              LOADING PHOTO GALLERIES...
            </p>
          </div>
        ) : matchdays.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={56} color="#cbd5e1" style={{ marginBottom: '20px' }} />
            <p className="empty-text">No matchday galleries uploaded yet. Check back soon after matchday!</p>
          </div>
        ) : (
          <div className="gallery-list">
            {matchdays.map(matchday => (
              <div key={matchday.id} className="gallery-card">
                <div className="card-header">
                  <h3 className="card-title">{matchday.title}</h3>
                  <a 
                    href={matchday.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="drive-link"
                  >
                    <ExternalLink size={16} /> VIEW ALL PHOTOS ON GOOGLE DRIVE
                  </a>
                </div>

                {/* Preview Thumbnail Grid */}
                <div className="thumb-grid">
                  {matchday.previewImages && matchday.previewImages.map((imgUrl, idx) => (
                    <div key={idx} className="thumb-item">
                      <img 
                        src={imgUrl} 
                        alt={`${matchday.title} - Preview ${idx + 1}`} 
                        className="thumb-img"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;