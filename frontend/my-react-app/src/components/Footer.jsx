import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Social media icons as SVG components
  const InstagramIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );

  const LinkedinIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );

  const LocationIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  return (
    <footer className="footer-premium">
      <div className="footer-bg-pattern" />
      <div className="container">
        <motion.div
          className="footer-premium-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-main">VAMSHI EDUCARE</span>
            </Link>
            <p className="footer-description">
              Empowering students to achieve their academic dreams through personalized guidance,
              scholarship support, and expert admission strategies.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <LinkedinIcon />
              </a>
              <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/colleges">Colleges</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/my-applications">My Applications</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/application-form">Apply Now</Link></li>
              <li><Link to="/scholarships">Scholarships</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact-col">
            <h4>Contact Info</h4>
            <div className="footer-contact-info">
              <p>
                <LocationIcon />
                <span>Thiruvarur, Tamil Nadu</span>
              </p>
              <p>
                <MailIcon />
                <a href="mailto:info@vamshieducare.in">info@vamshieducare.in</a>
              </p>
              <p>
                <PhoneIcon />
                <a href="tel:+918925262724">+91 89252 62724</a>
              </p>
              <p>
                <PhoneIcon />
                <a href="tel:+919360705445">+91 93607 05445</a>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="footer-bottom-bar"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p>&copy; {currentYear} VAMSHI EDUCARE. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;