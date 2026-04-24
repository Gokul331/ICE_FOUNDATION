import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { getColleges, getCollegeCourses } from '../services/api';
import '../styles/colleges.css';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ stream: 'All', type: 'All' });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [coursesMap, setCoursesMap] = useState({}); // Store courses for each college
  const [expandedCollege, setExpandedCollege] = useState(null); // Track expanded college for courses
  const [loadingCourses, setLoadingCourses] = useState({}); // Track loading state per college

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const data = await getColleges();
        const collegesArray = Array.isArray(data) ? data : (data.results || []);
        setColleges(collegesArray);

        // Pre-fetch courses for all colleges
        const coursesPromises = collegesArray.map(async (college) => {
          const collegeId = college.college_id || college.id;
          try {
            const courses = await getCollegeCourses(collegeId);
            return { collegeId, courses };
          } catch (error) {
            return { collegeId, courses: [] };
          }
        });

        const coursesResults = await Promise.all(coursesPromises);
        const newCoursesMap = {};
        coursesResults.forEach(({ collegeId, courses }) => {
          newCoursesMap[collegeId] = courses;
        });
        setCoursesMap(newCoursesMap);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setError('Failed to load colleges');
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Fetch courses for a specific college
  const fetchCourses = async (collegeId) => {
    if (coursesMap[collegeId]) {
      // Courses already loaded, just toggle expansion
      setExpandedCollege(expandedCollege === collegeId ? null : collegeId);
      return;
    }

    setLoadingCourses(prev => ({ ...prev, [collegeId]: true }));
    
    try {
      const courses = await getCollegeCourses(collegeId);
      setCoursesMap(prev => ({ ...prev, [collegeId]: courses }));
      setExpandedCollege(collegeId);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set empty array on error
      setCoursesMap(prev => ({ ...prev, [collegeId]: [] }));
    } finally {
      setLoadingCourses(prev => ({ ...prev, [collegeId]: false }));
    }
  };

  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const getCollegeColors = (name) => {
    const colors = [
      { bg: "#f5f5f5", fg: "#000000" },
      { bg: "#fafafa", fg: "#1a1a1a" },
      { bg: "#f0f0f0", fg: "#000000" },
      { bg: "#f5f5f5", fg: "#111111" },
      { bg: "#fafafa", fg: "#222222" }
    ];
    const hash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return colors[hash % colors.length];
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

  const formatType = (type) => {
    if (!type) return 'Private';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const enhancedColleges = useMemo(() => {
    return colleges.map(college => {
      const colors = getCollegeColors(college.college_name || college.name);
      return {
        ...college,
        id: college.college_id || college.id,
        name: college.college_name || college.name,
        city: college.location_city || college.district || 'Tamil Nadu',
        district: college.district || college.location_city || '',
        state: college.location_state || college.state,
        stream: college.type || 'Engineering',
        type: formatType(college.type),
        scholarship: college.scholarship_available || false,
        desc: college.address || college.description || 'No description available.',
        logo: college.logo_url || getLogoLetters(college.college_name || college.name),
        bg: colors.bg,
        fg: colors.fg,
        placement_percentage: college.placement_percentage,
        nirf_rank: college.nirf_rank,
        naac_grade: college.naac_grade,
        hostel_available: college.hostel_available,
        median_salary: college.median_salary
      };
    });
  }, [colleges]);

  const filteredAndSortedColleges = useMemo(() => {
    let filtered = enhancedColleges.filter(college => {
      const matchesSearch = searchQuery === '' ||
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.city && college.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filters.type === 'All' || college.type === filters.type;

      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'placement':
          return (b.placement_percentage || 0) - (a.placement_percentage || 0);
        case 'fees':
          return (a.median_salary || 0) - (b.median_salary || 0);
        case 'nirf':
          return (a.nirf_rank || 999) - (b.nirf_rank || 999);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enhancedColleges, searchQuery, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Render courses component
  const renderCourses = (college) => {
    const collegeId = college.id;
    const courses = coursesMap[collegeId];
    const isLoading = loadingCourses[collegeId];
    const isExpanded = expandedCollege === collegeId;

    if (!isExpanded) return null;

    return (
      <div className="courses-section" onClick={(e) => e.preventDefault()}>
        <div className="courses-header">
          <h4>Courses Offered</h4>
          <span className="courses-count">{courses?.length || 0} courses</span>
        </div>
        
        {isLoading ? (
          <div className="courses-loading">
            <div className="loading-spinner-small"></div>
            <span>Loading courses...</span>
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="course-card">
                <div className="course-header">
                  <h5 className="course-name">{course.course_name || course.name}</h5>
                  {course.duration && (
                    <span className="course-duration">{course.duration}</span>
                  )}
                </div>
                
                <div className="course-details">
                  {course.fees && (
                    <div className="course-fee">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 2v20M17 7H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                      </svg>
                      <span>Fees: {formatCurrency(course.fees)}</span>
                    </div>
                  )}
                  
                  {course.intake && (
                    <div className="course-intake">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                        <path d="M16 3.13a4 4 0 010 7.75"/>
                      </svg>
                      <span>Intake: {course.intake}</span>
                    </div>
                  )}
                  
                  {course.eligibility && (
                    <div className="course-eligibility">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                      </svg>
                      <span>{course.eligibility}</span>
                    </div>
                  )}
                </div>
                
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                
                <button 
                  className="course-apply-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Applied to ${course.course_name || course.name} at ${college.name}!`);
                  }}
                >
                  Apply for this course
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <p>No courses available for this college.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCollegeCard = (college, index) => {
    const isExpanded = expandedCollege === college.id;
    const courses = coursesMap[college.id] || [];
    const previewCourses = courses.slice(0, 5);

    if (viewMode === 'grid') {
      return (
        <div key={college.id}>
          <Link
            to={`/colleges/${college.id}`}
            className="college-card-link"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="college-card" data-index={index}>
              <div className="card-header">
                <div className="card-logo" style={{ background: college.bg, color: college.fg }}>
                  {college.logo && college.logo.startsWith('http') ? (
                    <img src={college.logo} alt={getLogoLetters(college.name)} className="logo-img" />
                  ) : (
                    <span className="logo-text">{college.logo}</span>
                  )}
                </div>
                <div className="card-meta">
                  <div className="card-name">{college.name}</div>
                  <div className="card-location">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {college.district}, {college.state}
                  </div>
                </div>
              </div>
              <div className="card-body">
                
                {previewCourses.length > 0 && (
                  <div className="card-courses-preview">
                    <div className="courses-preview-header">Top Courses</div>
                    <ul className="courses-preview-list">
                      {previewCourses.map((course, idx) => (
                        <li key={course.id || idx} className="course-preview-item">
                          {course.course_name || course.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <span className="view-all-link">
                  View All Courses
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
                <button
                  className="apply-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Applied to ${college.name}!`);
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </Link>
        </div>
      );
    } else {
      const previewCourses = (coursesMap[college.id] || []).slice(0, 5);
      return (
        <div key={college.id}>
          <Link
            to={`/colleges/${college.id}`}
            className="college-card-link"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="list-card">
              <div className="list-logo" style={{ background: college.bg, color: college.fg }}>
                {college.logo && college.logo.startsWith('http') ? (
                  <img src={college.logo} alt={getLogoLetters(college.name)} />
                ) : (
                  <span>{college.logo}</span>
                )}
              </div>
              <div className="list-info">
                <div className="list-name">{college.name}</div>
                <div className="list-loc">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {college.district}, {college.state}
                </div>
                <div className="list-tags">
                  {college.scholarship && <span className="tag tag-scholarship">Scholarship</span>}
                  {college.hostel_available && <span className="tag tag-hostel">Hostel</span>}
                  <span className="tag tag-type">{college.type}</span>
                </div>
                {previewCourses.length > 0 && (
                  <div className="list-courses-preview">
                    <span className="courses-preview-label">Top Courses:</span>
                    {previewCourses.map((course, idx) => (
                      <span key={course.id || idx} className="course-preview-tag">
                        {course.course_name || course.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="list-right">
                <div className="list-rating">
                  {college.nirf_rank && (
                    <span>NIRF: {college.nirf_rank}</span>
                  )}
                  {college.placement_percentage && (
                    <span className="placement-info">{college.placement_percentage}% Placed</span>
                  )}
                </div>
                <Link to={`/colleges/${college.id}`} className="view-all-link-small">
                  View All Courses
                </Link>
                <button
                  className="apply-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Applied to ${college.name}!`);
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </Link>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="colleges-page" onMouseMove={handleMouseMove}>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading colleges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="colleges-page" onMouseMove={handleMouseMove}>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>{error}</h3>
          <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="colleges-page" onMouseMove={handleMouseMove}>
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section - 3D Animated */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Smart matches in seconds
          </div>
          <h1>Explore college options built around your goals.</h1>
          <p>Search, compare, and shortlist colleges with fast recommendations from our matching engine.</p>
          <div className="hero-search">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search college or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" onClick={() => {}}>Search</button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">Type</span>
          <div className="filter-chips">
            {['All', 'Government', 'Private', 'Aided', 'Autonomous'].map(type => (
              <button
                key={type}
                className={`chip ${filters.type === type ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="sort-group">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort: A-Z</option>
            <option value="placement">Sort: Placement %</option>
            <option value="fees">Sort: Fees (Low to High)</option>
            <option value="nirf">Sort: NIRF Ranking</option>
          </select>
          <div className="view-toggle">
            <button
              className={`vt-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={`vt-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="page-body">
        <div className="results-meta">
          <div className="results-count">
            Showing <strong>{filteredAndSortedColleges.length}</strong> college{filteredAndSortedColleges.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'grid-view' : 'list-view'}>
          {filteredAndSortedColleges.map((college, index) => renderCollegeCard(college, index))}
        </div>

        {filteredAndSortedColleges.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h3>No colleges found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Colleges;