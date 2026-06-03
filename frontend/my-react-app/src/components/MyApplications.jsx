import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyApplications, downloadApplicationPDF } from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/myapplication.css";

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

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      // Ensure data is an array
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (applicationId) => {
    setDownloading(applicationId);
    try {
      const pdfBlob = await downloadApplicationPDF(applicationId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application_${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const getStatusClass = (status) => {
    // Applications from EnquiryForm are always "submitted"
    return 'status-submitted';
  };

  const getStatusDisplay = () => {
    return 'Submitted';
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.college_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="myapps-loading-screen">
        <div className="premium-spinner"></div>
        <p>Fetching your records...</p>
      </div>
    );
  }

  return (
    <div className="myapps-page-premium">
      <Navbar user={user} onLogout={handleLogout} />

      <section className="myapps-hero">
        <div className="container">
          <SectionReveal className="myapps-hero-content">
            <div className="section-label-premium">
              <span className="label-dot" />
              Student Dashboard
            </div>
            <h1>Your <span className="title-highlight">Applications</span></h1>
            <p>Monitor and manage all your college admission enquiries in one place.</p>
          </SectionReveal>
        </div>
      </section>

      <section className="myapps-content">
        <div className="container">
          
          {/* Dashboard Stats */}
          <div className="myapps-stats-grid">
            {[
              { label: "Total Enquiries", val: applications.length, icon: "📋" },
              { label: "This Month", val: applications.filter(a => {
                  const submittedDate = new Date(a.submitted_at);
                  const now = new Date();
                  return submittedDate.getMonth() === now.getMonth() && 
                         submittedDate.getFullYear() === now.getFullYear();
                }).length, icon: "📅" },
            ].map((s, i) => (
              <SectionReveal key={i} className="stat-card-premium" delay={i * 0.1}>
                <div className="stat-icon-wrap">{s.icon}</div>
                <div className="stat-info-wrap">
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </SectionReveal>
            ))}
          </div>

          {/* Controls */}
          <SectionReveal className="myapps-controls">
            <div className="search-box-premium">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search by ID, College, Course, or Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </SectionReveal>

          {/* Applications Grid */}
          <div className="myapps-list-grid">
            <AnimatePresence>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, idx) => (
                  <SectionReveal key={app.application_id} className="app-card-premium" delay={idx * 0.05}>
                    <div className="app-card-header">
                      <span className="app-id-pill">ID: #{app.application_id}</span>
                      <span className={`status-badge-premium ${getStatusClass()}`}>
                        {getStatusDisplay()}
                      </span>
                    </div>
                    
                    <div className="app-card-body">
                      <h3>{app.college_name || "College Not Specified"}</h3>
                      <p className="course-name">{app.course_name || "Course Not Specified"}</p>
                      {app.department_name && (
                        <p className="dept-name">Department: {app.department_name}</p>
                      )}
                      <div className="student-info">
                        <span>{app.first_name} {app.last_name}</span>
                        <span>{app.mobile_number}</span>
                      </div>
                      <div className="app-meta-grid">
                        <div className="meta-item">
                          <label>Submitted On</label>
                          <span>{new Date(app.submitted_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                        <div className="meta-item">
                          <label>Submitted At</label>
                          <span>{new Date(app.submitted_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="app-card-footer">
                      <button 
                        className="btn-download-premium"
                        onClick={() => handleDownloadPDF(app.application_id)}
                        disabled={downloading === app.application_id}
                      >
                        {downloading === app.application_id ? "⏳" : "📄 PDF"}
                      </button>
                      <button 
                        className="btn-view-details"
                        onClick={() => navigate(`/my-applications/${app.application_id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </SectionReveal>
                ))
              ) : (
                <motion.div 
                  className="empty-state-premium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="empty-icon-large">📂</div>
                  <h3>No Applications Found</h3>
                  <p>You haven't submitted any college applications yet.</p>
                  <button onClick={() => navigate("/colleges")} className="btn-premium-action">
                    Browse Colleges
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default MyApplications;