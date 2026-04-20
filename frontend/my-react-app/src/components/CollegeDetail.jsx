import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollegeDetail, getCollegeCourses } from '../services/api';
import Navbar from './Navbar';

function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

// In CollegeDetail component, update the useEffect:

useEffect(() => {
  const fetchCollegeData = async () => {
    try {
      setLoading(true);
      
      // Fetch college details - data is now the college object directly
      const collegeData = await getCollegeDetail(id);
      setCollege(collegeData);
      
      // Try to fetch courses for this college
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading college details...</div>
        </div>
      </>
    );
  }

  if (error || !college) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: '18px', color: '#E24B4A', marginBottom: '20px' }}>{error || 'College not found'}</div>
          <Link to="/colleges" style={{ color: '#5BB8E0', textDecoration: 'none' }}>← Back to Colleges</Link>
        </div>
      </>
    );
  }

  const colors = getCollegeColors(college.college_name);
  // Use address as description since description might not exist
  const description = college.description || college.address || 'No description available.';

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="page-body" style={{ padding: '28px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/colleges" style={{ color: '#5BB8E0', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
          ← Back to Colleges
        </Link>

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
              {/* Check for scholarship using median_salary or other fields */}
              {(college.median_salary || college.scholarship_available) && (
                <span style={{
                  padding: '4px 12px',
                  background: '#1D9E75',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  💰 Scholarship Available
                </span>
              )}
              {college.hostel_available && (
                <span style={{
                  padding: '4px 12px',
                  background: '#5BB8E0',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  🏠 Hostel Available
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

            {college.established_year && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>Established:</div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#2D3E55' }}>{college.established_year}</span>
              </div>
            )}

            {college.counselling_code && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>Counselling Code:</div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: colors.fg }}>{college.counselling_code}</span>
              </div>
            )}

            <p style={{ fontSize: '15px', color: '#2D3E55', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              {description}
            </p>

            {college.address && college.address !== description && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${colors.fg}20` }}>
                <div style={{ fontSize: '13px', color: '#4A6580', marginBottom: '4px' }}>📍 Address</div>
                <div style={{ fontSize: '14px', color: '#2D3E55' }}>{college.address}</div>
              </div>
            )}
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

            {college.median_salary && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Median Package</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: colors.fg }}>
                  ₹{(college.median_salary / 100000).toFixed(1)} LPA
                </div>
              </div>
            )}

            {college.placement_percentage && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Placement Rate</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: colors.fg }}>
                  {college.placement_percentage}%
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Application Fee</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#0A1628' }}>Contact College</div>
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
              {courses.map((course, index) => (
                <div key={course.course_id || index} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E2ECF5',
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0A1628', margin: '0 0 8px 0', textTransform: 'capitalize' }}>
                    {course.course_name || course.name}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#4A6580', marginBottom: '8px' }}>
                    {course.degree_name || course.degree} • {course.duration_years || course.duration} years
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
                    {course.fees && (
                      <span style={{ fontSize: '12px', padding: '2px 8px', background: '#F0F4F8', borderRadius: '4px' }}>
                        Fees: ₹{course.fees.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placement Stats Section */}
        {(college.placement_percentage || college.highest_salary || college.avg_salary || college.median_salary) && (
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
    </>
  );
}

export default CollegeDetail;