import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/auth.css";

const API_BASE_URL = "https://ice-foundation-1.onrender.com/api";

function Auth({ initialTab = "login", onLoginSuccess } = {}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ message: null, type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
    window.scrollTo(0, 0);
  }, [initialTab]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setStatus({ message: null, type: "" });
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: null, type: "" });

    const endpoint = activeTab === "login" ? "/login/" : "/register/";
    const body = activeTab === "login" 
      ? { username: formData.email, password: formData.password }
      : {
          username: formData.email,
          email: formData.email,
          password: formData.password,
          password2: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phone,
        };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus({ message: activeTab === "login" ? "Welcome back!" : "Account created!", type: "success" });

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else navigate("/");
      }, 800);
    } catch (error) {
      setStatus({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium">
      <div className="auth-split-layout">
        
        {/* ── LEFT SIDE: BRAND ── */}
        <motion.div 
          className="auth-visual-side premium-3d-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="visual-overlay" />
          <div className="visual-content floating-3d">
            <Link to="/" className="auth-logo-top">
              <span className="logo-dot-premium" />
              ACE <span>COUNSULTING</span>
            </Link>
            
            <div className="visual-text-box">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Building Your <br />
                <span>Educational Future</span>
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Join 1000+ students who have achieved their educational dreams with expert guidance.
              </motion.p>
            </div>

            <div className="visual-footer-stats">
              <div className="v-stat">
                <strong>100+</strong>
                <span>Colleges</span>
              </div>
              <div className="v-stat">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
              <div className="v-stat">
                <strong>95%</strong>
                <span>Success</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT SIDE: FORM ── */}
        <div className="auth-form-side">
          <div className="form-container-inner">
            <div className="auth-nav-pills">
              <button 
                className={activeTab === "login" ? "active" : ""} 
                onClick={() => switchTab("login")}
              >
                Sign In
              </button>
              <button 
                className={activeTab === "register" ? "active" : ""} 
                onClick={() => switchTab("register")}
              >
                Create Account
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="auth-form-wrapper"
              >
                <div className="form-header">
                  <h3>{activeTab === "login" ? "Welcome Back" : "Get Started"}</h3>
                  <p>{activeTab === "login" ? "Manage your applications effortlessly." : "Start your journey to the perfect college today."}</p>
                </div>

                {status.message && (
                  <div className={`auth-alert ${status.type}`}>
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleAction} className="premium-form">
                  {activeTab === "register" && (
                    <div className="form-row-dual">
                      <div className="input-group-premium">
                        <label>First Name</label>
                        <input 
                          type="text" 
                          placeholder="John" 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="input-group-premium">
                        <label>Last Name</label>
                        <input 
                          type="text" 
                          placeholder="Doe" 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="input-group-premium">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  {activeTab === "register" && (
                    <div className="input-group-premium">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+91 00000 00000" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  <div className="input-group-premium relative">
                    <label>Password</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <button 
                      type="button" 
                      className="pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {activeTab === "login" && (
                    <div className="form-extra-links">
                      <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                  )}

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? "Processing..." : (activeTab === "login" ? "Sign In" : "Create Account")}
                  </button>

                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>

                  <button type="button" className="btn-google-auth">
                    <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google Account
                  </button>

                  <div className="auth-back-home">
                    <Link to="/">← Back to Home</Link>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth; 