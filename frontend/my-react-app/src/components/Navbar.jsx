import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getInitial = () => {
    if (!user) return '';
    const username = user.username || user.email || 'U';
    return username.charAt(0).toUpperCase();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Prevent body scroll when mobile menu is open
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { to: "/about", label: "ABOUT US" },
    { to: "/colleges", label: "COLLEGE MATCHES" },
    { to: "/college-suggestion", label: "SUGGESTION" },
    { to: "/contact", label: "CONTACT" }
  ];

  return (
    <>
      <nav>
        <Link to="/" className="logo-area nav-link" onClick={closeMobileMenu}>
          <div className="logo-mark">ICE</div>
          <div className="logo-text-wrapper">
            <span className="logo-text"><span>ICE</span> Foundation</span>
            <span className="logo-subtext">Inspire Connect Empower</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <span className="user-avatar">{getInitial()}</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user.username}</span>
                    <span className="dropdown-email">{user.email || 'User'}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to="/profile" 
                    className={`dropdown-item ${isActive('/profile') ? 'active' : ''}`} 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                  </Link>
                  <Link 
                    to="/colleges" 
                    className={`dropdown-item ${isActive('/colleges') ? 'active' : ''}`} 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    Browse Colleges
                  </Link>
                  <Link 
                    to="/college-suggestion" 
                    className={`dropdown-item ${isActive('/college-suggestion') ? 'active' : ''}`} 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4l3 3"/>
                    </svg>
                    College Suggestions
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`nav-btn ${isActive('/login') ? 'active' : ''}`}>Login / Register</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      
      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
        <div className="mobile-nav-header">
          <div className="logo-mark">ICE</div>
          <span className="mobile-nav-title">ICE Foundation</span>
        </div>
        
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">{getInitial()}</div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user.username}</div>
                  <div className="mobile-user-email">{user.email || 'User'}</div>
                </div>
              </div>
              <Link 
                to="/profile" 
                className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`} 
                onClick={closeMobileMenu}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                My Profile
              </Link>
              <Link 
                to="/colleges" 
                className={`mobile-nav-link ${isActive('/colleges') ? 'active' : ''}`} 
                onClick={closeMobileMenu}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                Browse Colleges
              </Link>
              <Link 
                to="/college-suggestion" 
                className={`mobile-nav-link ${isActive('/college-suggestion') ? 'active' : ''}`} 
                onClick={closeMobileMenu}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                College Suggestions
              </Link>
              <button className="mobile-nav-link logout-btn" onClick={handleLogout}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className={`mobile-nav-btn ${isActive('/login') ? 'active' : ''}`} onClick={closeMobileMenu}>
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;