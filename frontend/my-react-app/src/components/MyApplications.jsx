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
  const [statusFilter, setStatusFilter] = useState("all");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
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
    } finally {
      setDownloading(null);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.college_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); setUser(null); navigate('/login'); }} />

      <section className="myapps-hero">
        <div className="container">
          <SectionReveal className="myapps-hero-content">
            <div className="section-label-premium">
              <span className="label-dot" />
              Student Dashboard
            </div>
            <h1>Your <span className="title-highlight">Applications</span></h1>
            <p>Monitor and manage all your ongoing college admission processes in one place.</p>
          </SectionReveal>
        </div>
      </section>

      <section className="myapps-content">
        <div className="container">
          
          {/* Dashboard Stats */}
          <div className="myapps-stats-grid">
            {[
              { label: "Total", val: applications.length, icon: "📋" },
              { label: "Approved", val: applications.filter(a => a.status === 'approved').length, icon: "✅" },
              { label: "Pending", val: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length, icon: "⏳" }
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search by ID or College name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="filter-select-premium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </SectionReveal>

          {/* Applications Grid */}
          <div className="myapps-list-grid">
            <AnimatePresence>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, idx) => (
                  <SectionReveal key={app.application_id} className="app-card-premium" delay={idx * 0.05}>
                    <div className="app-card-header">
                      <span className="app-id-pill">ID: #{app.application_id}</span>
                      <span className={`status-badge-premium ${getStatusClass(app.status)}`}>
                        {app.status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="app-card-body">
                      <h3>{app.college_name || "Unknown College"}</h3>
                      <div className="app-meta-grid">
                        <div className="meta-item">
                          <label>Applied On</label>
                          <span>{new Date(app.submitted_at).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                          <label>Quota</label>
                          <span className="capitalize">{app.quota_type || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="app-card-footer">
                      <button 
                        className="btn-download-premium"
                        onClick={() => handleDownloadPDF(app.application_id)}
                        disabled={downloading === app.application_id}
                      >
                        {downloading === app.application_id ? "..." : "PDF"}
                      </button>
                      <button 
                        className="btn-view-details"
                        onClick={() => navigate(`/applications/${app.application_id}`)}
                      >
                        View Full Details
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
                  <p>We couldn't find any applications matching your criteria.</p>
                  <button onClick={() => navigate("/colleges")} className="btn-premium-action">Browse Colleges</button>
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