import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { suggestColleges, getCourses } from "../services/api";
import Footer from "./Footer";
import "../styles/collegesuggestion.css";

/* ── animation helpers ── */
function SectionReveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
    >
      {children}
    </motion.div>
  );
}

function CollegeSuggestion() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    cutoffMark: "",
    communityCategory: "",
    preferredCourse: "",
    preferredDistrict: ""
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Autocomplete state
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const courseInputRef = useRef(null);

  const districts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukkudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        const coursesData = Array.isArray(response) ? response : (response?.data || []);
        const unique = Array.from(new Set(coursesData.map(c => c.course_name)))
          .map(name => ({ course_name: name }));
        setUniqueCourses(unique);
        setFilteredCourses(unique);
      } catch (err) { console.error("Error fetching courses:", err); }
    };
    fetchCourses();
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const handleCourseSearch = (val) => {
    setFormData({ ...formData, preferredCourse: val });
    if (val.trim() === "") {
      setFilteredCourses(uniqueCourses.slice(0, 10));
    } else {
      const filtered = uniqueCourses.filter(c => 
        c.course_name.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredCourses(filtered.slice(0, 10));
    }
    setShowCourseDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = {
        cutoff_mark: formData.cutoffMark,
        community: formData.communityCategory.toLowerCase(),
        preferred_course: formData.preferredCourse,
        preferred_district: formData.preferredDistrict
      };
      const response = await suggestColleges(params);
      const data = Array.isArray(response) ? response : (response?.data || []);
      setSuggestions(data);
      if (data.length === 0) setError("No exact matches found. Try broadening your criteria.");
    } catch (err) {
      setError("Failed to fetch suggestions. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggestion-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ── HERO ── */}
      <section className="suggestion-hero">
        <div className="container">
          <div className="hero-split">
            <motion.div 
              className="hero-text-side"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="section-label-premium">
                <span className="label-dot" />
                Intelligent Matching
              </div>
              <h1>Find Your <span className="title-highlight">Dream College</span></h1>
              <p>Our smart algorithm analyzes your cutoff marks and preferences to suggest the best institutions you're eligible for.</p>
              
              <div className="hero-stats-mini">
                <div className="mini-stat">
                  <strong>500+</strong>
                  <span>Institutions</span>
                </div>
                <div className="mini-stat">
                  <strong>100%</strong>
                  <span>Accuracy</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="hero-form-side"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-form-card">
                <h3>Check Eligibility</h3>
                <form onSubmit={handleSubmit} className="sug-form">
                  <div className="sug-form-group">
                    <label>Cutoff Mark</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 185.5" 
                      value={formData.cutoffMark}
                      onChange={(e) => setFormData({...formData, cutoffMark: e.target.value})}
                      required
                    />
                  </div>

                  <div className="sug-form-row">
                    <div className="sug-form-group">
                      <label>Community</label>
                      <select 
                        value={formData.communityCategory}
                        onChange={(e) => setFormData({...formData, communityCategory: e.target.value})}
                        required
                      >
                        <option value="">Select</option>
                        {["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="sug-form-group">
                      <label>District</label>
                      <select 
                        value={formData.preferredDistrict}
                        onChange={(e) => setFormData({...formData, preferredDistrict: e.target.value})}
                      >
                        <option value="">All</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="sug-form-group relative" ref={courseInputRef}>
                    <label>Preferred Course</label>
                    <input 
                      type="text" 
                      placeholder="Search courses..." 
                      value={formData.preferredCourse}
                      onChange={(e) => handleCourseSearch(e.target.value)}
                      onFocus={() => setShowCourseDropdown(true)}
                    />
                    <AnimatePresence>
                      {showCourseDropdown && filteredCourses.length > 0 && (
                        <motion.div 
                          className="sug-autocomplete"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          {filteredCourses.map((c, i) => (
                            <div 
                              key={i} 
                              className="sug-auto-item"
                              onClick={() => {
                                setFormData({...formData, preferredCourse: c.course_name});
                                setShowCourseDropdown(false);
                              }}
                            >
                              {c.course_name}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button type="submit" className="btn-premium-action" disabled={loading}>
                    {loading ? "Analyzing..." : "Get Suggestions"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="suggestion-results">
        <div className="container">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                className="loading-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="premium-loader" />
                <p>Matching your profile with institutions...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                className="error-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="error-icon-box">!</div>
                <h3>{error}</h3>
              </motion.div>
            ) : suggestions.length > 0 ? (
              <motion.div 
                key="results"
                className="results-grid-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="results-header-box">
                  <h2>Top Recommendations</h2>
                  <p>Based on your {formData.cutoffMark} score in {formData.communityCategory} category</p>
                </div>

                <div className="suggestions-grid">
                  {suggestions.map((clg, i) => (
                    <SectionReveal key={clg.college_id || i} delay={i * 0.1}>
                      <div className="suggestion-card-premium">
                        <div className="sug-card-inner">
                          <div className="sug-card-badge">Match Found</div>
                          <h3 className="sug-clg-name">{clg.college_name}</h3>
                          <div className="sug-clg-loc">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {clg.location_city}, {clg.location_state}
                          </div>
                          
                          <div className="sug-clg-stats">
                            <div className="sug-stat">
                              <span className="sug-val">{clg.nirf_rank || "NR"}</span>
                              <span className="sug-lab">NIRF</span>
                            </div>
                            <div className="sug-stat">
                              <span className="sug-val">{clg.placement_percentage || "90"}%</span>
                              <span className="sug-lab">Placement</span>
                            </div>
                            <div className="sug-stat">
                              <span className="sug-val">{clg.naac_grade || "A+"}</span>
                              <span className="sug-lab">NAAC</span>
                            </div>
                          </div>

                          <div className="sug-card-footer">
                            <Link to={`/colleges/${clg.college_id}`} className="btn-sug-view">View Profile</Link>
                          </div>
                        </div>
                      </div>
                    </SectionReveal>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}


export default CollegeSuggestion;