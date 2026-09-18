import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import logoImg from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Query the 'admin' collection for a document where the email field matches
      const q = query(collection(db, 'admin'), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      let isAdmin = false;
      querySnapshot.forEach((doc) => {
        if (doc.data().role === 'admin') {
          isAdmin = true;
        }
      });

      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        // Sign out unauthorized user
        await signOut(auth);
        setError("Access denied. You do not have Stacon League administrative privileges.");
      }
    } catch (err) {
      console.error("Login Error Code:", err.code);
      console.error("Login Error Message:", err.message);
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'permission-denied') {
        setError("Database permission denied. Check your Firestore security rules.");
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Portal | Stacon League</title>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          background-image: 
            radial-gradient(circle at 15% 20%, rgba(243, 231, 63, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(203, 213, 225, 0.4) 0%, transparent 50%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 40px 20px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #cbd5e1, #f3e73f, #cbd5e1);
        }

        .login-card {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: 28px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .login-header {
          padding: 40px 30px 20px;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .logo-container {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 10px;
        }

        .login-logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .header-tag {
          font-family: 'Cinzel', serif;
          color: #b5a70f;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .login-header h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: 2.5rem;
          color: #0f172a;
          letter-spacing: 1.5px;
          margin: 0;
          line-height: 1;
        }

        .login-body {
          padding: 32px 30px 40px;
        }

        .input-group {
          margin-bottom: 22px;
        }

        .input-group label {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper svg {
          position: absolute;
          left: 16px;
          color: #64748b;
          transition: color 0.3s ease;
        }

        .c-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 15px 16px 15px 48px;
          border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s ease;
          color: #0f172a;
          box-sizing: border-box;
        }

        .c-input::placeholder {
          color: #94a3b8;
        }

        .c-input:focus {
          border-color: #f3e73f;
          background: #ffffff;
          box-shadow: 0 0 15px rgba(243, 231, 63, 0.25);
        }

        .c-input:focus + svg,
        .input-wrapper:focus-within svg {
          color: #b5a70f;
        }

        .error-msg {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 22px;
          border: 1px solid rgba(220, 38, 38, 0.2);
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #f3e73f, #e5d828);
          color: #0f172a;
          border: none;
          border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(243, 231, 63, 0.3);
        }

        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #fff045, #f3e73f);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(243, 231, 63, 0.4);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-home {
          display: inline-block;
          width: 100%;
          text-align: center;
          margin-top: 24px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .back-home:hover {
          color: #0f172a;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img src={logoImg} alt="Stacon League Logo" className="login-logo" />
            </div>
            <span className="header-tag">Stacon League</span>
            <h2>Admin Portal</h2>
          </div>

          <div className="login-body">
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Admin Email</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input 
                    type="email" 
                    className="c-input"
                    placeholder="admin@staconleague.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Security Key</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input 
                    type="password" 
                    className="c-input"
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span>Verifying...</span>
                    <Loader2 className="animate-spin" size={18} />
                  </>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <Link to="/" className="back-home">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;