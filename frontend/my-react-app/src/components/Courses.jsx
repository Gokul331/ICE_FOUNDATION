import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getCourses, getColleges } from '../services/api';
import '../styles/courses.css';

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [collegesMap, setCollegesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    stream: 'All',
    duration: 'All',
    feeRange: 'All'
  });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all courses
        const coursesData = await getCourses();
        const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData.results || []);
        console.log('Courses loaded:', coursesArray.length);
        
        // Fetch colleges to map college names
        const collegesData = await getColleges();
        const collegesArray = Array.isArray(collegesData) ? collegesData : (collegesData.results || []);
        console.log('Colleges loaded:', collegesArray.length);
        
        // Create college map for quick lookup
        const collegeMap = {};
        collegesArray.forEach(college => {
          collegeMap[college.college_id] = {
            name: college.college_name,
            city: college.location_city,
            state: college.location_state,
            logo: college.logo_url,
            established: college.established_year,
            accreditation: college.naac_grade,
            ranking: college.nirf_rank,
            type: college.type,
            placement: college.placement_percentage,
            median_salary: college.median_salary,
            hostel: college.hostel_available
          };
        });
        
        setCollegesMap(collegeMap);
        setCourses(coursesArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load courses');
        setLoading(false);
      }
    };
    
    fetchData();
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

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    const numAmount = parseFloat(amount);
    if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(1)}L`;
    }
    if (numAmount >= 1000) {
      return `₹${(numAmount / 1000).toFixed(0)}K`;
    }
    return `₹${numAmount.toLocaleString()}`;
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

  const getDurationInYears = (duration) => {
    if (!duration) return 0;
    return parseFloat(duration);
  };

  const getFeeRange = (fees) => {
    if (!fees) return 'All';
    const numFees = parseFloat(fees);
    if (numFees < 50000) return 'Under ₹50K';
    if (numFees < 100000) return '₹50K - ₹1L';
    if (numFees < 200000) return '₹1L - ₹2L';
    if (numFees < 500000) return '₹2L - ₹5L';
    return 'Above ₹5L';
  };

  const enhancedCourses = courses.map(course => {
    const colors = getCollegeColors(course.course_name_display || course.course_name);
    const college = collegesMap[course.college];
    
    return {
      ...course,
      id: course.course_id,
      name: course.course_name_display || course.course_name,
      course_code: course.course_code,
      degree_type: course.degree_type_display || course.degree_type,
      degree_name: course.degree_name,
      college_id: course.college,
      college_name: college?.name || 'College Name N/A',
      college_city: college?.city || '',
      college_state: college?.state || '',
      college_logo: college?.logo,
      college_ranking: college?.ranking,
      college_accreditation: college?.accreditation,
      college_type: college?.type,
      college_placement: college?.placement,
      duration_years: getDurationInYears(course.duration_years),
      duration: `${course.duration_years} years`,
      intake: course.intake_seats,
      government_fee: course.tuition_fee_government || course.tuition_fee_government_formatted,
      management_fee: course.tuition_fee_management || course.tuition_fee_management_formatted,
      scholarship_amount: course.scholarship_amount,
      scholarship_criteria: course.scholarship_criteria,
      cutoffs: {
        oc: course.cutoff_oc,
        bc: course.cutoff_bc,
        bcm: course.cutoff_bcm,
        mbc: course.cutoff_mbc,
        sc: course.cutoff_sc,
        sca: course.cutoff_sca,
        st: course.cutoff_st
      },
      fee_range: getFeeRange(course.tuition_fee_management),
      bg: colors.bg,
      fg: colors.fg
    };
  });

  const filteredAndSortedCourses = (() => {
    let filtered = enhancedCourses.filter(course => {
      const matchesSearch = searchQuery === '' ||
        course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.college_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStream = filters.stream === 'All' || 
        (course.degree_type && course.degree_type.toLowerCase() === filters.stream.toLowerCase());
      
      const matchesDuration = filters.duration === 'All' || 
        course.duration_years === parseInt(filters.duration);
      
      const matchesFee = filters.feeRange === 'All' || 
        course.fee_range === filters.feeRange;
      
      return matchesSearch && matchesStream && matchesDuration && matchesFee;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name) || 0;
        case 'duration':
          return (b.duration_years || 0) - (a.duration_years || 0);
        case 'fees_low':
          return (parseFloat(a.management_fee) || 0) - (parseFloat(b.management_fee) || 0);
        case 'fees_high':
          return (parseFloat(b.management_fee) || 0) - (parseFloat(a.management_fee) || 0);
        default:
          return 0;
      }
    });

    return filtered;
  })();

  const handleApplyNow = (course) => {
    const token = localStorage.getItem('token');
    const collegeData = {
      college_id: course.college_id,
      college_name: course.college_name,
    };
    
    if (!token) {
      navigate('/login', { state: { from: `/courses/${course.id}`, course, college: collegeData } });
    } else {
      navigate('/application-form', { state: { college: collegeData, course } });
    }
  };

  const handleViewCollege = (collegeId) => {
    navigate(`/colleges/${collegeId}`);
  };

  const handleViewCourseDetail = (course) => {
    navigate(`/course-detail/${course.id}`, { state: { course } });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const CourseCard = ({ course, index }) => {
    const collegeColors = getCollegeColors(course.college_name);
    
    return (
      <div 
        className="course-card" 
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Header - College Logo & Name */}
        <div className="course-card-header">
          <div className="college-logo-section" style={{ background: collegeColors.bg, color: collegeColors.fg }}>
            <div className="college-logo">
              {course.college_logo ? (
                <img 
                  src={course.college_logo} 
                  alt={course.college_name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.parentElement) {
                      const fallback = e.target.parentElement.querySelector('.logo-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <span className="logo-fallback" style={{ display: course.college_logo ? 'none' : 'flex' }}>
                {getLogoLetters(course.college_name)}
              </span>
            </div>
          </div>
          <div className="college-details">
            <h3 className="college-name">{course.college_name}</h3>
            <div className="college-location">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{course.college_city || 'Various'}, {course.college_state || 'Location'}</span>
            </div>
            {course.college_accreditation && (
              <div className="college-accreditation">
                <span>NAAC {course.college_accreditation}</span>
              </div>
            )}
          </div>
        
        </div>

        {/* Body - Course Details */}
        <div className="course-card-body">
          <h4 className="course-name-display">
            {course.name}
            <span className="course-code">{course.course_code}</span>
          </h4>
          <div className="degree-badge">{course.degree_name} - {course.degree_type}</div>
          
          {/* Fee Structure */}
          <div className="fee-structure">
            <div className="fee-item">
              <span className="fee-label">Government Quota</span>
              <span className="fee-amount">{formatCurrency(course.government_fee)}/year</span>
            </div>
            <div className="fee-item">
              <span className="fee-label">Management Quota</span>
              <span className="fee-amount">{formatCurrency(course.management_fee)}/year</span>
            </div>
            {course.scholarship_amount && parseFloat(course.scholarship_amount) > 0 && (
              <div className="fee-item scholarship">
                <span className="fee-label">Scholarship Available</span>
                <span className="fee-amount scholarship-amount">Up to {formatCurrency(course.scholarship_amount)}</span>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="course-intake">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span>Intake: {course.intake} seats</span>
          </div>

          {/* Cutoff Information */}
          {course.cutoffs && Object.values(course.cutoffs).some(v => v) && (
            <div className="cutoff-info">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
              <span>Cutoff: OC: {course.cutoffs.oc || 'N/A'} | BC: {course.cutoffs.bc || 'N/A'}</span>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="course-card-footer">
          <button 
            className="apply-btn"
            onClick={() => handleApplyNow(course)}
          >
            Apply Now
          </button>
          <button 
            className="view-college-btn"
            onClick={() => handleViewCollege(course.college_id)}
          >
            View College Details
          </button>
          
        </div>
      </div>
    );
  };

  const CourseListItem = ({ course, index }) => {
    const collegeColors = getCollegeColors(course.college_name);
    
    return (
      <div 
        className="course-list-item" 
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="list-item-logo-section" style={{ background: collegeColors.bg, color: collegeColors.fg }}>
          <div className="list-item-logo">
            {course.college_logo ? (
              <img 
                src={course.college_logo} 
                alt={course.college_name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.parentElement) {
                    const fallback = e.target.parentElement.querySelector('.logo-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <span className="logo-fallback" style={{ display: course.college_logo ? 'none' : 'flex' }}>
              {getLogoLetters(course.college_name)}
            </span>
          </div>
        </div>
        
        <div className="list-item-info">
          <div className="list-college-header">
            <h3 className="list-college-name">{course.college_name}</h3>
            {course.college_accreditation && (
              <span className="list-naac-badge">NAAC {course.college_accreditation}</span>
            )}
          </div>
          <h4 className="list-course-name">{course.name} ({course.course_code})</h4>
          <div className="list-degree">{course.degree_name} - {course.degree_type}</div>
          <div className="list-location">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{course.college_city || 'Various'}, {course.college_state || 'Locations'}</span>
          </div>
          <div className="list-badges">
            <span className="duration-tag">{course.duration}</span>
            <span className="intake-tag">Intake: {course.intake}</span>
          </div>
        </div>
        
        <div className="list-item-fees">
          <div className="fee-row">
            <span>Govt Quota:</span>
            <strong>{formatCurrency(course.government_fee)}/year</strong>
          </div>
          <div className="fee-row">
            <span>Management:</span>
            <strong>{formatCurrency(course.management_fee)}/year</strong>
          </div>
          {course.scholarship_amount && parseFloat(course.scholarship_amount) > 0 && (
            <div className="fee-row scholarship">
              <span>Scholarship:</span>
              <strong>Up to {formatCurrency(course.scholarship_amount)}</strong>
            </div>
          )}
        </div>
        
        <div className="list-item-actions">
          <button 
            className="apply-btn"
            onClick={() => handleApplyNow(course)}
          >
            Apply Now
          </button>
          <button 
            className="view-college-btn"
            onClick={() => handleViewCollege(course.college_id)}
          >
            View College
          </button>
          <button 
            className="view-detail-btn"
            onClick={() => handleViewCourseDetail(course)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="courses-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>{error}</h3>
          <p className="error-detail">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="courses-hero">
        <div className="courses-hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Explore Our Courses
          </div>
          <h1>Find Your Perfect Course</h1>
          <p>Discover thousands of courses from top colleges across India. Compare fees, scholarships, and eligibility to make the right choice.</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="courses-filter-bar">
        <div className="search-wrapper">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search courses or colleges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="filter-select"
            value={filters.stream}
            onChange={(e) => handleFilterChange('stream', e.target.value)}
          >
            <option value="All">All Streams</option>
            <option value="ug">UG Courses</option>
            <option value="pg">PG Courses</option>
            <option value="diploma">Diploma</option>
          </select>

          <select 
            className="filter-select"
            value={filters.duration}
            onChange={(e) => handleFilterChange('duration', e.target.value)}
          >
            <option value="All">All Durations</option>
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="4">4 Years</option>
            <option value="5">5+ Years</option>
          </select>

          <select 
            className="filter-select"
            value={filters.feeRange}
            onChange={(e) => handleFilterChange('feeRange', e.target.value)}
          >
            <option value="All">All Fees</option>
            <option value="Under ₹50K">Under ₹50K</option>
            <option value="₹50K - ₹1L">₹50K - ₹1L</option>
            <option value="₹1L - ₹2L">₹1L - ₹2L</option>
            <option value="₹2L - ₹5L">₹2L - ₹5L</option>
            <option value="Above ₹5L">Above ₹5L</option>
          </select>
        </div>

        <div className="sort-view-group">
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort: A-Z</option>
            <option value="duration">Sort: Duration</option>
            <option value="fees_low">Sort: Fees (Low to High)</option>
            <option value="fees_high">Sort: Fees (High to Low)</option>
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

      {/* Results Count */}
      <div className="courses-results">
        <div className="results-count">
          Found <strong>{filteredAndSortedCourses.length}</strong> course{filteredAndSortedCourses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Courses Display */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="empty-state">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>No courses found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="courses-grid">
          {filteredAndSortedCourses.map((course, index) => (
            <CourseCard key={course.id || index} course={course} index={index} />
          ))}
        </div>
      ) : (
        <div className="courses-list">
          {filteredAndSortedCourses.map((course, index) => (
            <CourseListItem key={course.id || index} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;