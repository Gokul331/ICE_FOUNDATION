import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      setStatusMessage('Password reset successful! Redirecting to login...');
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
    <div className="auth-page-premium">
      <div className="auth-split-layout">
        
        {/* ── VISUAL SIDE ── */}
        <div className="auth-visual-side">
          <div className="visual-content">
            <Link to="/" className="auth-logo-top">
              <div className="logo-dot-premium" />
              ACE <span>COUNSULTING</span>
            </Link>
            
            <motion.div 
              className="visual-text-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Secure your <br /><span>Journey</span></h2>
              <p>Almost there. Create a new strong password to protect your account.</p>
            </motion.div>

            <div className="visual-footer-stats">
              <div className="v-stat">
                <strong>256-bit</strong>
                <span>Encryption</span>
              </div>
              <div className="v-stat">
                <strong>100%</strong>
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM SIDE ── */}
        <div className="auth-form-side">
          <motion.div 
            className="form-container-inner"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="form-header">
              <h3>Set New Password</h3>
              <p>Create a strong password for your account.</p>
            </div>

            {statusMessage && (
              <div className={`auth-alert ${statusType}`}>
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="input-group-premium" style={{ position: 'relative' }}>
                <label>New Password</label>
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
                  className="pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="input-group-premium">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  disabled={loading || !isValid}
                />
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading || !isValid}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="auth-divider">
                <span>Or</span>
              </div>

              <Link to="/login" className="btn-google-auth" style={{ textDecoration: 'none' }}>
                Back to Login
              </Link>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

