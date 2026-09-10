import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { 
  Clock, 
  Loader2, 
  AlertCircle,
  Calendar,
  ChevronRight,
  X,
  Zap
} from 'lucide-react';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Body scroll lock logic
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedArticle]);

  // Optimized fetch with a query limit for faster initial page load
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(newsQuery);
        const newsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) || "Recently Posted"
        }));
        setArticles(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      setSelectedArticle(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url || url.includes('via.placeholder')) {
      return `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=75`;
    }
    return url;
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 className="animate-spin" size={48} color="#0c1c8c" />
        <p style={{ marginTop: '20px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }}>
          REFRESHING LEAGUE FEED...
        </p>
      </div>
    );
  }

  const featured = articles[0];
  const regular = articles.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .news-page { 
          background-color: #f8fafc; 
          padding: 120px 5% 100px; 
          min-height: 100vh; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          color: #0f172a;
          box-sizing: border-box;
        }

        .container { max-width: 1100px; margin: 0 auto; }
        
        .color-blue { color: #0c1c8c; }
        .color-yellow { color: #c59b27; }
        .color-red { color: #b91c1c; }

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
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c); 
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

        /* Hero Card */
        .featured-hero { 
          display: grid; 
          grid-template-columns: 1.2fr 0.8fr; 
          background: #ffffff; 
          border-radius: 28px; 
          overflow: hidden; 
          margin-bottom: 60px; 
          border: 1px solid #e2e8f0; 
          cursor: pointer; 
          transition: all 0.35s ease;
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.06);
          position: relative;
        }

        .featured-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.3s ease;
          z-index: 2;
        }

        .featured-hero:hover { 
          transform: translateY(-6px); 
          border-color: #0c1c8c; 
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.12);
        }

        .featured-hero:hover::before {
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
        }

        .featured-img { 
          height: 100%; 
          min-height: 380px;
          background: #f1f5f9; 
          overflow: hidden; 
          position: relative;
        }

        .featured-img img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          object-position: center 25%;
          transition: transform 0.6s ease; 
        }

        .featured-hero:hover .featured-img img {
          transform: scale(1.05);
        }

        .featured-content {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .trending-badge { 
          background: #fef9c3; 
          color: #854d0e; 
          border: 1px solid #fde047;
          padding: 6px 14px; 
          border-radius: 50px; 
          font-size: 0.75rem; 
          font-weight: 800; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          width: fit-content; 
          margin-bottom: 20px; 
          letter-spacing: 1px;
        }

        .featured-content h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(1.8rem, 4vw, 2.2rem);
          color: #0c1c8c;
          letter-spacing: 0.8px;
          line-height: 1.1;
          margin: 0 0 15px 0;
          font-weight: 400;
        }

        /* Grid Cards */
        .news-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); 
          gap: 28px; 
        }

        .news-card { 
          background: #ffffff; 
          border-radius: 24px; 
          overflow: hidden; 
          border: 1px solid #e2e8f0; 
          transition: all 0.35s ease; 
          cursor: pointer; 
          display: flex; 
          flex-direction: column; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          position: relative;
        }

        .news-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.3s ease;
          z-index: 2;
        }

        .news-card:hover { 
          transform: translateY(-8px); 
          border-color: #0c1c8c; 
          box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1); 
        }

        .news-card:hover::before {
          background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
        }

        .card-img { 
          height: 200px; 
          background: #f1f5f9; 
          overflow: hidden; 
          position: relative;
        }

        .card-img img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          object-position: center 25%;
          transition: transform 0.5s ease;
        }

        .news-card:hover .card-img img {
          transform: scale(1.06);
        }

        .card-body { 
          padding: 25px; 
          flex-grow: 1; 
          display: flex;
          flex-direction: column;
        }

        .card-category {
          color: #c59b27; 
          font-weight: 800; 
          font-size: 0.7rem; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: block;
        }

        .card-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.5rem;
          color: #0c1c8c;
          letter-spacing: 0.6px;
          line-height: 1.2;
          margin: 0 0 15px 0;
          font-weight: 400;
        }

        .read-more-btn {
          margin-top: auto;
          display: flex; 
          align-items: center; 
          gap: 6px; 
          color: #0c1c8c; 
          font-weight: 800; 
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          transition: gap 0.2s ease;
        }

        .news-card:hover .read-more-btn {
          gap: 10px;
        }

        /* Modal Styling */
        .modal-backdrop { 
          position: fixed; 
          inset: 0; 
          background: rgba(12, 28, 140, 0.4); 
          backdrop-filter: blur(8px); 
          z-index: 9999; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 20px; 
        }

        .modal-container { 
          background: #ffffff; 
          color: #0f172a;
          width: 100%; 
          max-width: 720px; 
          max-height: 85vh; 
          border-radius: 28px; 
          overflow: hidden; 
          position: relative; 
          display: flex; 
          flex-direction: column; 
          border: 1px solid #e2e8f0;
          box-shadow: 0 25px 50px rgba(12, 28, 140, 0.15); 
        }
        
        .modal-scroll { 
          overflow-y: auto; 
          padding-bottom: 40px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .modal-scroll::-webkit-scrollbar { display: none; }

        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #0c1c8c;
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .featured-hero { grid-template-columns: 1fr; }
          .featured-img { height: 250px; min-height: auto; }
          .featured-content { padding: 30px 25px; }
          
          .header-box h1 { font-size: 2.8rem; }
          .featured-content h2 { font-size: 1.7rem; }
          .card-title { font-size: 1.4rem; }
        }
      `}</style>

      <div className="news-page">
        <div className="container">
          <header className="header-box">
            <span className="header-tag">Official Press & Updates</span>
            <h1>LEAGUE <span className="color-yellow">PRESS</span></h1>
            <div className="header-underline"></div>
            <p className="header-description">
              Welcome to the official news hub of the Stacon League. Stay up to date 
              with live match reports, tactical breakdowns, community updates, and board announcements.
            </p>
          </header>

          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(12, 28, 140, 0.04)' }}>
              <AlertCircle size={48} className="color-yellow" style={{ marginBottom: '15px' }} />
              <p style={{ color: '#0c1c8c', fontWeight: 700, margin: 0 }}>No news published yet.</p>
            </div>
          ) : (
            <>
              {featured && (
                <div className="featured-hero" onClick={() => setSelectedArticle(featured)}>
                  <div className="featured-img">
                    <img 
                      src={getImageUrl(featured.image || featured.imageUrl)} 
                      alt={featured.title} 
                      loading="lazy" 
                    />
                  </div>
                  <div className="featured-content">
                    <div className="trending-badge">
                      <Zap size={13} fill="#854d0e"/> FEATURED STORY
                    </div>
                    <h2>{featured.title}</h2>
                    <p style={{ color: '#334155', lineHeight: 1.6, marginBottom: '25px', fontSize: '0.9rem', fontWeight: 500 }}>
                      {featured.excerpt || featured.content?.substring(0, 130) + "..."}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c59b27', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Calendar size={15}/> {featured.date}
                    </div>
                  </div>
                </div>
              )}

              <div className="news-grid">
                {regular.map((article) => (
                  <div key={article.id} className="news-card" onClick={() => setSelectedArticle(article)}>
                    <div className="card-img">
                      <img 
                        src={getImageUrl(article.image || article.imageUrl)} 
                        alt={article.title} 
                        loading="lazy" 
                      />
                    </div>
                    <div className="card-body">
                      <span className="card-category">{article.category || "General"}</span>
                      <h3 className="card-title">{article.title}</h3>
                      <div className="read-more-btn">
                        READ ARTICLE <ChevronRight size={16} strokeWidth={3}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-container">
            <button className="close-btn" onClick={() => setSelectedArticle(null)}>
              <X size={20} color="#0c1c8c" />
            </button>
            
            <div className="modal-scroll">
              <img 
                src={getImageUrl(selectedArticle.image || selectedArticle.imageUrl)} 
                style={{ width: '100%', height: '300px', objectFit: 'cover', objectPosition: 'center 25%' }} 
                alt={selectedArticle.title} 
                loading="lazy"
              />
              <div style={{ padding: '35px 30px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '18px', alignItems: 'center' }}>
                  <span style={{ background: '#fef9c3', color: '#854d0e', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #fde047', textTransform: 'uppercase' }}>
                    {selectedArticle.category || 'General'}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} className="color-yellow" /> {selectedArticle.date}
                  </span>
                </div>
                
                <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '2rem', color: '#0c1c8c', marginBottom: '20px', lineHeight: 1.1, letterSpacing: '0.8px', fontWeight: 400 }}>
                  {selectedArticle.title}
                </h2>
                
                <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                  {selectedArticle.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default News;