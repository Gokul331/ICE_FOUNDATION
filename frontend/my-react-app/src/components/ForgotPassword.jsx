import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import '../styles/auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage('Please enter your email address.');
      setStatusType('error');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStatusMessage('Password reset link sent to your email. Check your inbox (and spam folder).');
      setStatusType('success');
      setEmail('');
    } catch (error) {
      // Backend returns same message even if email not found (security)
      setStatusMessage('If an account with that email exists, a reset link has been sent.');
      setStatusType('success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-3d">
        <div className="auth-brand-panel">
          <div className="brand-bg-3d">
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>
          </div>
          <div className="brand-content">
            <div className="brand-logo-3d">ICE</div>
            <div className="brand-title">
              ICE Foundation
              <small>Your Bridge to Success</small>
            </div>
          </div>
          <div className="brand-tagline">
            <div className="tagline-text">Reset your password.</div>
            <p className="tagline-subtext">We'll send you a link to get back into your account.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="form-header">
            <Link to="/login" className="back-home-btn">Back to login</Link>
          </div>

          {statusMessage && (
            <div className={`status-message ${statusType}`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-welcome">
              <h2>Forgot password?</h2>
              <p>No worries, we'll send you a reset link.</p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>

            <p className="terms-note" style={{ textAlign: 'center', marginTop: '1rem' }}>
              Remember your password? <Link to="/login" className="terms-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
