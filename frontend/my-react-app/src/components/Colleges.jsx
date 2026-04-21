// CollegeDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { 
  getCollegeDetail, 
  getCollegeCourses, 
  getCollegeFees,
  getTimelineEvents
} from '../services/api';
import '../styles/collegedetails.css';

function CollegeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [placementStats, setPlacementStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchCollegeData();
  }, [id]);

  const fetchCollegeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch college details
      const collegeData = await getCollegeDetail(id);
      setCollege(collegeData);
      
      // Fetch courses for this college
      const coursesData = await getCollegeCourses(id);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      
      // Fetch fee structure for this college
      const feesData = await getCollegeFees(id);
      setFeeStructure(Array.isArray(feesData) ? feesData : []);
      
      // Set placement stats from college data
      if (collegeData) {
        setPlacementStats({
          placement_percentage: collegeData.placement_percentage,
          highest_salary: collegeData.highest_salary,
          average_salary: collegeData.avg_salary,
          median_salary: collegeData.median_salary
        });
      }
      
    } catch (err) {
      console.error('Error fetching college data:', err);
      setError('Failed to load college details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const getLogoLetters = (collegeName) => {
    if (!collegeName) return 'CL';
    const words = collegeName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getCollegeColors = (name) => {
    if (!name) return { bg: "#EAF7FD", fg: "#3AAAD4" };
    const colors = [
      { bg: "#EAF7FD", fg: "#3AAAD4" },
      { bg: "#FFF0EA", fg: "#C85A30" },
      { bg: "#EAF0FD", fg: "#3A5AD4" },
      { bg: "#EDF7ED", fg: "#2A8A2A" },
      { bg: "#FDF5EA", fg: "#C8A530" }
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} LPA`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCutoff = (value) => {
    if (!value) return 'N/A';
    return value;
  };

  const colors = college ? getCollegeColors(college.college_name) : { bg: "#EAF7FD", fg: "#3AAAD4" };

  if (loading) {
    return (
      <div className="college-details-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading college details...</p>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="college-details-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'College not found'}</h2>
          <button onClick={() => navigate('/colleges')} className="back-btn">
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="college-details-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="college-hero" style={{ background: `linear-gradient(135deg, ${colors.fg}20 0%, ${colors.fg}05 100%)` }}>
        <div className="college-hero-content">
          {college.logo_url ? (
            <img src={college.logo_url} alt={college.college_name} className="college-logo-large" />
          ) : (
            <div className="college-logo-large" style={{ background: colors.fg }}>
              {getLogoLetters(college.college_name)}
            </div>
          )}
          <div className="college-title-section">
            <h1>{college.college_name}</h1>
            <div className="college-meta">
              <span className="meta-item">📍 {college.location_city}, {college.location_state}</span>
              {college.established_year && <span className="meta-item">📅 Est. {college.established_year}</span>}
              {college.counselling_code && <span className="meta-item">🎯 Code: {college.counselling_code}</span>}
              {college.type && <span className="meta-item">🏛️ {college.type.charAt(0).toUpperCase() + college.type.slice(1)}</span>}
            </div>
            <div className="college-quick-stats">
              {college.naac_grade && (
                <div className="stat">
                  <span className="stat-label">NAAC Grade</span>
                  <span className="stat-value">{college.naac_grade}</span>
                </div>
              )}
              {college.nirf_rank && (
                <div className="stat">
                  <span className="stat-label">NIRF Rank</span>
                  <span className="stat-value">#{college.nirf_rank}</span>
                </div>
              )}
              {college.placement_percentage && (
                <div className="stat">
                  <span className="stat-label">Placement %</span>
                  <span className="stat-value">{college.placement_percentage}%</span>
                </div>
              )}
              {college.hostel_available && (
                <div className="stat">
                  <span className="stat-label">Hostel</span>
                  <span className="stat-value">Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            Courses & Cutoffs
          </button>
          <button className={`tab ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}>
            Fee Structure
          </button>
          <button className={`tab ${activeTab === 'placements' ? 'active' : ''}`} onClick={() => setActiveTab('placements')}>
            Placements
          </button>
          <button className={`tab ${activeTab === 'admissions' ? 'active' : ''}`} onClick={() => setActiveTab('admissions')}>
            Admissions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-card">
              <h3>About College</h3>
              <p>{college.address || 'No description available.'}</p>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <h3>Key Information</h3>
                <table className="info-table">
                  <tbody>
                    <tr><th>College Type</th><td>{college.type ? college.type.charAt(0).toUpperCase() + college.type.slice(1) : 'Not specified'}</td></tr>
                    <tr><th>Established Year</th><td>{college.established_year || 'Not specified'}</td></tr>
                    <tr><th>Affiliated To</th><td>{college.affiliation ? college.affiliation.replace('_', ' ').toUpperCase() : 'Anna University'}</td></tr>
                    <tr><th>Accreditation</th><td>{college.naac_grade ? `NAAC ${college.naac_grade}` : 'Not specified'}</td></tr>
                    <tr><th>NIRF Ranking</th><td>{college.nirf_rank ? `#${college.nirf_rank}` : 'Not ranked'}</td></tr>
                    <tr><th>Counselling Code</th><td>{college.counselling_code || 'Not specified'}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="info-card">
                <h3>Contact Information</h3>
                <table className="info-table">
                  <tbody>
                    <tr><th>Address</th><td>{college.address || 'Not specified'}</td></tr>
                    <tr><th>City</th><td>{college.location_city}</td></tr>
                    <tr><th>State</th><td>{college.location_state}</td></tr>
                    <tr><th>Pincode</th><td>{college.location_pincode || 'Not specified'}</td></tr>
                    <tr><th>Website</th><td>{college.website_url ? <a href={college.website_url} target="_blank" rel="noopener noreferrer">Visit Website</a> : 'Not specified'}</td></tr>
                    <tr><th>Contact</th><td>{college.contact_phone || 'Not specified'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Courses & Cutoffs Tab */}
        {activeTab === 'courses' && (
          <div className="courses-tab">
            <div className="info-card">
              <h3>Courses Offered with Cutoff Marks</h3>
              {courses.length === 0 ? (
                <p>No course information available.</p>
              ) : (
                <div className="courses-table-container">
                  <table className="courses-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Degree</th>
                        <th>Duration</th>
                        <th>OC Cutoff</th>
                        <th>BC Cutoff</th>
                        <th>MBC Cutoff</th>
                        <th>SC/ST Cutoff</th>
                        <th>Intake</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={course.course_id || index}>
                          <td><strong>{course.course_code}</strong></td>
                          <td className="course-name">{course.course_name}</td>
                          <td>{course.degree_name}</td>
                          <td>{course.duration_years} years</td>
                          <td>{formatCutoff(course.cutoff_oc)}</td>
                          <td>{formatCutoff(course.cutoff_bc)}</td>
                          <td>{formatCutoff(course.cutoff_mbc)}</td>
                          <td>{formatCutoff(course.cutoff_sc)} / {formatCutoff(course.cutoff_st)}</td>
                          <td>{course.intake_seats || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {college.scholarship_amount && (
              <div className="info-card scholarship-card">
                <h3>💰 Scholarship Information</h3>
                <p>Scholarship Amount: {formatCurrency(college.scholarship_amount)}</p>
                {college.scholarship_criteria && <p>{college.scholarship_criteria}</p>}
              </div>
            )}
          </div>
        )}

        {/* Fee Structure Tab */}
        {activeTab === 'fees' && (
          <div className="fees-tab">
            <div className="info-card">
              <h3>Fee Structure</h3>
              {feeStructure.length === 0 ? (
                <p>Detailed fee structure will be updated soon.</p>
              ) : (
                <div className="fee-structure">
                  {feeStructure.map((fee, index) => (
                    <div key={fee.fee_id || index} className="fee-item">
                      <div className="fee-category">
                        {fee.course_name ? `${fee.course_name} (${fee.academic_year})` : fee.academic_year}
                      </div>
                      <div className="fee-details">
                        <div className="fee-row">
                          <span>Tuition Fee:</span>
                          <strong>{formatCurrency(fee.tuition_fee)}</strong>
                        </div>
                        {fee.hostel_fees && Object.keys(fee.hostel_fees).length > 0 && (
                          <div className="fee-row">
                            <span>Hostel Fee:</span>
                            <strong>Starting from {formatCurrency(Object.values(fee.hostel_fees)[0]?.fee || 0)}</strong>
                          </div>
                        )}
                        {fee.transport_fee_min > 0 && (
                          <div className="fee-row">
                            <span>Transport Fee:</span>
                            <strong>{formatCurrency(fee.transport_fee_min)} - {formatCurrency(fee.transport_fee_max)}</strong>
                          </div>
                        )}
                        <div className="fee-row">
                          <span>Admission Fee:</span>
                          <strong>{formatCurrency(fee.admission_fee)}</strong>
                        </div>
                        <div className="fee-row total">
                          <span>Total (approx):</span>
                          <strong>{formatCurrency(fee.total_fee)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placements Tab */}
        {activeTab === 'placements' && (
          <div className="placements-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{placementStats?.placement_percentage || 'N/A'}%</div>
                <div className="stat-label">Placement Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(placementStats?.highest_salary || 0)}</div>
                <div className="stat-label">Highest Package</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(placementStats?.average_salary || 0)}</div>
                <div className="stat-label">Average Package</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(placementStats?.median_salary || 0)}</div>
                <div className="stat-label">Median Package</div>
              </div>
            </div>

            <div className="info-card">
              <h3>Placement Highlights</h3>
              <ul className="highlights-list">
                <li>Dedicated placement cell with industry experts</li>
                <li>Regular campus recruitment drives</li>
                <li>Pre-placement training and workshops</li>
                <li>Internship opportunities with top companies</li>
              </ul>
            </div>
          </div>
        )}

        {/* Admissions Tab */}
        {activeTab === 'admissions' && (
          <div className="admissions-tab">
            <div className="info-card">
              <h3>Admission Process</h3>
              <div className="admission-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Application Form</h4>
                    <p>Fill out the online application form through TNEA counseling portal.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Cutoff Marks</h4>
                    <p>Based on your cutoff marks calculated from 12th standard marks.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Counseling</h4>
                    <p>Participate in the TNEA counseling process for seat allocation.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Document Verification</h4>
                    <p>Submit required documents for verification at the college.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Required Documents</h3>
              <div className="documents-list">
                <span className="document-tag">10th Mark Sheet</span>
                <span className="document-tag">12th Mark Sheet</span>
                <span className="document-tag">Transfer Certificate</span>
                <span className="document-tag">Community Certificate (if applicable)</span>
                <span className="document-tag">Passport Size Photos</span>
                <span className="document-tag">Aadhar Card</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="apply-now-btn" onClick={() => alert('Application process will be available soon. Stay tuned!')}>
          Apply Now
        </button>
        <button className="download-brochure-btn" onClick={() => alert('Brochure download will be available soon.')}>
          Download Brochure
        </button>
      </div>
    </div>
  );
}

export default CollegeDetails;