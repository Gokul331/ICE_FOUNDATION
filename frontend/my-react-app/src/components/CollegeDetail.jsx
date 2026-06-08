import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCollegeDetail,
  getCollegeCourses,
} from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/collegedetails.css";

const categoryConfig = {
  engineering: { name: "Engineering & Technology", icon: "⚙️", color: "#2563EB", bg: "#EFF6FF", gradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" },
  management: { name: "Management", icon: "📊", color: "#D97706", bg: "#FFFBEB", gradient: "linear-gradient(135deg, #D97706 0%, #B45309 100%)" },
  computer_applications: { name: "Computer Applications", icon: "💻", color: "#059669", bg: "#ECFDF5", gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
};

function CollegeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCoursesLoading(true);
        setCoursesError(null);

        // Fetch college details
        try {
          const collegeData = await getCollegeDetail(id);
          setCollege(collegeData);
        } catch (err) {
          console.error("Error fetching college:", err);
          setCollege({
            college_name: "College Details Unavailable",
            short_name: "N/A",
            location_city: "N/A",
            location_state: "N/A",
            location_pincode: "N/A",
            address: "Address information not available",
          });
        }

        // Fetch courses - NO FALLBACK DATA
        try {
          const coursesData = await getCollegeCourses(id);
          if (coursesData && Array.isArray(coursesData) && coursesData.length > 0) {
            setCourses(coursesData);
            setCoursesError(null);
          } else {
            setCourses([]);
            setCoursesError("No courses available for this college");
          }
        } catch (err) {
          console.error("Error fetching courses:", err);
          setCourses([]);
          setCoursesError("Unable to load courses. Please try again later.");
        } finally {
          setCoursesLoading(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
        setCoursesLoading(false);
      }
    };

    fetchData();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [id]);

  // Set active category when courses change
  useEffect(() => {
    if (courses.length > 0 && !activeCategory) {
      const grouped = {};
      courses.forEach(course => {
        const cat = course.category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(course);
      });
      const categories = Object.keys(grouped);
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [courses]);

  const handleApplyNow = (course) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/colleges/${id}`, course, college } });
    } else {
      navigate("/application-form", { state: { college, course } });
    }
  };

  const getDegreeBadge = (degreeType) => {
    const badges = {
      ug: { bg: "#10B981", label: "UG", icon: "🎓" },
      pg: { bg: "#F59E0B", label: "PG", icon: "📜" },
      diploma: { bg: "#3B82F6", label: "Diploma", icon: "📄" },
    };
    return badges[degreeType?.toLowerCase()] || { bg: "#6B7280", label: degreeType?.toUpperCase() || "N/A", icon: "📘" };
  };

  // Group courses by category
  const groupedCourses = {};
  courses.forEach(course => {
    let category = course.category;
    if (category === 'engineering') category = 'engineering';
    if (!groupedCourses[category]) groupedCourses[category] = [];
    groupedCourses[category].push(course);
  });

  const categories = Object.keys(groupedCourses);
  const currentCourses = groupedCourses[activeCategory] || [];

  if (loading) return (
    <div className="loading-screen-premium">
      <div className="premium-spinner" />
    </div>
  );

  const displayCollege = college || {
    college_name: "College Details",
    short_name: "N/A",
    location_city: "N/A",
    location_state: "N/A",
    location_pincode: "N/A",
  };

  return (
    <div className="college-details-page-premium">
      <Navbar user={user} onLogout={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate('/');
      }} />

      {/* Hero Section */}
      <section className="cd-hero-premium">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-info">
              <div className="hero-badge">🏛️ Institution</div>
              <h1>{displayCollege.college_name}</h1>
              <div className="hero-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {displayCollege.location_city}, {displayCollege.location_state} - {displayCollege.location_pincode}
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-value">{displayCollege.short_name || "N/A"}</span>
                  <span className="stat-label">College Code</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{categories.length}</span>
                  <span className="stat-label">Categories</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{courses.length}+</span>
                  <span className="stat-label">Courses</span>
                </div>
              </div>
            </div>
            <div className="hero-card">
              <div className="admission-badge">🎓 Admission Open 2025-26</div>
              <button className="btn-apply" onClick={() => handleApplyNow(courses[0])}>
                Apply Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <div className="container">
          <div className="tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              📖 OVERVIEW
            </button>
            <button className={`tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
              📚 COURSES
            </button>
            <button className={`tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
              📷 GALLERY
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="container">
            <div className="overview-card">
              <h2>About the Institution</h2>
              <p>{displayCollege.address || `${displayCollege.location_city} - ${displayCollege.location_pincode}, ${displayCollege.location_state}, India.`}</p>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div>
                    <label>Location</label>
                    <p>{displayCollege.location_city}, {displayCollege.location_state}</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📚</span>
                  <div>
                    <label>Categories</label>
                    <div className="category-tags">
                      {categories.slice(0, 3).map(cat => (
                        <span key={cat} className="category-tag" style={{ background: categoryConfig[cat]?.bg, color: categoryConfig[cat]?.color }}>
                          {categoryConfig[cat]?.icon} {categoryConfig[cat]?.name}
                        </span>
                      ))}
                      {categories.length > 3 && <span className="category-tag">+{categories.length - 3} more</span>}
                    </div>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">🎓</span>
                  <div>
                    <label>Total Programs</label>
                    <p>{courses.length} Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="courses-section">
          <div className="container">
            {/* Loading State */}
            {coursesLoading && (
              <div className="courses-loading">
                <div className="premium-spinner"></div>
                <p>Loading courses for {displayCollege.college_name}...</p>
              </div>
            )}

            {/* Error State */}
            {coursesError && !coursesLoading && (
              <div className="courses-error">
                <div className="error-icon">⚠️</div>
                <h3>Unable to Load Courses</h3>
                <p>{coursesError}</p>
                <button
                  className="retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Courses State */}
            {!coursesLoading && !coursesError && courses.length === 0 && (
              <div className="no-courses">
                <div className="no-courses-icon">📚</div>
                <h3>No Courses Available</h3>
                <p>This college currently doesn't have any courses listed.</p>
                <p>Please check back later or contact the admission office for more information.</p>
              </div>
            )}

            {/* Courses Display */}
            {!coursesLoading && !coursesError && categories.length > 0 && (
              <>
                {/* Category Filters */}
                <div className="category-filters">
                  {categories.map(cat => {
                    const config = categoryConfig[cat] || { name: cat.toUpperCase(), icon: "📘", color: "#6B7280", bg: "#F3F4F6" };
                    return (
                      <button
                        key={cat}
                        className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          background: activeCategory === cat ? config.color : 'transparent',
                          color: activeCategory === cat ? 'white' : config.color,
                          borderColor: config.color
                        }}
                      >
                        <span>{config.icon}</span>
                        {config.name}
                        <span className="count" style={{ background: activeCategory === cat ? 'rgba(255,255,255,0.2)' : config.bg }}>
                          {groupedCourses[cat].length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Courses Grid */}
                <div className="courses-grid">
                  {currentCourses.map((course) => {
                    const degreeBadge = getDegreeBadge(course.degree_type);
                    return (
                      <div key={course.id || course.course_id} className="course-item">
                        <div className="course-header">
                          <span className="course-code">{course.course_code}</span>
                          <span className="degree-tag" style={{ background: degreeBadge.bg }}>
                            {degreeBadge.label}
                          </span>
                        </div>
                        <h3 className="course-name">{course.course_name}</h3>
                        <div className="course-meta">
                          <span>⏱️ {course.degree_type === 'ug' ? '4 Years' : course.degree_type === 'pg' ? '2 Years' : '3 Years'}</span>
                          <span>📖 Full Time</span>
                        </div>
                        <button className="apply-btn" onClick={() => handleApplyNow(course)}>
                          Apply Now →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="gallery-section">
          <div className="container">
            <div className="gallery-placeholder">
              <p>📷 Gallery images will be displayed here</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default CollegeDetail;