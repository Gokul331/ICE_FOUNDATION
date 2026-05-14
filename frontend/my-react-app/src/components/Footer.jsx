import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer-premium">
      <div className="container">
        <div className="footer-premium-grid">
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-main">ACE</span>
              <span className="footer-logo-tagline">COUNSULTING</span>
            </Link>
            <p className="footer-description">
              Empowering students to achieve their academic dreams through personalized guidance, 
              scholarship support, and expert admission strategies since 2016.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="LinkedIn">🔗</a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/colleges">Colleges</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/college-suggestion">College Suggestion</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/application-form">Apply Now</Link></li>
              <li><a href="#">Scholarships</a></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4>Contact Info</h4>
            <div className="footer-contact-info">
              <p>📍 Chennai & Andhra Pradesh, India</p>
              <p>✉️ info@aceconsulting.in</p>
              <p>📞 +91 83309 14141</p>
              <p>📞 +91 98667 45085</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; {new Date().getFullYear()} ACE COUNSULTING. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
