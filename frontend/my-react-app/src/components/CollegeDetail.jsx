import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCollegeDetail,
  getCollegeCourses,
  getCollegeFees,
  getCollegeHostels,
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
  const [fees, setFees] = useState(null);
  const [hostels, setHostels] = useState([]);
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

        const [coursesData, feesData, hostelsData] = await Promise.allSettled([
          getCollegeCourses(id),
          getCollegeFees(collegeData.college_id || collegeData.id),
          getCollegeHostels(collegeData.college_id || collegeData.id)
        ]);

        if (coursesData.status === 'fulfilled') {
          setCourses(Array.isArray(coursesData.value) ? coursesData.value : coursesData.value.results || []);
        }
        if (feesData.status === 'fulfilled') {
          setFees(Array.isArray(feesData.value) && feesData.value.length > 0 ? feesData.value[0] : null);
        }
        if (hostelsData.status === 'fulfilled') {
          setHostels(Array.isArray(hostelsData.value) ? hostelsData.value : []);
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

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(amount);
  };

  const getAllImages = () => {
    const images = [];
    if (college?.cover_image) images.push({ url: college.cover_image, title: "Campus Main" });
    if (college?.banner_image) images.push({ url: college.banner_image, title: "College View" });
    if (college?.college_images) college.college_images.forEach((img, i) => images.push({ url: img, title: `Gallery ${i+1}` }));
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
                {college.type || "Institution"}
              </div>
              <h1>{college.college_name}</h1>
              <div className="cd-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {college.location_city}, {college.location_state}
              </div>
              <div className="cd-quick-stats">
                <div className="stat-item">
                  <strong>{college.counselling_code || "-"}</strong>
                  <span>Counseling Code</span>
                </div>
                <div className="stat-item">
                  <strong>{college.placement_percentage || "90"}%</strong>
                  <span>Placement</span>
                </div>
              </div>
            </div>

            <div className="cd-hero-action-card">
              <div className="action-inner">
                <div className="admission-status">Admission Open 2024-25</div>
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
            {['overview', 'courses', 'placements', 'gallery'].map(t => (
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
                <p className="cd-desc-text">{college.description || "Leading educational institution dedicated to excellence."}</p>
                <div className="cd-details-grid">
                  <div className="detail-box">
                    <label>Established</label>
                    <span>{college.established_year || "N/A"}</span>
                  </div>
                  <div className="detail-box">
                    <label>Affiliation</label>
                    <span>{college.affiliation || "-"}</span>
                  </div>
                  <div className="detail-box">
                    <label>NAAC Grade</label>
                    <span>{college.naac_grade || "N/A"}</span>
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
                  <div className="quota-toggle">
                    <button className={selectedQuota === 'management' ? 'active' : ''} onClick={() => setSelectedQuota('management')}>Management</button>
                    <button className={selectedQuota === 'government' ? 'active' : ''} onClick={() => setSelectedQuota('government')}>Government</button>
                  </div>
                </div>
                
                <div className="table-responsive-premium">
                  <table className="cd-courses-table">
                    <thead>
                      <tr>
                        <th>Specialization</th>
                        <th>Annual Fee</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((crs, i) => (
                        <tr key={i}>
                          <td><strong>{crs.course_name}</strong></td>
                          <td>{formatCurrency(selectedQuota === 'management' ? crs.tuition_fee_management : crs.tuition_fee_government)}</td>
                          <td><button className="btn-table-apply" onClick={() => handleApplyNow(crs)}>Apply</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Additional Fees Section */}
                {(fees || (hostels && hostels.length > 0)) && (
                  <div className="additional-fees-container" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Extra Fees & Accommodations</h3>
                    
                    <div className="cd-details-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      
                      {/* Transport Fees */}
                      {fees && (fees.transport_fee_min > 0 || fees.transport_fee_max > 0) && (
                        <div className="detail-box">
                          <label>Transport Fees</label>
                          <span>
                            {fees.transport_fee_min === fees.transport_fee_max 
                              ? formatCurrency(fees.transport_fee_min) 
                              : `${formatCurrency(fees.transport_fee_min)} - ${formatCurrency(fees.transport_fee_max)}`}
                          </span>
                        </div>
                      )}
                      
                      {/* Admission & Application Fees */}
                      {fees && fees.admission_fee > 0 && (
                        <div className="detail-box">
                          <label>Admission Fee (One-time)</label>
                          <span>{formatCurrency(fees.admission_fee)}</span>
                        </div>
                      )}
                      
                      {fees && fees.application_fee > 0 && (
                        <div className="detail-box">
                          <label>Application Fee</label>
                          <span>{formatCurrency(fees.application_fee)}</span>
                        </div>
                      )}

                      {/* Miscellaneous */}
                      {fees && fees.miscellaneous_fee > 0 && (
                        <div className="detail-box">
                          <label>Miscellaneous Fee</label>
                          <span>{formatCurrency(fees.miscellaneous_fee)}</span>
                        </div>
                      )}

                      {/* Hostel Fees */}
                      {hostels && hostels.map((hostel, idx) => (
                        <div className="detail-box" key={`hostel-${idx}`}>
                          <label>{hostel.name} {hostel.room_type_display ? `(${hostel.room_type_display})` : ''} Hostel</label>
                          <span>{formatCurrency(hostel.fee_per_year)} / Year</span>
                        </div>
                      ))}

                    </div>
                  </div>
                )}

              </SectionReveal>
            </motion.div>
          )}

          {activeTab === 'placements' && (
            <motion.div key="placements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SectionReveal className="cd-content-section">
                <h3>Placement Statistics</h3>
                <div className="cd-stats-grid-large">
                  <div className="stat-card">
                    <span className="stat-label">Placement %</span>
                    <span className="stat-val">{college.placement_percentage || "92"}%</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Highest Package</span>
                    <span className="stat-val">₹{college.highest_salary || "24"} LPA</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Median Salary</span>
                    <span className="stat-val">₹{college.median_salary || "6.5"} LPA</span>
                  </div>
                </div>
              </SectionReveal>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SectionReveal className="cd-content-section">
                <h3>Campus Gallery</h3>
                <div className="cd-gallery-grid-full">
                  {allImages.map((img, i) => (
                    <div key={i} className="gallery-item-full" onClick={() => { setSelectedGalleryImage(img); setGalleryOpen(true); }}>
                      <img src={img.url} alt={img.title} />
                    </div>
                  ))}
                </div>
              </SectionReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div className="cd-lightbox-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGalleryOpen(false)}>
            <motion.div className="cd-lightbox-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
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