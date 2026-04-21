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
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const courseInputRef = useRef(null);
  const courseDropdownRef = useRef(null);

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
      // Safely access the data array
      const coursesData = response?.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please refresh the page.');
      setCourses([]);
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
    
    // Ensure courses is an array before filtering
    const coursesArray = Array.isArray(courses) ? courses : [];
    
    if (searchValue.trim() === '') {
      setFilteredCourses(coursesArray);
      setShowCourseDropdown(true);
    } else {
      const filtered = coursesArray.filter(course =>
        course && (
          (course.course_name && course.course_name.toLowerCase().includes(searchValue.toLowerCase())) ||
          (course.course_code && course.course_code.toLowerCase().includes(searchValue.toLowerCase()))
        )
      );
      setFilteredCourses(filtered);
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

    try {
      const params = {
        cutoff_mark: formData.cutoffMark,
        community: formData.communityCategory.toLowerCase(),
        preferred_course: formData.preferredCourse,
        preferred_district: formData.preferredDistrict
      };

      const response = await suggestColleges(params);
      setSuggestions(response?.data || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to fetch college suggestions. Please try again.');
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

  return (
    <div className="suggestion-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="hero">
        <div className="hero-ring ring-1"></div>
        <div className="hero-ring ring-2"></div>
        <div className="page-header">
          <div className="panel-icon">✨</div>
          <h1 className="panel-title">College Suggestion</h1>
          <p className="page-subtitle">
            Enter your cutoff mark and preferences to discover colleges you are eligible for.
          </p>
        </div>
      </div>

      <div className="suggestion-container">
        <section className="suggestion-panel">
          <div className="panel-top">
            <div className="panel-icon">🎓</div>
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
                          {course?.course_code && (
                            <div className="course-code">{course.course_code}</div>
                          )}
                          {course?.duration && (
                            <div className="course-duration">{course.duration}</div>
                          )}
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
                <small className="form-hint">Start typing to search for courses</small>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred District</label>
                <select
                  name="preferredDistrict"
                  value={formData.preferredDistrict}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">All</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Tiruchirappalli">Tiruchirappalli</option>
                  <option value="Salem">Salem</option>
                  <option value="Tirunelveli">Tirunelveli</option>
                  <option value="Tiruppur">Tiruppur</option>
                  <option value="Vellore">Vellore</option>
                  <option value="Erode">Erode</option>
                  <option value="Thoothukudi">Thoothukudi</option>
                </select>
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
            <div>Analyzing your preferences...</div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {Array.isArray(suggestions) && suggestions.length > 0 && !loading && (
          <div className="suggestions-container">
            <h2 className="suggestions-title">
              Recommended Colleges ({suggestions.length})
            </h2>
            {suggestions.map((college, index) => {
              const colors = getCollegeColors(college?.college_name);
              return (
                <div key={college?.college_id || index} className="suggestion-card" style={{ borderLeftColor: colors.fg }}>
                  <div className="suggestion-header">
                    <div className="suggestion-logo" style={{ background: colors.fg }}>
                      {getLogoLetters(college?.college_name)}
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{college?.college_name || 'Unknown College'}</div>
                      <div className="suggestion-meta">{college?.location_city || 'N/A'}, {college?.location_state || 'N/A'}</div>
                    </div>
                    <Link to={`/colleges/${college?.college_id}`} className="suggestion-link" style={{ color: colors.fg }}>
                      View Details →
                    </Link>
                  </div>
                  {college?.description && (
                    <div className="suggestion-desc">{college.description.substring(0, 150)}...</div>
                  )}
                  <div className="suggestion-details">
                    <span className="detail-item">📍 {college?.location_city || 'N/A'}</span>
                    {college?.type && (
                      <span className="detail-item" style={{ textTransform: 'capitalize' }}>
                        🏛️ {college.type.replace('_', ' ')}
                      </span>
                    )}
                    {college?.scholarship_available && (
                      <span className="detail-item scholarship-badge">💰 Scholarship Available</span>
                    )}
                    {college?.naac_grade && (
                      <span className="detail-item">⭐ NAAC: {college.naac_grade}</span>
                    )}
                    {college?.placement_percentage && (
                      <span className="detail-item">📊 Placement: {college.placement_percentage}%</span>
                    )}
                    {college?.nirf_rank && (
                      <span className="detail-item">🏆 NIRF Rank: #{college.nirf_rank}</span>
                    )}
                    {college?.hostel_available && (
                      <span className="detail-item">🏠 Hostel Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(Array.isArray(suggestions) && suggestions.length === 0 && !loading && formData.cutoffMark) && (
          <div className="no-results">
            <div>No colleges found matching your criteria. Try adjusting your preferences.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeSuggestion;