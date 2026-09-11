import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';
import { 
  Loader2, 
  AlertCircle,
  Calendar,
  ChevronRight,
  X,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Send,
  ChevronDown,
  Clock
} from 'lucide-react';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // New states for interactive modal features
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Body scroll lock logic
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setShowAllComments(false); // Reset comment view toggle on close
      setCommentInput('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedArticle]);

  // Optimized fetch with a query limit for faster initial page load
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(newsQuery);
        const newsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Check multiple potential field names for images stored in Firestore
            imageUrl: data.imageUrl || data.image || data.photo || data.imgUrl || data.coverImage || "",
            likes: data.likes || 0,
            comments: data.comments || [],
            date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : (data.createdAt || "Recently Posted")
          };
        });
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

  const getImageUrl = (url, identifier = '') => {
    if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('via.placeholder')) {
      const fallbacks = [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=75',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=75',
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=75',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=75',
        'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=75'
      ];
      const index = identifier ? [...identifier].reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbacks.length : 0;
      return fallbacks[index];
    }
    return url;
  };

  // Handler for liking an article
  const handleLike = async () => {
    if (!selectedArticle || isLiking) return;
    setIsLiking(true);
    const articleRef = doc(db, "news", selectedArticle.id);

    try {
      await updateDoc(articleRef, {
        likes: increment(1)
      });

      // Update local state smoothly
      const updatedArticle = { ...selectedArticle, likes: (selectedArticle.likes || 0) + 1 };
      setSelectedArticle(updatedArticle);
      setArticles(articles.map(art => art.id === updatedArticle.id ? updatedArticle : art));
    } catch (error) {
      console.error("Error liking article:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handler for submitting a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedArticle) return;

    const newComment = {
      id: Date.now().toString(),
      text: commentInput.trim(),
      createdAt: new Date().toISOString()
    };

    const articleRef = doc(db, "news", selectedArticle.id);

    try {
      await updateDoc(articleRef, {
        comments: arrayUnion(newComment)
      });

      const updatedComments = [...(selectedArticle.comments || []), newComment];
      const updatedArticle = { ...selectedArticle, comments: updatedComments };
      
      setSelectedArticle(updatedArticle);
      setArticles(articles.map(art => art.id === updatedArticle.id ? updatedArticle : art));
      setCommentInput('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handler for sharing that specific post uniquely
  const handleShare = async () => {
    const specificUrl = `${window.location.origin}${window.location.pathname}?post=${selectedArticle.id}`;
    
    const shareData = {
      title: selectedArticle.title,
      text: selectedArticle.excerpt || selectedArticle.title,
      url: specificUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(specificUrl);
      alert('Specific article link copied to clipboard!');
    }
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
          scrollbar-width: thin;
        }

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

        /* Interaction Bar inside Modal */
        .interaction-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 15px 20px;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          margin-top: 25px;
          background: #f8fafc;
        }

        .interaction-btn {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #334155;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .interaction-btn:hover {
          background: #e2e8f0;
          color: #0c1c8c;
        }

        .interaction-btn.liked {
          color: #b91c1c;
        }

        /* Comments Section */
        .comments-section {
          margin-top: 25px;
          padding: 0 5px;
        }

        .comments-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.4rem;
          color: #0c1c8c;
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }

        .comment-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .comment-input {
          flex-grow: 1;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .comment-input:focus {
          border-color: #0c1c8c;
        }

        .comment-submit-btn {
          background: #0c1c8c;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 0 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .comment-submit-btn:hover {
          background: #08125c;
        }

        .comment-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #334155;
        }

        .view-more-comments {
          background: transparent;
          border: none;
          color: #0c1c8c;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 10px auto 0;
          padding: 5px 10px;
        }

        .view-more-comments:hover {
          text-decoration: underline;
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
              dengan live match reports, tactical breakdowns, community updates, and board announcements.
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
                      src={getImageUrl(featured.imageUrl, featured.id)} 
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
                        src={getImageUrl(article.imageUrl, article.id)} 
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
                src={getImageUrl(selectedArticle.imageUrl, selectedArticle.id)} 
                style={{ width: '100%', height: '300px', objectFit: 'cover', objectPosition: 'center 25%' }} 
                alt={selectedArticle.title} 
                loading="lazy"
              />
              <div style={{ padding: '35px 30px 20px' }}>
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

                {/* LIKE, COMMENT, SHARE INTERACTION BAR */}
                <div className="interaction-bar">
                  <button className="interaction-btn" onClick={handleLike} disabled={isLiking}>
                    <Heart size={18} fill={selectedArticle.likes > 0 ? "#b91c1c" : "none"} color="#b91c1c" />
                    <span>{selectedArticle.likes || 0} Likes</span>
                  </button>

                  <button className="interaction-btn" onClick={() => document.getElementById('comment-input-field')?.focus()}>
                    <MessageCircle size={18} color="#0c1c8c" />
                    <span>{selectedArticle.comments?.length || 0} Comments</span>
                  </button>

                  <button className="interaction-btn" onClick={handleShare}>
                    <Share2 size={18} color="#0c1c8c" />
                    <span>Share</span>
                  </button>
                </div>

                {/* COMMENTS SECTION */}
                <div className="comments-section">
                  <h3 className="comments-title">Discussion</h3>
                  
                  <form onSubmit={handleAddComment} className="comment-form">
                    <input 
                      id="comment-input-field"
                      type="text" 
                      className="comment-input" 
                      placeholder="Write a comment..." 
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <button type="submit" className="comment-submit-btn">
                      <Send size={16} />
                    </button>
                  </form>

                  <div className="comments-list">
                    {(!selectedArticle.comments || selectedArticle.comments.length === 0) ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                      <>
                        {(showAllComments 
                          ? selectedArticle.comments 
                          : selectedArticle.comments.slice(-1)
                        ).map((comment) => (
                          <div key={comment.id} className="comment-item">
                            {comment.text}
                          </div>
                        ))}

                        {selectedArticle.comments.length > 1 && !showAllComments && (
                          <button className="view-more-comments" onClick={() => setShowAllComments(true)}>
                            View more comments ({selectedArticle.comments.length - 1} earlier) <ChevronDown size={14} />
                          </button>
                        )}

                        {showAllComments && selectedArticle.comments.length > 1 && (
                          <button className="view-more-comments" onClick={() => setShowAllComments(false)}>
                            Show less <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
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