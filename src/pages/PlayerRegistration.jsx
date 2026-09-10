import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Helmet } from 'react-helmet-async';
import { Loader2, ShieldCheck, Camera, CheckCircle2, ChevronDown} from 'lucide-react';

// Custom Animated Dropdown Component
const CustomSelect = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="input-group" ref={dropdownRef}>
      <label>{label}</label>
      <div className="custom-select-wrapper">
        <button 
          type="button"
          className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={{ color: value ? '#0f172a' : '#64748b', fontWeight: 600 }}>{selectedLabel}</span>
          <ChevronDown 
            size={18} 
            color="#0c1c8c" 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.3s ease' 
            }} 
          />
        </button>

        {isOpen && (
          <div className="custom-options-menu">
            {options.map((opt) => (
              <div 
                key={opt.value}
                className={`custom-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PlayerRegistration = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    team: '',
    teamNumber: '',
    position: '',
    sex: '',
    studyPeriod: '',
    contact: ''
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const snap = await getDocs(collection(db, "clubs"));
        const sortedTeams = snap.docs
          .map(doc => {
            const data = doc.data();
            return { 
              id: doc.id, 
              name: data.name || data.teamName || data.clubName || "Unnamed Team"
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setTeams(sortedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Please enter your full name");
    if (!formData.team) return alert("Please select a team");
    if (!formData.teamNumber.trim()) return alert("Please enter your team number");
    if (!formData.position) return alert("Please select a playing position");
    if (!formData.sex) return alert("Please select sex");
    if (!formData.studyPeriod.trim()) return alert("Please enter your period of study");
    if (!formData.contact.trim()) return alert("Please enter your contact or WhatsApp number");
    if (!photo) return alert("Please upload your current passport photo");
    
    setLoading(true);

    try {
      const photoRef = ref(storage, `players/${Date.now()}_${photo.name}`);
      await uploadBytes(photoRef, photo);
      const photoUrl = await getDownloadURL(photoRef);

      await addDoc(collection(db, "players"), {
        ...formData,
        photoUrl,
        status: 'pending',
        registeredAt: serverTimestamp()
      });

      setSuccess(true);
      
      // Automatically redirect to home after 2.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (error) {
      console.error("Submission error:", error);
      alert("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Player Registration | St. Jerome League</title>
      </Helmet>

      <div className="reg-page">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .reg-page {
            background-color: #f8fafc;
            min-height: 100vh;
            padding: 120px 5% 100px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #0f172a;
            box-sizing: border-box;
          }

          .container {
            max-width: 680px;
            margin: 0 auto;
          }

          .color-blue { color: #0c1c8c; }
          .color-yellow { color: #c59b27; }
          .color-red { color: #b91c1c; }

          /* Header Section */
          .section-header { 
            text-align: center; 
            margin-bottom: 50px; 
          }

          .header-tag {
            font-family: 'Cinzel', serif;
            color: #0c1c8c;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .section-header h1 { 
            font-family: 'Bebas Neue', cursive;
            font-size: clamp(2.8rem, 6vw, 4.8rem); 
            color: #0c1c8c; 
            letter-spacing: 1px; 
            margin: 0; 
            line-height: 1;
            font-weight: 400;
            text-transform: uppercase;
          }

          .header-underline { 
            width: 80px; 
            height: 4px; 
            background: linear-gradient(90deg, #0c1c8c, #c59b27, #b91c1c); 
            margin: 20px auto 15px; 
            border-radius: 4px; 
          }

          .header-subtitle {
            font-family: 'Cinzel', serif;
            color: #c59b27;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-size: 0.9rem;
            margin: 0;
          }

          /* Form Card */
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

          .input-group {
            margin-bottom: 22px;
            position: relative;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

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

          .r-input {
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

          .r-input::placeholder {
            color: #94a3b8;
            font-weight: 500;
          }

          .r-input:focus {
            border-color: #0c1c8c;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(12, 28, 140, 0.08);
          }

          /* Custom Dropdown Styling */
          .custom-select-wrapper {
            position: relative;
          }

          .custom-select-trigger {
            width: 100%;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 14px 16px;
            border-radius: 16px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 600;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.3s ease;
            box-sizing: border-box;
            text-align: left;
          }

          .custom-select-trigger.active,
          .custom-select-trigger:hover {
            border-color: #0c1c8c;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(12, 28, 140, 0.08);
          }

          .custom-options-menu {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(12, 28, 140, 0.12);
            z-index: 100;
            max-height: 220px;
            overflow-y: auto;
            padding: 8px;
          }

          .custom-option {
            padding: 12px 14px;
            font-size: 0.95rem;
            font-weight: 600;
            color: #475569;
            border-radius: 10px;
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

          /* Upload Area */
          .upload-area {
            border: 2px dashed #cbd5e1;
            padding: 22px;
            border-radius: 16px;
            text-align: center;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: #f8fafc;
            transition: all 0.3s ease;
          }

          .upload-area:hover {
            border-color: #0c1c8c;
            background: rgba(12, 28, 140, 0.02);
          }

          .upload-area.has-file {
            border-color: #0c1c8c;
            background: rgba(12, 28, 140, 0.04);
          }

          /* Submit Button */
          .btn-submit {
            width: 100%;
            background: #0c1c8c;
            color: #ffffff;
            padding: 16px;
            border: none;
            border-radius: 16px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.25s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(12, 28, 140, 0.15);
          }

          .btn-submit:hover:not(:disabled) {
            background: #09146c;
          }

          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Success Card */
          .success-card {
            background: #ffffff;
            padding: 50px 30px;
            border-radius: 24px;
            text-align: center;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 30px rgba(12, 28, 140, 0.04);
          }

          .success-card h2 {
            font-family: 'Bebas Neue', cursive;
            font-size: 2.5rem;
            color: #0c1c8c;
            margin: 15px 0 5px;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 400;
          }

          /* Scrollbar styling for custom dropdown */
          .custom-options-menu::-webkit-scrollbar {
            width: 6px;
          }
          .custom-options-menu::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          .custom-options-menu::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }

          @media (max-width: 768px) {
            .reg-page { padding-top: 100px; }
            .grid-2 { grid-template-columns: 1fr; gap: 0; }
            .form-card { padding: 30px 20px; }
          }
        `}</style>

        <div className="container">
          {success ? (
            <div className="success-card">
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <CheckCircle2 size={40} color="#10b981" />
              </div>
              <h2>REGISTRATION SUCCESSFUL!</h2>
              <p style={{ color: '#334155', fontWeight: 500, fontSize: '0.95rem', marginBottom: '15px', lineHeight: 1.6 }}>
                Your player profile has been submitted successfully. Redirecting you home...
              </p>
            </div>
          ) : (
            <>
              <header className="section-header">
                <span className="header-tag">
                Official Enrollment
                </span>
                <h1>PLAYER <span className="color-yellow">REGISTRATION</span></h1>
                <div className="header-underline"></div>
                <p className="header-subtitle">Stacon League • Season 2026/2027</p>
              </header>

              <form onSubmit={handleSubmit} className="form-card">
                {/* Name in Full */}
                <div className="input-group">
                  <label>Name in Full *</label>
                  <input 
                    className="r-input"
                    type="text" 
                    placeholder="e.g. Musoni Alex" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                {/* Team and Team Number */}
                <div className="grid-2">
                  <CustomSelect 
                    label="Team *"
                    value={formData.team}
                    options={teams.map(t => ({ value: t.name, label: t.name }))}
                    onChange={val => setFormData({...formData, team: val})}
                    placeholder="Select Team"
                  />

                  <div className="input-group">
                    <label>Team Number *</label>
                    <input 
                      className="r-input"
                      type="text" 
                      placeholder="e.g. 001" 
                      required 
                      value={formData.teamNumber}
                      onChange={e => setFormData({...formData, teamNumber: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Position and Sex */}
                <div className="grid-2">
                  <CustomSelect 
                    label="Position *"
                    value={formData.position}
                    options={[
                      { value: 'Goalkeeper', label: 'Goalkeeper' },
                      { value: 'Defender', label: 'Defender' },
                      { value: 'Midfielder', label: 'Midfielder' },
                      { value: 'Forward', label: 'Forward' }
                    ]}
                    onChange={val => setFormData({...formData, position: val})}
                    placeholder="Select Position"
                  />

                  <CustomSelect 
                    label="Sex *"
                    value={formData.sex}
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' }
                    ]}
                    onChange={val => setFormData({...formData, sex: val})}
                    placeholder="Select Sex"
                  />
                </div>

                {/* Period of Study */}
                <div className="input-group">
                  <label>Period of Study (years) at Stacon *</label>
                  <input 
                    className="r-input"
                    type="text" 
                    placeholder="e.g. 2014 - 2019" 
                    required 
                    value={formData.studyPeriod}
                    onChange={e => setFormData({...formData, studyPeriod: e.target.value})} 
                  />
                </div>

                {/* Contact */}
                <div className="input-group">
                  <label>Contact / WhatsApp Number *</label>
                  <input 
                    className="r-input"
                    type="tel" 
                    required 
                    placeholder="e.g. +256 700 000 000" 
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})} 
                  />
                </div>

                {/* Passport Photo Upload */}
                <div className="input-group" style={{ marginBottom: '28px' }}>
                  <label>Current Photo (Passport Size) *</label>
                  <div 
                    className={`upload-area ${photo ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('pPhoto').click()} 
                  >
                    {photo ? <ShieldCheck color="#0c1c8c" size={22} /> : <Camera size={22} color="#64748b" />}
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: photo ? '#0c1c8c' : '#64748b' }}>
                      {photo ? photo.name : "Tap to upload current photo"}
                    </span>
                    <input 
                      id="pPhoto" 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={e => setPhoto(e.target.files[0])} 
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} className="btn-submit">
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Loader2 className="animate-spin" size={20} />
                      <span>SUBMITTING REGISTRATION...</span>
                    </div>
                  ) : "SUBMIT REGISTRATION"}
                </button>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                   <ShieldCheck size={14} color="#0c1c8c" /> Official Stacon League Verification
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerRegistration;