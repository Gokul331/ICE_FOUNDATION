import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollegeDetail, getCollegeCourses } from '../services/api';
import Navbar from './Navbar';
import '../styles/collegedetails.css';

function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        setLoading(true);
        const collegeData = await getCollegeDetail(id);
        setCollege(collegeData);

        try {
          const coursesData = await getCollegeCourses(id);
          setCourses(Array.isArray(coursesData) ? coursesData : (coursesData.results || []));
        } catch (coursesErr) {
          console.log('No courses found for this college');
          setCourses([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching college:', err);
        setError('College not found');
        setLoading(false);
      }
    };
    fetchCollegeData();
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
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

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading college details...</p>
        </div>
      </>
    );
  }

  if (error || !college) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>{error || 'College not found'}</h3>
          <Link to="/colleges" className="back-btn">Back to Colleges</Link>
        </div>
      </>
    );
  }

  const description = college.description || college.address || 'No description available.';

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="college-details-page">
        {/* Hero Section */}
        <div className="college-hero">
          <div className="college-hero-content">
            <div className="college-logo-large">
              {college.logo_url ? (
                <img
                  src={college.logo_url}
                  alt={college.college_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = getLogoLetters(college.college_name);
                  }}
                />
              ) : (
                getLogoLetters(college.college_name)
              )}
            </div>

            <div className="college-title-section">
              <h1>{college.college_name}</h1>
              <div className="college-meta">
                <span className="meta-item">{college.location_city}, {college.location_state}</span>
                {college.type && <span className="meta-item" style={{ textTransform: 'capitalize' }}>{college.type.replace('_', ' ')}</span>}
              </div>
              <div className="college-quick-stats">
                {college.placement_percentage && (
                  <div className="stat">
                    <span className="stat-label">Placement</span>
                    <span className="stat-value">{college.placement_percentage}%</span>
                  </div>
                )}
                {college.median_salary && (
                  <div className="stat">
                    <span className="stat-label">Median Package</span>
                    <span className="stat-value">₹{(college.median_salary / 100000).toFixed(1)} LPA</span>
                  </div>
                )}
                {college.nirf_rank && (
                  <div className="stat">
                    <span className="stat-label">NIRF Rank</span>
                    <span className="stat-value">#{college.nirf_rank}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="tab-content">
          <Link to="/colleges" className="back-btn" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '24px', gap: '8px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Colleges
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
            {/* Left Column */}
            <div>
              {/* About Card */}
              <div className="info-card">
                <h3>About {college.college_name}</h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {college.type && (
                    <span className="badge badge-dark" style={{ textTransform: 'capitalize' }}>
                      {college.type.replace('_', ' ')}
                    </span>
                  )}
                  {college.affiliation && (
                    <span className="badge badge-outline" style={{ textTransform: 'capitalize' }}>
                      {college.affiliation.replace('_', ' ')}
                    </span>
                  )}
                  {(college.median_salary || college.scholarship_available) && (
                    <span className="badge badge-dark">
                      Scholarship
                    </span>
                  )}
                  {college.hostel_available && (
                    <span className="badge badge-outline">
                      Hostel
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {college.naac_grade && (
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <div style={{ fontSize: '12px', color: '#737373', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NAAC Grade</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#000000' }}>{college.naac_grade}</div>
                    </div>
                  )}
                  {college.nirf_rank && (
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <div style={{ fontSize: '12px', color: '#737373', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIRF Ranking</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#000000' }}>#{college.nirf_rank}</div>
                    </div>
                  )}
                  {college.established_year && (
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <div style={{ fontSize: '12px', color: '#737373', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Established</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#000000' }}>{college.established_year}</div>
                    </div>
                  )}
                  {college.counselling_code && (
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <div style={{ fontSize: '12px', color: '#737373', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Counselling Code</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#000000' }}>{college.counselling_code}</div>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '15px', color: '#404040', lineHeight: '1.8', marginBottom: '20px' }}>
                  {description}
                </p>

                {college.address && college.address !== description && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e5e5e5' }}>
                    <div style={{ fontSize: '12px', color: '#737373', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Address</div>
                    <div style={{ fontSize: '14px', color: '#262626', fontWeight: '500' }}>{college.address}</div>
                  </div>
                )}
              </div>

              {/* Courses Section */}
              {courses && courses.length > 0 && (
                <div className="info-card" style={{ marginTop: '32px' }}>
                  <h3>Available Courses</h3>
                  <div className="courses-table-container">
                    <table className="courses-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Degree</th>
                          <th>Duration</th>
                          <th>Intake</th>
                          <th>Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course, index) => (
                          <tr key={course.course_id || index}>
                            <td className="course-name">{course.course_name || course.name}</td>
                            <td>{course.degree_name || course.degree || 'N/A'}</td>
                            <td>{course.duration_years || course.duration || 'N/A'} years</td>
                            <td>{course.intake_seats || 'N/A'}</td>
                            <td>{course.fees ? `₹${course.fees.toLocaleString()}` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Action Panel */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div className="info-card-action">
                <h3>Ready to Apply?</h3>

                {college.median_salary && (
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '12px', color: '#737373', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Median Package</div>
                    <div className="action-stat-value">₹{(college.median_salary / 100000).toFixed(1)} LPA</div>
                  </div>
                )}

                {college.placement_percentage && (
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '12px', color: '#737373', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Placement Rate</div>
                    <div className="action-stat-value">{college.placement_percentage}%</div>
                  </div>
                )}

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '12px', color: '#737373', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application Fee</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#000000' }}>Contact College</div>
                </div>

                <button className="action-btn">
                  Start Application
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Link to="/contact" style={{ color: '#000000', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
                    Need help? Contact us →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Placement Stats Section */}
          {(college.placement_percentage || college.highest_salary || college.avg_salary || college.median_salary) && (
            <div style={{ marginTop: '48px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#000000', marginBottom: '32px', letterSpacing: '-0.5px' }}>Placement Statistics</h3>
              <div className="stats-grid">
                {college.placement_percentage && (
                  <div className="stat-card">
                    <div className="stat-value">{college.placement_percentage}%</div>
                    <div className="stat-label">Placement Rate</div>
                  </div>
                )}
                {college.highest_salary && (
                  <div className="stat-card">
                    <div className="stat-value">₹{(college.highest_salary / 100000).toFixed(1)} LPA</div>
                    <div className="stat-label">Highest Package</div>
                  </div>
                )}
                {college.avg_salary && (
                  <div className="stat-card">
                    <div className="stat-value">₹{(college.avg_salary / 100000).toFixed(1)} LPA</div>
                    <div className="stat-label">Average Package</div>
                  </div>
                )}
                {college.median_salary && (
                  <div className="stat-card">
                    <div className="stat-value">₹{(college.median_salary / 100000).toFixed(1)} LPA</div>
                    <div className="stat-label">Median Package</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CollegeDetail;
