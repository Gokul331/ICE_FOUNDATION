import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { suggestColleges, getCourses } from '../services/api';
import '../styles/collegesuggestion.css';

function CollegeSuggestion() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    cutoffMark: '',
    communityCategory: '',
    preferredCourse: '',
    preferredDistrict: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Autocomplete state
  const [courses, setCourses] = useState([]);
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const courseInputRef = useRef(null);
  const courseDropdownRef = useRef(null);

  // All districts of Tamil Nadu
  const tamilNaduDistricts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Kanniyakumari", "Namakkal", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukkudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchCourses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseInputRef.current && !courseInputRef.current.contains(event.target) &&
          courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await getCourses();
      // Handle both response formats
      const coursesData = Array.isArray(response) ? response : (response?.data || []);
      setCourses(coursesData);
      
      // Extract unique course names
      const uniqueCourseMap = new Map();
      coursesData.forEach(course => {
        if (course && course.course_name && !uniqueCourseMap.has(course.course_name)) {
          uniqueCourseMap.set(course.course_name, {
            course_id: course.course_id,
            course_name: course.course_name
          });
        }
      });
      
      const uniqueCoursesList = Array.from(uniqueCourseMap.values());
      setUniqueCourses(uniqueCoursesList);
      setFilteredCourses(uniqueCoursesList);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please refresh the page.');
      setCourses([]);
      setUniqueCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSearch = (e) => {
    const searchValue = e.target.value;
    setCourseSearchTerm(searchValue);
    setFormData(prev => ({
      ...prev,
      preferredCourse: searchValue
    }));

    const coursesArray = Array.isArray(uniqueCourses) ? uniqueCourses : [];

    if (searchValue.trim() === '') {
      setFilteredCourses(coursesArray.slice(0, 20));
      setShowCourseDropdown(true);
    } else {
      const filtered = coursesArray.filter(course =>
        course && course.course_name && 
        course.course_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCourses(filtered.slice(0, 20));
      setShowCourseDropdown(true);
    }
  };

  const selectCourse = (course) => {
    if (course && course.course_name) {
      setFormData(prev => ({
        ...prev,
        preferredCourse: course.course_name
      }));
      setCourseSearchTerm(course.course_name);
      setShowCourseDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.cutoffMark) {
      setError('Please enter your cutoff mark');
      setLoading(false);
      return;
    }
    
    if (!formData.communityCategory) {
      setError('Please select your community category');
      setLoading(false);
      return;
    }

    try {
      const params = {
        cutoff_mark: formData.cutoffMark,
        community: formData.communityCategory.toLowerCase(),
        preferred_course: formData.preferredCourse || '',
        preferred_district: formData.preferredDistrict || ''
      };

      console.log('Sending params:', params); // Debug log

      const response = await suggestColleges(params);
      console.log('Response:', response); // Debug log
      
      // Handle response correctly
      const suggestionsData = Array.isArray(response) ? response : (response?.data || []);
      setSuggestions(suggestionsData);
      
      if (suggestionsData.length === 0) {
        setError('No colleges found matching your criteria. Try adjusting your preferences.');
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err.response?.data?.error || 'Failed to fetch college suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
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

  // Get placement color based on percentage
  const getPlacementColor = (percentage) => {
    if (!percentage) return '#666';
    if (percentage >= 90) return '#2ecc71';
    if (percentage >= 75) return '#27ae60';
    if (percentage >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="suggestion-page">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-ring ring-1"></div>
        <div className="hero-ring ring-2"></div>
        <div className="page-header">
          <span className="panel-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </span>
          <h1 className="page-title">College Suggestion</h1>
          <p className="page-subtitle">
            Enter your cutoff mark and preferences to discover colleges you are eligible for.
          </p>
        </div>
      </div>

      <div className="suggestion-container">
        <section className="suggestion-panel">
          <div className="panel-top">
            <span className="panel-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <div>
              <h2 className="panel-title">Find the best colleges for you</h2>
              <p className="panel-note">Choose your cutoff, community, course, and district to generate personalized college suggestions.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Your Cutoff Mark *</label>
                <input
                  type="number"
                  name="cutoffMark"
                  value={formData.cutoffMark}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 180"
                  min="0"
                  max="1000"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Community Category *</label>
                <select
                  name="communityCategory"
                  value={formData.communityCategory}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="OC">OC</option>
                  <option value="BC">BC</option>
                  <option value="BCM">BCM</option>
                  <option value="MBC">MBC</option>
                  <option value="SC">SC</option>
                  <option value="SCA">SCA</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred Course</label>
                <div className="autocomplete-container" ref={courseInputRef}>
                  <input
                    type="text"
                    value={courseSearchTerm}
                    onChange={handleCourseSearch}
                    onFocus={() => setShowCourseDropdown(true)}
                    className="form-input"
                    placeholder="Type to search for a course..."
                    autoComplete="off"
                  />
                  {loadingCourses && (
                    <div className="autocomplete-loading">Loading courses...</div>
                  )}
                  {showCourseDropdown && Array.isArray(filteredCourses) && filteredCourses.length > 0 && !loadingCourses && (
                    <div className="autocomplete-dropdown" ref={courseDropdownRef}>
                      {filteredCourses.map((course, index) => (
                        <div
                          key={course?.course_id || index}
                          className="autocomplete-item"
                          onClick={() => selectCourse(course)}
                        >
                          <div className="course-name">{course?.course_name || 'Unknown Course'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showCourseDropdown && Array.isArray(filteredCourses) && filteredCourses.length === 0 && courseSearchTerm && !loadingCourses && (
                    <div className="autocomplete-no-results">
                      No courses found matching "{courseSearchTerm}"
                    </div>
                  )}
                </div>
                <small className="form-hint">Start typing to search for courses (optional)</small>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred District</label>
                <select
                  name="preferredDistrict"
                  value={formData.preferredDistrict}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">All Districts</option>
                  {tamilNaduDistricts.map((district, index) => (
                    <option key={index} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <small className="form-hint">Select a specific district or leave as "All Districts"</small>
              </div>
            </div>

            <div className="cta-row">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Finding Colleges...' : 'Find Colleges'}
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your preferences...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {Array.isArray(suggestions) && suggestions.length > 0 && !loading && (
          <div className="suggestions-container">
            <div className="suggestions-header">
              <h2 className="suggestions-title">
                Recommended Colleges ({suggestions.length})
              </h2>
              {formData.preferredCourse && (
                <div className="filter-badge">
                  Course: {formData.preferredCourse}
                </div>
              )}
              {formData.preferredDistrict && (
                <div className="filter-badge">
                  District: {formData.preferredDistrict}
                </div>
              )}
            </div>
            
            {suggestions.map((college, index) => (
              <div key={college?.college_id || index} className="suggestion-card" style={{ borderLeftColor: '#000000' }}>
                <div className="suggestion-header">
                  <div className="suggestion-logo">
                    {getLogoLetters(college?.college_name)}
                  </div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{college?.college_name || 'Unknown College'}</div>
                    <div className="suggestion-meta">{college?.location_city || 'N/A'}, {college?.location_state || 'N/A'}</div>
                  </div>
                  <Link to={`/colleges/${college?.college_id}`} className="suggestion-link">
                    View Details →
                  </Link>
                </div>
                
                {college?.description && (
                  <div className="suggestion-desc">{college.description.substring(0, 150)}...</div>
                )}
                
                <div className="suggestion-details">
                  {college?.location_city && (
                    <span className="detail-item location">
                      📍 {college.location_city}
                    </span>
                  )}
                  {college?.type && (
                    <span className="detail-item type">
                      🏛️ {college.type.replace('_', ' ')}
                    </span>
                  )}
                  {college?.naac_grade && (
                    <span className="detail-item naac">
                      ⭐ NAAC: {college.naac_grade}
                    </span>
                  )}
                  {college?.placement_percentage && (
                    <span className="detail-item placement" style={{ color: getPlacementColor(college.placement_percentage) }}>
                      💼 Placement: {college.placement_percentage}%
                    </span>
                  )}
                  {college?.nirf_rank && (
                    <span className="detail-item nirf">
                      🏆 NIRF Rank: #{college.nirf_rank}
                    </span>
                  )}
                  {college?.hostel_available && (
                    <span className="detail-item hostel">
                      🏠 Hostel Available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {Array.isArray(suggestions) && suggestions.length === 0 && !loading && formData.cutoffMark && !error && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No colleges found</h3>
            <p>No colleges found matching your criteria. Try adjusting your preferences:</p>
            <ul>
              <li>Lower your cutoff mark</li>
              <li>Select a different community category</li>
              <li>Remove or change the preferred course</li>
              <li>Select "All Districts" for broader results</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeSuggestion;