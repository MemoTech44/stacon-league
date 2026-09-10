import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import { 
  Mail, Phone, MapPin, Send, 
  CheckCircle, Loader2, ShieldCheck, MessageSquare, ChevronDown, Sparkles 
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    customSubject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Custom dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const subjectOptions = [
    'General Inquiry',
    'Team Registration',
    'Sponsorship',
    'Other'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-fill subject if passed via URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramSubject = params.get('subject');
    if (paramSubject) {
      if (subjectOptions.includes(paramSubject)) {
        setFormData((prev) => ({ ...prev, subject: paramSubject }));
      } else {
        setFormData((prev) => ({ 
          ...prev, 
          subject: 'Other', 
          customSubject: paramSubject 
        }));
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalSubject = formData.subject === 'Other' 
      ? (formData.customSubject.trim() || 'General Inquiry')
      : formData.subject;

    try {
      await addDoc(collection(db, "messages"), {
        name: formData.name,
        email: formData.email,
        subject: finalSubject,
        message: formData.message,
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      setSubmitted(true);
      setFormData({ 
        name: '', 
        email: '', 
        subject: 'General Inquiry', 
        customSubject: '', 
        message: '' 
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | St. Jerome League</title>
      </Helmet>

      <div className="contact-page">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .contact-page { 
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

          /* Contact Layout Grid */
          .contact-grid { 
            display: grid; 
            grid-template-columns: 0.9fr 1.1fr; 
            gap: 30px; 
            align-items: start;
          }

          .info-stack { 
            display: flex; 
            flex-direction: column; 
            gap: 20px; 
          }
          
          .info-card { 
            background: #ffffff; 
            padding: 24px; 
            border-radius: 24px; 
            border: 1px solid #e2e8f0; 
            display: flex; 
            align-items: center; 
            gap: 18px;
            box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
            transition: all 0.35s ease;
            position: relative;
          }

          .info-card::before {
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

          .info-card:hover { 
            transform: translateY(-4px); 
            border-color: #0c1c8c; 
            box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1);
          }

          .info-card:hover::before {
            background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
          }
          
          .icon-box { 
            width: 52px; 
            height: 52px; 
            background: #f1f5f9; 
            border-radius: 16px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: #0c1c8c; 
            border: 1px solid #e2e8f0;
            flex-shrink: 0;
          }

          .info-label {
            font-family: 'Cinzel', serif;
            font-size: 0.7rem;
            color: #0c1c8c;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 4px 0;
            font-weight: 700;
          }

          .info-value {
            margin: 0;
            font-weight: 700;
            color: #0f172a;
            font-size: 1rem;
          }

          .notice-card {
            padding: 20px 24px; 
            background: #ffffff; 
            border-radius: 24px; 
            display: flex; 
            gap: 14px; 
            align-items: center;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
            border-left: 4px solid #c59b27;
          }

          .form-card { 
            background: #ffffff; 
            padding: 40px; 
            border-radius: 24px; 
            border: 1px solid #e2e8f0; 
            box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
            position: relative;
            overflow: hidden;
            transition: all 0.35s ease;
          }

          .form-card::before {
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

          .form-card:hover {
            border-color: #0c1c8c;
            box-shadow: 0 20px 40px rgba(12, 28, 140, 0.1);
          }

          .form-card:hover::before {
            background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c);
          }

          .input-group { margin-bottom: 22px; position: relative; }
          .input-group label { 
            display: block; 
            font-family: 'Cinzel', serif;
            font-size: 0.75rem; 
            font-weight: 700; 
            color: #0c1c8c; 
            margin-bottom: 8px; 
            text-transform: uppercase; 
            letter-spacing: 1px;
          }
          
          .c-input { 
            width: 100%; 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            padding: 14px 16px; 
            border-radius: 16px; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            font-weight: 600; 
            outline: none; 
            transition: all 0.3s ease; 
            color: #0f172a;
            box-sizing: border-box;
            font-size: 0.95rem;
          }

          .c-input:focus { 
            border-color: #0c1c8c; 
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(12, 28, 140, 0.08);
          }

          /* Custom Dropdown Styling */
          .custom-select-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            user-select: none;
          }

          .custom-options-menu {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            z-index: 50;
            box-shadow: 0 20px 40px rgba(12, 28, 140, 0.12);
          }

          .custom-option {
            padding: 12px 16px;
            font-size: 0.95rem;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .custom-option:hover {
            background: #f1f5f9;
            color: #0c1c8c;
          }

          .custom-option.selected {
            background: #f1f5f9;
            color: #0c1c8c;
            font-weight: 700;
          }

          .c-btn { 
            width: 100%; 
            padding: 16px; 
            background: #0c1c8c; 
            border: none; 
            border-radius: 16px; 
            color: #ffffff; 
            font-family: 'Cinzel', serif;
            font-weight: 700; 
            font-size: 0.9rem;
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 10px; 
            transition: background 0.25s ease; 
            letter-spacing: 1px;
          }

          .c-btn:hover:not(:disabled) { 
            background: #09146c; 
          }

          .c-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .success-box {
            text-align: center; 
            padding: 40px 20px;
          }

          .success-box h2 {
            font-family: 'Bebas Neue', cursive;
            font-size: 2.5rem;
            letter-spacing: 1px;
            margin: 10px 0 5px;
            color: #0c1c8c;
            text-transform: uppercase;
            font-weight: 400;
          }

          @media (max-width: 900px) {
            .contact-grid { grid-template-columns: 1fr; }
            .form-card { padding: 30px 20px; }
            .header-box h1 { font-size: 2.8rem; }
          }
        `}</style>

        <div className="container">
          <header className="header-box">
            <span className="header-tag">Direct Communication</span>
            <h1>GET IN <span className="color-yellow">TOUCH</span></h1>
            <div className="header-underline"></div>
            <p className="header-description">
              Have questions about team registration, match fixtures, or partnership opportunities? 
              Reach out directly to the Stacon League committee.
            </p>
          </header>

          <div className="contact-grid">
            <div className="info-stack">
              <div className="info-card">
                <div className="icon-box"><Mail size={22}/></div>
                <div>
                  <h4 className="info-label">Email Us</h4>
                  <p className="info-value">info@staconleague.com</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="icon-box"><Phone size={22}/></div>
                <div>
                  <h4 className="info-label">Call Us</h4>
                  <p className="info-value">+256 751 764406</p>
                </div>
              </div>

              <div className="info-card">
                <div className="icon-box"><MapPin size={22}/></div>
                <div>
                  <h4 className="info-label">Location</h4>
                  <p className="info-value">Kampala, Uganda</p>
                </div>
              </div>

              <div className="notice-card">
                <MessageSquare size={22} color="#c59b27" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                  Typical response time: <span style={{ color: '#0c1c8c', fontWeight: 700 }}>Within 24 hours.</span>
                </p>
              </div>
            </div>

            <div className="form-card">
              {submitted ? (
                <div className="success-box">
                  <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 15px' }} />
                  <h2>Message Sent!</h2>
                  <p style={{ color: '#334155', fontWeight: 500, fontSize: '0.95rem' }}>
                    We've received your inquiry and will respond shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)} 
                    className="c-btn" 
                    style={{ marginTop: '25px', background: '#f1f5f9', color: '#0c1c8c', border: '1px solid #e2e8f0' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="c-input" 
                      placeholder="e.g. John Doe"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="c-input" 
                      placeholder="name@example.com"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      required 
                    />
                  </div>

                  {/* Custom Dropdown Container */}
                  <div className="input-group" ref={dropdownRef}>
                    <label>Subject</label>
                    <div 
                      className="c-input custom-select-trigger"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>
                        {formData.subject === 'Other' ? 'Other / Custom Subject' : formData.subject}
                      </span>
                      <ChevronDown 
                        size={18} 
                        color="#0c1c8c" 
                        style={{ 
                          transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    </div>

                    {dropdownOpen && (
                      <div className="custom-options-menu">
                        {subjectOptions.map((opt) => (
                          <div 
                            key={opt}
                            className={`custom-option ${formData.subject === opt ? 'selected' : ''}`}
                            onClick={() => {
                              setFormData({ ...formData, subject: opt });
                              setDropdownOpen(false);
                            }}
                          >
                            {opt === 'Other' ? 'Other / Custom Subject' : opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.subject === 'Other' && (
                    <div className="input-group">
                      <label>Custom Subject Title</label>
                      <input 
                        type="text" 
                        className="c-input" 
                        placeholder="Please specify your subject"
                        value={formData.customSubject} 
                        onChange={(e) => setFormData({...formData, customSubject: e.target.value})} 
                        required 
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <label>Your Message</label>
                    <textarea 
                      className="c-input" 
                      style={{ height: '120px', resize: 'none' }} 
                      placeholder="How can we help you?"
                      value={formData.message} 
                      onChange={(e) => setFormData({...formData, message: e.target.value})} 
                      required
                    ></textarea>
                  </div>

                  <button className="c-btn" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Message <Send size={16} /></>}
                  </button>
                  
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                     <ShieldCheck size={14} color="#0c1c8c" /> Official Stacon League Communication
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;