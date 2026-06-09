import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/applicationForm.css';
import { SiTicktick } from "react-icons/si";
import { FaGraduationCap, FaUserGraduate, FaUsers, FaMapMarkerAlt, FaBookOpen, FaUniversity, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import {
  submitApplication,
  getCollegeCategories,
  getCategoryDegreeTypes,
  getDegreeCourses,
} from '../services/api';

function ApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { college: passedCollege, course: passedCourse } = location.state || {};

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

  const [currentStep, setCurrentStep] = useState(1);
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
        setColleges(collegesArray);
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
          // Remove duplicates by code
          const uniqueCategories = response.categories.filter((cat, index, self) =>
            index === self.findIndex(c => c.code === cat.code)
          );
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
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
          // Remove duplicates by code
          const uniqueDegreeTypes = response.degree_types.filter((deg, index, self) =>
            index === self.findIndex(d => d.code === deg.code)
          );
          setDegreeTypes(uniqueDegreeTypes);
        }
      } catch (err) {
        console.error('Error loading degree types:', err);
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
          // Remove duplicates by id
          const uniqueCourses = response.courses.filter((course, index, self) =>
            index === self.findIndex(c => c.id === course.id)
          );
          setCourses(uniqueCourses);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoadingFields(prev => ({ ...prev, courses: false }));
      }
    };
    loadCourses();
  }, [selectedCollege, selectedCategory, selectedDegreeType]);

  // Update course details when selected
  useEffect(() => {
    if (selectedCourse && courses.length > 0) {
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      if (course) {
        setSelectedCourseName(course.course_name);
        setSelectedDepartment(course.course_code_display || course.course_code);
      }
    }
  }, [selectedCourse, courses]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(c => c.code === selectedCategory);
      if (category) setSelectedCategoryName(category.name);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedDegreeType && degreeTypes.length > 0) {
      const degree = degreeTypes.find(d => d.code === selectedDegreeType);
      if (degree) setSelectedDegreeTypeName(degree.name);
    }
  }, [selectedDegreeType, degreeTypes]);

  const handleCollegeChange = (e) => {
    const collegeId = parseInt(e.target.value);
    setSelectedCollege(collegeId);
    const college = colleges.find(c => c.college_id === collegeId);
    setCollegeName(college?.college_name || '');
    setSelectedCategory('');
    setSelectedDegreeType('');
    setSelectedCourse('');
    setCurrentStep(2);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedDegreeType('');
    setSelectedCourse('');
    setCurrentStep(3);
  };

  const handleDegreeTypeChange = (e) => {
    setSelectedDegreeType(e.target.value);
    setSelectedCourse('');
    setCurrentStep(4);
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setCurrentStep(5);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!selectedCollege || !selectedCategory || !selectedDegreeType || !selectedCourse) {
      setError('Please complete all course selections');
      setLoading(false);
      return;
    }

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

    try {
      const result = await submitApplication(submitData);
      if (result.success) {
        setShowSuccessModal(true);
        setCountdown(5);

        // Clear form data after successful submission
        setFormData({
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
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Countdown and redirect to home page
  useEffect(() => {
    let timer;
    let countdownInterval;

    if (showSuccessModal) {
      // Countdown timer
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirect to home page after 5 seconds with success message
      timer = setTimeout(() => {
        navigate('/', {
          state: {
            successMessage: 'Application submitted successfully!',
          },
        });
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showSuccessModal, navigate]);

  const isSelectionComplete = selectedCollege && selectedCategory && selectedDegreeType && selectedCourse;

  const steps = [
    { number: 1, title: 'College', icon: <FaUniversity />, isComplete: !!selectedCollege },
    { number: 2, title: 'Category', icon: <FaBookOpen />, isComplete: !!selectedCategory },
    { number: 3, title: 'Degree', icon: <FaGraduationCap />, isComplete: !!selectedDegreeType },
    { number: 4, title: 'Course', icon: <FaUserGraduate />, isComplete: !!selectedCourse },
  ];

  return (
    <main className="app-shell-modern">
      {showSuccessModal && (
        <div className="success-modal-modern">
          <div className="success-icon-modern">
            <FaCheckCircle />
          </div>
          <h3>Application Submitted Successfully!</h3>
          <p>Your application has been successfully submitted. Thank you for choosing Vamshi EduCare.</p>
          <p className="redirect-note">
            Redirecting to <strong>Home Page</strong> in <span className="countdown">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {!showSuccessModal && (
        <div className="form-container-modern">
          {/* Header */}
          <div className="form-header-modern">
            <div className="logo-section">
              <img src="/Logo.png" alt="Logo" className="logo-modern" />
              <div className="brand-section">
                <span className="brand-name-modern">VAMSHI EDUCARE</span>
                <span className="brand-tagline">Career Guidance Center</span>
              </div>
            </div>
            <h1>Scholarship Form</h1>
            <p>Fill in the details to apply for your desired course</p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={step.number} className={`step-item ${step.isComplete ? 'completed' : ''} ${currentStep === step.number ? 'active' : ''}`}>
                <div className="step-circle">
                  {step.isComplete ? <FaCheckCircle /> : step.number}
                </div>
                <div className="step-label">{step.title}</div>
                {index < steps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form-modern">
            {/* Course Selection Section */}
            <div className="card-modern">
              <div className="card-title">
                <FaGraduationCap /> Course Selection
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label>Select College *</label>
                  <select value={selectedCollege} onChange={handleCollegeChange} required>
                    <option value="">-- Choose College --</option>
                    {colleges.map((college, index) => (
                      <option key={`college-${college.college_id}-${index}`} value={college.college_id}>
                        {college.location_city} - {college.college_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Select Category *</label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={!selectedCollege || loadingFields.categories}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat, index) => (
                      <option key={`category-${cat.code}-${index}`} value={cat.code}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Select Degree Type *</label>
                  <select
                    value={selectedDegreeType}
                    onChange={handleDegreeTypeChange}
                    disabled={!selectedCategory || loadingFields.degreeTypes}
                    required
                  >
                    <option value="">-- Choose Degree Type --</option>
                    {degreeTypes.map((deg, index) => (
                      <option key={`degree-${deg.code}-${index}`} value={deg.code}>
                        {deg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Select Course *</label>
                  <select
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    disabled={!selectedDegreeType || loadingFields.courses}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((course, index) => (
                      <option key={`course-${course.id}-${index}`} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selection Summary */}
              {isSelectionComplete && (
                <div className="selection-summary-modern">
                  <div className="summary-title">Selected Course Summary</div>
                  <div className="summary-grid">
                    <div><strong>College:</strong> {collegeName}</div>
                    <div><strong>Category:</strong> {selectedCategoryName}</div>
                    <div><strong>Degree Type:</strong> {selectedDegreeTypeName}</div>
                    <div><strong>Course:</strong> {selectedCourseName}</div>
                  </div>
                </div>
              )}

              {/* NEW REFERENCE NAME FIELD - Full Width */}
              <div className="input-group full-width">
                <label>Reference Name (Optional)</label>
                <input
                  type="text"
                  name="reference_name"
                  value={formData.reference_name || ''}
                  onChange={handleFormChange}
                  placeholder="Enter reference person's name (e.g., John Doe, Teacher Name, etc.)"
                />
                <small className="field-hint">Who referred you to this college? (Optional)</small>
              </div>
            </div>



            {/* Personal Details Section - Only show if course is selected */}
            {isSelectionComplete && (
              <>
                <div className="card-modern">
                  <div className="card-title"><FaUserGraduate /> Personal Details</div>
                  <div className="form-grid-2">
                    <div className="input-group"><label>First Name *</label><input type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} required /></div>
                    <div className="input-group"><label>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} /></div>
                    <div className="input-group"><label>Mobile Number *</label><input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleFormChange} maxLength={10} required /></div>
                    <div className="input-group"><label>Date of Birth *</label><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleFormChange} required /></div>
                    <div className="input-group"><label>Email ID *</label><input type="email" name="email_id" value={formData.email_id} onChange={handleFormChange} required /></div>
                    <div className="input-group"><label>Aadhar Number</label><input type="text" name="aadhar_number" value={formData.aadhar_number} onChange={handleFormChange} maxLength={12} /></div>
                    <div className="input-group"><label>Gender *</label>
                      <select name="gender" value={formData.gender} onChange={handleFormChange} required>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Community *</label>
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
                    </div>

                    <div className="input-group">
                      <label>Blood Group</label>
                      <select name="blood_group" value={formData.blood_group} onChange={handleFormChange}>
                        <option value="">Select Blood Group </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="card-modern">
                  <div className="card-title"><FaUsers /> Parent Details</div>
                  <div className="form-grid-2">
                    <div className="input-group"><label>Father Name</label><input type="text" name="father_name" value={formData.father_name} onChange={handleFormChange} /></div>
                    <div className="input-group"><label>Father Mobile</label><input type="tel" name="father_mobile" value={formData.father_mobile} onChange={handleFormChange} maxLength={10} /></div>
                    <div className="input-group"><label>Mother Name</label><input type="text" name="mother_name" value={formData.mother_name} onChange={handleFormChange} /></div>
                    <div className="input-group"><label>Mother Mobile</label><input type="tel" name="mother_mobile" value={formData.mother_mobile} onChange={handleFormChange} maxLength={10} /></div>
                  </div>
                </div>

                <div className="card-modern">
                  <div className="card-title"><FaGraduationCap /> Education Details</div>
                  <div className="form-grid-2">
                    <div className="input-group"><label>10th Percentage</label><input type="number" step="0.01" name="tenth_marks_percentage" value={formData.tenth_marks_percentage} onChange={handleFormChange} placeholder="Enter percentage" /></div>
                    <div className="input-group"><label>12th Percentage</label><input type="number" step="0.01" name="twelfth_marks_percentage" value={formData.twelfth_marks_percentage} onChange={handleFormChange} placeholder="Enter percentage" />
                      <span className='input-small'>If result not declared, enter 0 as percentage.</span></div>
                  </div>
                </div>

                <div className="card-modern">
                  <div className="card-title"><FaMapMarkerAlt /> Address Details</div>
                  <div className="form-grid-2">
                    <div className="input-group full-width"><label>Address Line 1</label><input type="text" name="address_line1" value={formData.address_line1} onChange={handleFormChange} placeholder="Street/House name" /></div>
                    <div className="input-group full-width"><label>Address Line 2</label><input type="text" name="address_line2" value={formData.address_line2} onChange={handleFormChange} placeholder="Area/Locality" /></div>
                    <div className="input-group"><label>City/District *</label><input type="text" name="city" value={formData.city} onChange={handleFormChange} required /></div>
                    <div className="input-group"><label>Pincode *</label><input type="text" name="pincode" value={formData.pincode} onChange={handleFormChange} maxLength={6} required /></div>
                  </div>
                </div>
              </>
            )}

            {error && <div className="error-message-modern">{error}</div>}

            <button type="submit" className="submit-btn-modern" disabled={loading || !isSelectionComplete}>
              {loading ? 'Submitting...' : 'Submit Application'} <FaArrowRight />
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default ApplicationForm;