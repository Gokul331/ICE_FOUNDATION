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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage('Please login to access the application form.');
        setStatusType('error');
        setLoading(false);
        return;
      }

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
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatusMessage('Could not load profile data. Please fill manually.');
        setStatusType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (course) {
      setSelectedCourse(course);
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.declaration_accepted) {
      setStatusMessage('Please accept the declaration to submit.');
      setStatusType('error');
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === 'photo' || key === 'aadhar_card' || key === 'tenth_marksheet' ||
            key === 'twelfth_marksheet' || key === 'diploma_marksheet' ||
            key === 'ug_marksheet' || key === 'community_marksheet') {
          if (formData[key]) {
            submitData.append(key, formData[key]);
          }
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add course info
      if (college) {
        submitData.append('college_id', college.college_id);
      }
      if (selectedCourse) {
        submitData.append('course_id', selectedCourse.course_id);
      }
      if (quotaType) {
        submitData.append('quota_type', quotaType);
      }

      await submitApplication(submitData);
      setStatusMessage('Application submitted successfully! You will receive a confirmation email shortly.');
      setStatusType('success');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Failed to submit application. Please try again.');
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <input type="file" name="photo" onChange={handleChange} accept="image/*" required />
        </div>
        <div className="form-field">
          <label>Aadhar Card *</label>
          <input type="file" name="aadhar_card" onChange={handleChange} accept="image/*,.pdf" required />
        </div>
        <div className="form-field">
          <label>10th Marksheet *</label>
          <input type="file" name="tenth_marksheet" onChange={handleChange} accept="image/*,.pdf" required />
        </div>
        <div className="form-field">
          <label>12th Marksheet *</label>
          <input type="file" name="twelfth_marksheet" onChange={handleChange} accept="image/*,.pdf" required />
        </div>
        <div className="form-field">
          <label>Diploma Marksheet</label>
          <input type="file" name="diploma_marksheet" onChange={handleChange} accept="image/*,.pdf" disabled={!formData.has_diploma} />
        </div>
        <div className="form-field">
          <label>UG Marksheet</label>
          <input type="file" name="ug_marksheet" onChange={handleChange} accept="image/*,.pdf" disabled={!formData.has_ug} />
        </div>
        <div className="form-field">
          <label>Community Marksheet</label>
          <input type="file" name="community_marksheet" onChange={handleChange} accept="image/*,.pdf" />
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

        <form onSubmit={handleSubmit}>
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
    </div>
  );
}

export default ApplicationForm;
