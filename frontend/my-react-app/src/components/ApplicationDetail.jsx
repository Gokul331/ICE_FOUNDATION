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

  const getStatusStep = (status) => {
    const steps = ['draft', 'submitted', 'under_review', 'approved'];
    const index = steps.indexOf(status?.toLowerCase());
    return index === -1 ? 1 : index;
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

  const currentStep = getStatusStep(application.status);

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
              <div className={`status-badge-premium ${application.status?.toLowerCase()}`}>
                <span className="status-dot"></span>
                {application.status?.replace('_', ' ') || 'Pending'}
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
                      <span className="val-large">{application.college_name}</span>
                    </div>
                    <div className="display-item">
                      <label>Course Selected</label>
                      <span>{application.course_name}</span>
                    </div>
                    <div className="display-item">
                      <label>Quota Type</label>
                      <span className="capitalize">{application.quota_type} Quota</span>
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
                    <div className="display-item"><label>Full Name</label><span>{application.first_name_prefix}. {application.first_name} {application.last_name}</span></div>
                    <div className="display-item"><label>Email Address</label><span>{application.email_id}</span></div>
                    <div className="display-item"><label>Phone Number</label><span>+91 {application.mobile_number}</span></div>
                    <div className="display-item"><label>Gender</label><span className="capitalize">{application.gender}</span></div>
                    <div className="display-item"><label>Date of Birth</label><span>{new Date(application.date_of_birth).toLocaleDateString()}</span></div>
                    <div className="display-item"><label>Aadhar Number</label><span>{application.aadhar_number}</span></div>
                    <div className="display-item"><label>Community</label><span>{application.community}</span></div>
                    <div className="display-item"><label>Blood Group</label><span>{application.blood_group}</span></div>
                    <div className="display-item"><label>Nationality</label><span>{application.nationality}</span></div>
                    <div className="display-item"><label>Marital Status</label><span className="capitalize">{application.marital_status}</span></div>
                  </div>
                </div>
              </SectionReveal>

              {/* Parents & Financial */}
              <SectionReveal className="detail-card-premium" delay={0.15}>
                <div className="card-header-premium">
                  <h3>Parents & Financial Info</h3>
                </div>
                <div className="card-body-premium">
                  <div className="info-display-grid">
                    <div className="display-item"><label>Father's Name</label><span>{application.father_name_prefix}. {application.father_name}</span></div>
                    <div className="display-item"><label>Father's Occupation</label><span>{application.father_occupation}</span></div>
                    <div className="display-item"><label>Mother's Name</label><span>{application.mother_name_prefix}. {application.mother_name}</span></div>
                    <div className="display-item"><label>Mother's Occupation</label><span>{application.mother_occupation}</span></div>
                    <div className="display-item"><label>Annual Family Income</label><span>{application.family_annual_income}</span></div>
                    <div className="display-item"><label>First Graduation</label><span>{application.first_graduation}</span></div>
                  </div>
                </div>
              </SectionReveal>

              {/* Academic Background */}
              <SectionReveal className="detail-card-premium" delay={0.2}>
                <div className="card-header-premium">
                  <h3>Academic Background</h3>
                </div>
                <div className="card-body-premium">
                  <div className="academic-list-premium">
                    {/* 10th */}
                    <div className="academic-item-premium">
                      <div className="academic-head">10th Standard</div>
                      <div className="info-display-grid mt-10">
                        <div className="display-item" style={{ gridColumn: 'span 2' }}><label>School</label><span>{application.tenth_school_name}</span></div>
                        <div className="display-item"><label>Board</label><span>{application.tenth_board}</span></div>
                        <div className="display-item"><label>Year</label><span>{application.tenth_year_of_passing}</span></div>
                        <div className="display-item"><label>Percentage</label><span>{application.tenth_marks_percentage}%</span></div>
                      </div>
                    </div>
                    {/* 12th */}
                    <div className="academic-item-premium mt-30">
                      <div className="academic-head">12th Standard</div>
                      <div className="info-display-grid mt-10">
                        <div className="display-item" style={{ gridColumn: 'span 2' }}><label>School</label><span>{application.twelfth_school_name}</span></div>
                        <div className="display-item"><label>Board</label><span>{application.twelfth_board}</span></div>
                        <div className="display-item"><label>Year</label><span>{application.twelfth_year_of_passing}</span></div>
                        <div className="display-item"><label>Percentage</label><span>{application.twelfth_marks_percentage}%</span></div>
                      </div>
                    </div>
                    {/* Diploma */}
                    {application.has_diploma && (
                      <div className="academic-item-premium mt-30">
                        <div className="academic-head">Diploma Details</div>
                        <div className="info-display-grid mt-10">
                          <div className="display-item" style={{ gridColumn: 'span 2' }}><label>College</label><span>{application.diploma_college_name}</span></div>
                          <div className="display-item"><label>Board/Univ</label><span>{application.diploma_board_university}</span></div>
                          <div className="display-item"><label>Year</label><span>{application.diploma_year_of_passing}</span></div>
                          <div className="display-item"><label>Percentage</label><span>{application.diploma_marks_percentage}%</span></div>
                        </div>
                      </div>
                    )}
                    {/* UG */}
                    {application.has_ug && (
                      <div className="academic-item-premium mt-30">
                        <div className="academic-head">Graduation (UG) Details</div>
                        <div className="info-display-grid mt-10">
                          <div className="display-item" style={{ gridColumn: 'span 2' }}><label>College</label><span>{application.ug_college_name}</span></div>
                          <div className="display-item"><label>Univ</label><span>{application.ug_board_university}</span></div>
                          <div className="display-item"><label>Year</label><span>{application.ug_year_of_passing}</span></div>
                          <div className="display-item"><label>Percentage</label><span>{application.ug_marks_percentage}%</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionReveal>

              {/* Documents Card */}
              <SectionReveal className="detail-card-premium" delay={0.25}>
                <div className="card-header-premium">
                  <h3>Verified Documents</h3>
                </div>
                <div className="card-body-premium">
                  <div className="docs-grid">
                    {[
                      { name: 'Photo', key: 'photo' },
                      { name: '10th Marksheet', key: 'tenth_marksheet' },
                      { name: '12th Marksheet', key: 'twelfth_marksheet' },
                      { name: 'Community Certificate', key: 'community_marksheet' },
                      { name: 'Aadhar Card', key: 'aadhar_card' },
                      { name: 'Diploma Marksheet', key: 'diploma_marksheet', show: application.has_diploma },
                      { name: 'UG Marksheet', key: 'ug_marksheet', show: application.has_ug }
                    ].filter(d => d.show !== false).map((doc, i) => (
                      <div key={i} className="doc-item-premium">
                        <div className="doc-icon">📄</div>
                        <div className="doc-info">
                          <span className="doc-name">{doc.name}</span>
                          <span className="doc-status">Verified ✓</span>
                        </div>
                      </div>
                    ))}
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
                <h3>Permanent Address</h3>
                <div className="address-box">
                  <p>{application.address_line1}</p>
                  {application.address_line2 && <p>{application.address_line2}</p>}
                  <p>{application.city}, {application.state}</p>
                  <p>Pincode: {application.pincode}</p>
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