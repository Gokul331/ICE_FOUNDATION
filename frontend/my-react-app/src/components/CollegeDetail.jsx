import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCollegeDetail, getCollegeCourses } from "../services/api";
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
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── category configuration ── */
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

const degreeBadges = {
  ug: { bg: "#4CAF50", label: "UG" },
  pg: { bg: "#FF9800", label: "PG" },
  diploma: { bg: "#2196F3", label: "Diploma" },
  phd: { bg: "#9C27B0", label: "PhD" },
  integrated: { bg: "#F44336", label: "Integrated" },
};

const degreeDurations = {
  ug: "4 Years",
  pg: "2 Years",
  diploma: "3 Years",
  phd: "3-5 Years",
  integrated: "5 Years",
};

const tabs = [
  { id: "overview", label: "Overview", icon: "📖" },
  { id: "courses", label: "Courses", icon: "📚" },
  { id: "gallery", label: "Gallery", icon: "📷" },
];

const fallbackCollege = {
  college_name: "DHANALAKSHMI SRINIVASAN UNIVERSITY",
  short_name: "DSU",
  location_city: "Chengalpattu",
  location_state: "Tamil Nadu",
  address: "No. 6, GST Road, Mamandur, Chengalpattu, Tamil Nadu 603 111",
};

function CollegeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  /* ── data fetching ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const collegeData = await getCollegeDetail(id);
        setCollege(collegeData);

        const coursesData = await getCollegeCourses(id).catch(() => []);
        const courseList = Array.isArray(coursesData) && coursesData.length ? coursesData : [];
        setCourses(courseList);
        setError(null);
      } catch (err) {
        console.error("Error fetching college:", err);
        setError("College not found");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [id]);

  /* Memoized grouped courses for the JSX */
  const groupedCourses = useMemo(() => {
    return courses.reduce((acc, course) => {
      const cat = (course.category || "engineering").toLowerCase().replace(/\s+/g, "_");
      (acc[cat] = acc[cat] || []).push(course);
      return acc;
    }, {});
  }, [courses]);

  /* Keep expanded categories in sync — auto-expand newly loaded categories */
  useEffect(() => {
    setExpandedCategories((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(groupedCourses).forEach((cat) => {
        if (next[cat] === undefined) {
          next[cat] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [groupedCourses]);

  const allImages = useMemo(() => {
    const imgs = [];
    if (college?.banner_image) imgs.push({ url: college.banner_image, title: "College Banner" });
    if (Array.isArray(college?.college_images)) {
      college.college_images.forEach((url, i) => imgs.push({ url, title: `Campus View ${i + 1}` }));
    }
    if (Array.isArray(college?.campus_images)) {
      college.campus_images.forEach((url, i) => imgs.push({ url, title: `Campus ${i + 1}` }));
    }
    return imgs;
  }, [college]);

  const displayCollege = college || fallbackCollege;
  const categoryKeys = Object.keys(groupedCourses);
  const visibleCategories = categoryKeys.slice(0, 6);
  const hiddenCount = Math.max(0, categoryKeys.length - 6);

  /* ── handlers ── */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const handleApplyNow = (course) => {
    const token = localStorage.getItem("token");
    const quotaType = "management";
    if (!token) {
      navigate("/login", { state: { from: `/colleges/${id}`, course, college, quotaType } });
    } else {
      navigate("/application-form", { state: { college, course, quotaType } });
    }
  };

  const toggleCategory = (category) =>
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));

  const openImage = (img) => {
    setSelectedImage(img);
  };

  const closeImage = () => setSelectedImage(null);

  const getDegreeBadge = (type) =>
    degreeBadges[type?.toLowerCase()] || { bg: "#666", label: type?.toUpperCase() || "N/A" };

  const getDuration = (type) => degreeDurations[type?.toLowerCase()] || "Varies";

  /* ── loading & error states ── */
  if (loading) {
    return (
      <div className="college-details-page-premium">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="cd-loading-screen">
          <div className="premium-spinner" />
        </div>
      </div>
    );
  }

  if (error && !college) {
    return (
      <div className="college-details-page-premium">
        <Navbar />
        <div className="container cd-error-page">
          <h2>{error}</h2>
          <Link to="/colleges" className="btn-premium">
            Return to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="college-details-page-premium">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ── Hero ── */}
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
                <LocationIcon />
                {displayCollege.location_city}, {displayCollege.location_state}
              </div>
              <div className="cd-quick-stats">
                <StatItem label="College Code" value={displayCollege.short_name || "-"} />
                <StatItem label="Categories" value={categoryKeys.length || "0"} />
                <StatItem label="Courses" value={`${courses.length || "0"}+`} />
              </div>
            </div>

            <aside className="cd-hero-action-card">
              <div className="action-inner">
                <div className="admission-status">🎓 Admission Open 2025-26</div>
                <button className="btn-apply-full" onClick={() => handleApplyNow(courses[0])}>
                  Apply Now →
                </button>
                <ul className="action-features">
                  <li>✓ Expert Counseling</li>
                  <li>✓ Direct Admission Support</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <nav className="cd-tabs-wrapper" aria-label="College sections">
        <div className="container">
          <div className="cd-tabs-nav" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Tab Content ── */}
      <main className="container cd-main-content">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              className="tab-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionReveal className="cd-content-section">
                <h3>About the Institution</h3>
                <p className="cd-desc-text">
                  {displayCollege.address ||
                    "Leading educational institution dedicated to academic excellence and holistic student development."}
                </p>
                <div className="cd-details-grid">
                  <DetailBox icon="📍" label="Location">
                    {displayCollege.location_city}, {displayCollege.location_state}
                  </DetailBox>

                  <DetailBox icon="📚" label="Categories">
                    <div className="category-tags">
                      {visibleCategories.map((cat) => {
                        const config = categoryConfig[cat];
                        return (
                          <span
                            key={cat}
                            className="category-tag"
                            style={{
                              backgroundColor: config?.bgColor || "#f0f0f0",
                              color: config?.color || "#666",
                            }}
                          >
                            {config?.icon} {config?.name || cat.replace(/_/g, " ")}
                          </span>
                        );
                      })}
                      {hiddenCount > 0 && <span className="category-tag">+{hiddenCount} more</span>}
                    </div>
                  </DetailBox>

                  <DetailBox icon="🎓" label="Total Programs">
                    {courses.length} Courses
                  </DetailBox>
                </div>
              </SectionReveal>
            </motion.div>
          )}

          {activeTab === "courses" && (
            <motion.div
              key="courses"
              className="tab-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="cd-content-section">
                <div className="section-header-flex">
                  <h3>Academic Programs by Category</h3>
                  <span className="total-courses-badge">{courses.length} Programs Available</span>
                </div>

                {categoryKeys.length === 0 ? (
                  <EmptyState message="No courses available for this institution." />
                ) : (
                  <div className="courses-by-category">
                    {categoryKeys.map((category) => (
                      <CategorySection
                        key={category}
                        category={category}
                        courses={groupedCourses[category]}
                        isExpanded={expandedCategories[category]}
                        onToggle={() => toggleCategory(category)}
                        onApply={handleApplyNow}
                        getDegreeBadge={getDegreeBadge}
                        getDuration={getDuration}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              className="tab-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionReveal className="cd-content-section">
                <h3>Campus Gallery</h3>
                {allImages.length > 0 ? (
                  <div className="cd-gallery-grid-full">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        className="gallery-item-full"
                        onClick={() => openImage(img)}
                        aria-label={`View ${img.title}`}
                      >
                        <img src={img.url} alt={img.title} loading="lazy" />
                        <div className="gallery-overlay">
                          <span>🔍 View Image</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No gallery images available" />
                )}
              </SectionReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="cd-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImage}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <motion.div
              className="cd-lightbox-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-lightbox" onClick={closeImage} aria-label="Close">
                &times;
              </button>
              <img src={selectedImage.url} alt={selectedImage.title} />
              <div className="lightbox-caption">{selectedImage.title}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/* ── Sub-components ── */

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="stat-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DetailBox({ icon, label, children }) {
  return (
    <div className="detail-box">
      <label>
        {icon} {label}
      </label>
      <div className="detail-box-content">{children}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="no-courses-message">
      <p>{message}</p>
    </div>
  );
}

function CategorySection({ category, courses, isExpanded, onToggle, onApply, getDegreeBadge, getDuration }) {
  const config = categoryConfig[category] || {
    name: category.replace(/_/g, " ").toUpperCase(),
    icon: "📘",
    color: "#666",
    bgColor: "#f5f5f5",
  };

  return (
    <motion.section
      className="category-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        className="category-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        style={{
          background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
          borderLeftColor: config.color,
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
          <span className="course-count-badge">{courses.length} Programs</span>
          <span className="expand-icon" aria-hidden="true">
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="category-courses"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
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
                  {courses.map((course, idx) => {
                    const badge = getDegreeBadge(course.degree_type);
                    const duration = getDuration(course.degree_type);
                    return (
                      <tr key={`${course.course_code || "course"}-${idx}`}>
                        <td>
                          <strong className="course-code">{course.course_code || "-"}</strong>
                        </td>
                        <td>
                          <div className="course-name-cell">
                            <span className="course-name">{course.course_name}</span>
                            <span
                              className="course-category-tag"
                              style={{ backgroundColor: config.bgColor, color: config.color }}
                            >
                              {config.icon} {config.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="degree-badge" style={{ backgroundColor: badge.bg }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="duration-cell">{duration}</td>
                        <td>
                          <button className="btn-table-apply" onClick={() => onApply(course)}>
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
      </AnimatePresence>
    </motion.section>
  );
}

export default CollegeDetail;
