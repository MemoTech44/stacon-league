import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { 
  Mail, Trash2, CheckCircle, Clock, ExternalLink, 
  MessageSquare, User, Tag, Loader2 
} from 'lucide-react';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const msgData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMessages(msgData);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (msg) => {
    const subject = encodeURIComponent(`Re: ${msg.subject || 'Inquiry'} - St. Jerome League`);
    const body = encodeURIComponent(`Hi ${msg.name || 'there'},\n\nThank you for reaching out to St. Jerome League.\n\n------------------\nIn response to your message:\n"${msg.message}"\n------------------\n\n`);
    const mailtoUrl = `mailto:${msg.email}?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoUrl;
    if (msg.status === 'unread') {
      markAsRead(msg.id);
    }
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "messages", id), { status: 'read' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this message permanently?")) {
      try {
        await deleteDoc(doc(db, "messages", id));
        setMessages(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        alert("Error deleting message");
      }
    }
  };

  return (
    <div className="inbox-manager-container">
      <style>{`
        .inbox-manager-container {
          padding: 20px 10px 50px 10px;
          max-width: 850px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
          animation: fadeIn 0.5s ease;
          color: #ffffff;
          text-align: center;
        }

        .inbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
          text-align: left;
        }

        .message-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: left;
          transition: 0.2s;
        }

        .message-card:hover {
          border-color: rgba(250, 204, 21, 0.3);
        }

        .message-card.unread {
          border: 1.5px solid #facc15;
          background: rgba(15, 23, 42, 0.95);
        }

        .unread-indicator {
          position: absolute;
          top: -10px;
          left: 20px;
          background: #facc15;
          color: #04060d;
          padding: 2px 10px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          border: 1.5px solid #0f172a;
          box-shadow: 0 4px 10px rgba(250, 204, 21, 0.3);
        }

        .msg-meta {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .msg-body {
          color: #e2e8f0;
          line-height: 1.5;
          font-size: 0.85rem;
          background: #0b1329;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-top: 10px;
          white-space: pre-wrap;
        }

        .reply-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #facc15;
          color: #04060d;
          border: none;
          font-weight: 900;
          font-size: 0.75rem;
          margin-top: 14px;
          padding: 8px 16px;
          border-radius: 10px;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 15px rgba(250, 204, 21, 0.2);
        }

        .reply-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(250, 204, 21, 0.3);
        }

        .action-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        .circle-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: 0.2s;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .circle-btn:hover {
          background: rgba(250, 204, 21, 0.15);
          border-color: #facc15;
          color: #facc15;
        }

        .circle-btn.delete:hover {
          background: rgba(248, 113, 113, 0.15);
          border-color: #f87171;
          color: #f87171;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Specific Optimization */
        @media (max-width: 600px) {
          .message-card {
            padding: 14px;
            grid-template-columns: 1fr;
          }
          .action-column {
            flex-direction: row;
            justify-content: flex-end;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 10px;
          }
          .msg-body {
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* Header section matching your app design */}
      <div className="inbox-header">
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', margin: 0, letterSpacing: '0.5px' }}>Inbox Inquiries</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Total Messages: {messages.length}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#facc15' }} />
          <p style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>SYNCING INBOX...</p>
        </div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '20px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <MessageSquare size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>No messages found.</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`message-card ${msg.status === 'unread' ? 'unread' : ''}`}>
            {msg.status === 'unread' && <div className="unread-indicator">New</div>}
            
            <div style={{ textAlign: 'left' }}>
              <div className="msg-meta">
                <span className="meta-item" style={{ color: '#facc15', fontWeight: 600 }}>
                  <User size={14}/> {msg.name ? msg.name.toUpperCase() : 'GUEST'}
                </span>
                <span className="meta-item"><Mail size={14}/> {msg.email}</span>
                <span className="meta-item"><Clock size={14}/> 
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Recent'}
                </span>
              </div>
              
              <h4 style={{ margin: '0 0 4px 0', textTransform: 'uppercase', color: '#ffffff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                <Tag size={14} style={{ color: '#facc15' }} />
                {msg.subject || 'No Subject'}
              </h4>

              <div className="msg-body">{msg.message}</div>
              
              <button 
                className="reply-btn"
                onClick={() => handleReply(msg)}
                title="Send reply email directly to sender"
              >
                Reply <ExternalLink size={12} />
              </button>
            </div>

            <div className="action-column">
              <button 
                onClick={() => markAsRead(msg.id)}
                className="circle-btn"
                title={msg.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                style={{ color: msg.status === 'unread' ? '#facc15' : '#94a3b8' }}
              >
                <CheckCircle size={18} />
              </button>
              
              <button 
                onClick={() => handleDelete(msg.id)}
                className="circle-btn delete"
                title="Delete Message"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContactMessages;