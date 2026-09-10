import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Helmet } from 'react-helmet-async';
import { Loader2, ShieldCheck, Camera, CheckCircle2, ChevronDown } from 'lucide-react';

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
      
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (error) {
      console.error("Submission error:", error);
      alert("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const positionOptions = [
    { value: 'Goalkeeper', label: 'Goalkeeper' },
    { value: 'Defender', label: 'Defender' },
    { value: 'Midfielder', label: 'Midfielder' },
    { value: 'Forward', label: 'Forward' }
  ];

  const sexOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  const teamOptions = teams.map(t => ({ value: t.name, label: t.name }));

  return (
    <>
      <Helmet>
        <title>Player Registration | STACON League</title>
      </Helmet>

      <div className="reg-page">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .reg-page {
            background-color: #f8fafc;
            min-height: 100vh;
            padding: 140px 5% 100px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #0f172a;
            box-sizing: border-box;
          }

          .container {
            max-width: 680px;
            margin: 0 auto;
          }

          .color-blue { color: #0c1c8c; }
          .color-yellow { color: #d97706; }

          /* Header Section */
          .section-header { 
            text-align: center; 
            margin-bottom: 50px; 
          }

          .header-tag {
            font-family: 'Cinzel', serif;
            color: #d97706;
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
            font-size: clamp(3.5rem, 8vw, 5rem); 
            color: #0c1c8c; 
            letter-spacing: 1px; 
            margin: 0; 
            line-height: 0.9;
            font-weight: 400;
            text-transform: uppercase;
          }

          .header-underline { 
            width: 80px; 
            height: 4px; 
            background: linear-gradient(90deg, #0c1c8c, #d97706); 
            margin: 20px auto 15px; 
            border-radius: 4px; 
          }

          .header-subtitle {
            font-family: 'Cinzel', serif;
            color: #d97706;
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
            box-shadow: 0 15px 35px rgba(12, 28, 140, 0.06);
            position: relative;
            overflow: hidden;
            transition: all 0.35s ease;
          }

          .form-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 20px 45px rgba(12, 28, 140, 0.1);
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
            border: 2px solid #0c1c8c;
            border-radius: 50px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            box-shadow: 0 10px 25px rgba(12, 28, 140, 0.2);
          }

          .btn-submit:hover:not(:disabled) {
            background: #060d3d;
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(12, 28, 140, 0.3);
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
            .reg-page { padding-top: 110px; padding-bottom: 60px; }
            .form-card { padding: 24px 20px; }
            .grid-2 { grid-template-columns: 1fr; gap: 0; }
          }
        `}</style>

        <div className="container">
          <div className="section-header">
            <div className="header-tag">
              <ShieldCheck size={16} /> Official Season Registration
            </div>
            <h1>Player <span className="color-yellow">Registration</span></h1>
            <div className="header-underline"></div>
            <p className="header-subtitle">Stacon League</p>
          </div>

          {success ? (
            <div className="success-card">
              <CheckCircle2 size={64} color="#0c1c8c" style={{ margin: '0 auto' }} />
              <h2>Registration Successful!</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                Your player details have been submitted for review. Redirecting to home...
              </p>
            </div>
          ) : (
            <div className="form-card">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text"
                    className="r-input"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid-2">
                  <CustomSelect 
                    label="Select Team"
                    value={formData.team}
                    options={teamOptions}
                    onChange={(val) => setFormData({...formData, team: val})}
                    placeholder="Choose Team..."
                  />

                  <div className="input-group">
                    <label>Team Number / Jersey No.</label>
                    <input 
                      type="text"
                      className="r-input"
                      placeholder="e.g. 10"
                      value={formData.teamNumber}
                      onChange={(e) => setFormData({...formData, teamNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <CustomSelect 
                    label="Playing Position"
                    value={formData.position}
                    options={positionOptions}
                    onChange={(val) => setFormData({...formData, position: val})}
                    placeholder="Choose Position..."
                  />

                  <CustomSelect 
                    label="Sex"
                    value={formData.sex}
                    options={sexOptions}
                    onChange={(val) => setFormData({...formData, sex: val})}
                    placeholder="Select Sex..."
                  />
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label>Period of Study</label>
                    <input 
                      type="text"
                      className="r-input"
                      placeholder="e.g. Year 2 / 2024-2027"
                      value={formData.studyPeriod}
                      onChange={(e) => setFormData({...formData, studyPeriod: e.target.value})}
                    />
                  </div>

                  <div className="input-group">
                    <label>Contact / WhatsApp Number</label>
                    <input 
                      type="text"
                      className="r-input"
                      placeholder="e.g. +256 700 000000"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Passport Photo</label>
                  <label className={`upload-area ${photo ? 'has-file' : ''}`}>
                    <Camera size={22} color={photo ? "#0c1c8c" : "#64748b"} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: photo ? '#0c1c8c' : '#64748b' }}>
                      {photo ? photo.name : "Click to upload passport photo (.jpg, .png)"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => setPhoto(e.target.files[0])}
                    />
                  </label>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 className="animate-spin" size={18} /> Submitting...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerRegistration;