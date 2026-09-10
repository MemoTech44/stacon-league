import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError("Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Portal | St. Jerome League</title>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #04060d;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .login-card {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .login-header {
          padding: 40px 30px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .header-tag {
          font-family: 'Cinzel', serif;
          color: #facc15;
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
          color: #facc15;
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
          color: #64748b;
          transition: color 0.3s ease;
        }

        .c-input {
          width: 100%;
          background: rgba(4, 6, 13, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          border-color: #facc15;
          background: rgba(4, 6, 13, 0.9);
          box-shadow: 0 0 15px rgba(250, 204, 21, 0.15);
        }

        .c-input:focus + svg,
        .input-wrapper:focus-within svg {
          color: #facc15;
        }

        .error-msg {
          background: rgba(220, 38, 38, 0.1);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(220, 38, 38, 0.2);
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          background: #facc15;
          color: #04060d;
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
          background: #ffe066;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(250, 204, 21, 0.25);
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
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .back-home:hover {
          color: #facc15;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <ShieldCheck size={44} color="#facc15" style={{ margin: '0 auto' }} />
            <span className="header-tag">St. Jerome League</span>
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
                    placeholder="name@league.com" 
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