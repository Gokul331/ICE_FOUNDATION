import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getApplicationFormData, submitApplication } from '../services/api';
import '../styles/applicationForm.css';

function ApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [user, setUser] = useState(null);

  // Get data from navigation state
  const { college, course, quotaType } = location.state || {};

  const [formData, setFormData] = useState({
    // Bio-data
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    mobile_number: '',
    email_id: '',
    blood_group: '',
    nationality: 'Indian',
    community: '',
    sub_caste: '',
    marital_status: '',
    mother_tongue: '',
    aadhar_number: '',
    first_graduation: '',

    // Parent's details
    father_name: '',
    father_mobile: '',
    father_occupation: '',
    mother_name: '',
    mother_mobile: '',
    mother_occupation: '',
    family_annual_income: '',

    // Address details
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',

    // 10th details
    tenth_school_name: '',
    tenth_board: '',
    tenth_year_of_passing: '',
    tenth_result_status: '',
    tenth_marks_percentage: '',

    // 12th details
    twelfth_school_name: '',
    twelfth_board: '',
    twelfth_year_of_passing: '',
    twelfth_result_status: '',
    twelfth_marks_percentage: '',

    // Diploma details
    has_diploma: false,
    diploma_college_name: '',
    diploma_board_university: '',
    diploma_year_of_passing: '',
    diploma_result_status: '',
    diploma_marks_percentage: '',

    // UG details
    has_ug: false,
    ug_college_name: '',
    ug_board_university: '',
    ug_year_of_passing: '',
    ug_result_status: '',
    ug_marks_percentage: '',

    // Uploads
    photo: null,
    aadhar_card: null,
    tenth_marksheet: null,
    twelfth_marksheet: null,
    diploma_marksheet: null,
    ug_marksheet: null,
    community_marksheet: null,

    // Declaration
    declaration_accepted: false,
  });

  // Helper Functions
  const formatAadhar = (value) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
  };

  const isValidMobile = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateFile = (file, fieldName) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (!file) return null;
    
    if (file.size > maxSize) {
      return `${fieldName} size must be less than 5MB.`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `${fieldName} must be JPG, PNG, or PDF format.`;
    }
    
    return null;
  };

  const validateStep = (step) => {
    const errors = [];
    
    switch(step) {
      case 1: // Bio-data
        if (!formData.first_name) errors.push('First Name is required');
        if (!formData.last_name) errors.push('Last Name is required');
        if (!formData.gender) errors.push('Gender is required');
        if (!formData.date_of_birth) {
          errors.push('Date of Birth is required');
        } else {
          const age = calculateAge(formData.date_of_birth);
          if (age < 17) errors.push('Applicant must be at least 17 years old');
          if (age > 25) errors.push('Age exceeds maximum limit of 25 years');
        }
        if (!formData.mobile_number) {
          errors.push('Mobile Number is required');
        } else if (!isValidMobile(formData.mobile_number)) {
          errors.push('Mobile number must be a valid 10-digit Indian number starting with 6-9');
        }
        if (!formData.email_id?.includes('@')) errors.push('Valid Email ID is required');
        if (!formData.community) errors.push('Community is required');
        if (!formData.aadhar_number) {
          errors.push('Aadhar Number is required');
        } else if (formData.aadhar_number.replace(/\s/g, '').length !== 12) {
          errors.push('Valid 12-digit Aadhar Number is required');
        }
        break;
      case 2: // Parents
        if (!formData.father_name) errors.push("Father's Name is required");
        if (!formData.father_mobile) {
          errors.push("Father's Mobile Number is required");
        } else if (!isValidMobile(formData.father_mobile)) {
          errors.push("Father's Mobile number must be valid");
        }
        if (!formData.mother_name) errors.push("Mother's Name is required");
        if (!formData.family_annual_income) errors.push('Family Annual Income is required');
        break;
      case 3: // Address
        if (!formData.address_line1) errors.push('Address Line 1 is required');
        if (!formData.city) errors.push('City is required');
        if (!formData.state) errors.push('State is required');
        if (!formData.pincode) {
          errors.push('Pincode is required');
        } else if (!formData.pincode.match(/^\d{6}$/)) {
          errors.push('Valid 6-digit Pincode is required');
        }
        break;
      case 4: // Education
        if (!formData.tenth_school_name) errors.push('10th School Name is required');
        if (!formData.tenth_board) errors.push('10th Board is required');
        if (!formData.tenth_year_of_passing) errors.push('10th Year of Passing is required');
        if (!formData.tenth_result_status) errors.push('10th Result Status is required');
        if (!formData.tenth_marks_percentage) {
          errors.push('10th Marks Percentage is required');
        } else if (formData.tenth_marks_percentage < 0 || formData.tenth_marks_percentage > 100) {
          errors.push('10th Marks Percentage must be between 0 and 100');
        }
        if (!formData.twelfth_school_name) errors.push('12th School Name is required');
        if (!formData.twelfth_board) errors.push('12th Board is required');
        if (!formData.twelfth_year_of_passing) errors.push('12th Year of Passing is required');
        if (!formData.twelfth_result_status) errors.push('12th Result Status is required');
        if (!formData.twelfth_marks_percentage) {
          errors.push('12th Marks Percentage is required');
        } else if (formData.twelfth_marks_percentage < 0 || formData.twelfth_marks_percentage > 100) {
          errors.push('12th Marks Percentage must be between 0 and 100');
        }
        break;
      case 5: // Uploads
        const requiredFiles = ['photo', 'aadhar_card', 'tenth_marksheet', 'twelfth_marksheet'];
        requiredFiles.forEach(file => {
          if (!formData[file]) {
            errors.push(`${file.replace(/_/g, ' ').toUpperCase()} is required`);
          }
        });
        if (!formData.declaration_accepted) errors.push('You must accept the declaration');
        break;
    }
    
    if (errors.length > 0) {
      setStatusMessage(errors.join(', '));
      setStatusType('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  };

  // Check authentication on mount and set user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      setStatusMessage('Please login to access the application form.');
      setStatusType('error');
      setLoading(false);
      setTimeout(() => {
        navigate('/login', { state: { from: location.pathname, ...location.state } });
      }, 2000);
      return;
    }
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setLoading(false); // Set loading to false after user is set
    } else {
      setStatusMessage('User data not found. Please login again.');
      setStatusType('error');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate, location]);

  // Fetch profile data when user is available
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const data = await getApplicationFormData();
        setFormData((prev) => ({
          ...prev,
          first_name: data.first_name || prev.first_name,
          last_name: data.last_name || prev.last_name,
          email_id: data.email_id || data.email || prev.email_id,
          mobile_number: data.mobile_number || prev.mobile_number,
          date_of_birth: data.date_of_birth || prev.date_of_birth,
          gender: data.gender || prev.gender,
          address_line1: data.address_line1 || prev.address_line1,
          address_line2: data.address_line2 || prev.address_line2,
          city: data.city || prev.city,
          state: data.state || prev.state,
          pincode: data.pincode || prev.pincode,
        }));
        setStatusMessage('Profile data loaded successfully.');
        setStatusType('success');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatusMessage('Could not load profile data. Please fill manually.');
        setStatusType('error');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    };

    fetchData();
  }, [user]);

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (Object.keys(formData).length > 0 && !submitting && !loading && user) {
        localStorage.setItem('application_form_draft', JSON.stringify({
          data: formData,
          step: currentStep,
          timestamp: new Date().toISOString()
        }));
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [formData, currentStep, submitting, loading, user]);

  // Load saved draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('application_form_draft');
    if (savedDraft && !college && !course) {
      try {
        const { data, step } = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(step);
        setStatusMessage('Loaded saved draft. You can continue from where you left off.');
        setStatusType('info');
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (course) {
      setSelectedCourse(course);
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      const error = validateFile(file, name.replace(/_/g, ' ').toUpperCase());
      if (error) {
        setStatusMessage(error);
        setStatusType('error');
        setTimeout(() => setStatusMessage(null), 3000);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === 'aadhar_number') {
        const formatted = formatAadhar(value);
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      setStatusMessage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setStatusMessage('Please login to submit your application.');
      setStatusType('error');
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 2000);
      return;
    }
    
    // Validate all steps before showing modal
    for (let step = 1; step <= 5; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      gender: '',
      date_of_birth: '',
      mobile_number: '',
      email_id: '',
      blood_group: '',
      nationality: 'Indian',
      community: '',
      sub_caste: '',
      marital_status: '',
      mother_tongue: '',
      aadhar_number: '',
      first_graduation: '',
      father_name: '',
      father_mobile: '',
      father_occupation: '',
      mother_name: '',
      mother_mobile: '',
      mother_occupation: '',
      family_annual_income: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      tenth_school_name: '',
      tenth_board: '',
      tenth_year_of_passing: '',
      tenth_result_status: '',
      tenth_marks_percentage: '',
      twelfth_school_name: '',
      twelfth_board: '',
      twelfth_year_of_passing: '',
      twelfth_result_status: '',
      twelfth_marks_percentage: '',
      has_diploma: false,
      diploma_college_name: '',
      diploma_board_university: '',
      diploma_year_of_passing: '',
      diploma_result_status: '',
      diploma_marks_percentage: '',
      has_ug: false,
      ug_college_name: '',
      ug_board_university: '',
      ug_year_of_passing: '',
      ug_result_status: '',
      ug_marks_percentage: '',
      photo: null,
      aadhar_card: null,
      tenth_marksheet: null,
      twelfth_marksheet: null,
      diploma_marksheet: null,
      ug_marksheet: null,
      community_marksheet: null,
      declaration_accepted: false,
    });
    setCurrentStep(1);
    setSelectedCourse(null);
    localStorage.removeItem('application_form_draft');
  };

  const handleSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    
    try {
      // Verify authentication again
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !currentUser.id) {
        throw new Error('Authentication required. Please login again.');
      }
      
      const submitData = new FormData();

      const fileFields = ['photo', 'aadhar_card', 'tenth_marksheet', 'twelfth_marksheet',
                        'diploma_marksheet', 'ug_marksheet', 'community_marksheet'];

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (fileFields.includes(key)) {
          if (formData[key]) {
            submitData.append(key, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Explicitly add user information
      submitData.append('user_id', currentUser.id);
      submitData.append('user', currentUser.id);
      submitData.append('username', currentUser.username || currentUser.email);

      // Handle college
      if (college) {
        const collegeId = college.college_id || college.id;
        if (collegeId) {
          submitData.append('college_id', parseInt(collegeId));
          submitData.append('college', parseInt(collegeId));
        } else {
          throw new Error('College ID is missing');
        }
      } else {
        throw new Error('College information is missing');
      }
      
      // Handle course
      if (selectedCourse) {
        const courseId = selectedCourse.course_id || selectedCourse.id;
        if (courseId) {
          submitData.append('course_id', parseInt(courseId));
          submitData.append('course', parseInt(courseId));
        } else {
          throw new Error('Course ID is missing');
        }
      } else {
        throw new Error('Course information is missing');
      }
      
      // Handle quota type
      if (quotaType) {
        submitData.append('quota_type', quotaType);
      }

      // Debug log
      console.log('Submitting application with data:');
      for (let pair of submitData.entries()) {
        if (!(pair[1] instanceof File)) {
          console.log(pair[0], ':', pair[1]);
        } else {
          console.log(pair[0], ':', pair[1].name);
        }
      }
      console.log('User authenticated with ID:', currentUser.id);
      console.log('Token present:', !!token);

      const response = await submitApplication(submitData);
      
      setStatusMessage('Application submitted successfully! You will receive a confirmation email shortly.');
      setStatusType('success');
      
      // Clear draft on successful submission
      localStorage.removeItem('application_form_draft');
      
      setTimeout(() => {
        resetForm();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to submit application. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setStatusMessage(errorMessage);
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="application-form-container">
        <div className="form-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Bio-data'}
            {step === 2 && 'Parents'}
            {step === 3 && 'Address'}
            {step === 4 && 'Education'}
            {step === 5 && 'Upload'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCourseInfo = () => {
    if (!college && !selectedCourse) return null;
    return (
      <div className="selected-course-info">
        <h3>Selected Course</h3>
        <div className="course-details">
          <p><strong>College:</strong> {college?.college_name || 'N/A'}</p>
          <p><strong>Course:</strong> {selectedCourse?.course_name || 'N/A'}</p>
          <p><strong>Quota:</strong> {quotaType === 'government' ? 'Government Quota' : 'Management Quota'}</p>
        </div>
      </div>
    );
  };

  const renderBioData = () => (
    <div className="form-section">
      <h3>Bio-data Details</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>First Name *</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Last Name *</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Gender *</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-field">
          <label>Date of Birth *</label>
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Mobile Number *</label>
          <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="9876543210" required />
        </div>
        <div className="form-field">
          <label>Email ID *</label>
          <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} placeholder="you@example.com" required />
        </div>
        <div className="form-field">
          <label>Blood Group</label>
          <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
            <option value="">Select</option>
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
        <div className="form-field">
          <label>Nationality *</label>
          <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Indian" required />
        </div>
        <div className="form-field">
          <label>Community *</label>
          <select name="community" value={formData.community} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="OC">OC</option>
            <option value="BC">BC</option>
            <option value="MBC">MBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>
        <div className="form-field">
          <label>Sub-Caste</label>
          <input type="text" name="sub_caste" value={formData.sub_caste} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Marital Status</label>
          <select name="marital_status" value={formData.marital_status} onChange={handleChange}>
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
        <div className="form-field">
          <label>Mother Tongue</label>
          <input type="text" name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Aadhar Number *</label>
          <input type="text" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} placeholder="XXXX XXXX XXXX" maxLength={14} required />
        </div>
        <div className="form-field">
          <label>First Graduation</label>
          <input type="text" name="first_graduation" value={formData.first_graduation} onChange={handleChange} placeholder="e.g., B.Sc Physics" />
        </div>
      </div>
    </div>
  );

  const renderParentsDetails = () => (
    <div className="form-section">
      <h3>Father's Details</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>Father's Name *</label>
          <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Father's Mobile Number *</label>
          <input type="tel" name="father_mobile" value={formData.father_mobile} onChange={handleChange} placeholder="9876543210" required />
        </div>
        <div className="form-field">
          <label>Father's Occupation</label>
          <input type="text" name="father_occupation" value={formData.father_occupation} onChange={handleChange} />
        </div>
      </div>

      <h3>Mother's Details</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>Mother's Name *</label>
          <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Mother's Mobile Number</label>
          <input type="tel" name="mother_mobile" value={formData.mother_mobile} onChange={handleChange} placeholder="9876543210" />
        </div>
        <div className="form-field">
          <label>Mother's Occupation</label>
          <input type="text" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} />
        </div>
      </div>

      <h3>Family Details</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>Family Annual Income (INR) *</label>
          <input type="number" name="family_annual_income" value={formData.family_annual_income} onChange={handleChange} placeholder="250000" required />
        </div>
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="form-section">
      <h3>Address Details</h3>
      <div className="form-grid">
        <div className="form-field full-width">
          <label>Address Line 1 *</label>
          <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} placeholder="House No., Street" required />
        </div>
        <div className="form-field full-width">
          <label>Address Line 2</label>
          <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} placeholder="Village/Town, Landmark" />
        </div>
        <div className="form-field">
          <label>City *</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>State *</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Pincode *</label>
          <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="600001" maxLength={6} required />
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="form-section">
      <h3>10th Standard *</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>School Name *</label>
          <input type="text" name="tenth_school_name" value={formData.tenth_school_name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Board *</label>
          <select name="tenth_board" value={formData.tenth_board} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="CBSE">CBSE</option>
            <option value="State Board">State Board</option>
            <option value="ICSE">ICSE</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-field">
          <label>Year of Passing *</label>
          <input type="number" name="tenth_year_of_passing" value={formData.tenth_year_of_passing} onChange={handleChange} placeholder="2020" min="1990" max="2030" required />
        </div>
        <div className="form-field">
          <label>Result Status *</label>
          <select name="tenth_result_status" value={formData.tenth_result_status} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="passed">Passed</option>
            <option value="appearing">Appearing</option>
            <option value="compartment">Compartment</option>
          </select>
        </div>
        <div className="form-field">
          <label>Marks Scored (%) *</label>
          <input type="number" name="tenth_marks_percentage" value={formData.tenth_marks_percentage} onChange={handleChange} placeholder="85.5" step="0.01" min="0" max="100" required />
        </div>
      </div>

      <h3>12th Standard *</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>School Name *</label>
          <input type="text" name="twelfth_school_name" value={formData.twelfth_school_name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Board *</label>
          <select name="twelfth_board" value={formData.twelfth_board} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="CBSE">CBSE</option>
            <option value="State Board">State Board</option>
            <option value="ICSE">ICSE</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-field">
          <label>Year of Passing *</label>
          <input type="number" name="twelfth_year_of_passing" value={formData.twelfth_year_of_passing} onChange={handleChange} placeholder="2022" min="1990" max="2030" required />
        </div>
        <div className="form-field">
          <label>Result Status *</label>
          <select name="twelfth_result_status" value={formData.twelfth_result_status} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="passed">Passed</option>
            <option value="appearing">Appearing</option>
            <option value="compartment">Compartment</option>
          </select>
        </div>
        <div className="form-field">
          <label>Marks Scored (%) *</label>
          <input type="number" name="twelfth_marks_percentage" value={formData.twelfth_marks_percentage} onChange={handleChange} placeholder="85.5" step="0.01" min="0" max="100" required />
        </div>
      </div>

      <h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" name="has_diploma" checked={formData.has_diploma} onChange={handleChange} />
          Add Diploma Details
        </label>
      </h3>
      {formData.has_diploma && (
        <div className="form-grid">
          <div className="form-field">
            <label>College Name</label>
            <input type="text" name="diploma_college_name" value={formData.diploma_college_name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Board / University</label>
            <input type="text" name="diploma_board_university" value={formData.diploma_board_university} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Year of Passing</label>
            <input type="number" name="diploma_year_of_passing" value={formData.diploma_year_of_passing} onChange={handleChange} placeholder="2024" min="1990" max="2030" />
          </div>
          <div className="form-field">
            <label>Result Status</label>
            <select name="diploma_result_status" value={formData.diploma_result_status} onChange={handleChange}>
              <option value="">Select</option>
              <option value="passed">Passed</option>
              <option value="appearing">Appearing</option>
              <option value="compartment">Compartment</option>
            </select>
          </div>
          <div className="form-field">
            <label>Marks Scored (%)</label>
            <input type="number" name="diploma_marks_percentage" value={formData.diploma_marks_percentage} onChange={handleChange} placeholder="85.5" step="0.01" min="0" max="100" />
          </div>
        </div>
      )}

      <h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" name="has_ug" checked={formData.has_ug} onChange={handleChange} />
          Add Undergraduate (UG) Details
        </label>
      </h3>
      {formData.has_ug && (
        <div className="form-grid">
          <div className="form-field">
            <label>College Name</label>
            <input type="text" name="ug_college_name" value={formData.ug_college_name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Board / University</label>
            <input type="text" name="ug_board_university" value={formData.ug_board_university} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Year of Passing</label>
            <input type="number" name="ug_year_of_passing" value={formData.ug_year_of_passing} onChange={handleChange} placeholder="2024" min="1990" max="2030" />
          </div>
          <div className="form-field">
            <label>Result Status</label>
            <select name="ug_result_status" value={formData.ug_result_status} onChange={handleChange}>
              <option value="">Select</option>
              <option value="passed">Passed</option>
              <option value="appearing">Appearing</option>
              <option value="compartment">Compartment</option>
            </select>
          </div>
          <div className="form-field">
            <label>Marks Scored (%)</label>
            <input type="number" name="ug_marks_percentage" value={formData.ug_marks_percentage} onChange={handleChange} placeholder="85.5" step="0.01" min="0" max="100" />
          </div>
        </div>
      )}
    </div>
  );

  const renderUploads = () => (
    <div className="form-section">
      <h3>Document Uploads</h3>
      <p className="form-note">Allowed formats: JPG, PNG, PDF (Max size: 5MB each)</p>
      <div className="form-grid">
        <div className="form-field">
          <label>Photo *</label>
          <input type="file" name="photo" onChange={handleChange} accept="image/jpeg,image/png,image/jpg" required />
          {formData.photo && <small className="file-name">{formData.photo.name}</small>}
        </div>
        <div className="form-field">
          <label>Aadhar Card *</label>
          <input type="file" name="aadhar_card" onChange={handleChange} accept="image/*,.pdf" required />
          {formData.aadhar_card && <small className="file-name">{formData.aadhar_card.name}</small>}
        </div>
        <div className="form-field">
          <label>10th Marksheet *</label>
          <input type="file" name="tenth_marksheet" onChange={handleChange} accept="image/*,.pdf" required />
          {formData.tenth_marksheet && <small className="file-name">{formData.tenth_marksheet.name}</small>}
        </div>
        <div className="form-field">
          <label>12th Marksheet *</label>
          <input type="file" name="twelfth_marksheet" onChange={handleChange} accept="image/*,.pdf" required />
          {formData.twelfth_marksheet && <small className="file-name">{formData.twelfth_marksheet.name}</small>}
        </div>
        <div className="form-field">
          <label>Diploma Marksheet</label>
          <input type="file" name="diploma_marksheet" onChange={handleChange} accept="image/*,.pdf" disabled={!formData.has_diploma} />
          {formData.diploma_marksheet && <small className="file-name">{formData.diploma_marksheet.name}</small>}
        </div>
        <div className="form-field">
          <label>UG Marksheet</label>
          <input type="file" name="ug_marksheet" onChange={handleChange} accept="image/*,.pdf" disabled={!formData.has_ug} />
          {formData.ug_marksheet && <small className="file-name">{formData.ug_marksheet.name}</small>}
        </div>
        <div className="form-field">
          <label>Community Certificate</label>
          <input type="file" name="community_marksheet" onChange={handleChange} accept="image/*,.pdf" />
          {formData.community_marksheet && <small className="file-name">{formData.community_marksheet.name}</small>}
        </div>
      </div>

      <h3>Declaration *</h3>
      <div className="declaration-box">
        <p>I hereby declare that all the information provided by me in this application form is true and correct to the best of my knowledge. I understand that any false information or suppression of facts will lead to rejection of my application or cancellation of admission at any stage.</p>
        <p>I agree to abide by the rules and regulations of the institution and any changes that may be made from time to time.</p>
      </div>
      <label className="terms-checkbox">
        <input
          type="checkbox"
          name="declaration_accepted"
          checked={formData.declaration_accepted}
          onChange={handleChange}
        />
        <span>I accept the above declaration and confirm that all information provided is true.</span>
      </label>
    </div>
  );

  const renderConfirmationModal = () => {
    if (!showConfirmModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Confirm Submission</h3>
          <p>Please review all details carefully. You cannot edit after submission.</p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="application-form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Application Form</h1>
          <p>Complete all sections to submit your application</p>
        </div>

        {statusMessage && (
          <div className={`status-message ${statusType}`}>
            {statusMessage}
          </div>
        )}

        {renderCourseInfo()}
        {renderStepIndicator()}

        <form onSubmit={handleSubmitClick}>
          {currentStep === 1 && renderBioData()}
          {currentStep === 2 && renderParentsDetails()}
          {currentStep === 3 && renderAddress()}
          {currentStep === 4 && renderEducation()}
          {currentStep === 5 && renderUploads()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-secondary" onClick={handlePrev}>
                Previous
              </button>
            )}
            {currentStep < 5 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
      
      {renderConfirmationModal()}
    </div>
  );
}

export default ApplicationForm;