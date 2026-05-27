import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  getApplicationFormData,
  submitApplication,
  getCollegeCourses,
} from "../services/api";
import "../styles/applicationForm.css";

/* =====================================================
   CONSTANTS
===================================================== */

const PREFIX_OPTIONS = ["Mr", "Mrs", "Ms"];

const BOARD_OPTIONS = [
  { label: "State Board", value: "state_board" },
  { label: "CBSE", value: "cbse" },
  { label: "ICSE", value: "icse" },
  { label: "IB", value: "ib" },
  { label: "Other", value: "other" },
];

const QUALIFICATION_TYPE_OPTIONS = [
  { label: "12th Standard (HSC)", value: "hsc" },
  { label: "Diploma", value: "diploma" },
];

const OCCUPATION_OPTIONS = [
  "Government Employee",
  "Private Employee",
  "Business",
  "Self-Employed",
  "Farmer",
  "Teacher",
  "Retired",
  "Home Maker",
  "Other",
];

const INCOME_RANGES = [
  "< 1 Lakh",
  "1-2 Lakhs",
  "2-3 Lakhs",
  "3-5 Lakhs",
  "5-10 Lakhs",
  "> 10 Lakhs",
];

const COMMUNITY_OPTIONS = [
  "OC",
  "BC",
  "MBC",
  "SC",
  "ST",
  "SCA",
  "BCM",
  "DNC",
];

const BLOOD_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const MARITAL_OPTIONS = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
];

const RESULT_OPTIONS = [
  { label: "Declared", value: "declared" },
  { label: "Awaited", value: "awaited" },
];

const QUOTA_OPTIONS = [
  { label: "Management Quota", value: "management" },
  { label: "Government Quota", value: "government" },
];

const GRADUATION_OPTIONS = ["Yes", "No"];

const STEPS = [
  { id: 1, label: "Bio-data" },
  { id: 2, label: "Parents" },
  { id: 3, label: "Address" },
  { id: 4, label: "Academic" },
  { id: 5, label: "Documents" },
];

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

/* =====================================================
   HELPERS
===================================================== */

const validateMobile = (num) => {
  const cleaned = num.replace(/\D/g, "");
  return /^[6-9][0-9]{9}$/.test(cleaned);
};

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateAadhar = (aadhar) =>
  aadhar.replace(/\s/g, "").length === 12;

const validatePincode = (pincode) => /^\d{6}$/.test(pincode);

const validatePercentage = (value) => {
  if (!value) return true; // Allow empty if result is awaited
  const num = parseFloat(value);
  return num >= 0 && num <= 100;
};

const validateYear = (year) => {
  if (!year) return false;
  const num = Number(year);
  const currentYear = new Date().getFullYear();
  return (
    Number.isInteger(num) &&
    num >= currentYear - 10 &&
    num <= currentYear
  );
};

const validateFileSize = (file, maxSizeMB = 2) =>
  file.size <= maxSizeMB * 1024 * 1024;

const getCourseKey = (course) =>
  course?.course_id ?? course?.id ?? course?.course_name;

const renderFieldLabel = (label, required) => {
  if (typeof label !== "string") return label;

  const trimmed = label.trim();
  const hasExplicitStar = trimmed.endsWith(" *");
  const text = hasExplicitStar ? trimmed.slice(0, -2) : label;

  return (
    <>
      {text}
      {(hasExplicitStar || required) && (
        <span className="required-mark">*</span>
      )}
    </>
  );
};

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

const SectionReveal = memo(({ children, className, delay = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          delay,
          duration: 0.5,
        },
      },
    }}
  >
    {children}
  </motion.div>
));

const TextInput = memo(
  ({
    label,
    value,
    onChange,
    type = "text",
    required,
    placeholder,
    ...props
  }) => (
    <div className="input-group-premium">
      <label>{renderFieldLabel(label, required)}</label>

      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        aria-label={label}
        aria-required={required}
        {...props}
      />
    </div>
  )
);

// PrefixSelect with proper dropdown visibility
function PrefixSelect({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="prefix-select-container" ref={containerRef}>
      <div
        className={`prefix-select-display ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="prefix-value">{value}</span>
        <svg
          className="prefix-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="prefix-select-list"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                className={`prefix-option ${value === opt ? "active" : ""}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  required,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (opt) =>
    typeof opt === "object" ? opt.label : opt;

  const getValue = (opt) =>
    typeof opt === "object" ? opt.value : opt;

  const filteredOptions = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(
    (opt) => getValue(opt) === value
  );

  const displayValue = selectedOption
    ? getLabel(selectedOption)
    : placeholder;

  return (
    <div className="input-group-premium custom-select-container" ref={containerRef}>
      <label>{renderFieldLabel(label, required)}</label>

      <div
        className={`custom-select-display ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayValue}</span>
        <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="select-search-wrap">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                autoFocus
              />
            </div>

            <div className="options-scroll-area">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={getValue(opt)}
                    className={`select-option ${value === getValue(opt) ? "active" : ""}`}
                    onClick={() => {
                      onChange(getValue(opt));
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {getLabel(opt)}
                  </div>
                ))
              ) : (
                <div className="no-options">No options found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function YearPicker({ value, onChange, label, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const currentYear = new Date().getFullYear();
  
  const years = useMemo(() => {
    const startYear = currentYear - 10;
    const endYear = currentYear;
    const yearList = [];
    for (let i = endYear; i >= startYear; i--) {
      yearList.push(i);
    }
    return yearList;
  }, [currentYear]);

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
      <label>{renderFieldLabel(label, required)}</label>
      <div
        className={`year-display ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "" : "placeholder"}>
          {value || "Select Year"}
        </span>
        <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="year-picker-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="year-picker-header">
              <span>Select Year</span>
            </div>
            <div className="years-list">
              {years.map(year => (
                <div
                  key={year}
                  className={`year-item ${value == year ? "active" : ""}`}
                  onClick={() => {
                    onChange(year);
                    setIsOpen(false);
                  }}
                >
                  {year}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

function ApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const submittingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState([1]);

  const {
    college: initialCollege,
    course: initialCourse,
    quotaType: initialQuotaType,
  } = location.state || {};

  const [college] = useState(initialCollege || null);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse || null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [canEditCourse, setCanEditCourse] = useState(false);

  const [quotaType, setQuotaType] = useState(
    initialQuotaType === "Government Quota"
      ? "government"
      : "management"
  );

  const [formData, setFormData] = useState({
    first_name_prefix: "Mr",
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    mobile_number: "",
    email_id: "",
    blood_group: "",
    nationality: "Indian",
    community: "",
    sub_caste: "",
    marital_status: "",
    mother_tongue: "",
    aadhar_number: "",
    first_graduation: "",

    father_name_prefix: "Mr",
    father_name: "",
    father_mobile: "",
    father_occupation: "",
    father_occupation_other: "",

    mother_name_prefix: "Mrs",
    mother_name: "",
    mother_mobile: "",
    mother_occupation: "",
    mother_occupation_other: "",

    family_annual_income: "",

    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",

    tenth_school_name: "",
    tenth_board: "",
    tenth_year_of_passing: "",
    tenth_result_status: "",
    tenth_marks_percentage: "",

    qualification_type: "hsc",
    
    twelfth_school_name: "",
    twelfth_board: "",
    twelfth_year_of_passing: "",
    twelfth_result_status: "",
    twelfth_marks_percentage: "",

    has_diploma: false,
    diploma_college_name: "",
    diploma_board_university: "",
    diploma_year_of_passing: "",
    diploma_result_status: "",
    diploma_marks_percentage: "",

    has_ug: false,
    ug_college_name: "",
    ug_board_university: "",
    ug_year_of_passing: "",
    ug_result_status: "",
    ug_marks_percentage: "",

    declaration_accepted: false,
  });

  const [files, setFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

  const currentYear = new Date().getFullYear();
  const isTenthPassingCurrentYear =
    Number(formData.tenth_year_of_passing) === currentYear;
  const showPostTenthQualification = !isTenthPassingCurrentYear;

  useEffect(() => {
    if (isTenthPassingCurrentYear) {
      setFormData((prev) => ({
        ...prev,
        qualification_type: "",
        twelfth_school_name: "",
        twelfth_board: "",
        twelfth_year_of_passing: "",
        twelfth_result_status: "",
        twelfth_marks_percentage: "",
        diploma_college_name: "",
        diploma_board_university: "",
        diploma_year_of_passing: "",
        diploma_result_status: "",
        diploma_marks_percentage: "",
      }));
    }
  }, [isTenthPassingCurrentYear]);

  /* =====================================================
     INPUT HANDLER
  ===================================================== */

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (statusMessage) {
      setStatusMessage(null);
      setStatusType("");
    }
  }, [statusMessage]);

  /* =====================================================
     AUTOSAVE DRAFT
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      "applicationDraft",
      JSON.stringify(formData)
    );
  }, [formData]);

  useEffect(() => {
    const savedDraft = localStorage.getItem("applicationDraft");

    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    const collegeId = college?.college_id || college?.id;
    if (!collegeId) {
      setAvailableCourses([]);
      return;
    }

    let active = true;
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await getCollegeCourses(collegeId);
        const courses = Array.isArray(response)
          ? response
          : response.results || [];

        if (!active) return;
        setAvailableCourses(courses);

        const currentCourseKey = selectedCourse
          ? getCourseKey(selectedCourse)
          : null;
        const matchedCourse = courses.find(
          (course) => getCourseKey(course) === currentCourseKey
        );

        if (!selectedCourse && courses.length > 0) {
          setSelectedCourse(courses[0]);
        } else if (selectedCourse && !matchedCourse && courses.length > 0) {
          setSelectedCourse(courses[0]);
        }
      } catch (error) {
        console.error("Error loading courses for selected college:", error);
      } finally {
        if (active) setCoursesLoading(false);
      }
    };

    fetchCourses();
    return () => {
      active = false;
    };
  }, [college]);

  /* =====================================================
     FETCH PROFILE DATA
  ===================================================== */

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await getApplicationFormData();

      if (data) {
        setFormData((prev) => ({
          ...prev,
          first_name: data.first_name || prev.first_name,
          last_name: data.last_name || prev.last_name,
          email_id: data.email || prev.email_id,
          mobile_number:
            data.mobile_number || prev.mobile_number,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfileData();
    setLoading(false);
  }, [fetchProfileData, navigate]);

  /* =====================================================
     CLEANUP PREVIEWS
  ===================================================== */

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [filePreviews]);

  /* =====================================================
     VALIDATORS
  ===================================================== */

  const validateBioData = () => {
    if (!formData.first_name)
      return "Enter first name";

    if (!validateMobile(formData.mobile_number))
      return "Invalid mobile number";

    if (!validateEmail(formData.email_id))
      return "Invalid email";

    if (!validateAadhar(formData.aadhar_number))
      return "Invalid Aadhar";

    return null;
  };

  const validateParents = () => {
    if (!formData.father_name)
      return "Father name required";

    if (!formData.mother_name)
      return "Mother name required";

    return null;
  };

  const validateAddress = () => {
    if (!formData.address_line1)
      return "Address required";

    if (!validatePincode(formData.pincode))
      return "Invalid pincode";

    return null;
  };

  const validateAcademic = () => {
    if (!formData.tenth_school_name)
      return "10th school name required";

    if (!formData.tenth_year_of_passing)
      return "10th year of passing required";
    if (!validateYear(formData.tenth_year_of_passing))
      return "Invalid 10th year of passing";

    // Only validate 10th percentage if result is declared
    if (formData.tenth_result_status === "declared" && !formData.tenth_marks_percentage) {
      return "10th marks percentage required";
    }
    if (formData.tenth_result_status === "declared" && !validatePercentage(formData.tenth_marks_percentage)) {
      return "Invalid 10th percentage";
    }

    if (!showPostTenthQualification) {
      return null;
    }

    if (!formData.qualification_type)
      return "Select your qualification";

    if (formData.qualification_type === "hsc") {
      if (!formData.twelfth_school_name)
        return "12th school name required";
      if (!formData.twelfth_year_of_passing)
        return "12th year of passing required";
      if (!validateYear(formData.twelfth_year_of_passing))
        return "Invalid 12th year of passing";
      // Only validate 12th percentage if result is declared
      if (formData.twelfth_result_status === "declared" && !formData.twelfth_marks_percentage) {
        return "12th marks percentage required";
      }
      if (formData.twelfth_result_status === "declared" && !validatePercentage(formData.twelfth_marks_percentage)) {
        return "Invalid 12th percentage";
      }
    } else {
      if (!formData.diploma_college_name)
        return "Diploma college name required";
      if (!formData.diploma_year_of_passing)
        return "Diploma year of passing required";
      if (!validateYear(formData.diploma_year_of_passing))
        return "Invalid diploma year of passing";
      // Only validate diploma percentage if result is declared
      if (formData.diploma_result_status === "declared" && !formData.diploma_marks_percentage) {
        return "Diploma marks percentage required";
      }
      if (formData.diploma_result_status === "declared" && !validatePercentage(formData.diploma_marks_percentage)) {
        return "Invalid diploma percentage";
      }
    }

    return null;
  };

  const validateDocuments = () => {
    if (!formData.declaration_accepted)
      return "Accept declaration";

    return null;
  };

  const validators = {
    1: validateBioData,
    2: validateParents,
    3: validateAddress,
    4: validateAcademic,
    5: validateDocuments,
  };

  const validateCurrentStep = () => {
    const error = validators[currentStep]?.();

    if (error) {
      setStatusMessage(error);
      setStatusType("error");

      document
        .querySelector(".input-group-premium")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

      return false;
    }

    return true;
  };

  /* =====================================================
     FILE HANDLER
  ===================================================== */

  const handleFileChange = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files[0];

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setStatusMessage("Invalid file format");
      setStatusType("error");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (!validateFileSize(file)) {
      setStatusMessage("File exceeds 2MB limit");
      setStatusType("error");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFiles((prev) => ({
      ...prev,
      [field]: file,
    }));

    setFilePreviews((prev) => ({
      ...prev,
      [field]: previewUrl,
    }));
  };

  const removeFile = (field) => {
    if (filePreviews[field]) {
      URL.revokeObjectURL(filePreviews[field]);
    }
    setFiles(prev => ({ ...prev, [field]: null }));
    setFilePreviews(prev => ({ ...prev, [field]: null }));
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNext = (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!validateCurrentStep()) return;

    const nextStep = currentStep + 1;

    setStatusMessage(null);
    setStatusType("");
    setCurrentStep(nextStep);
    setVisitedSteps((prev) =>
      prev.includes(nextStep) ? prev : [...prev, nextStep]
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;

    setSubmitting(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          form.append(key, value);
        }
      });

      Object.entries(files).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      form.append(
        "college_id",
        college?.college_id || college?.id
      );

      form.append(
        "course_name",
        selectedCourse?.course_name ||
          selectedCourse?.name
      );

      form.append("quota_type", quotaType);

      await submitApplication(form);

      setStatusMessage(
        "Application submitted successfully!"
      );

      setStatusType("success");

      localStorage.removeItem("applicationDraft");

      setTimeout(() => {
        navigate("/my-applications");
      }, 1500);
    } catch (error) {
      console.error(error);

      setStatusMessage(
        error.response?.data?.message ||
          "Submission failed"
      );

      setStatusType("error");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleAadharChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 12) val = val.slice(0, 12);
    let formatted = "";
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += val[i];
    }
    handleInputChange("aadhar_number", formatted);
  };

  if (loading) {
    return (
      <div className="loading-screen-premium">
        <div className="skeleton-loader-card"></div>
      </div>
    );
  }

  return (
    <div className="application-form-container premium-3d-wrap">
      <Navbar />

      <section className="form-hero">
        <div className="container">
          <SectionReveal className="form-hero-content">
            <div className="section-label-premium">
              <span className="label-dot" />
              Admission Application
            </div>
            <h1>
              Apply to{" "}
              <span className="title-highlight">
                {college?.college_name ||
                  "Preferred Institution"}
              </span>
            </h1>

            <p>
              Choose or update the course for this college, then complete your application.
            </p>
          </SectionReveal>
        </div>
      </section>

      <div className="container">
        <div className="form-progress-container">
          <div className="progress-bar-premium">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`progress-step ${
                  currentStep === step.id
                    ? "active"
                    : ""
                } ${
                  visitedSteps.includes(step.id)
                    ? "completed"
                    : ""
                }`}
                onClick={() =>
                  visitedSteps.includes(step.id) && setCurrentStep(step.id)
                }
              >
                <div className="step-circle">
                  {visitedSteps.includes(step.id) && currentStep !== step.id
                    ? "✓"
                    : step.id}
                </div>

                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-form-card card-3d">
          <div className="selected-summary">
            <div className="summary-details">
              <h4>Current Selection</h4>
              <p>{college?.college_name || "College selection required"}</p>
              <div className="summary-meta">
                <span>Course: <strong>{selectedCourse?.course_name || (coursesLoading ? 'Loading courses...' : 'Select Course')}</strong></span>
              </div>
              {canEditCourse ? (
                <div className="summary-course-select">
                  <CustomSelect
                    label="Choose a course"
                    required
                    value={selectedCourse ? getCourseKey(selectedCourse) : ""}
                    options={availableCourses.map((course) => ({
                      label: course.course_name || course.name || "Course",
                      value: getCourseKey(course),
                    }))}
                    onChange={(value) => {
                      const course = availableCourses.find(
                        (item) => getCourseKey(item) === value
                      );
                      if (course) setSelectedCourse(course);
                    }}
                    placeholder={coursesLoading ? "Loading courses..." : "Select course"}
                  />
                </div>
              ) : (
                <div className="course-readonly-note">
                  Click "Change Course" to pick a different specialization.
                </div>
              )}
              <div className="summary-meta" style={{ marginTop: "10px" }}>
                <span>Quota: <strong>{quotaType === 'government' ? 'Government Quota' : 'Management Quota'}</strong></span>
              </div>
            </div>
            <div className="summary-actions">
              <button
                type="button"
                className="btn-secondary-change-course"
                onClick={() => setCanEditCourse((prev) => !prev)}
              >
                {canEditCourse ? "Done" : "Change Course"}
              </button>
              <button
                type="button"
                className="btn-secondary-change-college"
                onClick={() => navigate('/colleges')}
              >
                Change College
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className={`form-status-alert ${statusType}`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="premium-main-form">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: BIO-DATA */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 className="form-section-title">Personal Information</h3>

                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-prefix-input">
                      <label>First Name</label>
                      <div className="input-with-prefix-wrap">
                        <PrefixSelect
                          value={formData.first_name_prefix}
                          options={PREFIX_OPTIONS}
                          onChange={(val) =>
                            handleInputChange("first_name_prefix", val)
                          }
                          
                        />
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) =>
                            handleInputChange("first_name", e.target.value)
                          }
                          required
                          placeholder="Enter First Name"
                        />
                      </div>
                    </div>

                    <TextInput
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      required
                      placeholder="Initial / Surname"
                    />

                    <CustomSelect
                      label="Gender"
                      required
                      value={formData.gender}
                      options={GENDER_OPTIONS}
                      onChange={(val) => handleInputChange("gender", val)}
                    />

                    <TextInput
                      label="Date of Birth"
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleInputChange("date_of_birth", e.target.value)
                      }
                    />

                    <div className="input-group-premium">
                      <label>Mobile Number</label>
                      <div className="input-with-static-prefix">
                        <span className="static-prefix">+91</span>
                        <input
                          type="tel"
                          maxLength="10"
                          value={formData.mobile_number}
                          onChange={(e) =>
                            handleInputChange(
                              "mobile_number",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          required
                          placeholder="9XXXXXXXXX"
                        />
                      </div>
                    </div>

                    <TextInput
                      label="Email ID"
                      type="email"
                      required
                      value={formData.email_id}
                      onChange={(e) =>
                        handleInputChange("email_id", e.target.value)
                      }
                    />

                    <CustomSelect
                      label="Blood Group"
                      required
                      value={formData.blood_group}
                      options={BLOOD_OPTIONS}
                      onChange={(val) => handleInputChange("blood_group", val)}
                    />

                    <TextInput
                      label="Nationality"
                      value={formData.nationality}
                      onChange={(e) =>
                        handleInputChange("nationality", e.target.value)
                      }
                      required
                    />

                    <CustomSelect
                      label="Community"
                      required
                      value={formData.community}
                      options={COMMUNITY_OPTIONS}
                      onChange={(val) => handleInputChange("community", val)}
                    />

                    <TextInput
                      label="Sub Caste"
                      required
                      value={formData.sub_caste}
                      onChange={(e) =>
                        handleInputChange("sub_caste", e.target.value)
                      }
                    />

                    <CustomSelect
                      label="Marital Status"
                      required
                      value={formData.marital_status}
                      options={MARITAL_OPTIONS}
                      onChange={(val) => handleInputChange("marital_status", val)}
                    />

                    <TextInput
                      label="Mother Tongue"
                      required
                      value={formData.mother_tongue}
                      onChange={(e) =>
                        handleInputChange("mother_tongue", e.target.value)
                      }
                    />

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
                      required
                      value={formData.first_graduation}
                      options={GRADUATION_OPTIONS}
                      onChange={(val) => handleInputChange("first_graduation", val)}
                    />

                    <CustomSelect
                      label="Quota Type *"
                      required
                      value={quotaType}
                      options={QUOTA_OPTIONS}
                      onChange={setQuotaType}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PARENT'S DETAILS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 className="form-section-title">Parent's Details</h3>

                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-prefix-input">
                      <label>Father's Name <span className="required-mark">*</span></label>
                      <div className="input-with-prefix-wrap">
                        <PrefixSelect
                          value={formData.father_name_prefix}
                          options={PREFIX_OPTIONS}
                          onChange={(val) =>
                            handleInputChange("father_name_prefix", val)
                          }
                        />
                        <input
                          type="text"
                          value={formData.father_name}
                          onChange={(e) =>
                            handleInputChange("father_name", e.target.value)
                          }
                          required
                          placeholder="Enter Father's Name"
                        />
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
                          onChange={(e) =>
                            handleInputChange(
                              "father_mobile",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          required
                          placeholder="Enter Father's Mobile"
                        />
                      </div>
                    </div>

                    <CustomSelect
                      label="Father's Occupation"
                      required
                      value={formData.father_occupation}
                      options={OCCUPATION_OPTIONS}
                      onChange={(val) => handleInputChange("father_occupation", val)}
                    />

                    {formData.father_occupation === "Other" && (
                      <TextInput
                        label="Specify Father's Occupation"
                        value={formData.father_occupation_other}
                        onChange={(e) =>
                          handleInputChange("father_occupation_other", e.target.value)
                        }
                        required
                      />
                    )}

                    <div className="input-group-premium form-group-prefix-input">
                      <label>Mother's Name <span className="required-mark">*</span></label>
                      <div className="input-with-prefix-wrap">
                        <PrefixSelect
                          value={formData.mother_name_prefix}
                          options={PREFIX_OPTIONS}
                          onChange={(val) =>
                            handleInputChange("mother_name_prefix", val)
                          }
                        />
                        <input
                          type="text"
                          value={formData.mother_name}
                          onChange={(e) =>
                            handleInputChange("mother_name", e.target.value)
                          }
                          required
                          placeholder="Enter Mother's Name"
                        />
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
                          onChange={(e) =>
                            handleInputChange(
                              "mother_mobile",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          required
                          placeholder="Enter Mother's Mobile"
                        />
                      </div>
                    </div>

                    <CustomSelect
                      label="Mother's Occupation"
                      required
                      value={formData.mother_occupation}
                      options={OCCUPATION_OPTIONS}
                      onChange={(val) => handleInputChange("mother_occupation", val)}
                    />

                    {formData.mother_occupation === "Other" && (
                      <TextInput
                        label="Specify Mother's Occupation"
                        value={formData.mother_occupation_other}
                        onChange={(e) =>
                          handleInputChange("mother_occupation_other", e.target.value)
                        }
                        required
                      />
                    )}

                    <CustomSelect
                      label="Family Annual Income"
                      required
                      value={formData.family_annual_income}
                      options={INCOME_RANGES}
                      onChange={(val) => handleInputChange("family_annual_income", val)}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: ADDRESS DETAILS */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 className="form-section-title">Address Details</h3>

                  <div className="form-grid-premium">
                    <div className="input-group-premium form-group-full">
                      <label>Address Line 1 <span className="required-mark">*</span></label>
                      <textarea
                        rows="2"
                        value={formData.address_line1}
                        onChange={(e) =>
                          handleInputChange("address_line1", e.target.value)
                        }
                        required
                        placeholder="House No, Street Name"
                      />
                    </div>

                    <div className="input-group-premium form-group-full">
                      <label>Address Line 2</label>
                      <textarea
                        rows="2"
                        value={formData.address_line2}
                        onChange={(e) =>
                          handleInputChange("address_line2", e.target.value)
                        }
                        required
                        placeholder="Landmark, Area"
                      />
                    </div>

                    <TextInput
                      label="City / Village *"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                      placeholder="Enter City"
                    />

                    <TextInput
                      label="State *"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      required
                      placeholder="Enter State"
                    />

                    <TextInput
                      label="Pincode *"
                      value={formData.pincode}
                      onChange={(e) =>
                        handleInputChange("pincode", e.target.value.replace(/\D/g, ""))
                      }
                      required
                      placeholder="Enter 6-digit Pincode"
                      maxLength={6}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 4: ACADEMIC DETAILS */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 className="form-section-title">Academic Details</h3>

                  {/* 10th Standard */}
                  <div className="academic-block-premium">
                    <h4 className="sub-section-header">10th Standard (SSLC)</h4>
                    <div className="form-grid-premium">
                      <TextInput
                        label="School Name *"
                        value={formData.tenth_school_name}
                        onChange={(e) =>
                          handleInputChange("tenth_school_name", e.target.value)
                        }
                        required
                        placeholder="Enter School Name"
                      />

                      <CustomSelect
                        label="Board *"
                        required
                        value={formData.tenth_board}
                        options={BOARD_OPTIONS}
                        onChange={(val) => handleInputChange("tenth_board", val)}
                      />

                      <YearPicker
                        label="Year of Passing"
                        value={formData.tenth_year_of_passing}
                        onChange={(year) =>
                          handleInputChange("tenth_year_of_passing", year)
                        }
                        required
                      />

                      <CustomSelect
                        label="Result Status *"
                        required
                        value={formData.tenth_result_status}
                        options={RESULT_OPTIONS}
                        onChange={(val) =>
                          handleInputChange("tenth_result_status", val)
                        }
                      />

                      {formData.tenth_result_status === "declared" && (
                        <TextInput
                          label="Marks Percentage (%) *"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.tenth_marks_percentage}
                          onChange={(e) =>
                            handleInputChange("tenth_marks_percentage", e.target.value)
                          }
                          required
                          placeholder="Enter Percentage"
                        />
                      )}
                    </div>
                  </div>

                  {/* After 10th Qualification Type Selection */}
                  {showPostTenthQualification && (
                    <div className="academic-block-premium mt-30">
                      <h4 className="sub-section-header">
                        After 10th Qualification
                      </h4>
                      <div className="form-grid-premium">
                        <CustomSelect
                          label="Select your qualification *"
                          required
                          value={formData.qualification_type}
                          options={QUALIFICATION_TYPE_OPTIONS}
                          onChange={(val) => handleInputChange("qualification_type", val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Show based on qualification type */}
                  {showPostTenthQualification && formData.qualification_type === "hsc" ? (
                    /* 12th/HSC Details */
                    <div className="academic-block-premium mt-30">
                      <h4 className="sub-section-header">12th Standard (HSC)</h4>
                      <div className="form-grid-premium">
                        <TextInput
                          label="School/College Name *"
                          value={formData.twelfth_school_name}
                          onChange={(e) =>
                            handleInputChange("twelfth_school_name", e.target.value)
                          }
                          required
                          placeholder="Enter School/College Name"
                        />

                        <CustomSelect
                          label="Board *"
                          required
                          value={formData.twelfth_board}
                          options={BOARD_OPTIONS}
                          onChange={(val) => handleInputChange("twelfth_board", val)}
                        />

                        <YearPicker
                          label="Year of Passing *"
                          value={formData.twelfth_year_of_passing}
                          onChange={(year) =>
                            handleInputChange("twelfth_year_of_passing", year)
                          }
                          required
                        />

                        <CustomSelect
                          label="Result Status *"
                          required
                          value={formData.twelfth_result_status}
                          options={RESULT_OPTIONS}
                          onChange={(val) =>
                            handleInputChange("twelfth_result_status", val)
                          }
                        />

                        {formData.twelfth_result_status === "declared" && (
                          <TextInput
                            label="Marks Percentage (%) *"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.twelfth_marks_percentage}
                            onChange={(e) =>
                              handleInputChange("twelfth_marks_percentage", e.target.value)
                            }
                            required
                            placeholder="Enter Percentage"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Diploma Details */
                    <div className="academic-block-premium mt-30">
                      <h4 className="sub-section-header">Diploma Details</h4>
                      <div className="form-grid-premium">
                        <TextInput
                          label="College Name *"
                          value={formData.diploma_college_name}
                          onChange={(e) =>
                            handleInputChange("diploma_college_name", e.target.value)
                          }
                          required
                          placeholder="Enter College Name"
                        />

                        <TextInput
                          label="Board / University *"
                          value={formData.diploma_board_university}
                          onChange={(e) =>
                            handleInputChange("diploma_board_university", e.target.value)
                          }
                          required
                          placeholder="Enter Board/University"
                        />

                        <YearPicker
                          label="Year of Passing *"
                          value={formData.diploma_year_of_passing}
                          onChange={(year) =>
                            handleInputChange("diploma_year_of_passing", year)
                          }
                          required
                        />

                        <CustomSelect
                          label="Result Status *"
                          required
                          value={formData.diploma_result_status}
                          options={RESULT_OPTIONS}
                          onChange={(val) =>
                            handleInputChange("diploma_result_status", val)
                          }
                        />

                        {formData.diploma_result_status === "declared" && (
                          <TextInput
                            label="Marks Percentage (%) *"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.diploma_marks_percentage}
                            onChange={(e) =>
                              handleInputChange("diploma_marks_percentage", e.target.value)
                            }
                            required
                            placeholder="Enter Percentage"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* UG Toggle */}
                  <div className="academic-toggle-premium mt-30">
                    <label className="checkbox-wrap-premium">
                      <input
                        type="checkbox"
                        checked={formData.has_ug}
                        onChange={(e) =>
                          handleInputChange("has_ug", e.target.checked)
                        }
                      />
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
                          <TextInput
                            label="College Name"
                            value={formData.ug_college_name}
                            onChange={(e) =>
                              handleInputChange("ug_college_name", e.target.value)
                            }
                            required
                            placeholder="Enter College Name"
                          />

                          <TextInput
                            label="Board / University"
                            value={formData.ug_board_university}
                            onChange={(e) =>
                              handleInputChange("ug_board_university", e.target.value)
                            }
                            required
                            placeholder="Enter Board/University"
                          />

                          <YearPicker
                            label="Year of Passing"
                            value={formData.ug_year_of_passing}
                            onChange={(year) =>
                              handleInputChange("ug_year_of_passing", year)
                            }
                            required
                          />

                          <CustomSelect
                            label="Result Status"
                            required
                            value={formData.ug_result_status}
                            options={RESULT_OPTIONS}
                            onChange={(val) =>
                              handleInputChange("ug_result_status", val)
                            }
                          />

                          {formData.ug_result_status === "declared" && (
                            <TextInput
                              label="Marks Percentage (%)"
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={formData.ug_marks_percentage}
                              onChange={(e) =>
                                handleInputChange("ug_marks_percentage", e.target.value)
                              }
                              required
                              placeholder="Enter Percentage"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* STEP 5: DOCUMENTS */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 className="form-section-title">Document Uploads</h3>
                  <p className="upload-instruction">
                    Upload clear scanned copies of original documents (Max 2MB each). Accepted formats: JPG, PNG, PDF.
                  </p>

                  <div className="upload-grid-premium">
                    {[
                      { id: "photo", label: "Student Photo", required: true },
                      { id: "aadhar_card", label: "Aadhar Card", required: true },
                      { id: "tenth_marksheet", label: "10th Marksheet", required: true },
                      ...(showPostTenthQualification
                        ? [
                            {
                              id: "twelfth_marksheet",
                              label:
                                formData.qualification_type === "hsc"
                                  ? "12th Marksheet"
                                  : "Diploma Marksheet",
                              required: true,
                            },
                          ]
                        : []),
                      { id: "community_marksheet", label: "Community Certificate", required: true },
                      { id: "ug_marksheet", label: "UG Marksheet", required: false }
                    ].map(doc => (
                      <div key={doc.id} className="upload-card-premium">
                        <label>{doc.label} {doc.required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                        <div className="upload-zone-premium-mini">
                          <div className="upload-placeholder-mini">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <span>Upload File</span>
                          </div>
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, doc.id)}
                            accept=".jpg,.jpeg,.png,.pdf"
                            required={doc.required && !filePreviews[doc.id]}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          />
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
                                {filePreviews[doc.id].startsWith("blob:") ? (
                                  <img src={filePreviews[doc.id]} alt="Preview" />
                                ) : (
                                  <div className="pdf-placeholder-mini">📄 PDF</div>
                                )}
                                <button
                                  type="button"
                                  className="btn-remove-preview"
                                  onClick={() => removeFile(doc.id)}
                                >
                                  ✕
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="declaration-premium mt-40">
                    <label className="checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={formData.declaration_accepted}
                        onChange={(e) =>
                          handleInputChange("declaration_accepted", e.target.checked)
                        }
                        required
                      />
                      <span>I hereby declare that all information provided is true and accurate. I understand that false information may lead to cancellation.</span>
                    </label>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="form-footer-actions">
              <button
                type="button"
                className="btn-form-prev"
                disabled={currentStep === 1}
                onClick={handlePrev}
              >
                Back
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  className="btn-form-next"
                  onClick={(e) => handleNext(e)}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-form-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Final Submission"}
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