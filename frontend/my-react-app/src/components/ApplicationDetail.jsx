import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApplicationDetail, downloadApplicationPDF } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/applicationdetail.css';

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

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      const data = await getApplicationDetail(id);
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await downloadApplicationPDF(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-screen">
        <div className="premium-spinner"></div>
        <p>Loading application data...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="detail-error-premium">
        <p>Application not found</p>
        <button onClick={() => navigate('/my-applications')} className="btn-premium-action">Go Back</button>
      </div>
    );
  }

  return (
    <div className="app-detail-page-premium">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); setUser(null); navigate('/login'); }} />

      <section className="detail-hero">
        <div className="container">
          <SectionReveal className="detail-hero-content">
            <button onClick={() => navigate('/my-applications')} className="btn-back-dashboard">
              ← Dashboard
            </button>
            <div className="detail-header-row">
              <div className="header-text-box">
                <h1>Application <span className="title-highlight">Details</span></h1>
                <p>ID: #{application.application_id} • Applied on {new Date(application.submitted_at).toLocaleDateString()}</p>
              </div>
              <div className={`status-pill-large ${application.status?.toLowerCase()}`}>
                {application.status?.replace('_', ' ') || 'Pending'}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="detail-body-section">
        <div className="container">
          <div className="detail-grid-layout">
            
            {/* Main Info */}
            <div className="detail-main-col">
              
              <SectionReveal className="detail-card-premium">
                <div className="card-header-premium">
                  <h3>Educational Institution</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid">
                    <div className="display-item">
                      <label>College Name</label>
                      <span className="val-large">{application.college_name}</span>
                    </div>
                    <div className="display-item">
                      <label>Course Selected</label>
                      <span>{application.course_name || application.course_id}</span>
                    </div>
                    <div className="display-item">
                      <label>Quota Type</label>
                      <span className="capitalize">{application.quota_type}</span>
                    </div>
                  </div>
                </div>
              </SectionReveal>

              <SectionReveal className="detail-card-premium" delay={0.1}>
                <div className="card-header-premium">
                  <h3>Personal Profile</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid dual">
                    <div className="display-item"><label>Full Name</label><span>{application.first_name} {application.last_name}</span></div>
                    <div className="display-item"><label>Email Address</label><span>{application.email_id}</span></div>
                    <div className="display-item"><label>Phone Number</label><span>{application.mobile_number}</span></div>
                    <div className="display-item"><label>Gender</label><span className="capitalize">{application.gender || 'N/A'}</span></div>
                    <div className="display-item"><label>Date of Birth</label><span>{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="display-item"><label>Community</label><span>{application.community || 'N/A'}</span></div>
                  </div>
                </div>
              </SectionReveal>

              <SectionReveal className="detail-card-premium" delay={0.2}>
                <div className="card-header-premium">
                  <h3>Parental & Financial Info</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid dual">
                    <div className="display-item"><label>Father's Name</label><span>{application.father_name || 'N/A'}</span></div>
                    <div className="display-item"><label>Mother's Name</label><span>{application.mother_name || 'N/A'}</span></div>
                    <div className="display-item"><label>Annual Income</label><span>₹{application.family_annual_income?.toLocaleString() || 'N/A'}</span></div>
                  </div>
                </div>
              </SectionReveal>

            </div>

            {/* Sidebar / Actions */}
            <div className="detail-side-col">
              <SectionReveal className="detail-actions-card">
                <h3>Manage</h3>
                <div className="action-stack">
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-action-premium primary">
                    {downloading ? '...' : 'Download PDF'}
                  </button>
                  <button onClick={() => window.print()} className="btn-action-premium outline">
                    Print Application
                  </button>
                </div>
              </SectionReveal>

              <SectionReveal className="detail-address-card" delay={0.3}>
                <h3>Permanent Address</h3>
                <p>{application.address_line1}</p>
                {application.address_line2 && <p>{application.address_line2}</p>}
                <p>{application.city}, {application.state} - {application.pincode}</p>
              </SectionReveal>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ApplicationDetail;