import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCollegeDetail,
  getCollegeCourses,
} from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/collegedetails.css";

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

// Category configuration
const categoryConfig = {
  engineering: { name: "Engineering & Technology", icon: "⚙️", color: "#2196F3", bgColor: "#E3F2FD" },
  arts_science: { name: "Arts & Science", icon: "🎨", color: "#9C27B0", bgColor: "#F3E5F5" },
  polytechnic: { name: "Polytechnic", icon: "🔧", color: "#FF9800", bgColor: "#FFF3E0" },
  allied_health_science: { name: "Allied Health Sciences", icon: "🏥", color: "#4CAF50", bgColor: "#E8F5E9" },
  medical: { name: "Medical", icon: "💊", color: "#F44336", bgColor: "#FFEBEE" },
  law: { name: "Law", icon: "⚖️", color: "#3F51B5", bgColor: "#E8EAF6" },
  nursing: { name: "Nursing", icon: "👩‍⚕️", color: "#00BCD4", bgColor: "#E0F7FA" },
  management: { name: "Management", icon: "📊", color: "#FFC107", bgColor: "#FFF8E1" },
  computer_applications: { name: "Computer Applications", icon: "💻", color: "#607D8B", bgColor: "#ECEFF1" },
  pharmacy: { name: "Pharmacy", icon: "💊", color: "#795548", bgColor: "#EFEBE9" },
  agriculture: { name: "Agricultural Science", icon: "🌾", color: "#8BC34A", bgColor: "#F1F8E9" },
  physiotherapy: { name: "Physiotherapy", icon: "🦵", color: "#009688", bgColor: "#E0F2F1" },
  occupational_therapy: { name: "Occupational Therapy", icon: "🧑‍🦽", color: "#CDDC39", bgColor: "#F9FBE7" },
  architecture: { name: "Architecture", icon: "🏛️", color: "#FF5722", bgColor: "#FBE9E7" },
  education: { name: "Education", icon: "📚", color: "#9E9E9E", bgColor: "#F5F5F5" },
  physical_education: { name: "Physical Education", icon: "🏃", color: "#E91E63", bgColor: "#FCE4EC" },
};


function CollegeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [groupedCourses, setGroupedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        setLoading(true);
        
        // Fetch college details
        const collegeData = await getCollegeDetail(id);
        console.log("College data:", collegeData);
        setCollege(collegeData);

        // Fetch courses
        let coursesList = [];
        try {
          const coursesData = await getCollegeCourses(id);
          console.log("Raw courses data from API:", coursesData);
          
          if (coursesData && Array.isArray(coursesData) && coursesData.length > 0) {
            coursesList = coursesData;
          } else {
            // Use mock data if API returns empty
            console.log("No courses from API, using mock data");
            coursesList = MOCK_COURSES;
          }
        } catch (err) {
          console.error("Error fetching courses:", err);
          // Use mock data on error
          coursesList = MOCK_COURSES;
        }
        
        console.log("Final courses list:", coursesList);
        setCourses(coursesList);
        
        // Group courses by category
        const grouped = {};
        coursesList.forEach(course => {
          let category = course.category || 'engineering';
          
          // Normalize category
          category = category.toLowerCase().replace(/\s+/g, '_');
          
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(course);
        });
        
        console.log("Grouped courses:", grouped);
        setGroupedCourses(grouped);
        
        // Initialize expanded state - expand all categories
        const initialExpanded = {};
        Object.keys(grouped).forEach(cat => {
          initialExpanded[cat] = true;
        });
        setExpandedCategories(initialExpanded);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching college:", err);
        setError("College not found");
        
        // Still set mock courses even if college fetch fails
        setCourses(MOCK_COURSES);
        const grouped = { engineering: MOCK_COURSES };
        setGroupedCourses(grouped);
        setExpandedCategories({ engineering: true });
        
        setLoading(false);
      }
    };
    
    fetchCollegeData();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate('/');
  };

  const handleApplyNow = (course) => {
    const token = localStorage.getItem("token");
    const selectedQuota = "management";
    
    if (!token) {
      navigate("/login", { state: { from: `/colleges/${id}`, course, college, quotaType: selectedQuota } });
    } else {
      navigate("/application-form", { state: { college, course, quotaType: selectedQuota } });
    }
  };

  const getAllImages = () => {
    const images = [];
    if (college?.banner_image) images.push({ url: college.banner_image, title: "College Banner" });
    if (college?.college_images && Array.isArray(college.college_images)) {
      college.college_images.forEach((img, i) => images.push({ url: img, title: `Campus View ${i+1}` }));
    }
    if (college?.campus_images && Array.isArray(college.campus_images)) {
      college.campus_images.forEach((img, i) => images.push({ url: img, title: `Campus ${i+1}` }));
    }
    return images;
  };

  const allImages = getAllImages();

  const getDegreeBadge = (degreeType) => {
    const badges = {
      ug: { bg: "#4CAF50", label: "UG" },
      pg: { bg: "#FF9800", label: "PG" },
      diploma: { bg: "#2196F3", label: "Diploma" },
      phd: { bg: "#9C27B0", label: "PhD" },
      integrated: { bg: "#F44336", label: "Integrated" },
    };
    return badges[degreeType?.toLowerCase()] || { bg: "#666", label: degreeType?.toUpperCase() || "N/A" };
  };

  const getDuration = (degreeType) => {
    const durations = {
      ug: '4 Years',
      pg: '2 Years',
      diploma: '3 Years',
      phd: '3-5 Years',
      integrated: '5 Years',
    };
    return durations[degreeType?.toLowerCase()] || 'Varies';
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (loading) return (
    <div className="loading-screen-premium">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="premium-spinner" />
    </div>
  );
  
  if (error && !college) return (
    <div className="error-page-premium">
      <Navbar />
      <div className="container">
        <h2>{error || "Institution not found"}</h2>
        <Link to="/colleges" className="btn-premium">Return to List</Link>
      </div>
    </div>
  );

  // If college is null but we have mock data, create a default college object
  const displayCollege = college || {
    college_name: "DHANALAKSHMI SRINIVASAN UNIVERSITY",
    short_name: "DSU",
    location_city: "Chengalpattu",
    location_state: "Tamil Nadu",
    address: "No. 6, GST Road, Mamandur, Chengalpattu, Tamil Nadu 603 111"
  };

  return (
    <div className="college-details-page-premium">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="cd-hero-premium">
        <div className="container">
          <div className="cd-hero-layout">
            <div className="cd-hero-info">
              <div className="section-label-premium">
                <span className="label-dot" />
                Institution
              </div>
              <h1>{displayCollege.college_name}</h1>
              <div className="cd-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {displayCollege.location_city}, {displayCollege.location_state}
              </div>
              <div className="cd-quick-stats">
                <div className="stat-item">
                  <strong>{displayCollege.short_name || "-"}</strong>
                  <span>College Code</span>
                </div>
                <div className="stat-item">
                  <strong>{Object.keys(groupedCourses).length || "0"}</strong>
                  <span>Categories</span>
                </div>
                <div className="stat-item">
                  <strong>{courses.length || "0"}+</strong>
                  <span>Courses</span>
                </div>
              </div>
            </div>

            <div className="cd-hero-action-card">
              <div className="action-inner">
                <div className="admission-status">🎓 Admission Open 2025-26</div>
                <button className="btn-apply-full" onClick={() => handleApplyNow(courses[0])}>
                  Apply Now →
                </button>
                <div className="action-features">
                  <span>✓ Expert Counseling</span>
                  <span>✓ Direct Admission Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="cd-tabs-wrapper">
        <div className="container">
          <div className="cd-tabs-nav">
            {['overview', 'courses', 'gallery'].map(t => (
              <button 
                key={t} 
                className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t === 'courses' ? '📚 COURSES' : t === 'gallery' ? '📷 GALLERY' : '📖 OVERVIEW'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container cd-main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SectionReveal className="cd-content-section">
                <h3>About the Institution</h3>
                <p className="cd-desc-text">
                  {displayCollege.address || "Leading educational institution dedicated to academic excellence and holistic student development."}
                </p>
                <div className="cd-details-grid">
                  <div className="detail-box">
                    <label>📍 Location</label>
                    <span>{displayCollege.location_city}, {displayCollege.location_state}</span>
                  </div>
                  <div className="detail-box">
                    <label>📚 Categories</label>
                    <div className="category-tags">
                      {Object.keys(groupedCourses).slice(0, 6).map(cat => (
                        <span key={cat} className="category-tag" style={{ 
                          backgroundColor: categoryConfig[cat]?.bgColor || "#f0f0f0", 
                          color: categoryConfig[cat]?.color || "#666" 
                        }}>
                          {categoryConfig[cat]?.icon} {categoryConfig[cat]?.name || cat.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ))}
                      {Object.keys(groupedCourses).length > 6 && (
                        <span className="category-tag">+{Object.keys(groupedCourses).length - 6} more</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-box">
                    <label>🎓 Total Programs</label>
                    <span>{courses.length} Courses</span>
                  </div>
                </div>
              </SectionReveal>
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="cd-content-section">
                <div className="section-header-flex">
                  <h3>Academic Programs by Category</h3>
                  <span className="total-courses-badge">{courses.length} Programs Available</span>
                </div>

                {/* Courses by Category */}
                <div className="courses-by-category">
                  {Object.entries(groupedCourses).length === 0 ? (
                    <div className="no-courses-message">
                      <p>No courses available for this institution.</p>
                    </div>
                  ) : (
                    Object.entries(groupedCourses).map(([category, categoryCourses]) => {
                      const config = categoryConfig[category] || {
                        name: category.replace(/_/g, ' ').toUpperCase(),
                        icon: "📘",
                        color: "#666",
                        bgColor: "#f5f5f5"
                      };
                      const isExpanded = expandedCategories[category];
                      
                      return (
                        <motion.div
                          key={category}
                          className="category-section"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div 
                            className="category-header"
                            onClick={() => toggleCategory(category)}
                            style={{ 
                              background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
                              borderLeftColor: config.color
                            }}
                          >
                            <div className="category-title">
                              <span className="category-icon" style={{ color: config.color }}>
                                {config.icon}
                              </span>
                              <h4>{config.name}</h4>
                              <span className="category-code">{category}</span>
                            </div>
                            <div className="category-stats">
                              <span className="course-count-badge">{categoryCourses.length} Programs</span>
                              <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                          </div>

                          {isExpanded && (
                            <motion.div 
                              className="category-courses"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="table-responsive-premium">
                                <table className="cd-courses-table">
                                  <thead>
                                    <tr>
                                      <th>Course Code</th>
                                      <th>Course Name</th>
                                      <th>Degree Type</th>
                                      <th>Duration</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {categoryCourses.map((course, idx) => {
                                      const degreeBadge = getDegreeBadge(course.degree_type);
                                      const duration = getDuration(course.degree_type);
                                      
                                      return (
                                        <tr key={idx}>
                                          <td>
                                            <strong className="course-code">{course.course_code || '-'}</strong>
                                          </td>
                                          <td>
                                            <div className="course-name-cell">
                                              <span className="course-name">{course.course_name}</span>
                                              <span className="course-category-tag" style={{ 
                                                backgroundColor: config.bgColor, 
                                                color: config.color 
                                              }}>
                                                {config.icon} {config.name}
                                              </span>
                                            </div>
                                          </td>
                                          <td>
                                            <span className="degree-badge" style={{ backgroundColor: degreeBadge.bg }}>
                                              {degreeBadge.label}
                                            </span>
                                          </td>
                                          <td className="duration-cell">{duration}</td>
                                          <td>
                                            <button className="btn-table-apply" onClick={() => handleApplyNow(course)}>
                                              Apply Now →
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SectionReveal className="cd-content-section">
                <h3>Campus Gallery</h3>
                {allImages.length > 0 ? (
                  <div className="cd-gallery-grid-full">
                    {allImages.map((img, i) => (
                      <div key={i} className="gallery-item-full" onClick={() => { setSelectedGalleryImage(img); setGalleryOpen(true); }}>
                        <img src={img.url} alt={img.title} />
                        <div className="gallery-overlay">
                          <span>🔍 View Image</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No gallery images available</p>
                )}
              </SectionReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {galleryOpen && selectedGalleryImage && (
          <motion.div 
            className="cd-lightbox-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setGalleryOpen(false)}
          >
            <motion.div 
              className="cd-lightbox-content" 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              onClick={e => e.stopPropagation()}
            >
              <button className="close-lightbox" onClick={() => setGalleryOpen(false)}>&times;</button>
              <img src={selectedGalleryImage.url} alt="Gallery" />
              <div className="lightbox-caption">{selectedGalleryImage.title}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default CollegeDetail;