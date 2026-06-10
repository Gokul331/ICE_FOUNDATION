import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCollegeDetail,
  getCollegeCourses,
} from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/collegedetails.css";

// Professional icons as SVG components
const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const GraduationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

function CollegeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
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

        // Fetch courses
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
  }, [id]);

  // Set active category when courses change
  useEffect(() => {
    if (courses.length > 0 && !activeCategory) {
      const grouped = {};
      courses.forEach(course => {
        const cat = course.category || course.program_category;
        if (cat && !grouped[cat]) grouped[cat] = [];
        if (cat) grouped[cat].push(course);
      });
      const categories = Object.keys(grouped);
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [courses]);

  const handleApplyNow = (course) => {
    navigate("/application-form", { state: { college, course } });
  };

  const getDurationText = (degreeType) => {
    switch (degreeType?.toLowerCase()) {
      case 'ug': return '4 Years';
      case 'pg': return '2 Years';
      case 'diploma': return '3 Years';
      default: return 'Full Time';
    }
  };

  // Group courses by category
  const groupedCourses = {};
  courses.forEach(course => {
    const category = course.category || course.program_category || "general";
    if (!groupedCourses[category]) groupedCourses[category] = [];
    groupedCourses[category].push(course);
  });

  const categories = Object.keys(groupedCourses);
  const currentCourses = groupedCourses[activeCategory] || [];

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
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
    <div className="college-detail-page">
      <Navbar />

      {/* Hero Section - Dark Blue Background */}
      <section className="detail-hero">
        <div className="hero-glow" />
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-main">
              <div className="institution-badge">
                <BuildingIcon />
                <span>Institution</span>
              </div>
              <h1>{displayCollege.college_name}</h1>
              <div className="hero-location">
                <LocationIcon />
                <span>{displayCollege.location_city}, {displayCollege.location_state} - {displayCollege.location_pincode}</span>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">{displayCollege.short_name || "N/A"}</span>
                  <span className="stat-label">College Type</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">{categories.length}</span>
                  <span className="stat-label">Programs</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">{courses.length}+</span>
                  <span className="stat-label">Courses</span>
                </div>
              </div>
            </div>
            <div className="hero-action">
              <div className="admission-status">
                <span className="status-dot" />
                Admissions Open 2025-26
              </div>
              <button className="apply-primary-btn" onClick={() => courses.length > 0 && handleApplyNow(courses[0])}>
                Apply Now
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              Courses
            </button>
            <button
              className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="overview-section">
          <div className="container">
            <div className="overview-card">
              <div className="section-header">
                <BookIcon />
                <h2>About the Institution</h2>
              </div>
              <p className="overview-text">
                {displayCollege.address || `${displayCollege.college_name} is located in ${displayCollege.location_city}, ${displayCollege.location_state}. The institution is committed to providing quality education and fostering academic excellence.`}
              </p>

              <div className="info-grid">
                <div className="info-row">
                  <div className="info-label">Location</div>
                  <div className="info-value">
                    {displayCollege.location_city}, {displayCollege.location_state}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Pincode</div>
                  <div className="info-value">{displayCollege.location_pincode || "N/A"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">College Code</div>
                  <div className="info-value">{displayCollege.short_name || "N/A"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Total Courses</div>
                  <div className="info-value">{courses.length}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="contact-section">
                <div className="section-header">
                  <MailIcon />
                  <h3>Contact Information</h3>
                </div>
                <div className="contact-grid">
                  {displayCollege.email && (
                    <div className="contact-item">
                      <MailIcon />
                      <span>{displayCollege.email}</span>
                    </div>
                  )}
                  {displayCollege.phone && (
                    <div className="contact-item">
                      <PhoneIcon />
                      <span>{displayCollege.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <section className="courses-section">
          <div className="container">
            {/* Loading State */}
            {coursesLoading && (
              <div className="courses-loading">
                <div className="spinner"></div>
                <p>Loading courses...</p>
              </div>
            )}

            {/* Error State */}
            {coursesError && !coursesLoading && (
              <div className="courses-error">
                <div className="error-icon">!</div>
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
              </div>
            )}

            {/* Courses Display */}
            {!coursesLoading && !coursesError && categories.length > 0 && (
              <>
                {/* Category Filters */}
                <div className="category-filters">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      <span className="count">{groupedCourses[cat].length}</span>
                    </button>
                  ))}
                </div>

                {/* Courses Grid */}
                <div className="courses-grid">
                  {currentCourses.map((course, index) => (
                    <div key={course.id || course.course_id || index} className="course-card">
                      <div className="course-header">
                        <span className="course-code">{course.course_code || "N/A"}</span>
                        <span className="degree-badge">
                          {course.degree_type?.toUpperCase() || "COURSE"}
                        </span>
                      </div>
                      <h3 className="course-name">{course.course_name}</h3>
                      <div className="course-meta">
                        <div className="meta-item">
                          <ClockIcon />
                          <span>{getDurationText(course.degree_type)}</span>
                        </div>
                        <div className="meta-item">
                          <CalendarIcon />
                          <span>Full Time</span>
                        </div>
                      </div>
                      <button className="apply-course-btn" onClick={() => handleApplyNow(course)}>
                        Apply Now
                        <ChevronRightIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <section className="gallery-section">
          <div className="container">
            <div className="gallery-placeholder">
              <div className="placeholder-icon">🏛️</div>
              <p>Gallery images will be displayed here</p>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default CollegeDetail;