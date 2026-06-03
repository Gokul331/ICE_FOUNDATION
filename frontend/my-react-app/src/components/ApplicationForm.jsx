import { useState, useEffect } from 'react';
import '../styles/applicationForm.css';
import { SiTicktick } from "react-icons/si";
import { submitScholarshipApplication } from '../services/api';

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

function App() {
  const [formData, setFormData] = useState({
    studentName: '',
    phoneNumber: '',
    dateOfBirth: '',
    email: '',
    aadharNumber: '',
    fatherName: '',
    fatherNumber: '',
    motherName: '',

    addressLine1: '',
    addressLine2: '',
    district: '',
    pincode: '',
    course: 'Select course',
    departmentName: '',
    college: '',
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

    try {
      const result = await submitScholarshipApplication(formData);

      if (result.success) {
        setSubmitted(true);
        setShowSuccessModal(true);
        setCountdown(5);
        console.log('Application submitted successfully', result.data);
      } else {
        setError(result.error || 'Failed to submit application');
        console.error('Submission error:', result.error);
      }
    } catch (err) {
      setError('An error occurred. Please check your connection and try again.');
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

      // Redirect timer
      timer = setTimeout(() => {
        window.location.href = 'https://aceconsultancy.org/';
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
            Thank you for submitting your application. You will be redirected to our website shortly.
          </p>
          <p className="redirect-note">
            Redirecting to <strong className="brand-name-1">Vamshi Educare</strong> in <span className="countdown">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      )}
      {!(showSuccessModal) && (
        <section className="form-panel">
          <header className="form-header">
            <div className="form-title">
              <img src="/Logo.png" alt="Vamshi Edu Care" className="form-logo" />
              <div className="form-title-copy">
                <p className="brand-name">
                  <span className="brand-name-line">Vamshi Edu Care</span>
                </p>
                <h1>Scholarship Form</h1>
                <p className="form-description">
                  Complete the scholarship application in one go.
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
                  <span className="field-label-text">Student Name</span>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Phone Number</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength={10}
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Date of Birth</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Mail ID</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Aadhar Number</span>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="Enter Aadhar number"
                    maxLength={12}
                    required
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
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father name"
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Father Number</span>
                  <input
                    type="tel"
                    name="fatherNumber"
                    value={formData.fatherNumber}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Enter father phone"
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Mother Name</span>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother name"
                    required
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
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Street/House name"
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">District</span>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    required
                  />
                </label>
                <label className="field-label">
                  <span className="field-label-text">Pincode</span>
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
              <div className="field-grid">
                <label className="field-label field-full">
                  <span className="field-label-text">Course Selection</span>
                  <select name="course" value={formData.course} onChange={handleChange} required>
                    <option value="Select course">Select course</option>
                    {courseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {formData.course !== 'Select course' && (
                  <label className="field-label field-full">
                    <span className="field-label-text">Department Name</span>
                    <input
                      type="text"
                      name="departmentName"
                      value={formData.departmentName}
                      onChange={handleChange}
                      placeholder="Enter department name"
                      required
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
                    className={`college-option ${formData.college === option ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="college"
                      value={option}
                      checked={formData.college === option}
                      onChange={handleChange}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </section>

            {error && (
              <div className="error-message">
                <p>{error}</p>
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