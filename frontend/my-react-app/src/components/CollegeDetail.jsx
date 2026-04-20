import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollegeDetail } from '../services/api';

function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        setLoading(true);
        const response = await getCollegeDetail(id);
        const collegeData = response.data;
        setCollege(collegeData);
        
        // Fetch courses for this college
        if (collegeData.courses) {
          setCourses(collegeData.courses);
        }
        
        // Fetch fees for this college (if you have a fees API)
        // const feesResponse = await getCollegeFees(id);
        // setFees(feesResponse.data);
        
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

  // Generate logo letters from college name
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

  // Get college colors based on name hash
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading college details...</div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: '18px', color: '#E24B4A', marginBottom: '20px' }}>{error || 'College not found'}</div>
        <Link to="/colleges" style={{ color: '#5BB8E0', textDecoration: 'none' }}>← Back to Colleges</Link>
      </div>
    );
  }

  const colors = getCollegeColors(college.college_name);

  return (
    <>
      {/* Navbar */}
      <nav>
        <Link to="/" className="logo-area nav-link">
          <div className="logo-mark">ICE</div>
          <div className="flex flex-col">
            <span className="logo-text"><span>ICE</span> Foundation</span>
            <span className="logo-subtext">Inspire Connect Empower</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/colleges" className="nav-link active">College Matches</Link>
          <Link to="/college-suggestion" className="nav-link">College Suggestion</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {user ? (
            <div className="nav-user">
              <span className="nav-user-greeting">Hi, {user.username}</span>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="nav-btn">Login / Register</Link>
          )}
        </div>
      </nav>

      <div className="page-body" style={{ padding: '28px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/colleges" style={{ color: '#5BB8E0', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>← Back to Colleges</Link>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* College Card */}
          <div style={{
            flex: '1',
            minWidth: '300px',
            background: colors.bg,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${colors.fg}20`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: colors.fg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '800',
                color: '#fff'
              }}>
                {/* Use logo_url if available, otherwise fallback to letters */}
                {college.logo_url ? (
                  <img
                    src={college.logo_url}
                    alt={college.college_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = getLogoLetters(college.college_name);
                    }}
                  />
                ) : (
                  getLogoLetters(college.college_name)
                )}
              </div>

              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0A1628', margin: '0 0 4px 0' }}>
                  {college.college_name}
                </h2>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>
                  {college.location_city}, {college.location_state}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {college.type && (
                <span style={{
                  padding: '4px 12px',
                  background: '#fff',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.fg,
                  textTransform: 'capitalize'
                }}>
                  {college.type.replace('_', ' ')}
                </span>
              )}
              {college.affiliation && (
                <span style={{
                  padding: '4px 12px',
                  background: '#fff',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.fg,
                  textTransform: 'capitalize'
                }}>
                  {college.affiliation.replace('_', ' ')}
                </span>
              )}
              {college.scholarship_available && (
                <span style={{
                  padding: '4px 12px',
                  background: '#1D9E75',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Scholarship Available
                </span>
              )}
            </div>

            {college.naac_grade && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>NAAC Grade:</div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: colors.fg }}>{college.naac_grade}</span>
              </div>
            )}

            {college.nirf_rank && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>NIRF Ranking:</div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: colors.fg }}>#{college.nirf_rank}</span>
              </div>
            )}

            {college.hostel_available !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>Hostel:</div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: college.hostel_available ? '#1D9E75' : '#E24B4A' }}>
                  {college.hostel_available ? 'Available' : 'Not Available'}
                </span>
              </div>
            )}

            <p style={{ fontSize: '15px', color: '#2D3E55', lineHeight: '1.6', margin: '0' }}>
              {college.description || 'No description available.'}
            </p>
          </div>

          {/* Action Panel */}
          <div style={{
            flex: '0 0 300px',
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #E2ECF5'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0A1628', margin: '0 0 24px 0' }}>
              Ready to Apply?
            </h3>

            {/* Fees from Fees model - you'll need to fetch this separately */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Annual Tuition Fee</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#0A1628' }}>
                {fees?.tuition_fee ? `₹${fees.tuition_fee.toLocaleString()}` : 'Contact college'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Application Fee</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#0A1628' }}>₹1,500</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Processing Time</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#0A1628' }}>2-3 weeks</div>
            </div>

            <button style={{
              width: '100%',
              padding: '16px',
              background: colors.fg,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Start Application
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/contact" style={{ color: '#5BB8E0', textDecoration: 'none', fontSize: '14px' }}>
                Need help? Contact us
              </Link>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        {courses && courses.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0A1628', marginBottom: '20px' }}>Available Courses</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {courses.map(course => (
                <div key={course.course_id} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E2ECF5',
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0A1628', margin: '0 0 8px 0', textTransform: 'capitalize' }}>
                    {course.course_name}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#4A6580', marginBottom: '8px' }}>
                    {course.degree_name} • {course.duration_years} years
                  </div>
                  {course.specialization && (
                    <div style={{ fontSize: '13px', color: '#4A6580', marginBottom: '8px' }}>
                      Specialization: {course.specialization}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {course.intake_seats && (
                      <span style={{ fontSize: '12px', padding: '2px 8px', background: '#F0F4F8', borderRadius: '4px' }}>
                        Intake: {course.intake_seats}
                      </span>
                    )}
                    {course.cutoff_oc && (
                      <span style={{ fontSize: '12px', padding: '2px 8px', background: '#F0F4F8', borderRadius: '4px' }}>
                        Cutoff OC: {course.cutoff_oc}
                      </span>
                    )}
                    {course.scholarship_amount && (
                      <span style={{ fontSize: '12px', padding: '2px 8px', background: '#1D9E75', color: '#fff', borderRadius: '4px' }}>
                        Scholarship: ₹{course.scholarship_amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placement Stats */}
        {(college.placement_percentage || college.highest_salary || college.avg_salary) && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0A1628', marginBottom: '20px' }}>Placement Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {college.placement_percentage && (
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E2ECF5',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1D9E75' }}>{college.placement_percentage}%</div>
                  <div style={{ fontSize: '14px', color: '#4A6580' }}>Placement Rate</div>
                </div>
              )}
              {college.highest_salary && (
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E2ECF5',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: colors.fg }}>
                    ₹{(college.highest_salary / 100000).toFixed(1)} LPA
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6580' }}>Highest Package</div>
                </div>
              )}
              {college.avg_salary && (
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E2ECF5',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: colors.fg }}>
                    ₹{(college.avg_salary / 100000).toFixed(1)} LPA
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6580' }}>Average Package</div>
                </div>
              )}
              {college.median_salary && (
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E2ECF5',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: colors.fg }}>
                    ₹{(college.median_salary / 100000).toFixed(1)} LPA
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6580' }}>Median Package</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #E2ECF5;
          padding: 0 40px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #87CEEB, #5BB8E0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .logo-text {
          font-size: 17px;
          font-weight: 700;
          color: #0A1628;
          letter-spacing: -0.4px;
        }
        .logo-text span {
          color: #5BB8E0;
        }
        .logo-subtext {
          font-size: 10px;
          font-weight: 500;
          color: #4A6580;
          letter-spacing: 0.5px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #2D3E55;
          text-decoration: none;
          border-radius: 8px;
          transition: all .2s;
          border: none;
          background: none;
          cursor: pointer;
        }
        .nav-link:hover {
          background: #EAF7FD;
          color: #5BB8E0;
        }
        .nav-link.active {
          background: #EAF7FD;
          color: #5BB8E0;
          font-weight: 700;
        }
        .nav-btn {
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: #5BB8E0;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all .2s;
          letter-spacing: -0.2px;
        }
        .nav-btn:hover {
          background: #0A1628;
          transform: translateY(-1px);
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-user-greeting {
          font-size: 14px;
          font-weight: 500;
          color: #2D3E55;
        }
        .page-body {
          min-height: calc(100vh - 72px);
        }
        @media(max-width:992px) {
          nav {
            padding: 0 20px;
          }
          .page-body {
            padding: 20px 20px;
          }
        }
        @media(max-width:640px) {
          nav {
            padding: 0 16px;
          }
          .page-body {
            padding: 16px 16px;
          }
        }
      `}</style>
    </>
  );
}

export default CollegeDetail;