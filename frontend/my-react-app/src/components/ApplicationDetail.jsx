import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    window.scrollTo(0, 0);
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
        <p>Retrieving Application Securely...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="app-detail-page-premium">
        <Navbar />
        <div className="container" style={{ padding: '200px 0', textAlign: 'center' }}>
          <h2>Application Not Found</h2>
          <p>The application you're looking for might have been removed or is unavailable.</p>
          <button onClick={() => navigate('/my-applications')} className="btn-back-dashboard" style={{ margin: '30px auto' }}>Return to Dashboard</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-detail-page-premium">
      <Navbar />

      <section className="detail-hero">
        <div className="container">
          <SectionReveal className="detail-hero-content">
            <button onClick={() => navigate('/my-applications')} className="btn-back-dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Dashboard
            </button>
            <div className="detail-header-row">
              <div className="header-text-box">
                <h1>Application <span className="title-highlight">Portal</span></h1>
                <p>Ref: #{application.application_id} • Submission Date: {new Date(application.submitted_at).toLocaleDateString()}</p>
              </div>
              <div className={`status-badge-premium submitted`}>
                <span className="status-dot"></span>
                Submitted
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="detail-body-section">
        <div className="container">
          
          <div className="detail-grid-layout">
            <div className="detail-main-col">
              
              {/* Institution Choice */}
              <SectionReveal className="detail-card-premium">
                <div className="card-header-premium">
                  <h3>Institution Choice</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid">
                    <div className="display-item" style={{ gridColumn: 'span 2' }}>
                      <label>College Name</label>
                      <span className="val-large">{application.college_name || 'Not specified'}</span>
                    </div>
                    <div className="display-item">
                      <label>Course Selected</label>
                      <span>{application.course_name || 'Not specified'}</span>
                    </div>
                    <div className="display-item">
                      <label>Department</label>
                      <span>{application.department_name || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </SectionReveal>

              {/* Applicant Identity */}
              <SectionReveal className="detail-card-premium" delay={0.1}>
                <div className="card-header-premium">
                  <h3>Applicant Identity</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid">
                    <div className="display-item"><label>Full Name</label><span>{application.first_name} {application.last_name}</span></div>
                    <div className="display-item"><label>Email Address</label><span>{application.email_id}</span></div>
                    <div className="display-item"><label>Phone Number</label><span>{application.mobile_number}</span></div>
                    <div className="display-item"><label>Gender</label><span className="capitalize">{application.gender || 'Not specified'}</span></div>
                    <div className="display-item"><label>Date of Birth</label><span>{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'Not specified'}</span></div>
                    <div className="display-item"><label>Aadhar Number</label><span>{application.aadhar_number || 'Not specified'}</span></div>
                    <div className="display-item"><label>Community</label><span>{application.community || 'Not specified'}</span></div>
                    <div className="display-item"><label>Blood Group</label><span>{application.blood_group || 'Not specified'}</span></div>
                  </div>
                </div>
              </SectionReveal>

              {/* Parents Details */}
              <SectionReveal className="detail-card-premium" delay={0.15}>
                <div className="card-header-premium">
                  <h3>Parent's Details</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid">
                    <div className="display-item"><label>Father's Name</label><span>{application.father_name || 'Not specified'}</span></div>
                    <div className="display-item"><label>Father's Mobile</label><span>{application.father_mobile || 'Not specified'}</span></div>
                    <div className="display-item"><label>Mother's Name</label><span>{application.mother_name || 'Not specified'}</span></div>
                    <div className="display-item"><label>Mother's Mobile</label><span>{application.mother_mobile || 'Not specified'}</span></div>
                  </div>
                </div>
              </SectionReveal>

              {/* Address */}
              <SectionReveal className="detail-card-premium" delay={0.2}>
                <div className="card-header-premium">
                  <h3>Address Details</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid">
                    <div className="display-item" style={{ gridColumn: 'span 2' }}>
                      <label>Address Line 1</label>
                      <span>{application.address_line1 || 'Not specified'}</span>
                    </div>
                    <div className="display-item" style={{ gridColumn: 'span 2' }}>
                      <label>Address Line 2</label>
                      <span>{application.address_line2 || 'Not specified'}</span>
                    </div>
                    <div className="display-item"><label>City</label><span>{application.city || 'Not specified'}</span></div>
                    <div className="display-item"><label>Pincode</label><span>{application.pincode || 'Not specified'}</span></div>
                  </div>
                </div>
              </SectionReveal>

              {/* Academic Background */}
              <SectionReveal className="detail-card-premium" delay={0.25}>
                <div className="card-header-premium">
                  <h3>Academic Background</h3>
                </div>
                <div className="card-body-premium">
                  <div className="academic-list-premium">
                    {/* 10th */}
                    <div className="academic-item-premium">
                      <div className="academic-head">10th Standard</div>
                      <div className="info-display-grid mt-10">
                        <div className="display-item"><label>Percentage</label><span>{application.tenth_marks_percentage || 'Not specified'}%</span></div>
                      </div>
                    </div>
                    
                    {/* 12th */}
                    <div className="academic-item-premium mt-30">
                      <div className="academic-head">12th Standard</div>
                      <div className="info-display-grid mt-10">
                        <div className="display-item"><label>Percentage</label><span>{application.twelfth_marks_percentage || 'Not specified'}%</span></div>
                      </div>
                    </div>
                    
                    {/* Diploma */}
                    {application.has_diploma && (
                      <div className="academic-item-premium mt-30">
                        <div className="academic-head">Diploma Details</div>
                        <div className="info-display-grid mt-10">
                          <div className="display-item"><label>Percentage</label><span>{application.diploma_marks_percentage || 'Not specified'}%</span></div>
                        </div>
                      </div>
                    )}
                    
                    {/* UG */}
                    {application.has_ug && (
                      <div className="academic-item-premium mt-30">
                        <div className="academic-head">Graduation (UG) Details</div>
                        <div className="info-display-grid mt-10">
                          <div className="display-item"><label>Percentage</label><span>{application.ug_marks_percentage || 'Not specified'}%</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionReveal>
            </div>

            <div className="detail-side-col">
              <SectionReveal className="sidebar-premium-card">
                <h3>Application Actions</h3>
                <div className="action-stack">
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-action-premium primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    {downloading ? 'Processing...' : 'Download Full PDF'}
                  </button>
                  <button onClick={() => window.print()} className="btn-action-premium outline">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
                    Print Hardcopy
                  </button>
                </div>
              </SectionReveal>

              <SectionReveal className="sidebar-premium-card" delay={0.3}>
                <h3>Address</h3>
                <div className="address-box">
                  <p>{application.address_line1 || 'Not specified'}</p>
                  {application.address_line2 && <p>{application.address_line2}</p>}
                  <p>{application.city || ''} {application.pincode ? `- ${application.pincode}` : ''}</p>
                </div>
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