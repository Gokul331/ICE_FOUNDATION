import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/applicationForm.css';
import { SiTicktick } from "react-icons/si";
import {
  submitApplication,
  getCollegeCategories,
  getCategoryDegreeTypes,
  getDegreeCourses,
  getCollegeDetail
} from '../services/api';

function ApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { college: passedCollege, course: passedCourse, quotaType } = location.state || {};

  // Hierarchical selection states
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(passedCollege?.college_id || '');
  const [collegeName, setCollegeName] = useState(passedCollege?.college_name || '');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const [degreeTypes, setDegreeTypes] = useState([]);
  const [selectedDegreeType, setSelectedDegreeType] = useState('');
  const [selectedDegreeTypeName, setSelectedDegreeTypeName] = useState('');

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(passedCourse?.course_id || '');
  const [selectedCourseName, setSelectedCourseName] = useState(passedCourse?.course_name || '');
  const [selectedDepartment, setSelectedDepartment] = useState(passedCourse?.course_code || '');

  const [loadingFields, setLoadingFields] = useState({
    categories: false,
    degreeTypes: false,
    courses: false
  });

  // Form data state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    date_of_birth: '',
    email_id: '',
    aadhar_number: '',
    father_name: '',
    father_mobile: '',
    mother_name: '',
    mother_mobile: '',
    address_line1: '',
    address_line2: '',
    city: '',
    pincode: '',
    gender: '',
    community: '',
    blood_group: '',
    tenth_marks_percentage: '',
    twelfth_marks_percentage: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://ice-foundation-1.onrender.com/api/colleges/');
        const data = await response.json();
        const collegesArray = Array.isArray(data) ? data : data.results || [];
        // Remove duplicate colleges by ID
        const uniqueColleges = collegesArray.filter((college, index, self) =>
          index === self.findIndex(c => c.college_id === college.college_id)
        );
        setColleges(uniqueColleges);
      } catch (err) {
        console.error('Error fetching colleges:', err);
      }
    };
    fetchColleges();
  }, []);

  // Pre-fill user data
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setFormData(prev => ({
        ...prev,
        first_name: userData.first_name || prev.first_name,
        last_name: userData.last_name || prev.last_name,
        email_id: userData.email || prev.email_id,
      }));
    }
  }, []);

  // Load categories when college changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedCollege) {
        setCategories([]);
        setSelectedCategory('');
        setSelectedCategoryName('');
        setDegreeTypes([]);
        setSelectedDegreeType('');
        setCourses([]);
        setSelectedCourse('');
        return;
      }

      setLoadingFields(prev => ({ ...prev, categories: true }));
      try {
        const response = await getCollegeCategories(selectedCollege);
        if (response.success && response.categories) {
          // Remove duplicate categories by code
          const uniqueCategories = response.categories.filter((cat, index, self) =>
            index === self.findIndex(c => c.code === cat.code)
          );
          setCategories(uniqueCategories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setCategories([]);
      } finally {
        setLoadingFields(prev => ({ ...prev, categories: false }));
      }
    };

    loadCategories();
  }, [selectedCollege]);

  // Load degree types when category changes
  useEffect(() => {
    const loadDegreeTypes = async () => {
      if (!selectedCollege || !selectedCategory) {
        setDegreeTypes([]);
        setSelectedDegreeType('');
        setCourses([]);
        setSelectedCourse('');
        return;
      }

      setLoadingFields(prev => ({ ...prev, degreeTypes: true }));
      try {
        const response = await getCategoryDegreeTypes(selectedCollege, selectedCategory);
        if (response.success && response.degree_types) {
          // Remove duplicate degree types by code
          const uniqueDegreeTypes = response.degree_types.filter((degree, index, self) =>
            index === self.findIndex(d => d.code === degree.code)
          );
          setDegreeTypes(uniqueDegreeTypes);
        } else {
          setDegreeTypes([]);
        }
      } catch (err) {
        console.error('Error loading degree types:', err);
        setDegreeTypes([]);
      } finally {
        setLoadingFields(prev => ({ ...prev, degreeTypes: false }));
      }
    };

    loadDegreeTypes();
  }, [selectedCollege, selectedCategory]);

  // Load courses when degree type changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedCollege || !selectedCategory || !selectedDegreeType) {
        setCourses([]);
        setSelectedCourse('');
        return;
      }

      setLoadingFields(prev => ({ ...prev, courses: true }));
      try {
        const response = await getDegreeCourses(selectedCollege, selectedCategory, selectedDegreeType);
        if (response.success && response.courses) {
          // Remove duplicate courses by ID
          const uniqueCourses = response.courses.filter((course, index, self) =>
            index === self.findIndex(c => c.id === course.id)
          );
          setCourses(uniqueCourses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        setCourses([]);
      } finally {
        setLoadingFields(prev => ({ ...prev, courses: false }));
      }
    };

    loadCourses();
  }, [selectedCollege, selectedCategory, selectedDegreeType]);

  // Update course name when selected course changes
  useEffect(() => {
    if (selectedCourse && courses.length > 0) {
      const course = courses.find(c => c.id === parseInt(selectedCourse) || c.id === selectedCourse);
      if (course) {
        setSelectedCourseName(course.course_name);
        setSelectedDepartment(course.course_code_display || course.course_code);
      }
    }
  }, [selectedCourse, courses]);

  // Update category name when selected category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(c => c.code === selectedCategory);
      if (category) {
        setSelectedCategoryName(category.name);
      }
    }
  }, [selectedCategory, categories]);

  // Update degree type name when selected degree type changes
  useEffect(() => {
    if (selectedDegreeType && degreeTypes.length > 0) {
      const degree = degreeTypes.find(d => d.code === selectedDegreeType);
      if (degree) {
        setSelectedDegreeTypeName(degree.name);
      }
    }
  }, [selectedDegreeType, degreeTypes]);

  const handleCollegeChange = (e) => {
    const collegeId = parseInt(e.target.value);
    setSelectedCollege(collegeId);
    const college = colleges.find(c => c.college_id === collegeId);
    setCollegeName(college?.college_name || '');
    setSelectedCategory('');
    setSelectedCategoryName('');
    setSelectedDegreeType('');
    setSelectedDegreeTypeName('');
    setSelectedCourse('');
    setSelectedCourseName('');
    setSelectedDepartment('');
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedDegreeType('');
    setSelectedDegreeTypeName('');
    setSelectedCourse('');
    setSelectedCourseName('');
    setSelectedDepartment('');
  };

  const handleDegreeTypeChange = (e) => {
    setSelectedDegreeType(e.target.value);
    setSelectedCourse('');
    setSelectedCourseName('');
    setSelectedDepartment('');
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to submit application');
      setLoading(false);
      navigate('/login');
      return;
    }

    // Validate selections
    if (!selectedCollege || !selectedCategory || !selectedDegreeType || !selectedCourse) {
      setError('Please complete all course selections');
      setLoading(false);
      return;
    }

    // Prepare data for backend
    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name || '',
      mobile_number: formData.mobile_number,
      date_of_birth: formData.date_of_birth,
      email_id: formData.email_id,
      aadhar_number: formData.aadhar_number,
      father_name: formData.father_name,
      father_mobile: formData.father_mobile,
      mother_name: formData.mother_name,
      mother_mobile: formData.mother_mobile || '',
      address_line1: formData.address_line1,
      address_line2: formData.address_line2 || '',
      city: formData.city,
      pincode: formData.pincode,
      course_name: selectedCourseName,
      department_name: selectedDepartment,
      college_id: parseInt(selectedCollege),
      college: parseInt(selectedCollege),
      selected_course_id: parseInt(selectedCourse),
      selected_category: selectedCategory,
      selected_degree_type: selectedDegreeType,
      gender: formData.gender || 'male',
      community: formData.community || 'OC',
      blood_group: formData.blood_group || '',
      tenth_marks_percentage: formData.tenth_marks_percentage ? parseFloat(formData.tenth_marks_percentage) : null,
      twelfth_marks_percentage: formData.twelfth_marks_percentage ? parseFloat(formData.twelfth_marks_percentage) : null,
      has_diploma: false,
      has_ug: false,
    };

    console.log('Submitting data:', submitData);

    try {
      const result = await submitApplication(submitData);

      if (result.success) {
        setShowSuccessModal(true);
        setCountdown(5);
      } else {
        setError(result.error || result.message || 'Failed to submit application');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'An error occurred. Please try again.';
      setError(errorMsg);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Countdown and redirect
  useEffect(() => {
    let timer;
    let countdownInterval;

    if (showSuccessModal) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timer = setTimeout(() => {
        navigate('/my-applications');
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showSuccessModal, navigate]);

  // Check if coming from college detail page (pre-selected)
  const isPreSelected = !!passedCollege || !!passedCourse;

  // Determine if all selections are made
  const isSelectionComplete = selectedCollege && selectedCategory && selectedDegreeType && selectedCourse;

  return (
    <main className="app-shell">
      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-icon">
            <SiTicktick />
          </div>
          <h3>Application Submitted Successfully!</h3>
          <p>
            Thank you for submitting your application. You will be redirected to your applications page shortly.
          </p>
          <p className="redirect-note">
            Redirecting in <span className="countdown">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {!showSuccessModal && (
        <section className="form-panel">
          <header className="form-header">
            <div className="form-title">
              <img src="/Logo.png" alt="Vamshi Edu Care" className="form-logo" />
              <div className="form-title-copy">
                <p className="brand-name">
                  <span className="brand-name-line">Vamshi Edu Care</span>
                </p>
                <h1>Enquiry Form</h1>
                <p className="form-description">
                  Complete your application in one go.
                </p>
              </div>
            </div>
          </header>

          <form className="application-form" onSubmit={handleSubmit}>
            {/* ==================== COURSE SELECTION SECTION (GROUPED) ==================== */}
            <section className="panel-section selection-group">
              <div className="section-heading">
                <div className="step-indicator">Step 1-4</div>
                <h2>Course Selection</h2>
                <p className="section-description">Select your desired course from the options below</p>
              </div>

              <div className="selection-grid">
                {/* College Selection */}
                <div className="selection-item">
                  <label className="selection-label">
                    <span className="step-number">1</span>
                    Select College <span className="required">*</span>
                  </label>
                  <select
                    value={selectedCollege}
                    onChange={handleCollegeChange}
                    disabled={isPreSelected && selectedCollege}
                    className="selection-select"
                    required
                  >
                    <option value="">-- Choose College --</option>
                    {colleges.map(college => (
                      <option key={college.college_id} value={college.college_id}>
                        {college.college_name}
                      </option>
                    ))}
                  </select>
                  {loadingFields.categories && <span className="loading-text">Loading categories...</span>}
                </div>

                {/* Category Selection */}
                <div className="selection-item">
                  <label className="selection-label">
                    <span className="step-number">2</span>
                    Select Category <span className="required">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={!selectedCollege || loadingFields.categories || (isPreSelected && selectedCategory)}
                    className="selection-select"
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map(category => (
                      <option key={category.code} value={category.code}>
                        {category.name} ({category.course_count} courses)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Degree Type Selection */}
                <div className="selection-item">
                  <label className="selection-label">
                    <span className="step-number">3</span>
                    Select Degree Type <span className="required">*</span>
                  </label>
                  <select
                    value={selectedDegreeType}
                    onChange={handleDegreeTypeChange}
                    disabled={!selectedCategory || loadingFields.degreeTypes || (isPreSelected && selectedDegreeType)}
                    className="selection-select"
                    required
                  >
                    <option value="">-- Choose Degree Type --</option>
                    {degreeTypes.map(degree => (
                      <option key={degree.code} value={degree.code}>
                        {degree.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Selection */}
                <div className="selection-item">
                  <label className="selection-label">
                    <span className="step-number">4</span>
                    Select Course <span className="required">*</span>
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    disabled={!selectedDegreeType || loadingFields.courses || (isPreSelected && selectedCourse)}
                    className="selection-select"
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.full_name || `${course.course_code} - ${course.course_name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selection Summary Card */}
              {isSelectionComplete && (
                <div className="selection-summary-card">
                  <div className="summary-header">
                    <span className="summary-icon">📋</span>
                    <h3>Selected Course Summary</h3>
                  </div>
                  <div className="summary-content">
                    <div className="summary-item">
                      <span className="summary-key">College:</span>
                      <span className="summary-value">{collegeName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-key">Category:</span>
                      <span className="summary-value">{selectedCategoryName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-key">Degree Type:</span>
                      <span className="summary-value">{selectedDegreeTypeName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-key">Course:</span>
                      <span className="summary-value">{selectedCourseName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-key">Department Code:</span>
                      <span className="summary-value">{selectedDepartment}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Personal Details - Only show if course is selected */}
            {isSelectionComplete && (
              <>
                {/* Personal Details */}
                <section className="panel-section">
                  <div className="section-heading">
                    <h2>Personal Details</h2>
                  </div>
                  <div className="field-grid">
                    <label className="field-label">
                      <span className="field-label-text">First Name *</span>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleFormChange}
                        placeholder="Enter first name"
                        required
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Last Name</span>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleFormChange}
                        placeholder="Enter last name"
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Mobile Number *</span>
                      <input
                        type="tel"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleFormChange}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        required
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Date of Birth *</span>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleFormChange}
                        required
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Email ID *</span>
                      <input
                        type="email"
                        name="email_id"
                        value={formData.email_id}
                        onChange={handleFormChange}
                        placeholder="Enter email address"
                        required
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Aadhar Number</span>
                      <input
                        type="text"
                        name="aadhar_number"
                        value={formData.aadhar_number}
                        onChange={handleFormChange}
                        placeholder="Enter Aadhar number"
                        maxLength={12}
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Gender *</span>
                      <select name="gender" value={formData.gender} onChange={handleFormChange} required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Community *</span>
                      <select name="community" value={formData.community} onChange={handleFormChange} required>
                        <option value="">Select Community</option>
                        <option value="OC">OC</option>
                        <option value="BC">BC</option>
                        <option value="MBC">MBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="SCA">SCA</option>
                        <option value="BCM">BCM</option>
                        <option value="DNC">DNC</option>
                      </select>
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Blood Group</span>
                      <input
                        type="text"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleFormChange}
                        placeholder="Blood group"
                      />
                    </label>
                  </div>
                </section>

                {/* Parent Details */}
                <section className="panel-section">
                  <div className="section-heading">
                    <h2>Parent Details</h2>
                  </div>
                  <div className="field-grid">
                    <label className="field-label">
                      <span className="field-label-text">Father Name</span>
                      <input
                        type="text"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleFormChange}
                        placeholder="Enter father name"
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Father Mobile</span>
                      <input
                        type="tel"
                        name="father_mobile"
                        value={formData.father_mobile}
                        onChange={handleFormChange}
                        maxLength={10}
                        placeholder="Enter father phone"
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Mother Name</span>
                      <input
                        type="text"
                        name="mother_name"
                        value={formData.mother_name}
                        onChange={handleFormChange}
                        placeholder="Enter mother name"
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Mother Mobile</span>
                      <input
                        type="tel"
                        name="mother_mobile"
                        value={formData.mother_mobile}
                        onChange={handleFormChange}
                        maxLength={10}
                        placeholder="Enter mother phone"
                      />
                    </label>
                  </div>
                </section>

                {/* Education Details */}
                <section className="panel-section">
                  <div className="section-heading">
                    <h2>Education Details</h2>
                  </div>
                  <div className="field-grid">
                    <label className="field-label">
                      <span className="field-label-text">10th Percentage</span>
                      <input
                        type="number"
                        step="0.01"
                        name="tenth_marks_percentage"
                        value={formData.tenth_marks_percentage}
                        onChange={handleFormChange}
                        placeholder="Enter 10th percentage"
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">12th Percentage</span>
                      <input
                        type="number"
                        step="0.01"
                        name="twelfth_marks_percentage"
                        value={formData.twelfth_marks_percentage}
                        onChange={handleFormChange}
                        placeholder="Enter 12th percentage"
                      />
                    </label>
                  </div>
                </section>

                {/* Address Details */}
                <section className="panel-section">
                  <div className="section-heading">
                    <h2>Address Details</h2>
                  </div>
                  <div className="field-grid">
                    <label className="field-label field-full">
                      <span className="field-label-text">Address Line 1</span>
                      <input
                        type="text"
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleFormChange}
                        placeholder="Street/House name"
                      />
                    </label>
                    <label className="field-label field-full">
                      <span className="field-label-text">Address Line 2</span>
                      <input
                        type="text"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleFormChange}
                        placeholder="Area/Locality"
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">City/District *</span>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="Enter city/district"
                        required
                      />
                    </label>
                    <label className="field-label">
                      <span className="field-label-text">Pincode *</span>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleFormChange}
                        placeholder="Enter pincode"
                        maxLength={6}
                        required
                      />
                    </label>
                  </div>
                </section>
              </>
            )}

            {error && (
              <div className="error-message">
                <p style={{ color: 'red', textAlign: 'center', padding: '10px' }}>{error}</p>
              </div>
            )}

            <div className="submit-row">
              <button
                type="submit"
                className="submit-button"
                disabled={loading || !isSelectionComplete}
              >
                {loading ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}

export default ApplicationForm;