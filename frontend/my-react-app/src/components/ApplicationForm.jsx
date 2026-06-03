import { useState, useEffect } from 'react';
import '../styles/applicationForm.css';
import { SiTicktick } from "react-icons/si";
import { submitApplication } from '../services/api'; // Changed from submitScholarshipApplication

const courseOptions = [
  'Arts',
  'Engineering',
  'Nursing',
  'Pharmacy',
  'Allied Health Science',
  'Polytechnic',
  'Law',
  'Agriculture',
];

const collegeOptions = [
  'Dhanalakshmi Srinivasan University',
];

function ApplicationForm() {
  const [formData, setFormData] = useState({
    first_name: '',        // Changed from studentName
    last_name: '',         // Added last_name
    mobile_number: '',     // Changed from phoneNumber
    date_of_birth: '',     // Changed from dateOfBirth
    email_id: '',          // Changed from email
    aadhar_number: '',     // Changed from aadharNumber
    father_name: '',       // Changed from fatherName
    father_mobile: '',     // Changed from fatherNumber
    mother_name: '',       // Changed from motherName
    address_line1: '',     // Changed from addressLine1
    address_line2: '',     // Changed from addressLine2
    city: '',              // Changed from district
    pincode: '',           // Changed from pincode
    course_name: '',       // Changed from course
    department_name: '',   // Changed from departmentName
    college_id: '',        // Changed from college
    gender: '',            // Added (required by backend)
    community: '',         // Added (required by backend)
    blood_group: '',       // Added (optional)
    tenth_marks_percentage: '',     // Added for education
    twelfth_marks_percentage: '',   // Added for education
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
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

    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to submit application');
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
      course_name: formData.course_name,
      department_name: formData.department_name || '',
      college_id: formData.college_id,
      gender: formData.gender || 'male',
      community: formData.community || 'OC',
      blood_group: formData.blood_group || '',
      tenth_marks_percentage: formData.tenth_marks_percentage || null,
      twelfth_marks_percentage: formData.twelfth_marks_percentage || null,
      has_diploma: false,
      has_ug: false,
    };

    try {
      const result = await submitApplication(submitData); // Using submitApplication API

      if (result.success) {
        setSubmitted(true);
        setShowSuccessModal(true);
        setCountdown(5);
        console.log('Application submitted successfully', result);
      } else {
        setError(result.error || result.message || 'Failed to submit application');
        console.error('Submission error:', result);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred. Please try again.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effect for countdown and redirect
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
        window.location.href = '/my-applications'; // Redirect to applications list instead of external site
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showSuccessModal]);

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
            Redirecting to <strong className="brand-name-1">Vamshi EduCare</strong> in <span className="countdown">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Mobile Number *</span>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Email ID *</span>
                  <input
                    type="email"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Enter Aadhar number"
                    maxLength={12}
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Gender *</span>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="field-label">
                  <span className="field-label-text">Community *</span>
                  <select name="community" value={formData.community} onChange={handleChange} required>
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Enter father name"
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Father Mobile</span>
                  <input
                    type="tel"
                    name="father_mobile"
                    value={formData.father_mobile}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Enter mother name"
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Mother Mobile</span>
                  <input
                    type="tel"
                    name="mother_mobile"
                    value={formData.mother_mobile}
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Street/House name"
                  />
                </label>
                <label className="field-label field-full">
                  <span className="field-label-text">Address Line 2</span>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    placeholder="Area/Locality"
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">City/District *</span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    maxLength={6}
                    required
                  />
                </label>
              </div>
            </section>

            {/* Course Selection */}
            <section className="panel-section">
              <div className="section-heading">
                <h2>Course Selection</h2>
              </div>
              <div className="field-grid">
                <label className="field-label field-full">
                  <span className="field-label-text">Course *</span>
                  <select name="course_name" value={formData.course_name} onChange={handleChange} required>
                    <option value="">Select course</option>
                    {courseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {formData.course_name && (
                  <label className="field-label field-full">
                    <span className="field-label-text">Department Name</span>
                    <input
                      type="text"
                      name="department_name"
                      value={formData.department_name}
                      onChange={handleChange}
                      placeholder="Enter department name (if applicable)"
                    />
                  </label>
                )}
              </div>
            </section>

            {/* College Selection */}
            <section className="panel-section">
              <div className="section-heading">
                <h2>College Selection</h2>
              </div>
              <div className="college-options">
                {collegeOptions.map((option) => (
                  <label
                    key={option}
                    className={`college-option ${formData.college_id === option ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="college_id"
                      value={option}
                      checked={formData.college_id === option}
                      onChange={handleChange}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </section>

            {error && (
              <div className="error-message">
                <p style={{ color: 'red', textAlign: 'center', padding: '10px' }}>{error}</p>
              </div>
            )}

            <div className="submit-row">
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
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