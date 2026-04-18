import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

// IMPORTANT: Set your backend URL here
const API_BASE_URL = 'https://ice-foundation-1.onrender.com/api';  

const passwordStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['transparent', '#E24B4A', '#EF9F27', '#87CEEB', '#1D9E75'];

function Auth({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const strengthValue = useMemo(
    () => passwordStrength(registerPassword),
    [registerPassword]
  );

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register');
    setStatusMessage(null);
    setStatusType('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setStatusMessage('Please enter your email and password.');
      setStatusType('error');
      return;
    }

    setLoading(true);
    try {
      // Use the correct backend URL
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: loginEmail, 
          password: loginPassword 
        }),
      });
      
      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatusMessage('Signed in successfully.');
        setStatusType('success');
        setTimeout(() => navigate('/'), 800);
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatusMessage(error.message || 'Unable to sign in. Please try again later.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !agreeTerms) {
      setStatusMessage('Please complete all fields and accept the terms.');
      setStatusType('error');
      return;
    }

    if (registerPassword.length < 8) {
      setStatusMessage('Password must be at least 8 characters long.');
      setStatusType('error');
      return;
    }

    setLoading(true);
    try {
      // Use the correct backend URL
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerEmail,
          email: registerEmail,
          password: registerPassword,
          password2: registerPassword,
          first_name: registerFirstName,
          last_name: registerLastName,
          phone: registerPhone,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatusMessage('Account created successfully! Redirecting...');
        setStatusType('success');
        setTimeout(() => navigate('/'), 1000);
      } else {
        let errorMsg = 'Registration failed.';
        if (data.password) errorMsg = data.password[0];
        else if (data.username) errorMsg = data.username[0];
        else if (data.email) errorMsg = data.email[0];
        else if (data.error) errorMsg = data.error;
        setStatusMessage(errorMsg);
        setStatusType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setStatusMessage('Unable to register. Please make sure backend is running on https://ice-foundation-1.onrender.com/api');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Panel - Brand Section */}
        <div className="auth-brand-panel">
          <div className="brand-bg-decoration"></div>
          <div className="brand-content">
            <div className="brand-logo">ICE</div>
            <div className="brand-title">
              ICE Foundation
              <small>Your Bridge to Success</small>
            </div>
          </div>
          <div className="brand-tagline">
            <div className="tagline-text">Find your perfect college.</div>
            <p className="tagline-subtext">Expert guidance for 12th-grade students across India.</p>
          </div>
          <div className="brand-stats">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Partner Colleges</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹12Cr+</div>
              <div className="stat-label">Scholarships Secured</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="auth-form-panel">
          <div className="form-header">
            <div className="tab-buttons">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                disabled={loading}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                disabled={loading}
              >
                Create account
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="back-home-btn"
              disabled={loading}
            >
              Back to home
            </button>
          </div>

          {statusMessage && (
            <div className={`status-message ${statusType}`}>
              {statusMessage}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-welcome">
                <h2>Welcome back</h2>
                <p>
                  No account? <button type="button" onClick={() => switchTab('register')} className="link-btn" disabled={loading}>Register free</button>
                </p>
              </div>

              <div className="social-buttons">
                <button type="button" className="social-btn" disabled={loading}>
                  <span className="social-icon">G</span>
                  Google
                </button>
              </div>

              <div className="divider">or with email</div>

              <div className="form-field">
                <label>Email address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="m9 11 3-3 3 3"/>
                  </svg>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="forgot-password">
                <button type="button" className="forgot-link" disabled={loading}>Forgot password?</button>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-welcome">
                <h2>Join ICE Foundation</h2>
                <p>
                  Have an account? <button type="button" onClick={() => switchTab('login')} className="link-btn" disabled={loading}>Sign in</button>
                </p>
              </div>

              <div className="name-fields">
                <div className="form-field">
                  <label>First name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      placeholder="Arjun"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Last name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      placeholder="Kumar"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label>Email address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Phone number</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="m9 11 3-3 3 3"/>
                  </svg>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    {showRegisterPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${strengthValue * 25}%`, backgroundColor: strengthColor[strengthValue] }} />
                  </div>
                  <div className="strength-label" style={{ color: strengthColor[strengthValue] }}>
                    {strengthLabel[strengthValue] || 'Enter a password'}
                  </div>
                </div>
              </div>

              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                />
                <span>
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              
              <p className="terms-note">
                By continuing you agree to our <Link to="/terms" className="terms-link">Terms</Link> & <Link to="/privacy" className="terms-link">Privacy Policy</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;