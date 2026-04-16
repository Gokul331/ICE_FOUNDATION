import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import Navbar from './Navbar';
function Home() {
  const [colleges, setColleges] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/colleges/')
      .then(response => response.json())
      .then(data => setColleges(data))
      .catch(error => console.error('Error fetching colleges:', error));
  }, []);

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

  // Logo array for college cards
  const logos = [
    <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
      <polygon points="29,1 57,14 57,46 29,61 1,46 1,14" fill="#291a8b" stroke="#C8922A" strokeWidth="2"/>
      <text x="29" y="28" fontFamily="Georgia,serif" fontSize="11" fontWeight="bold" fill="#F5D78A" textAnchor="middle">ST.</text>
      <text x="29" y="42" fontFamily="Georgia,serif" fontSize="9" fill="#F5D78A" textAnchor="middle">STEPH</text>
    </svg>,
    <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="29" cy="31" rx="27" ry="29" fill="#1A3A7A" stroke="#4A7ACB" strokeWidth="2"/>
      <ellipse cx="29" cy="31" rx="19" ry="21" fill="none" stroke="#A8C0EF" strokeWidth="1"/>
      <text x="29" y="28" fontFamily="Georgia,serif" fontSize="9" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">LOYOLA</text>
      <text x="29" y="40" fontFamily="Georgia,serif" fontSize="8" fill="#A8C0EF" textAnchor="middle">COLLEGE</text>
    </svg>,
    <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="50" height="46" rx="8" fill="#1B4DAB" stroke="none"/>
      <polygon points="29,10 50,22 50,38 29,50 8,38 8,22" fill="#E8640A" opacity="0.85"/>
      <rect x="22" y="24" width="14" height="14" rx="3" fill="#fff" opacity="0.9"/>
      <text x="29" y="34" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="900" fill="#1B4DAB" textAnchor="middle">SRM</text>
    </svg>,
    <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
      <circle cx="29" cy="31" r="27" fill="#FDF0D0" stroke="#C8922A" strokeWidth="2.5"/>
      <circle cx="29" cy="31" r="19" fill="none" stroke="#8B1A1A" strokeWidth="1"/>
      <circle cx="29" cy="31" r="5" fill="#8B1A1A"/>
      <text x="29" y="19" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#8B1A1A" textAnchor="middle">IIT</text>
      <text x="29" y="47" fontFamily="Georgia,serif" fontSize="6" fill="#8B1A1A" textAnchor="middle">MADRAS</text>
      <line x1="29" y1="4" x2="29" y2="11" stroke="#C8922A" strokeWidth="1.5"/>
      <line x1="29" y1="51" x2="29" y2="58" stroke="#C8922A" strokeWidth="1.5"/>
      <line x1="2" y1="31" x2="9" y2="31" stroke="#C8922A" strokeWidth="1.5"/>
      <line x1="49" y1="31" x2="56" y2="31" stroke="#C8922A" strokeWidth="1.5"/>
    </svg>,
    <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
      <path d="M29 1 L55 14 L55 48 L29 61 L3 48 L3 14 Z" fill="#2A4A8A" stroke="#6B8ED0" strokeWidth="1.5"/>
      <rect x="26" y="12" width="6" height="22" fill="#E8D080"/>
      <rect x="19" y="20" width="20" height="6" fill="#E8D080"/>
      <text x="29" y="50" fontFamily="Georgia,serif" fontSize="7" fill="#B8CCF0" textAnchor="middle">CHRIST</text>
    </svg>
  ];

  const locations = [
    'New Delhi, Delhi',
    'Chennai, Tamil Nadu',
    'Kattankulathur, Tamil Nadu',
    'Chennai, Tamil Nadu',
    'Bangalore, Karnataka'
  ];

  const descriptions = [
    'One of India\'s most prestigious liberal arts institutions under the University of Delhi, known for its rich heritage in humanities and science.',
    'A premier Jesuit institution ranked among the best colleges in South India, offering excellence in arts, science, and management studies.',
    'A leading deemed university specializing in engineering and technology, globally recognized for research and industry partnerships.',
    'India\'s #1 ranked institution for engineering and technology, known globally for innovation, research output, and outstanding faculty.',
    'A prestigious deemed university renowned for its multidisciplinary approach, holistic education model, and vibrant campus culture.'
  ];

  return (
    <div className="home-container">
      {/* NAVIGATION */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Your dream college is closer than you think.
          </div>
          <h1>Your Bridge from School to <em>Success.</em></h1>
          <p className="hero-sub">Expert consulting for 12th-grade students to find the perfect college, course, and scholarship — tailored just for you.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/colleges" className="btn-primary">Go to Colleges</Link>
            ) : (
              <Link to="/register" className="btn-primary">Get Started</Link>
            )}
            <Link to="/colleges" className="btn-secondary">Explore Colleges →</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"> 
              <div className="stat-num">100<span>+</span></div>
              <div className="stat-label">Partner Colleges</div>
            </div>
            <div className="stat">
              <div className="stat-num">5<span>k</span> - 40<span>k</span></div>
              <div className="stat-label">Scholarships Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COLLEGES */}
      <section className="colleges">
        <div className="colleges-container">
          <div className="section-header">
            <div className="section-tag">Featured Colleges</div>
            <h2>Find Your Perfect Institution</h2>
            <p>Explore top-ranked colleges across India, handpicked by our expert counselors.</p>
          </div>
          <div className="colleges-grid">
            {colleges.slice(0, 15).map((college, index) => (
              <div key={college.id} className="college-card">
                <div className="card-top">
                  <div className="card-logo-wrapper">
                    {logos[index % logos.length]}
                  </div>
                  <div className="card-info">
                    <div className="card-name">{college.name}</div>
                    <div className="card-location">{locations[index % locations.length]}</div>
                  </div>
                </div>
                <p className="card-desc">{descriptions[index % descriptions.length]}</p>
                <div className="card-footer">
                  {college.scholarship_available && <span className="scholarship-tag">Scholarship Available</span>}
                  <div className="card-arrow">→</div>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-container">
            <Link to="/colleges" className="btn-primary view-all-btn">
              View All Colleges →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="how-inner">
          <div className="section-header">
            <div className="section-tag">How It Works</div>
            <h2>Three Steps to Your Dream College</h2>
            <p>Our expert counselors guide you through every stage of the admission journey.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <h3>Create Your Profile</h3>
              <p>Share your academic interests, scores, and aspirations. Our system finds your best-fit options instantly.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h3>Get Expert Guidance</h3>
              <p>Meet one-on-one with our certified counselors who specialize in your preferred stream and colleges.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h3>Secure Admission</h3>
              <p>We manage applications, scholarship documents, and follow-ups — so you focus on what matters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <h2>Ready to Find Your Path?</h2>
        <p>Join thousands of students who found their perfect college with ICE Foundation's expert guidance.</p>
        <Link to="/register" className="cta-btn">Start Your Journey Today</Link>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo"><span>ICE</span> Foundation</div>
        <div className="footer-copy">© 2025 ICE Foundation. Empowering students across India.</div>
      </footer>
    </div>
  );
}

export default Home;