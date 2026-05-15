import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getApplicationFormData,
  submitApplication,
  getColleges,
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

function PrefixSelect({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="prefix-select-container" ref={containerRef}>
      <div 
        className={`prefix-select-display ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}.</span>
        <svg className="prefix-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7"/></svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="prefix-select-list"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {options.map(opt => (
              <div 
                key={opt} 
                className={`prefix-option ${value === opt ? 'active' : ''}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}.
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomSelect({ label, value, options, onChange, placeholder = "Select", searchable = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (opt) => typeof opt === 'object' ? opt.label : opt;
  const getValue = (opt) => typeof opt === 'object' ? opt.value : opt;
  
  const selectedOption = options.find(opt => getValue(opt) === value);
  const displayValue = selectedOption ? getLabel(selectedOption) : (value || placeholder);

  const filteredOptions = options.filter(opt => 
    getLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="input-group-premium custom-select-container" ref={containerRef}>
      <label>{label}</label>
      <div 
        className={`custom-select-display ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayValue}</span>
        <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7"/></svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-select-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {searchable && (
              <div className="select-search-wrap">
                <input 
                  type="text" 
                  placeholder="Type to search..." 
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="options-scroll-area">
              {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                <div 
                  key={getValue(opt)} 
                  className={`select-option ${value === getValue(opt) ? 'active' : ''}`}
                  onClick={() => {
                    onChange(getValue(opt));
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {getLabel(opt)}
                </div>
              )) : <div className="no-options">No matches found</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function YearPicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="input-group-premium year-picker-container" ref={containerRef}>
      <label>{label}</label>
      <input 
        type="text" 
        value={value || ""} 
        readOnly 
        onClick={() => setIsOpen(!isOpen)} 
        placeholder="Select Year"
        style={{ cursor: 'pointer' }}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="year-picker-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {years.map(year => (
              <div 
                key={year} 
                className={`year-item ${value == year ? 'active' : ''}`}
                onClick={() => {
                  onChange(year);
                  setIsOpen(false);
                }}
              >
                {year}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [loadingColleges, setLoadingColleges] = useState(false);

  const {
    college: initialCollege,
    course: initialCourse,
    quotaType: initialQuotaType,
  } = location.state || {};

  const [college, setCollege] = useState(initialCollege || null);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse || null);
  
  const [quotaType, setQuotaType] = useState(
    initialQuotaType === "Government Quota" ? "government" : "management"
  );

  const [formData, setFormData] = useState({
    // Bio-data
    first_name_prefix: "Mr", first_name: "", last_name: "", gender: "", date_of_birth: "",
    mobile_number: "", email_id: "", blood_group: "", nationality: "Indian",
    community: "", sub_caste: "", marital_status: "", mother_tongue: "",
    aadhar_number: "", first_graduation: "", 
    
    // Parent's Details
    father_name_prefix: "Mr", father_name: "", father_mobile: "", father_occupation: "", 
    father_occupation_other: "",
    mother_name_prefix: "Mrs", mother_name: "", mother_mobile: "", mother_occupation: "", 
    mother_occupation_other: "",
    family_annual_income: "",
    
    // Address
    address_line1: "", address_line2: "", city: "", state: "", pincode: "",
    
    // Academic (10th)
    tenth_school_name: "", tenth_board: "", tenth_year_of_passing: "",
    tenth_result_status: "", tenth_marks_percentage: "", 
    
    // Academic (12th)
    twelfth_school_name: "", twelfth_board: "", twelfth_year_of_passing: "", 
    twelfth_result_status: "", twelfth_marks_percentage: "", 

    // Academic (Diploma)
    has_diploma: false,
    diploma_college_name: "", diploma_board_university: "", diploma_year_of_passing: "",
    diploma_result_status: "", diploma_marks_percentage: "",

    // Academic (UG)
    has_ug: false,
    ug_college_name: "", ug_board_university: "", ug_year_of_passing: "",
    ug_result_status: "", ug_marks_percentage: "",

    declaration_accepted: false
  });

  const [files, setFiles] = useState({
    photo: null, aadhar_card: null, tenth_marksheet: null, 
    twelfth_marksheet: null, diploma_marksheet: null, 
    ug_marksheet: null, community_marksheet: null
  });

  const [filePreviews, setFilePreviews] = useState({
    photo: null, aadhar_card: null, tenth_marksheet: null, 
    twelfth_marksheet: null, diploma_marksheet: null, 
    ug_marksheet: null, community_marksheet: null
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
    setCurrentStep(prev => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateMobile = (num) => /^[6-9]\d{9}$/.test(num.replace(/\D/g, ""));

  const handleAadharChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 12) val = val.slice(0, 12);
    let formatted = "";
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += val[i];
    }
    setFormData({...formData, aadhar_number: formatted});
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateMobile(formData.mobile_number)) {
      setStatusMessage("Please enter a valid 10-digit mobile number.");
      setStatusType("error");
      return;
    }

    if (!formData.declaration_accepted) {
      setStatusMessage("Please accept the declaration.");
      setStatusType("error");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });
      Object.keys(files).forEach(key => {
        if (files[key]) submitData.append(key, files[key]);
      });
      
      submitData.append("college_id", college?.college_id || college?.id);
      submitData.append("course_name", selectedCourse?.course_name || selectedCourse?.name);
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

  const occupationOptions = [
    "Government Employee", "Private Employee", "Business", 
    "Self-Employed", "Farmer", "Teacher", "Retired", "Home Maker", "Other"
  ];

  const incomeRanges = [
    "< 1 Lakh", "1-2 Lakhs", "2-3 Lakhs", "3-5 Lakhs", "5-10 Lakhs", "> 10 Lakhs"
  ];

  const communityOptions = ["OC", "BC", "MBC", "SC", "ST", "SCA", "BCM", "DNC"];
  const bloodOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" }
  ];
  const maritalOptions = [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" }
  ];
  const resultOptions = [
    { label: "Declared", value: "declared" },
    { label: "Awaited", value: "awaited" }
  ];
  const quotaOptions = [
    { label: "Management Quota", value: "management" },
    { label: "Government Quota", value: "government" }
  ];
  const prefixOptions = ["Mr", "Mrs", "Ms"];
  const graduationOptions = ["Yes", "No"];

  const steps = [
    { id: 1, label: "Bio-data" },
    { id: 2, label: "Parents" },
    { id: 3, label: "Address" },
    { id: 4, label: "Academic" },
    { id: 5, label: "Documents" }
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
              <p>{selectedCourse?.course_name || "Course selection required"} • {college?.college_name || "College selection required"}</p>
              <div className="summary-meta">
                <span>Quota: <strong>{quotaType === 'government' ? 'Government Quota' : 'Management Quota'}</strong></span>
              </div>
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
                  <h3 className="form-section-title">Bio-data</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-prefix-input">
                      <label>First Name</label>
                      <div className="input-with-prefix-wrap">
                        <PrefixSelect 
                          value={formData.first_name_prefix} 
                          options={prefixOptions} 
                          onChange={val => setFormData({...formData, first_name_prefix: val})}
                        />
                        <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required placeholder="Enter First Name" />
                      </div>
                    </div>
                    <div className="input-group-premium">
                      <label>Last Name</label>
                      <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} placeholder="Initial / Surname" />
                    </div>
                    <CustomSelect 
                      label="Gender" 
                      value={formData.gender} 
                      options={genderOptions} 
                      onChange={val => setFormData({...formData, gender: val})} 
                      placeholder="Select Gender"
                    />
                    <div className="input-group-premium">
                      <label>Date of Birth</label>
                      <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Mobile Number</label>
                      <div className="input-with-static-prefix">
                        <span className="static-prefix">+91</span>
                        <input 
                          type="tel" 
                          maxLength="10"
                          value={formData.mobile_number} 
                          onChange={e => setFormData({...formData, mobile_number: e.target.value.replace(/\D/g, "")})} 
                          required 
                          placeholder="9XXXXXXXXX"
                        />
                      </div>
                    </div>
                    <div className="input-group-premium">
                      <label>Email ID</label>
                      <input type="email" value={formData.email_id} onChange={e => setFormData({...formData, email_id: e.target.value})} required />
                    </div>
                    <CustomSelect 
                      label="Blood Group" 
                      value={formData.blood_group} 
                      options={bloodOptions} 
                      onChange={val => setFormData({...formData, blood_group: val})} 
                      placeholder="Select Group"
                    />
                    <div className="input-group-premium">
                      <label>Nationality</label>
                      <input type="text" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} required />
                    </div>
                    <CustomSelect 
                      label="Community" 
                      value={formData.community} 
                      options={communityOptions} 
                      onChange={val => setFormData({...formData, community: val})} 
                      placeholder="Select Community"
                    />
                    <div className="input-group-premium">
                      <label>Sub Caste</label>
                      <input type="text" value={formData.sub_caste} onChange={e => setFormData({...formData, sub_caste: e.target.value})} />
                    </div>
                    <CustomSelect 
                      label="Marital Status" 
                      value={formData.marital_status} 
                      options={maritalOptions} 
                      onChange={val => setFormData({...formData, marital_status: val})} 
                      placeholder="Select Status"
                    />
                    <div className="input-group-premium">
                      <label>Mother Tongue</label>
                      <input type="text" value={formData.mother_tongue} onChange={e => setFormData({...formData, mother_tongue: e.target.value})} />
                    </div>
                    <div className="input-group-premium">
                      <label>Aadhar Number</label>
                      <input 
                        type="text" 
                        value={formData.aadhar_number} 
                        onChange={handleAadharChange} 
                        required 
                        placeholder="0000 0000 0000" 
                        maxLength="14"
                      />
                    </div>
                    <CustomSelect 
                      label="First Graduation?" 
                      value={formData.first_graduation} 
                      options={graduationOptions} 
                      onChange={val => setFormData({...formData, first_graduation: val})} 
                      placeholder="Select Option"
                    />
                    <CustomSelect 
                      label="Quota Type" 
                      value={quotaType} 
                      options={quotaOptions} 
                      onChange={val => setQuotaType(val)} 
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Parent's Details</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-prefix-input">
                      <label>Father's Name</label>
                      <div className="input-with-prefix-wrap">
                        <PrefixSelect 
                          value={formData.father_name_prefix} 
                          options={prefixOptions} 
                          onChange={val => setFormData({...formData, father_name_prefix: val})}
                        />
                        <input type="text" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} required />
                      </div>
                    </div>
                    <div className="input-group-premium">
                      <label>Father's Mobile</label>
                      <div className="input-with-static-prefix">
                        <span className="static-prefix">+91</span>
                        <input 
                          type="tel" 
                          maxLength="10"
                          value={formData.father_mobile} 
                          onChange={e => setFormData({...formData, father_mobile: e.target.value.replace(/\D/g, "")})} 
                        />
                      </div>
                    </div>
                    <CustomSelect 
                      label="Father's Occupation" 
                      value={formData.father_occupation} 
                      options={occupationOptions} 
                      onChange={val => setFormData({...formData, father_occupation: val})} 
                    />
                    {formData.father_occupation === "Other" && (
                      <div className="input-group-premium">
                        <label>Specify Father's Occupation</label>
                        <input type="text" value={formData.father_occupation_other} onChange={e => setFormData({...formData, father_occupation_other: e.target.value})} required />
                      </div>
                    )}
                    <div className="input-group-premium form-group-prefix-input">
                      <label>Mother's Name</label>
                      <div className="input-with-prefix-wrap">
                        <PrefixSelect 
                          value={formData.mother_name_prefix} 
                          options={prefixOptions} 
                          onChange={val => setFormData({...formData, mother_name_prefix: val})}
                        />
                        <input type="text" value={formData.mother_name} onChange={e => setFormData({...formData, mother_name: e.target.value})} required />
                      </div>
                    </div>
                    <div className="input-group-premium">
                      <label>Mother's Mobile</label>
                      <div className="input-with-static-prefix">
                        <span className="static-prefix">+91</span>
                        <input 
                          type="tel" 
                          maxLength="10"
                          value={formData.mother_mobile} 
                          onChange={e => setFormData({...formData, mother_mobile: e.target.value.replace(/\D/g, "")})} 
                        />
                      </div>
                    </div>
                    <CustomSelect 
                      label="Mother's Occupation" 
                      value={formData.mother_occupation} 
                      options={occupationOptions} 
                      onChange={val => setFormData({...formData, mother_occupation: val})} 
                    />
                    {formData.mother_occupation === "Other" && (
                      <div className="input-group-premium">
                        <label>Specify Mother's Occupation</label>
                        <input type="text" value={formData.mother_occupation_other} onChange={e => setFormData({...formData, mother_occupation_other: e.target.value})} required />
                      </div>
                    )}
                    <CustomSelect 
                      label="Family Annual Income" 
                      value={formData.family_annual_income} 
                      options={incomeRanges} 
                      onChange={val => setFormData({...formData, family_annual_income: val})} 
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Address Details</h3>
                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-full">
                      <label>Address Line 1</label>
                      <textarea rows="2" value={formData.address_line1} onChange={e => setFormData({...formData, address_line1: e.target.value})} required />
                    </div>
                    <div className="input-group-premium form-group-full">
                      <label>Address Line 2</label>
                      <textarea rows="2" value={formData.address_line2} onChange={e => setFormData({...formData, address_line2: e.target.value})} />
                    </div>
                    <div className="input-group-premium">
                      <label>City / Village</label>
                      <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>State</label>
                      <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
                    </div>
                    <div className="input-group-premium">
                      <label>Pincode</label>
                      <input type="text" maxLength="6" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Academic Details</h3>
                  
                  {/* ── 10th Standard ── */}
                  <div className="academic-block-premium">
                    <h4 className="sub-section-header">10th Standard</h4>
                    <div className="form-grid-premium">
                      <div className="input-group-premium">
                        <label>School Name</label>
                        <input type="text" value={formData.tenth_school_name} onChange={e => setFormData({...formData, tenth_school_name: e.target.value})} required />
                      </div>
                      <div className="input-group-premium">
                        <label>Board</label>
                        <input type="text" value={formData.tenth_board} onChange={e => setFormData({...formData, tenth_board: e.target.value})} required placeholder="e.g. State Board" />
                      </div>
                      <YearPicker 
                        label="Year of Passing"
                        value={formData.tenth_year_of_passing}
                        onChange={(year) => setFormData({...formData, tenth_year_of_passing: year})}
                      />
                      <CustomSelect 
                        label="Result Status" 
                        value={formData.tenth_result_status} 
                        options={resultOptions} 
                        onChange={val => setFormData({...formData, tenth_result_status: val})} 
                      />
                      <div className="input-group-premium">
                        <label>Marks Percentage (%)</label>
                        <input type="number" step="0.01" value={formData.tenth_marks_percentage} onChange={e => setFormData({...formData, tenth_marks_percentage: e.target.value})} required />
                      </div>
                    </div>
                  </div>

                  {/* ── 12th Standard ── */}
                  <div className="academic-block-premium mt-30">
                    <h4 className="sub-section-header">12th Standard</h4>
                    <div className="form-grid-premium">
                      <div className="input-group-premium">
                        <label>School Name</label>
                        <input type="text" value={formData.twelfth_school_name} onChange={e => setFormData({...formData, twelfth_school_name: e.target.value})} required />
                      </div>
                      <div className="input-group-premium">
                        <label>Board</label>
                        <input type="text" value={formData.twelfth_board} onChange={e => setFormData({...formData, twelfth_board: e.target.value})} required placeholder="e.g. State Board" />
                      </div>
                      <YearPicker 
                        label="Year of Passing"
                        value={formData.twelfth_year_of_passing}
                        onChange={(year) => setFormData({...formData, twelfth_year_of_passing: year})}
                      />
                      <CustomSelect 
                        label="Result Status" 
                        value={formData.twelfth_result_status} 
                        options={resultOptions} 
                        onChange={val => setFormData({...formData, twelfth_result_status: val})} 
                      />
                      <div className="input-group-premium">
                        <label>Marks Percentage (%)</label>
                        <input type="number" step="0.01" value={formData.twelfth_marks_percentage} onChange={e => setFormData({...formData, twelfth_marks_percentage: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* ── Diploma Toggle ── */}
                  <div className="academic-toggle-premium mt-30">
                    <label className="checkbox-wrap-premium">
                      <input type="checkbox" checked={formData.has_diploma} onChange={e => setFormData({...formData, has_diploma: e.target.checked})} />
                      <span>Have you completed a Diploma?</span>
                    </label>
                  </div>

                  <AnimatePresence>
                    {formData.has_diploma && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="academic-block-premium mt-20"
                      >
                        <h4 className="sub-section-header">Diploma Details</h4>
                        <div className="form-grid-premium">
                          <div className="input-group-premium">
                            <label>College Name</label>
                            <input type="text" value={formData.diploma_college_name} onChange={e => setFormData({...formData, diploma_college_name: e.target.value})} />
                          </div>
                          <div className="input-group-premium">
                            <label>Board / University</label>
                            <input type="text" value={formData.diploma_board_university} onChange={e => setFormData({...formData, diploma_board_university: e.target.value})} />
                          </div>
                          <YearPicker 
                            label="Year of Passing"
                            value={formData.diploma_year_of_passing}
                            onChange={(year) => setFormData({...formData, diploma_year_of_passing: year})}
                          />
                          <CustomSelect 
                            label="Result Status" 
                            value={formData.diploma_result_status} 
                            options={resultOptions} 
                            onChange={val => setFormData({...formData, diploma_result_status: val})} 
                          />
                          <div className="input-group-premium">
                            <label>Marks Percentage (%)</label>
                            <input type="number" step="0.01" value={formData.diploma_marks_percentage} onChange={e => setFormData({...formData, diploma_marks_percentage: e.target.value})} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── UG Toggle ── */}
                  <div className="academic-toggle-premium mt-30">
                    <label className="checkbox-wrap-premium">
                      <input type="checkbox" checked={formData.has_ug} onChange={e => setFormData({...formData, has_ug: e.target.checked})} />
                      <span>Have you completed Graduation (UG)?</span>
                    </label>
                  </div>

                  <AnimatePresence>
                    {formData.has_ug && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="academic-block-premium mt-20"
                      >
                        <h4 className="sub-section-header">UG Details</h4>
                        <div className="form-grid-premium">
                          <div className="input-group-premium">
                            <label>College Name</label>
                            <input type="text" value={formData.ug_college_name} onChange={e => setFormData({...formData, ug_college_name: e.target.value})} />
                          </div>
                          <div className="input-group-premium">
                            <label>Board / University</label>
                            <input type="text" value={formData.ug_board_university} onChange={e => setFormData({...formData, ug_board_university: e.target.value})} />
                          </div>
                          <YearPicker 
                            label="Year of Passing"
                            value={formData.ug_year_of_passing}
                            onChange={(year) => setFormData({...formData, ug_year_of_passing: year})}
                          />
                          <CustomSelect 
                            label="Result Status" 
                            value={formData.ug_result_status} 
                            options={resultOptions} 
                            onChange={val => setFormData({...formData, ug_result_status: val})} 
                          />
                          <div className="input-group-premium">
                            <label>Marks Percentage (%)</label>
                            <input type="number" step="0.01" value={formData.ug_marks_percentage} onChange={e => setFormData({...formData, ug_marks_percentage: e.target.value})} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="form-section-title">Document Uploads</h3>
                  <p className="upload-instruction">Upload clear scanned copies of original documents (Max 2MB each).</p>
                  
                  <div className="upload-grid-premium">
                    {[
                      { id: "photo", label: "Student Photo" },
                      { id: "aadhar_card", label: "Aadhar Card" },
                      { id: "tenth_marksheet", label: "10th Marksheet" },
                      { id: "twelfth_marksheet", label: "12th Marksheet" },
                      { id: "community_marksheet", label: "Community Certificate" },
                      { id: "diploma_marksheet", label: "Diploma Marksheet" },
                      { id: "ug_marksheet", label: "UG Marksheet" }
                    ].map(doc => (
                      <div key={doc.id} className="upload-card-premium">
                        <label>{doc.label}</label>
                        <div className="upload-zone-premium-mini">
                          <div className="upload-placeholder-mini">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                            <span>Upload File</span>
                          </div>
                          <input type="file" onChange={e => handleFileChange(e, doc.id)} accept=".jpg,.jpeg,.png,.pdf" />
                        </div>
                        
                        <AnimatePresence>
                          {filePreviews[doc.id] && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: 10 }}
                              className="file-preview-external"
                            >
                              <div className="preview-container">
                                {filePreviews[doc.id].startsWith("data:image") ? (
                                  <img src={filePreviews[doc.id]} alt="Preview" />
                                ) : (
                                  <div className="pdf-placeholder-mini">📄 PDF</div>
                                )}
                                <button type="button" className="btn-remove-preview" onClick={() => {
                                  setFiles(prev => ({ ...prev, [doc.id]: null }));
                                  setFilePreviews(prev => ({ ...prev, [doc.id]: null }));
                                }}>✕</button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="declaration-premium mt-40">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={formData.declaration_accepted} onChange={e => setFormData({...formData, declaration_accepted: e.target.checked})} required />
                      <span>I hereby declare that all information provided is true and accurate. I understand that false information may lead to cancellation.</span>
                    </label>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="form-footer-actions">
              <button type="button" className="btn-form-prev" onClick={handlePrev} disabled={currentStep === 1}>Back</button>
              {currentStep < 5 ? (
                <button type="button" className="btn-form-next" onClick={handleNext}>Continue</button>
              ) : (
                <button type="submit" className="btn-form-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Final Submission"}
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
