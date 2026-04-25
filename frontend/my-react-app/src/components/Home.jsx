import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getColleges, getCollegeCourses } from "../services/api";
import "../styles/home.css";
import Navbar from "./Navbar";

function Home() {
  const [colleges, setColleges] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollegesAndCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const collegesData = await getColleges();
        const collegesArray = Array.isArray(collegesData)
          ? collegesData
          : collegesData.results || [];

        // Fetch courses for each college (limit to first 8 for performance)
        const collegesWithCourses = await Promise.all(
          collegesArray.slice(0, 8).map(async (college) => {
            try {
              const courses = await getCollegeCourses(college.college_id);
              // Get only first 3 courses for display
              const topCourses = Array.isArray(courses) ? courses.slice(0, 3) : [];
              return {
                ...college,
                courses: topCourses,
              };
            } catch (err) {
              console.error(`Error fetching courses for college ${college.college_id}:`, err);
              return { ...college, courses: [] };
            }
          }),
        );

        setColleges(collegesWithCourses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching colleges:", err);
        setError("Failed to load colleges. Please try again later.");
        setColleges([]);
        setLoading(false);
      }
    };

    fetchCollegesAndCourses();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    // Optionally redirect to home page
    window.location.href = "/";
  };

  // Function to get college initials for logo fallback
  const getCollegeInitials = (name) => {
    if (!name) return "CO";
    const words = name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="home-container">
      <Navbar user={user} onLogout={handleLogout} />

      {/* HERO SECTION - Split Layout */}
      <section className="hero-split">
        <div className="hero-split-left">
          <div className="hero-badge-dark">
            <span className="badge-pulse"></span>
            Partnership with 100+ colleges across Tamilnadu
          </div>
          <h1 className="hero-title">
            <span className="line-1">Discover</span>
            <span className="line-2">Your Perfect</span>
            <span className="line-3">Future College</span>
          </h1>
          <p className="hero-desc">
            AI-powered college recommendations, scholarship discovery, and
            expert guidance — all in one place. Your dream institution awaits.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/college-suggestion" className="btn-dark">
                Get Personalized Suggestions
              </Link>
            ) : (
              <Link to="/register" className="btn-dark">
                Start Your Journey
              </Link>
            )}
            <Link to="/colleges" className="btn-outline">
              <span>Explore Colleges</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-num">100+</span>
              <span className="trust-label">Colleges</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-num">5k - 40k</span>
              <span className="trust-label">Scholarships</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-num">95%</span>
              <span className="trust-label">Success Rate</span>
            </div>
          </div>
        </div>
        <div className="hero-split-right">
          <div className="hero-visual-wrapper">
            {/* 3D Roadmap */}
            <div className="hero-roadmap">
              <div className="roadmap-header">
                <span className="roadmap-title">Your Path</span>
              </div>

              <div className="roadmap-track">
                <div className="roadmap-line"></div>

                <div className="roadmap-step">
                  <div className="step-marker">
                    <span className="step-num">01</span>
                  </div>
                  <div className="step-content">
                    <div className="step-icon">📝</div>
                    <div className="step-info">
                      <h4>Create Profile</h4>
                      <p>Tell us about your interests</p>
                    </div>
                  </div>
                </div>

                <div className="roadmap-step">
                  <div className="step-marker">
                    <span className="step-num">02</span>
                  </div>
                  <div className="step-content">
                    <div className="step-icon">🎯</div>
                    <div className="step-info">
                      <h4>Get Matched</h4>
                      <p>AI finds best colleges</p>
                    </div>
                  </div>
                </div>

                <div className="roadmap-step">
                  <div className="step-marker">
                    <span className="step-num">03</span>
                  </div>
                  <div className="step-content">
                    <div className="step-icon">✅</div>
                    <div className="step-info">
                      <h4>Apply & Secure</h4>
                      <p>One-click applications</p>
                    </div>
                  </div>
                </div>

                <div className="roadmap-destination">
                  <span>🎓</span>
                  <span>Dream College</span>
                </div>
              </div>
            </div>

            {/* Floating Visual Cards */}
            <div className="hero-visual">
              <div className="visual-card card-1">
                <div className="vc-icon">🎓</div>
                <div className="vc-text">Top Ranked</div>
              </div>
              <div className="visual-card card-2">
                <div className="vc-icon">💰</div>
                <div className="vc-text">Scholarships</div>
              </div>
              <div className="visual-card card-3">
                <div className="vc-icon">📚</div>
                <div className="vc-text">Courses</div>
              </div>
              <div className="visual-card card-4">
                <div className="vc-icon">🏆</div>
                <div className="vc-text">Expert Guide</div>
              </div>
              <div className="visual-bg-circle"></div>
              <div className="visual-bg-dots"></div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE SECTION */}
      <section className="marquee-section">
        <div className="marquee-track">
          <span>Engineering</span>
          <span className="dot">•</span>
          <span>Medical</span>
          <span className="dot">•</span>
          <span>Nursing</span>
          <span className="dot">•</span>
          <span>Allied Health Science</span>
          <span className="dot">•</span>
          <span>Arts & Science</span>
          <span className="dot">•</span>
          <span>Polytechnic</span>
          <span className="dot">•</span>
          <span>Law</span>
          <span className="dot">•</span>
          <span>Engineering</span>
          <span className="dot">•</span>
          <span>Medical</span>
          <span className="dot">•</span>
          <span>Nursing</span>
          <span className="dot">•</span>
          <span>Allied Health Science</span>
          <span className="dot">•</span>
          <span>Arts & Science</span>
          <span className="dot">•</span>
          <span>Polytechnic</span>
          <span className="dot">•</span>
          <span>Law</span>
          <span className="dot">•</span>
        </div>
      </section>

      {/* COLLEGES SECTION */}
      <section className="colleges-alt">
        <div className="colleges-alt-container">
          <div className="section-header-alt">
            <div className="section-label">Featured</div>
            <h2>Top Colleges For You</h2>
            <p>
              Explore India's premier institutions hand-picked based on your
              profile.
            </p>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading colleges...</p>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <div className="error-icon">!</div>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && colleges.length > 0 && (
            <div className="colleges-list">
              {colleges.map((college, index) => (
                <Link
                  key={college.college_id}
                  to={`/colleges/${college.college_id}`}
                  className="college-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="college-item-card">
                    <div className="college-item-logo">
                      {college.logo_url ? (
                        <img
                          src={college.logo_url}
                          alt={college.college_name}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.querySelector("span").style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span style={{ display: college.logo_url ? "none" : "flex" }}>
                        {getCollegeInitials(college.college_name)}
                      </span>
                      <h4>{college.college_name || "College Name"}</h4>
                    </div>
                    <div className="college-item-info">
                      <p>
                        {college.location_city || "City"},{" "}
                        {college.location_state || "State"}
                      </p>
                      {college.courses && college.courses.length > 0 && (
                        <>
                          <div className="college-label">Popular courses :</div>
                          <div className="college-item-courses">
                            {college.courses.slice(0, 2).map((c, i) => (
                              <span key={i}>
                                {c.course_name || c.course_code || "Course"}
                              </span>
                            ))}
                            {college.courses.length > 2 && (
                              <span className="more-courses">
                                +{college.courses.length - 2} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                      {(!college.courses || college.courses.length === 0) && (
                        <div className="college-label">Multiple courses available</div>
                      )}
                    </div>
                  </div>
                  <div className="college-item-right">
                    <span className="college-item-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && colleges.length === 0 && (
            <div className="no-colleges-container">
              <div className="no-colleges-icon">🏫</div>
              <h3>No Colleges Found</h3>
              <p>We couldn't find any colleges at the moment. Please check back later.</p>
            </div>
          )}

          <div className="view-all-wrap">
            <Link to="/colleges" className="btn-dark-outline">
              View All Colleges
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="bento-section">
        <div className="bento-container">
          <div className="section-label">Why Choose Us</div>
          <h2 className="section-title">Everything You Need in One Platform</h2>

          <div className="bento-grid">
            <div className="bento-card bento-large">
              <div className="flex gap-2 items-center">
                <div className="bento-icon">📈</div>
                <h3>Cutoff Prediction & College Suggestion</h3>
              </div>
              <p>
                Using historical cutoff data and trend analysis, our AI predicts
                your chances of admission at top colleges based on your entrance
                exam scores and category. Get realistic expectations and backup
                options instantly.
              </p>
              <ul className="feature-list">
                <li>
                  🎯 Personalized college suggestions based on your profile
                </li>
                <li>
                  📊 Real-time cutoff predictions for JEE, NEET, TNEA, and more
                </li>
                <li>💡 Data-driven insights to optimize your applications</li>
                <li>
                  📈 Track cutoff trends from previous years for informed
                  decisions
                </li>
              </ul>
              <div className="bento-visual">
                <Link to="/college-suggestion" className="btn-dark-outline">
                  Find Your Match →
                </Link>
              </div>
            </div>
            <div className="bento-card">
              <div className="flex gap-2 items-center">
                <div className="bento-icon">💎</div>
                <h3>Scholarship Finder</h3>
              </div>
              <p>
                Discover scholarships up to 40 lakhs with our comprehensive
                database.
              </p>
            </div>

            <div className="bento-card">
              <div className="flex gap-2 items-center">
                <div className="bento-icon">📊</div>
                <h3>Rankings & Reviews</h3>
              </div>
              <p>
                Real student reviews and official rankings to make informed
                decisions.
              </p>
            </div>

            <div className="bento-card">
              <div className="flex gap-2 items-center">
                <div className="bento-icon">🎯</div>
                <h3>Expert Counseling</h3>
              </div>
              <p>
                Get guidance from education experts with decades of experience.
              </p>
            </div>

            <div className="bento-card">
              <div className="flex gap-2 items-center">
                <div className="bento-icon">⚡</div>
                <h3>Quick Apply</h3>
              </div>
              <p>
                Apply to multiple colleges with a single application form. Save
                time and effort with our streamlined process.
              </p>
              <div className="quick-apply-logos">
                <span>IIT</span>
                <span>NIT</span>
                <span>IIIT</span>
                <span>AIIMS</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-number">100+</span>
            <span className="stat-text">Partner Colleges</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">₹5k - 40k</span>
            <span className="stat-text">Scholarship Amount</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">24/7</span>
            <span className="stat-text">Support Available</span>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-alt">
        <div className="cta-alt-bg"></div>
        <div className="cta-alt-content">
          <h2>Ready to Transform Your Future?</h2>
          <p>
            Join thousands of students who found their dream colleges through
            ICE Foundation.
          </p>
          <div className="cta-alt-buttons">
            <Link to="/register" className="btn-white">
              Get Started Free
            </Link>
            <Link to="/contact" className="btn-white-outline">
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER - DARK DESIGN */}
      <footer className="footer-dark">
        <div className="footer-dark-content">
          <div className="footer-dark-main">
            <div className="footer-dark-brand">
              <div className="footer-dark-logo">
                <span className="footer-logo-main">ICE</span>
                <span className="footer-logo-sub">Foundation</span>
              </div>
              <p className="footer-tagline">
                Smart College Prediction.
                <br />
                Expert Guidance. Seamless Admissions.
              </p>
            </div>

            <div className="footer-dark-links">
              <div className="footer-dark-col">
                <h4>Company</h4>
                <Link to="/about">About</Link>
                <Link to="/colleges">Colleges</Link>
                <Link to="/contact">Contact</Link>
              </div>
              <div className="footer-dark-col">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="footer-dark-bottom">
            <span>© 2025 ICE Foundation. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;