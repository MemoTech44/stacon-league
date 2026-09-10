import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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
          background-color: #0c1c8c;
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
          background: linear-gradient(90deg, #0c1c8c, #d97706, #0c1c8c);
        }

        .login-card {
          background: rgba(12, 28, 140, 0.45);
          backdrop-filter: blur(16px);
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .login-header {
          padding: 40px 30px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .header-tag {
          font-family: 'Cinzel', serif;
          color: #d97706;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: block;
          margin-top: 12px;
        }

        .login-header h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: 2.4rem;
          color: #ffffff;
          letter-spacing: 1.5px;
          margin: 4px 0 0;
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
          color: #d97706;
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
          left: 14px;
          color: #94a3b8;
          transition: color 0.3s ease;
        }

        .c-input {
          width: 100%;
          background: rgba(4, 6, 13, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 14px 14px 14px 44px;
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s ease;
          color: #ffffff;
          box-sizing: border-box;
        }

        .c-input:focus {
          border-color: #d97706;
          background: rgba(4, 6, 13, 0.8);
          box-shadow: 0 0 15px rgba(217, 119, 6, 0.2);
        }

        .c-input:focus + svg,
        .input-wrapper:focus-within svg {
          color: #d97706;
        }

        .error-msg {
          background: rgba(220, 38, 38, 0.15);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(220, 38, 38, 0.3);
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          background: #d97706;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .login-btn:hover:not(:disabled) {
          background: #b45309;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-home {
          display: inline-block;
          width: 100%;
          text-align: center;
          margin-top: 22px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .back-home:hover {
          color: #d97706;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <ShieldCheck size={44} color="#d97706" style={{ margin: '0 auto' }} />
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