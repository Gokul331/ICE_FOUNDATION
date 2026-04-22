import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/profile.css';
import Navbar from './Navbar';
import { 
  getCurrentUserProfile, 
  updateCurrentUserProfile, 
  changePassword,
  isAuthenticated,
  clearAuthData
} from '../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Form data for profile update
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    whatsapp_number: ''
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        // Fetch latest user data from API using the new function
        const latestUserData = await getCurrentUserProfile();
        
        if (latestUserData) {
          setUser(latestUserData);
          localStorage.setItem('user', JSON.stringify(latestUserData));
          
          // Populate form data with user info
          setFormData({
            first_name: latestUserData.first_name || '',
            last_name: latestUserData.last_name || '',
            email: latestUserData.email || '',
            phone_number: latestUserData.phone_number || '',
            date_of_birth: latestUserData.date_of_birth || '',
            gender: latestUserData.gender || '',
            address: latestUserData.address || '',
            city: latestUserData.city || '',
            state: latestUserData.state || 'Tamil Nadu',
            pincode: latestUserData.pincode || '',
            whatsapp_number: latestUserData.whatsapp_number || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
        
        // Fallback to stored data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setFormData({
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              email: userData.email || userData.username || '',
              phone_number: userData.phone_number || '',
              date_of_birth: userData.date_of_birth || '',
              gender: userData.gender || '',
              address: userData.address || '',
              city: userData.city || '',
              state: userData.state || 'Tamil Nadu',
              pincode: userData.pincode || '',
              whatsapp_number: userData.whatsapp_number || ''
            });
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Using the updated API service function
      const response = await updateCurrentUserProfile(formData);
      
      if (response && response.user) {
        setUser(response.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long!' });
      return;
    }

    setUpdateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Using the API service function
      const response = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsChangingPassword(false);
      setMessage({ type: 'success', text: 'Password changed successfully! Please login again.' });
      
      // Auto logout after password change
      setTimeout(() => {
        handleLogout();
      }, 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to change password';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  // Get full name
  const getFullName = () => {
    if (!user) return 'User';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.username) return user.username;
    return 'User';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="profile-hero">
        <h1>My Profile</h1>
        <p>Manage your student profile and view your account details for ICE Foundation access.</p>
      </section>

      {/* Message Display */}
      {message.text && (
        <div className={`message-container ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Content */}
      <section className="profile-card">
        {user ? (
          <>
            {/* Avatar and Name Section */}
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {getInitials()}
              </div>
              <div className="profile-name-section">
                <h2>{getFullName()}</h2>
                <p>Student Account</p>
                <div className="profile-badges">
                  <span className="badge">Verified Account</span>
                  {user.is_staff && <span className="badge">Staff</span>}
                </div>
              </div>
              <div className="profile-actions-header">
                {!isEditing && !isChangingPassword && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34"/>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                      </svg>
                      Edit Profile
                    </button>
                    <button onClick={() => setIsChangingPassword(true)} className="edit-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      Change Password
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              // Edit Profile Form
              <form onSubmit={handleUpdateProfile} className="edit-form">
                <h3 className="section-title">Edit Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleInputChange}
                      placeholder="10-digit WhatsApp number"
                      pattern="[0-9]{10}"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={updateLoading}>
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            ) : isChangingPassword ? (
              // Change Password Form
              <form onSubmit={handleChangePassword} className="edit-form">
                <h3 className="section-title">Change Password</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min. 8 characters)"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={updateLoading}>
                    {updateLoading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button type="button" onClick={() => setIsChangingPassword(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // View Profile
              <>
                {/* Personal Information */}
                <h3 className="section-title">Personal Information</h3>
                <div className="profile-meta">
                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Full Name
                    </span>
                    <span className="profile-value">{getFullName()}</span>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email Address
                    </span>
                    <span className="profile-value">{user.email || 'Not available'}</span>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                      </svg>
                      Phone Number
                    </span>
                    <span className="profile-value">{user.phone_number || 'Not provided'}</span>
                  </div>

                  {user.whatsapp_number && (
                    <div className="profile-item">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                        </svg>
                        WhatsApp Number
                      </span>
                      <span className="profile-value">{user.whatsapp_number}</span>
                    </div>
                  )}

                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Username
                    </span>
                    <span className="profile-value">{user.username || 'Not available'}</span>
                  </div>

                  {user.date_of_birth && (
                    <div className="profile-item">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Date of Birth
                      </span>
                      <span className="profile-value">
                        {new Date(user.date_of_birth).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}

                  {user.gender && (
                    <div className="profile-item">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="4"/>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        Gender
                      </span>
                      <span className="profile-value">{user.gender}</span>
                    </div>
                  )}

                  {user.city && (
                    <div className="profile-item">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        City
                      </span>
                      <span className="profile-value">{user.city}</span>
                    </div>
                  )}

                  {user.state && (
                    <div className="profile-item">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        State
                      </span>
                      <span className="profile-value">{user.state}</span>
                    </div>
                  )}

                  {user.pincode && (
                    <div className="profile-item">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Pincode
                      </span>
                      <span className="profile-value">{user.pincode}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="profile-item full-width">
                      <span className="profile-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Address
                      </span>
                      <span className="profile-value">{user.address}</span>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <h3 className="section-title">Account Information</h3>
                <div className="profile-meta">
                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Account Status
                    </span>
                    <span className="profile-value">
                      <span className="status-badge status-active">Active</span>
                    </span>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Member Since
                    </span>
                    <span className="profile-value">
                      {user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Registered user'}
                    </span>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Account Type
                    </span>
                    <span className="profile-value">{user.is_staff ? 'Staff Account' : 'Student Account'}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="profile-action">
                  <Link to="/college-suggestion" className="action-btn primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Get College Suggestions
                  </Link>
                  <Link to="/colleges" className="action-btn secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Browse Colleges
                  </Link>
                  <button onClick={handleLogout} className="action-btn danger">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <h3>You are not logged in</h3>
            <p>Sign in to view your profile information and access personalized college recommendations.</p>
            <div className="empty-state-actions">
              <Link to="/login" className="action-btn primary">Login</Link>
              <Link to="/register" className="action-btn secondary">Create Account</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;