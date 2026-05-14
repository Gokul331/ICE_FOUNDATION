import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { requestPasswordReset } from '../services/api';
import '../styles/auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStatusMessage('If an account exists with this email, you will receive a reset link shortly.');
      setStatusType('success');
      setEmail('');
    } catch (error) {
      setStatusMessage('An error occurred. Please try again.');
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
              <span className="logo-dot-premium" />
              ACE <span>COUNSULTING</span>
            </Link>
            
            <motion.div 
              className="visual-text-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Secure your <br /><span>Journey</span></h2>
              <p>We'll help you get back on track. Just enter your email and follow the instructions.</p>
            </motion.div>

            <div className="visual-footer-stats">
              <div className="v-stat">
                <strong>24/7</strong>
                <span>Support</span>
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
              <h3>Forgot Password</h3>
              <p>Enter your email to receive a reset link.</p>
            </div>

            {statusMessage && (
              <div className={`auth-alert ${statusType}`}>
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="input-group-premium">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
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

export default ForgotPassword;

