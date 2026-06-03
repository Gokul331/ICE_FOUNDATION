import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-premium">
      <div className="container">
        <motion.div 
          className="footer-premium-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-main">VAMSHI EDUCARE</span>
            </Link>
            <p className="footer-description">
              Empowering students to achieve their academic dreams through personalized guidance, 
              scholarship support, and expert admission strategies.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">📸</a>
              <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">🔗</a>
              <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">📘</a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/colleges">Colleges</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/my-applications">My Applications</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/application-form">Apply Now</Link></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4>Contact Info</h4>
            <div className="footer-contact-info">
              <p>📍 Thiruvarur, Tamil Nadu</p>
              <p>✉️ <a href="mailto:info@vamshieducare.in">info@vamshieducare.in</a></p>
              <p>📞 <a href="tel:+918925262724">+91 89252 62724</a></p>
              <p>📞 <a href="tel:+919360705445">+91 93607 05445</a></p>
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