import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/profile.css';
import { 
  getCurrentUserProfile, 
  updateCurrentUserProfile, 
  changePassword,
  isAuthenticated
} from '../services/api';

/* ── animation helpers ── */
function SectionReveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
    >
      {children}
    </motion.div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '',
    date_of_birth: '', gender: '', address: '', city: '',
    pincode: '', whatsapp_number: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', confirm_password: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getCurrentUserProfile();
      if (data) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          pincode: data.pincode || '',
          whatsapp_number: data.whatsapp_number || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateCurrentUserProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await fetchUserData(); // Refresh data
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    
    setUpdateLoading(true);
    try {
      await changePassword(passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to change password. Please check your current password.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen-premium">
        <div className="premium-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-premium">
      <Navbar />

      <section className="profile-hero">
        <div className="container">
          <SectionReveal className="profile-hero-content">
            <div className="profile-avatar-large">
              {user?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-intro">
              <h1>{user?.first_name} {user?.last_name}</h1>
              <p>{user?.email} • Student Member</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="profile-tabs-section">
        <div className="container">
          <div className="profile-layout">
            <aside className="profile-sidebar">
              <nav className="sidebar-nav">
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('overview')}
                >
                  {activeTab === 'overview' && <span className="active-pill" />}
                  Overview
                </button>
                <button 
                  className={`nav-item ${activeTab === 'edit' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('edit')}
                >
                  {activeTab === 'edit' && <span className="active-pill" />}
                  Edit Profile
                </button>
                <button 
                  className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('security')}
                >
                  {activeTab === 'security' && <span className="active-pill" />}
                  Security
                </button>
                <button 
                  className="nav-item logout-btn-premium" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </nav>
            </aside>

            <main className="profile-main">
              {message.text && (
                <div className={`profile-alert ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="content-header">
                      <h3>Account Overview</h3>
                      <p>View your primary account information and status.</p>
                    </div>
                    <div className="info-grid-premium">
                      <div className="info-item">
                        <label>Full Name</label>
                        <span>{user?.first_name} {user?.last_name || ''}</span>
                      </div>
                      <div className="info-item">
                        <label>Email Address</label>
                        <span>{user?.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Phone Number</label>
                        <span>{user?.phone_number || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <label>WhatsApp Number</label>
                        <span>{user?.whatsapp_number || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <label>Location</label>
                        <span>
                          {user?.city || 'Not provided'}
                          {user?.pincode ? ` - ${user.pincode}` : ''}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Member Since</label>
                        <span>
                          {user?.date_joined ? 
                            new Date(user.date_joined).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'edit' && (
                  <motion.div 
                    key="edit" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="content-header">
                      <h3>Update Personal Details</h3>
                      <p>Keep your profile up to date for better recommendations.</p>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="premium-profile-form">
                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>First Name *</label>
                          <input 
                            type="text" 
                            name="first_name" 
                            value={formData.first_name} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="input-group-premium">
                          <label>Last Name</label>
                          <input 
                            type="text" 
                            name="last_name" 
                            value={formData.last_name} 
                            onChange={handleInputChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>Email ID</label>
                          <input 
                            type="email" 
                            value={formData.email} 
                            disabled 
                            className="disabled-input"
                          />
                          <small>Email cannot be changed. Contact support for assistance.</small>
                        </div>
                        <div className="input-group-premium">
                          <label>Mobile Number</label>
                          <input 
                            type="tel" 
                            name="phone_number" 
                            value={formData.phone_number} 
                            onChange={handleInputChange} 
                            maxLength={10}
                            pattern="[0-9]{10}"
                          />
                        </div>
                      </div>
                      
                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>WhatsApp Number</label>
                          <input 
                            type="tel" 
                            name="whatsapp_number" 
                            value={formData.whatsapp_number} 
                            onChange={handleInputChange} 
                            maxLength={10}
                            pattern="[0-9]{10}"
                          />
                        </div>
                        <div className="input-group-premium">
                          <label>Date of Birth</label>
                          <input 
                            type="date" 
                            name="date_of_birth" 
                            value={formData.date_of_birth} 
                            onChange={handleInputChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleInputChange}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="input-group-premium">
                          <label>City</label>
                          <input 
                            type="text" 
                            name="city" 
                            value={formData.city} 
                            onChange={handleInputChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>Pincode</label>
                          <input 
                            type="text" 
                            name="pincode" 
                            value={formData.pincode} 
                            onChange={handleInputChange} 
                            maxLength={6}
                            pattern="[0-9]{6}"
                          />
                        </div>
                        <div className="input-group-premium">
                          <label>Address</label>
                          <textarea 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange}
                            rows="2"
                          />
                        </div>
                      </div>
                      
                      <button type="submit" className="btn-save-profile" disabled={updateLoading}>
                        {updateLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div 
                    key="security" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="content-header">
                      <h3>Security Settings</h3>
                      <p>Manage your password and account security preferences.</p>
                    </div>
                    <form onSubmit={handleChangePassword} className="premium-profile-form">
                      <div className="input-group-premium">
                        <label>Current Password</label>
                        <input 
                          type="password" 
                          name="current_password" 
                          value={passwordData.current_password} 
                          onChange={handlePasswordChange} 
                          required 
                        />
                      </div>
                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>New Password</label>
                          <input 
                            type="password" 
                            name="new_password" 
                            value={passwordData.new_password} 
                            onChange={handlePasswordChange} 
                            required 
                          />
                          <small>Minimum 8 characters</small>
                        </div>
                        <div className="input-group-premium">
                          <label>Confirm New Password</label>
                          <input 
                            type="password" 
                            name="confirm_password" 
                            value={passwordData.confirm_password} 
                            onChange={handlePasswordChange} 
                            required 
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn-save-profile" disabled={updateLoading}>
                        {updateLoading ? 'Changing Password...' : 'Update Password'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Profile;