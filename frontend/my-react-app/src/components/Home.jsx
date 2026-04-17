import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import Navbar from './Navbar';

function Home() {
  const [colleges, setColleges] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch colleges
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/colleges/')
      .then(res => res.json())
      .then(data => {
        setColleges(data);
        setLoading(false);
        
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load colleges");
        setLoading(false);
      });
  }, []);
 

  // Get user from localStorage
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

  return (
    <div className="home-container">

      {/* NAVBAR */}
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

          <h1>
            Your Bridge from School to <em>Success.</em>
          </h1>

          <p className="hero-sub">
            Expert consulting for 12th-grade students to find the perfect college, course, and scholarship — tailored just for you.
          </p>

          <div className="hero-actions">
            {user ? (
              <Link to="/colleges" className="btn-primary">
                Go to Colleges
              </Link>
            ) : (
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            )}
            <Link to="/colleges" className="btn-secondary">
              Explore Colleges →
            </Link>
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

      {/* COLLEGES */}
      <section className="colleges">
        <div className="colleges-container">

          <div className="section-header">
            <div className="section-tag">Featured Colleges</div>
            <h2>Find Your Perfect Institution</h2>
            <p>Explore top-ranked colleges across India.</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="loading">Loading colleges...</div>
          )}

          {/* Error */}
          {error && (
            <div className="error">{error}</div>
          )}

          {/* Colleges Grid */}
          {!loading && !error && (
            <div className="colleges-grid">
              {colleges.slice(0, 15).map((college) => (
                <div key={college.id} className="college-card">

                  {/* TOP */}
                  <div className="card-top">
                    <div className="card-logo-wrapper">

                      {/* Image or fallback */}
                      {college.image ? (
                        <img
                         src={`http://127.0.0.1:8000${college.image}`}
                          alt={college.name}
                        />
                      ) : (
                        <div className="logo-fallback">
                          {college.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="card-info">
                      <div className="card-name">{college.name}</div>
                      <div className="card-location">
                        {college.district}, {college.state}
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="card-desc">
                    {college.description}
                  </p>

                  {/* COURSES */}
                  <div className="course-list">
                    {college.courses?.slice(0, 3).map(course => (
                      <span key={course.id} className="course-chip">
                        {course.name} ({course.cutoff_oc})
                      </span>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="card-footer">
                    {college.scholarship_available && (
                      <span className="scholarship-tag">
                        Scholarship Available
                      </span>
                    )}
                    <div className="card-arrow">→</div>
                  </div>

                </div>
              ))}
            </div>
          )}

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
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <h3>Create Profile</h3>
              <p>Tell us your interests and marks.</p>
            </div>

            <div className="step">
              <div className="step-num">02</div>
              <h3>Get Guidance</h3>
              <p>Expert counselling for best colleges.</p>
            </div>

            <div className="step">
              <div className="step-num">03</div>
              <h3>Secure Admission</h3>
              <p>We handle applications & scholarships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Ready to Find Your Path?</h2>
        <p>Join thousands of students today.</p>
        <Link to="/register" className="cta-btn">
          Start Your Journey
        </Link>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">
          <span>ICE</span> Foundation
        </div>
        <div className="footer-copy">
          © 2025 ICE Foundation.
        </div>
      </footer>

    </div>
  );
}

export default Home;