import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getCourses, getColleges } from "../services/api";
import "../styles/courses.css";

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

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [collegesMap, setCollegesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ stream: "All", duration: "All" });
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, collegesData] = await Promise.all([getCourses(), getColleges()]);
        
        const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData.results || []);
        const collegesArray = Array.isArray(collegesData) ? collegesData : (collegesData.results || []);
        
        const collegeMap = {};
        collegesArray.forEach(c => {
          collegeMap[c.college_id] = {
            name: c.college_name,
            city: c.location_city,
            state: c.location_state,
            logo: c.logo_url
          };
        });
        
        setCollegesMap(collegeMap);
        setCourses(coursesArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load courses");
        setLoading(false);
      }
    };
    fetchData();

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const handleApplyNow = (course) => {
    const token = localStorage.getItem("token");
    const college = collegesMap[course.college];
    const collegeData = {
      college_id: course.college,
      college_name: college?.name || "Institution",
    };
    if (!token) {
      navigate("/login", { state: { from: `/courses`, course, college: collegeData } });
    } else {
      navigate("/application-form", { state: { college: collegeData, course } });
    }
  };

  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(c => {
      const name = c.course_name || "";
      const college = collegesMap[c.college]?.name || "";
      const matchesSearch = searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStream = filters.stream === "All" || (c.degree_type && c.degree_type.toLowerCase() === filters.stream.toLowerCase());
      
      return matchesSearch && matchesStream;
    });

    filtered.sort((a, b) => {
      const nameA = a.course_name || "";
      const nameB = b.course_name || "";
      return sortBy === "name" ? nameA.localeCompare(nameB) : 0;
    });

    return filtered;
  }, [courses, collegesMap, searchQuery, filters, sortBy]);

  return (
    <div className="courses-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ── HERO ── */}
      <section className="courses-hero">
        <div className="hero-bg-pattern" />
        <div className="container">
          <motion.div 
            className="courses-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label-premium">
              <span className="label-dot" />
              Academic Programs
            </div>
            <h1>Your Future <span className="title-highlight">Starts Here</span></h1>
            <p>Browse through specialized programs designed to empower your career journey.</p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <div className="filters-sticky-bar">
        <div className="container">
          <div className="filters-layout">

            {/* Sticky search box */}
            <div className="sticky-search-box">
              <svg className="sticky-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="sticky-search-input"
                placeholder="Search courses or specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-chips">
              {["All", "UG", "PG", "Diploma"].map(t => (
                <button
                  key={t}
                  className={`filter-chip ${filters.stream === t ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, stream: t })}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="sort-view-controls">
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort: A-Z</option>
                <option value="duration">Sort: Duration</option>
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
      <section className="results-section">
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
                Found <strong>{filteredAndSortedCourses.length}</strong> programs matching your criteria
              </div>

              <div className={`courses-${viewMode}`}>
                {filteredAndSortedCourses.map((course, i) => (
                  <SectionReveal key={course.course_id || i} className="course-card-wrapper" delay={i % 6 * 0.05}>
                    <div className="course-card-premium">
                      <div className="course-card-top">
                        <div className="course-badge">{course.degree_type || "UG"}</div>
                        <h3 className="course-name">{course.course_name}</h3>
                        <p className="course-clg">{collegesMap[course.college]?.name || "Institution"}</p>
                      </div>
                      
                      <div className="course-card-meta">
                        <div className="c-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {course.duration_years || "4"} Years
                        </div>
                        <div className="c-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                          Intake: {course.intake_seats || "60"}
                        </div>
                      </div>

                      <div className="course-card-fees">
                        <div className="fee-box">
                          <span className="fee-label">Management Fee</span>
                          <span className="fee-val">₹{course.tuition_fee_management || "1.2"}L /yr</span>
                        </div>
                        {course.scholarship_amount && (
                          <div className="scholar-label">Scholarship: ₹{course.scholarship_amount}</div>
                        )}
                      </div>
                      
                      <div className="course-card-actions">
                        <Link to={`/colleges/${course.college}`} className="btn-view-clg">View College</Link>
                        <button className="btn-apply-now" onClick={() => handleApplyNow(course)}>Apply Now</button>
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

export default Courses;
