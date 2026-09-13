import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { UserCircle, Loader2 } from 'lucide-react';

const Executive = () => {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const q = query(collection(db, "members"));
        const snapshot = await getDocs(q);
        const memberData = snapshot.docs.map(doc => {
          const rawData = doc.data();
          return {
            id: doc.id,
            ...rawData,
            imageUrl: rawData.imageUrl || rawData.photoUrl || rawData.photo || null
          };
        });

        // Sort by rank: 1 at the top, missing ranks at the bottom (99)
        const sortedData = memberData.sort((a, b) => {
          const rankA = a.rank !== undefined ? Number(a.rank) : 99;
          const rankB = b.rank !== undefined ? Number(b.rank) : 99;
          return rankA - rankB;
        });

        setCommittee(sortedData);
      } catch (error) {
        console.error("Error fetching committee:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommittee();
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={48} color="#0c1c8c" />
      <p style={{ marginTop: '20px', fontWeight: 800, color: '#0c1c8c', letterSpacing: '2px', fontFamily: 'Plus Jakarta Sans', fontSize: '0.85rem' }}>
        SYNCING LEADERSHIP...
      </p>
    </div>
  );

  return (
    <div className="exec-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .exec-page { 
          background-color: #f8fafc; 
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif; 
          min-height: 100vh; 
          padding: 120px 5% 100px; 
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .container { max-width: 1280px; margin: 0 auto; }
        
        .color-blue { color: #0c1c8c; }
        .color-yellow { color: #c59b27; }
        .color-red { color: #b91c1c; }

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

        .exec-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 30px; 
        }
        
        .member-card { 
          background: #ffffff; 
          border-radius: 24px; 
          padding: 35px 25px; 
          text-align: center; 
          box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
          cursor: default;
          pointer-events: none;
          user-select: none;
        }

        .photo-container {
          position: relative;
          width: 130px;
          height: 130px;
          margin: 0 auto 20px;
          border-radius: 50%;
          padding: 4px;
          background: #0c1c8c;
          box-shadow: 0 8px 20px rgba(12, 28, 140, 0.2);
        }

        .member-photo { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          object-position: top;
          border-radius: 50%; 
          background: #ffffff;
          display: block;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .member-name { 
          font-size: 1.2rem; 
          font-weight: 700; 
          margin-bottom: 12px; 
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .member-role { 
          color: #0c1c8c; 
          font-size: 0.75rem; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          background: #f8fafc; 
          padding: 8px 18px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #e2e8f0;
          position: relative;
          margin-bottom: 5px;
        }

        @media (max-width: 900px) {
          .exec-page { padding-top: 100px; padding-left: 16px; padding-right: 16px; }
          .exec-grid { grid-template-columns: 1fr; gap: 20px; }
          .member-card { padding: 30px 20px; }
        }
      `}</style>

      <div className="container">
        <header className="header-box">
          <span className="header-tag">Leadership & Governance</span>
          <h1>EXECUTIVE <span className="color-yellow">COMMITTEE</span></h1>
          <div className="header-underline"></div>
          <div className="header-description">
            Meet the visionary team driving the Stacon League forward. 
            Our executive board is committed to fostering sportsmanship, strengthening 
            alumni bonds, and ensuring operational excellence.
          </div>
        </header>

        <div className="exec-grid">
          {committee.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#0c1c8c', padding: '60px 0' }}>
              <UserCircle size={56} color="#0c1c8c" style={{ margin: '0 auto 15px' }} />
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#0c1c8c', margin: '0 0 5px 0' }}>
                No Committee Members Found
              </h3>
              <p style={{ color: '#0c1c8c', fontSize: '0.9rem', margin: 0 }}>Please check back later for updates.</p>
            </div>
          ) : (
            committee.map((member) => (
              <div 
                key={member.id} 
                className="member-card"
              >
                <div className="photo-container">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="member-photo" />
                  ) : (
                    <div className="photo-placeholder">
                      <UserCircle size={80} color="#0c1c8c" />
                    </div>
                  )}
                </div>
                
                <div className="member-name">{member.name ? member.name.toUpperCase() : ''}</div>
                <div className="member-role">
                  {member.position ? member.position.toUpperCase() : 'BOARD MEMBER'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Executive;