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

function CollegeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuota, setSelectedQuota] = useState("management");
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        setLoading(true);
        const collegeData = await getCollegeDetail(id);
        setCollege(collegeData);

        const coursesData = await getCollegeCourses(id);
        if (coursesData && Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else if (coursesData && coursesData.results) {
          setCourses(coursesData.results);
        } else {
          setCourses([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching college:", err);
        setError("College not found");
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

  if (loading) return <div className="loading-screen-premium"><div className="premium-spinner" /></div>;
  if (error || !college) return (
    <div className="error-page-premium">
      <Navbar />
      <div className="container">
        <h2>{error || "Institution not found"}</h2>
        <Link to="/colleges" className="btn-premium">Return to List</Link>
      </div>
    </div>
  );

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
              <h1>{college.college_name}</h1>
              <div className="cd-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {college.location_city}, {college.location_state}
              </div>
              <div className="cd-quick-stats">
                <div className="stat-item">
                  <strong>{college.short_name || "-"}</strong>
                  <span>College Code</span>
                </div>
                <div className="stat-item">
                  <strong>{courses.length || "0"}+</strong>
                  <span>Courses</span>
                </div>
              </div>
            </div>

            <div className="cd-hero-action-card">
              <div className="action-inner">
                <div className="admission-status">Admission Open 2025-26</div>
                <button className="btn-apply-full" onClick={() => handleApplyNow(courses[0])}>Apply Now</button>
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
                {t.toUpperCase()}
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
                <p className="cd-desc-text">{college.address || "Leading educational institution dedicated to academic excellence and holistic student development."}</p>
                <div className="cd-details-grid">
                  <div className="detail-box">
                    <label>Location</label>
                    <span>{college.location_city}, {college.location_state}</span>
                  </div>
                  <div className="detail-box">
                    <label>Pincode</label>
                    <span>{college.location_pincode || "-"}</span>
                  </div>
                  <div className="detail-box">
                    <label>Courses Offered</label>
                    <span>{college.courses_offered?.length || 0} Categories</span>
                  </div>
                </div>
              </SectionReveal>
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SectionReveal className="cd-content-section">
                <div className="section-header-flex">
                  <h3>Academic Offerings</h3>
                </div>
                
                <div className="table-responsive-premium">
                  <table className="cd-courses-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Degree Type</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.length > 0 ? (
                        courses.map((crs, i) => (
                          <tr key={i}>
                            <td><strong>{crs.course_code || '-'}</strong></td>
                            <td>{crs.course_name}</td>
                            <td>{crs.degree_type?.toUpperCase() || '-'}</td>
                            <td><button className="btn-table-apply" onClick={() => handleApplyNow(crs)}>Apply</button></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center' }}>No courses available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionReveal>
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
                          <span>View Image</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', padding: '40px' }}>No gallery images available</p>
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