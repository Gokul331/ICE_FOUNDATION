import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { getColleges, getCollegeCourses } from "../services/api";
import Footer from "./Footer";
import "../styles/colleges.css";
import { FaBars, FaExternalLinkAlt, FaHeart, FaMapMarkerAlt, FaSearch, FaTh } from "react-icons/fa";

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function CollegeImageDisplay({ college, getLogoLetters }) {
  const allImages = Array.isArray(college.all_images) ? college.all_images.filter(Boolean) : [];
  const fallbackLogo = college.logo_url || "";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasLogoError, setHasLogoError] = useState(false);

  const rotationInterval = 5000;
  const zoomAmount = 1.03;

  useEffect(() => {
    if (allImages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, rotationInterval);

    return () => window.clearInterval(interval);
  }, [allImages.length, rotationInterval]);

  const hasImages = allImages.length > 0;
  const activeImage = hasImages ? allImages[currentImageIndex] : fallbackLogo;
  const shouldShowLogo = !hasImages && Boolean(fallbackLogo) && !hasLogoError;

  return (
    <div className="card-image-box">
      {shouldShowLogo ? (
        <motion.div
          className="card-image-logo-shell"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <img
            src={activeImage}
            alt={college.college_name || college.name}
            className="card-image logo-image"
            onError={() => setHasLogoError(true)}
          />
          <div className="logo-label-overlay">logo</div>
        </motion.div>
      ) : hasImages ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={college.college_name || college.name}
            className="card-image"
            initial={{ opacity: 0, scale: zoomAmount + 0.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: zoomAmount }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </AnimatePresence>
      ) : (
        <div className="card-image-placeholder">
          <div className="card-image-placeholder-badge">
            {getLogoLetters(college.college_name || college.name)}
          </div>
          <div className="logo-label-overlay">logo</div>
        </div>
      )}
    </div>
  );
}

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
                <FaSearch className="search-icon" />
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

            {/* Sticky search box */}
            <div className="sticky-search-box">
              <FaSearch className="sticky-search-icon" />
              <input
                type="text"
                className="sticky-search-input"
                placeholder="Search colleges or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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
                  <FaTh />
                </button>
                <button className={`vt-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                  <FaBars />
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
                      <CollegeImageDisplay college={college} getLogoLetters={getLogoLetters} />
                      
                        <div className="card-badge">{college.type || "Private"}</div>
                        <motion.button 
                          className="card-wishlist"
                          whileTap={{ scale: 0.8 }}
                        >
                          <FaHeart />
                        </motion.button>
                     
                      
                      <div className="card-details">
                        <div className="card-top">
                          <div className="card-logo">
                            {getLogoLetters(college.college_name || college.name)}
                          </div>
                          <div className="card-loc">
                            <FaMapMarkerAlt />
                            {college.location_city || college.district}, {college.state || "TN"}
                          </div>
                        </div>
                        
                        <h3 className="card-name">{college.college_name || college.name}</h3>
                        
                        <div className="card-stats">
                          <div className="c-stat">
                             <span className="c-stat-label">TNEA Code</span>
                            <span className="c-stat-val">{college.counselling_code}</span>
                           
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-label">Placement</span>
                            <span className="c-stat-val">{college.placement_percentage || "90"}%</span>
                            
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-label">Website</span>
                            <a
                              href={college.website_url || "#"}
                              className="website-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaExternalLinkAlt className="website-icon"/>
                            </a>
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