import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/contact.css';

const Contact = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    window.pickSubj = function(btn) {
      document.querySelectorAll('#subject-grid .subj-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };

    window.doSubmit = function(btn) {
      btn.querySelector('.btn-label').style.display = 'none';
      document.getElementById('form-spinner').style.display = 'block';
      btn.classList.add('loading');
      setTimeout(() => {
        document.getElementById('form-view').style.display = 'none';
        document.getElementById('success-view').style.display = 'block';
      }, 1800);
    };

    window.resetForm = function() {
      document.getElementById('form-view').style.display = '';
      document.getElementById('success-view').style.display = 'none';
      const btn = document.querySelector('.submit-btn');
      btn.querySelector('.btn-label').style.display = '';
      document.getElementById('form-spinner').style.display = 'none';
      btn.classList.remove('loading');
    };

    window.toggleFaq = function(el) {
      const ans = el.nextElementSibling;
      const isOpen = ans.classList.contains('open');
      document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
      if (!isOpen) {
        ans.classList.add('open');
        el.classList.add('open');
      }
    };
  }, []);

  return (
    <div className="contact-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section - 3D Animated */}
      <div className="contact-hero">
        <div className="hero-ring" style={{ width: '400px', height: '400px', top: '-150px', right: '-150px' }}></div>
        <div className="hero-ring" style={{ width: '280px', height: '280px', bottom: '-100px', left: '-80px' }}></div>
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Send your college plan questions
        </div>
        <h1>Talk to the ICE Foundation team<br />about your next step.</h1>
        <p>Whether you need help with matching, applications, or scholarships, our startup support team is here to help.</p>
      </div>

      {/* Info Bar */}
      <div className="info-bar">
        <div className="info-inner">
          <div className="info-item">
            <div className="info-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
            </div>
            <div>
              <div className="info-label">Phone</div>
              <div className="info-val">+91 8778635855</div>
              <div className="info-sub">Mon - Sat, 9 AM - 6 PM</div>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div className="info-label">Email</div>
              <div className="info-val">hello@icefoundations.com</div>
              <div className="info-sub">We reply within 24 hours</div>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <div className="info-label">Office</div>
              <div className="info-val">Puduchatram, Namakkal</div>
              <div className="info-sub">Tamil Nadu - 637 018</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="body-wrap">
        {/* Form Card */}
        <div className="form-card">
          <div id="form-view">
            <div className="form-title">Start your college plan</div>
            <div className="form-sub">Tell us about your goals and we'll connect you with tailored options and next-step support.</div>

            <div className="field">
              <div className="field-row">
                <div>
                  <label>First name</label>
                  <div className="input-wrap">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="text" placeholder="Arjun" />
                  </div>
                </div>
                <div>
                  <label>Last name</label>
                  <div className="input-wrap">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="text" placeholder="Kumar" />
                  </div>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Email address</label>
              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" placeholder="you@example.com" />
              </div>
            </div>

            <div className="field">
              <label>Phone number</label>
              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                </svg>
                <input type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="field">
              <label>I'm enquiring about</label>
              <div className="subject-grid" id="subject-grid">
                <button className="subj-chip active" onClick={(e) => window.pickSubj(e.target)}>Admissions strategy</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Scholarship support</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Course fit</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Application review</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Campus planning</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Other startup help</button>
              </div>
            </div>

            <div className="field">
              <label>How did you hear about us?</label>
              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                <select>
                  <option value="">Select a source...</option>
                  <option>Google Search</option>
                  <option>Social Media</option>
                  <option>Friend / Family</option>
                  <option>School Counselor</option>
                  <option>Newspaper / Magazine</option>
                  <option>Other</option>
                </select>
                <div className="select-arrow">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Your message</label>
              <div className="input-wrap">
                <svg style={{ top: '14px', transform: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <textarea placeholder="Tell us a little about yourself and what you're looking for..."></textarea>
              </div>
            </div>

            <button className="submit-btn" onClick={(e) => window.doSubmit(e.target)}>
              <span className="btn-label">Send message</span>
              <div className="spinner" id="form-spinner"></div>
            </button>
          </div>

          <div className="success-state" id="success-view">
            <div className="success-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3>Message sent!</h3>
            <p>Thank you for reaching out. One of our counselors will get back to you within 24 hours.</p>
            <button className="reset-btn" onClick={() => window.resetForm()}>Send another message</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Map Card */}
          <div className="map-card">
            <div className="map-visual">
              <div className="map-grid"></div>
              <svg style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '.12' }} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="60" x2="300" y2="60" stroke="#000000" strokeWidth="6"/>
                <line x1="0" y1="120" x2="300" y2="120" stroke="#000000" strokeWidth="3"/>
                <line x1="80" y1="0" x2="80" y2="180" stroke="#000000" strokeWidth="4"/>
                <line x1="180" y1="0" x2="180" y2="180" stroke="#000000" strokeWidth="4"/>
                <line x1="130" y1="60" x2="130" y2="180" stroke="#000000" strokeWidth="2"/>
                <line x1="0" y1="90" x2="80" y2="90" stroke="#000000" strokeWidth="2"/>
                <rect x="20" y="68" width="40" height="22" rx="3" fill="#000000" opacity=".5"/>
                <rect x="90" y="30" width="30" height="18" rx="3" fill="#000000" opacity=".4"/>
                <rect x="195" y="68" width="50" height="30" rx="3" fill="#000000" opacity=".3"/>
                <rect x="100" y="95" width="60" height="15" rx="3" fill="#000000" opacity=".35"/>
              </svg>
              <div className="map-pin">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="pin-pulse"></div>
                  <div className="pin-dot"></div>
                </div>
                <div className="pin-label">ICE FOUNDATION</div>
              </div>
            </div>
            <div className="map-footer">
              <div className="map-addr">Puduchatram<br />Namakkal, Tamil Nadu 637018</div>
              <button className="map-btn">Get directions</button>
            </div>
          </div>

          {/* Hours Card */}
          <div className="hours-card">
            <div className="hours-title">
              <div className="live-dot"></div>
              Office hours
            </div>
            <div className="hours-sub">Walk-ins welcome during open hours</div>
            <div className="hours-row">
              <span className="day">Monday<span className="today-badge">Today</span></span>
              <span className="time">9:00 AM - 6:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Tuesday</span>
              <span className="time">9:00 AM - 6:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Wednesday</span>
              <span className="time">9:00 AM - 6:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Thursday</span>
              <span className="time">9:00 AM - 6:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Friday</span>
              <span className="time">9:00 AM - 6:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Saturday</span>
              <span className="time">10:00 AM - 3:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Sunday</span>
              <span className="time closed">Closed</span>
            </div>
          </div>

          {/* Social Card */}
          <div className="social-card">
            <div className="social-title">Connect with us</div>
            <div className="social-links">
              <div className="social-link">
                <div className="s-icon">
                  <svg viewBox="0 0 24 24" fill="#000000">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <div className="s-name">Facebook</div>
                  <div className="s-handle">@icefoundation.in</div>
                </div>
              </div>
              <div className="social-link">
                <div className="s-icon">
                  <svg viewBox="0 0 24 24" fill="#000000">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <div>
                  <div className="s-name">Twitter</div>
                  <div className="s-handle">@icefoundation</div>
                </div>
              </div>
              <div className="social-link">
                <div className="s-icon">
                  <svg viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#333"/>
                        <stop offset="25%" stopColor="#333"/>
                        <stop offset="50%" stopColor="#333"/>
                        <stop offset="75%" stopColor="#333"/>
                        <stop offset="100%" stopColor="#333"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <div className="s-name">Instagram</div>
                  <div className="s-handle">@icefoundation</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Card */}
          <div className="faq-card">
            <div className="faq-header">Quick answers</div>
            <div className="faq-item">
              <div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}>
                <span>How soon will I hear back?</span>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div className="faq-a">We aim to respond to all enquiries within 24 hours on business days. For urgent queries, please call us directly.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}>
                <span>Is the initial consultation free?</span>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div className="faq-a">Yes! Your first 30-minute consultation with an ICE Foundation advisor is completely free with no obligations.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}>
                <span>Can I visit the office directly?</span>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div className="faq-a">Absolutely. Walk-ins are welcome during office hours. We recommend calling ahead so our team can prepare for your visit.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}>
                <span>Do you offer online counselling?</span>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div className="faq-a">Yes, we offer full online counselling via video call. Students from across India can access our services remotely.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="ft-logo"><span>ICE</span> Foundation</div>
        <div className="ft-copy">2025 ICE Foundation. Supporting future-ready students across India.</div>
      </footer>
    </div>
  );
};

export default Contact;