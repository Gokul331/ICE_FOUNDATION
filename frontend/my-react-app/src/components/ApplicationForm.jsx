import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getApplicationFormData,
  submitApplication,
  getColleges,
  getCollegeCourses,
} from "../services/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/applicationForm.css";

/* ── animation helpers ── */
function SectionReveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
    >
      {children}
    </motion.div>
  );
}

function ApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [user, setUser] = useState(null);
  
  const [availableColleges, setAvailableColleges] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  const {
    college: initialCollege,
    course: initialCourse,
    quotaType: initialQuotaType,
  } = location.state || {};

  const [college, setCollege] = useState(initialCollege || null);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse || null);
  const [quotaType, setQuotaType] = useState(initialQuotaType || "management");

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", gender: "", date_of_birth: "",
    mobile_number: "", email_id: "", blood_group: "", nationality: "Indian",
    community: "", sub_caste: "", marital_status: "", mother_tongue: "",
    aadhar_number: "", first_graduation: "", father_name: "",
    father_mobile: "", father_occupation: "", mother_name: "",
    mother_mobile: "", mother_occupation: "", family_annual_income: "",
    address_line1: "", address_line2: "", city: "", state: "", pincode: "",
    tenth_school_name: "", tenth_board: "", tenth_year_of_passing: "",
    tenth_result_status: "", tenth_marks_percentage: "", twelfth_school_name: "",
    twelfth_board: "", twelfth_year_of_passing: "", twelfth_result_status: "",
    twelfth_marks_percentage: "", declaration_accepted: false
  });

  const [filePreviews, setFilePreviews] = useState({
    photo: null, aadhar_card: null, tenth_marksheet: null, twelfth_marksheet: null
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
    fetchProfileData();
    if (!college) loadColleges();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await getApplicationFormData();
      if (data) {
        setFormData(prev => ({
          ...prev,
          first_name: data.first_name || prev.first_name,
          last_name: data.last_name || prev.last_name,
          email_id: data.email_id || data.email || prev.email_id,
          mobile_number: data.mobile_number || prev.mobile_number,
          city: data.city || prev.city,
          state: data.state || prev.state
        }));
      }
    } catch (err) { console.error(err); }
  };

  const loadColleges = async () => {
    setLoadingColleges(true);
    try {
      const data = await getColleges({});
      setAvailableColleges(data.results || data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingColleges(false); }
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.declaration_accepted) {
      setStatusMessage("Please accept the declaration.");
      setStatusType("error");
      return;
    }
    setSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) submitData.append(key, formData[key]);
      });
      submitData.append("college_id", college?.college_id || college?.id);
      submitData.append("course_id", selectedCourse?.course_id || selectedCourse?.id);
      submitData.append("quota_type", quotaType);
      
      await submitApplication(submitData);
      setStatusMessage("Application submitted successfully!");
      setStatusType("success");
      setTimeout(() => navigate('/my-applications'), 2000);
    } catch (err) {
      setStatusMessage("Submission failed. Please check all fields.");
      setStatusType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Personal" },
    { id: 2, label: "Family" },
    { id: 3, label: "Address" },
    { id: 4, label: "Academic" }
  ];

  if (loading) return <div className="loading-screen-premium"><div className="premium-spinner" /></div>;

  return (
    <div className="application-form-container premium-3d-wrap">
      <Navbar />

      <section className="form-hero">
        <div className="container">
          <SectionReveal className="form-hero-content">
            <div className="section-label-premium">
              <span className="label-dot" />
              Admission Portal
            </div>
            <h1>Apply to <span className="title-highlight">{college?.college_name || "Preferred Institution"}</span></h1>
            <p>Please provide accurate information for a smooth admission process.</p>
          </SectionReveal>
        </div>
      </section>

      <div className="container">
        <div className="form-progress-container">
          <div className="progress-bar-premium">
            {steps.map(s => (
              <div 
                key={s.id} 
                className={`progress-step ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'completed' : ''}`}
                onClick={() => currentStep > s.id && setCurrentStep(s.id)}
              >
                <div className="step-circle">{currentStep > s.id ? '✓' : s.id}</div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-form-card card-3d">
          <div className="selected-summary">
            <div className="summary-details">
              <h4>Current Selection</h4>
              <p>{selectedCourse?.course_name || "Course Selection Pending"} • {college?.college_name || "College Pending"}</p>
            </div>
            <button className="btn-edit-selection" onClick={() => navigate('/colleges')}>Change</button>
          </div>

          {statusMessage && (
            <div className={`form-status-alert ${statusType}`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="premium-main-form">
            <AnimatePresence mode="wait">
              
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Personal Details</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium">
                      <label>First Name</label>
                      <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Last Name</label>
                      <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Mobile Number</label>
                      <input type="tel" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Date of Birth</label>
                      <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Gender</label>
                      <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} required>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="input-group-premium">
                      <label>Aadhar Number</label>
                      <input type="text" value={formData.aadhar_number} onChange={e => setFormData({...formData, aadhar_number: e.target.value})} required />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Family Information</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium">
                      <label>Father's Name</label>
                      <input type="text" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Mother's Name</label>
                      <input type="text" value={formData.mother_name} onChange={e => setFormData({...formData, mother_name: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Father's Occupation</label>
                      <input type="text" value={formData.father_occupation} onChange={e => setFormData({...formData, father_occupation: e.target.value})} />
                    </div>
                    <div className="input-group-premium">
                      <label>Annual Family Income</label>
                      <input type="number" value={formData.family_annual_income} onChange={e => setFormData({...formData, family_annual_income: e.target.value})} />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Permanent Address</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-full">
                      <label>Address Line 1</label>
                      <input type="text" value={formData.address_line1} onChange={e => setFormData({...formData, address_line1: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>City</label>
                      <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>State</label>
                      <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Pincode</label>
                      <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Academic Records</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium">
                      <label>10th School Name</label>
                      <input type="text" value={formData.tenth_school_name} onChange={e => setFormData({...formData, tenth_school_name: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>10th Marks (%)</label>
                      <input type="number" value={formData.tenth_marks_percentage} onChange={e => setFormData({...formData, tenth_marks_percentage: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>12th School Name</label>
                      <input type="text" value={formData.twelfth_school_name} onChange={e => setFormData({...formData, twelfth_school_name: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>12th Marks (%)</label>
                      <input type="number" value={formData.twelfth_marks_percentage} onChange={e => setFormData({...formData, twelfth_marks_percentage: e.target.value})} required />
                    </div>
                  </div>

                  <div className="declaration-premium">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={formData.declaration_accepted} onChange={e => setFormData({...formData, declaration_accepted: e.target.checked})} required />
                      <span>I hereby declare that all information provided is true and accurate.</span>
                    </label>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="form-footer-actions">
              <button type="button" className="btn-form-prev" onClick={handlePrev} disabled={currentStep === 1}>Back</button>
              {currentStep < 4 ? (
                <button type="button" className="btn-form-next" onClick={handleNext}>Continue</button>
              ) : (
                <button type="submit" className="btn-form-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}


export default ApplicationForm;
