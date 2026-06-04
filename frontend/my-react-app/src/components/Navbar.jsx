import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import '../styles/navbar.css';

/* ── animation variants ──────────────────────────────── */
const navVariants = {
  top:      { backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 30px rgba(0,0,0,0.08)' },
  scrolled: { backgroundColor: 'rgba(255,255,255,0.0)', backdropFilter: 'blur(20px)',  boxShadow: 'none' },
};

const dropdownVariants = {
  hidden:  { opacity: 0, y: -10, scale: 0.96 },
  visible: { opacity: 1, y: 0,   scale: 1,   transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit:    { opacity: 0, y: -8,  scale: 0.95, transition: { duration: 0.15 } },
};

const mobileMenuVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0,     transition: { type: 'spring', stiffness: 260, damping: 28 } },
  exit:    { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 35 } },
};

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const linkVariants = {
  hidden:  { opacity: 0, x: 30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 },
  }),
};

const mobileSubVariants = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit:    { height: 0,      opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
};

/* ── icons ───────────────────────────────────────────── */
const IconProfile = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconApps = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconCollege = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const IconSuggest = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
);
const IconLogout = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconChevron = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

/* ── component ───────────────────────────────────────── */
function Navbar() {
  const [user, setUser]                         = useState(null);
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const [mobileSubOpen, setMobileSubOpen]       = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const dropdownRef      = useRef(null);
  const mobileMenuRef    = useRef(null);
  const mobileMenuBtnRef = useRef(null);
  const navigate         = useNavigate();
  const location         = useLocation();
  const { scrollY }      = useScroll();

  /* scroll detection */
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 50));

  /* load user */
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* click outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(e.target)
      ) closeMobile();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileMenuOpen]);

  /* resize */
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 992 && mobileMenuOpen) closeMobile(); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [mobileMenuOpen]);

  /* route change */
  useEffect(() => { closeMobile(); }, [location]);

  /* helpers */
  const closeMobile = () => {
    setMobileMenuOpen(false);
    setMobileSubOpen(false);
    document.body.style.overflow = 'unset';
  };

  const toggleMobile = (e) => {
    e?.stopPropagation();
    const next = !mobileMenuOpen;
    setMobileMenuOpen(next);
    if (!next) setMobileSubOpen(false);
    document.body.style.overflow = next ? 'hidden' : 'unset';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    closeMobile();
    navigate('/');
  };

  const getInitial = () => {
    if (!user) return '';
    return (user.first_name || user.email || 'U').charAt(0).toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/',                  label: 'Home' },
    { to: '/about',             label: 'About' },
    { to: '/colleges',          label: 'Colleges' },
    { to: '/courses',           label: 'Courses' },
    { to: '/contact',           label: 'Contact' },
  ];

  const userMenuItems = [
    { to: '/profile',           label: 'My Profile',         Icon: IconProfile },
    { to: '/my-applications',   label: 'My Applications',    Icon: IconApps    },
    { to: '/colleges',          label: 'Browse Colleges',    Icon: IconCollege },
    
  ];

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────── */}
      <motion.nav
        className="nb-root"
        variants={navVariants}
        animate={scrolled ? 'scrolled' : 'top'}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <Link to="/" className="nb-logo" onClick={closeMobile}>
          <div className="nb-logo-icon" whileHover={{ rotate: 8, scale: 1.08 }} transition={{ type: 'spring', stiffness: 300 }}>
            <img src="/Logo.png" alt="Logo" />
          </div>
          <div className="nb-logo-text">
            <span className="nb-logo-brand">VAMSHI EDUCARE</span>
            <span className="nb-logo-sub">CAREER GUIDANCE CENTER</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nb-links">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`nb-link ${isActive(link.to) ? 'nb-link--active' : ''}`}>
              {link.label}
              {isActive(link.to) && (
                <motion.span className="nb-link-indicator" layoutId="nb-indicator" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="nb-right">
          {user ? (
            <div className="nb-avatar-wrap" ref={dropdownRef}>
              <motion.button
                className="nb-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                aria-label="User menu"
              >
                <span className="nb-avatar">{getInitial()}</span>
                <motion.span
                  className="nb-avatar-chevron"
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <IconChevron />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="nb-dropdown"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* header */}
                    <div className="nb-dd-header">
                      <div className="nb-dd-avatar">{getInitial()}</div>
                      <div className="nb-dd-info">
                        <span className="nb-dd-name">{user.first_name || 'User'}</span>
                        <span className="nb-dd-email">{user.email || ''}</span>
                      </div>
                    </div>
                    <div className="nb-dd-divider" />

                    {userMenuItems.map(({ to, label, Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        className={`nb-dd-item ${isActive(to) ? 'nb-dd-item--active' : ''}`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Icon />{label}
                      </Link>
                    ))}

                    <div className="nb-dd-divider" />
                    <button className="nb-dd-item nb-dd-logout" onClick={handleLogout}>
                      <IconLogout />Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/login" className="nb-cta">Login / Register</Link>
            </motion.div>
          )}
        </div>

        {/* Hamburger */}
        <motion.button
          ref={mobileMenuBtnRef}
          className="nb-hamburger"
          onClick={toggleMobile}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
        >
          <motion.span animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} />
          <motion.span animate={mobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }} />
          <motion.span animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} />
        </motion.button>
      </motion.nav>

      {/* ── MOBILE OVERLAY ─────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="nb-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU ────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            ref={mobileMenuRef}
            className="nb-mobile"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* mobile header */}
            <div className="nb-mob-header">
              <div className="nb-mob-logo">
                <div className="nb-mob-logo-icon">
                  <img src="/Logo.png" alt="Logo" />
                </div>
                <div>
                  <span className="nb-mob-brand">VAMSHI EDUCARE</span>
                  <small className="nb-mob-sub">CAREER GUIDANCE CENTER</small>
                </div>
              </div>
              <motion.button className="nb-mob-close" onClick={closeMobile} whileTap={{ scale: 0.9 }} aria-label="Close menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </motion.button>
            </div>

            {/* mobile links */}
            <nav className="nb-mob-links">
              {navLinks.map((link, i) => (
                <motion.div key={link.to} custom={i} variants={linkVariants} initial="hidden" animate="visible">
                  <Link
                    to={link.to}
                    className={`nb-mob-link ${isActive(link.to) ? 'nb-mob-link--active' : ''}`}
                    onClick={closeMobile}
                  >
                    <span className="nb-mob-link-dot" />
                    {link.label}
                    {isActive(link.to) && <span className="nb-mob-active-pill">Current</span>}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="nb-mob-divider" />

            {/* mobile user section */}
            {user ? (
              <div className="nb-mob-user-section">
                <motion.button
                  className="nb-mob-user-trigger"
                  onClick={() => setMobileSubOpen(!mobileSubOpen)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="nb-mob-user-row">
                    <div className="nb-mob-user-avatar">{getInitial()}</div>
                    <div className="nb-mob-user-info">
                      <span className="nb-mob-user-name">{user.first_name || 'User'}</span>
                      <span className="nb-mob-user-email">{user.email || ''}</span>
                    </div>
                  </div>
                  <motion.span
                    className="nb-mob-chevron"
                    animate={{ rotate: mobileSubOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <IconChevron />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {mobileSubOpen && (
                    <motion.div
                      className="nb-mob-sub"
                      variants={mobileSubVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {userMenuItems.map(({ to, label, Icon }, i) => (
                        <motion.div
                          key={to}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06 } }}
                        >
                          <Link
                            to={to}
                            className={`nb-mob-sub-item ${isActive(to) ? 'nb-mob-sub-item--active' : ''}`}
                            onClick={closeMobile}
                          >
                            <Icon />{label}
                          </Link>
                        </motion.div>
                      ))}
                      <div className="nb-mob-sub-divider" />
                      <motion.button
                        className="nb-mob-sub-item nb-mob-logout"
                        onClick={handleLogout}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.28 } }}
                      >
                        <IconLogout />Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="nb-mob-footer">
                <Link to="/login" className="nb-mob-cta" onClick={closeMobile}>Login / Register</Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;