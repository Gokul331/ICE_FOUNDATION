import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { confirmPasswordReset } from '../services/api';
import '../styles/auth.css';

function ResetPassword() {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid || !token) {
      setIsValid(false);
      setStatusMessage('Invalid reset link. Please request a new one.');
      setStatusType('error');
    }
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setStatusMessage('Please fill in all fields.');
      setStatusType('error');
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage('Password must be at least 8 characters long.');
      setStatusType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage('Passwords do not match.');
      setStatusType('error');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStatusMessage('Password reset successful! You can now sign in with your new password.');
      setStatusType('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Failed to reset password. The link may have expired.');
      setStatusType('error');
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
            <div className="tagline-text">Create new password.</div>
            <p className="tagline-subtext">Enter your new password below.</p>
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
              <h2>Set new password</h2>
              <p>Create a strong password for your account.</p>
            </div>

            <div className="form-field">
              <label>New password</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="m9 11 3-3 3 3"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  disabled={loading || !isValid}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label>Confirm new password</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="m9 11 3-3 3 3"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  disabled={loading || !isValid}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !isValid}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>

            <p className="terms-note" style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="terms-link">Back to sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
