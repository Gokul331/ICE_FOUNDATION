import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { getColleges, getCollegeCourses } from "../services/api";
import Footer from "./Footer";
import "../styles/colleges.css";

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const inView = window.innerWidth < 768 ? true : false; // simplified for long lists
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

function Colleges() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: "All" });
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const data = await getColleges();
        const collegesArray = Array.isArray(data) ? data : (data.results || []);
        setColleges(collegesArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching colleges:", err);
        setError("Failed to load colleges");
        setLoading(false);
      }
    };
    fetchColleges();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const handleApplyNow = (college) => {
    const token = localStorage.getItem("token");
    const collegeData = {
      college_id: college.college_id || college.id,
      college_name: college.college_name || college.name,
    };
    if (!token) {
      navigate("/login", { 
        state: { 
          from: `/colleges/${college.college_id || college.id}`, 
          college: collegeData, 
          quotaType: "management" 
        } 
      });
    } else {
      navigate("/application-form", { state: { college: collegeData, quotaType: "management" } });
    }
  };

  const getLogoLetters = (name) => {
    if (!name) return "CL";
    return name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  };

  const filteredAndSortedColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      const name = college.college_name || college.name || "";
      const city = college.location_city || college.district || "";
      const matchesSearch = searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const type = college.type || "Private";
      const matchesType = filters.type === "All" || type.toLowerCase() === filters.type.toLowerCase();
      
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      const nameA = a.college_name || a.name || "";
      const nameB = b.college_name || b.name || "";
      switch (sortBy) {
        case "name": return nameA.localeCompare(nameB);
        case "nirf": return (a.nirf_rank || 999) - (b.nirf_rank || 999);
        default: return 0;
      }
    });

    return filtered;
  }, [colleges, searchQuery, filters, sortBy]);

  return (
    <div className="colleges-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ── HERO ── */}
      <section className="colleges-hero">
        <div className="hero-bg-pattern" />
        <div className="container">
          <motion.div 
            className="colleges-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label-premium">
              <span className="label-dot" />
              Institutions Directory
            </div>
            <h1>Explore Top <span className="title-highlight">Colleges</span></h1>
            <p>Discover India's premier educational institutions tailored to your career aspirations.</p>
            
            <div className="hero-search-box">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by college name or city..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <div className="filters-sticky-bar">
        <div className="container">
          <div className="filters-layout">
            <div className="filter-chips">
              {["All", "Government", "Private", "Autonomous"].map(t => (
                <button 
                  key={t}
                  className={`filter-chip ${filters.type === t ? "active" : ""}`}
                  onClick={() => setFilters({ type: t })}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="sort-view-controls">
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort: Name A-Z</option>
                <option value="nirf">Sort: NIRF Rank</option>
              </select>
              <div className="view-toggle">
                <button className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`vt-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <section className="results-section premium-3d-wrap">
        <div className="container">
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>{error}</h3>
              <button onClick={() => window.location.reload()} className="btn-dark">Try Again</button>
            </div>
          ) : (
            <>
              <div className="results-count">
                Showing <strong>{filteredAndSortedColleges.length}</strong> institutions found
              </div>

              <div className={`colleges-${viewMode}`}>
                {filteredAndSortedColleges.map((college, i) => (
                  <SectionReveal key={college.college_id || college.id} className="college-card-wrapper" delay={i % 6 * 0.05}>
                    <div className="college-card-premium card-3d">
                      <div className="card-image-box">
                        <img 
                          src={college.image_url || `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80`} 
                          alt="College" 
                        />
                        <div className="card-badge">{college.type || "Private"}</div>
                        <motion.button 
                          className="card-wishlist"
                          whileTap={{ scale: 0.8 }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        </motion.button>
                      </div>
                      
                      <div className="card-details">
                        <div className="card-top">
                          <div className="card-logo">
                            {getLogoLetters(college.college_name || college.name)}
                          </div>
                          <div className="card-loc">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {college.location_city || college.district}, {college.state || "TN"}
                          </div>
                        </div>
                        
                        <h3 className="card-name">{college.college_name || college.name}</h3>
                        
                        <div className="card-stats">
                          <div className="c-stat">
                            <span className="c-stat-val">{college.nirf_rank || "NR"}</span>
                            <span className="c-stat-label">NIRF</span>
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-val">{college.placement_percentage || "90"}%</span>
                            <span className="c-stat-label">Placed</span>
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-val">Grade</span>
                            <span className="c-stat-label">{college.naac_grade || "A+"}</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <Link to={`/colleges/${college.college_id || college.id}`} className="btn-view">
                            View Details
                          </Link>
                          <button className="btn-apply-card" onClick={() => handleApplyNow(college)}>
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}


export default Colleges;