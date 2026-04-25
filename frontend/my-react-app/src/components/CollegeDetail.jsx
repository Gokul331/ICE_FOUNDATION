import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCollegeDetail,
  getCollegeCourses,
  getCollegeFees,
} from "../services/api";
import Navbar from "./Navbar";
import "../styles/collegedetails.css";

function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState(null); // Changed to single fee object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFeeTab, setActiveFeeTab] = useState({});
  const [expandedFees, setExpandedFees] = useState({});
  const [selectedQuota, setSelectedQuota] = useState("management"); // 'management' or 'government'

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        setLoading(true);

        // Fetch college details
        const collegeData = await getCollegeDetail(id);
        setCollege(collegeData);

        // Fetch courses
        try {
          const coursesData = await getCollegeCourses(id);
          const coursesList = Array.isArray(coursesData)
            ? coursesData
            : coursesData.results || [];
          setCourses(coursesList);
        } catch (coursesErr) {
          console.log("No courses found for this college");
          setCourses([]);
        }

        // Fetch fees structure - Now returns a single fee object per college
        try {
          const feesData = await getCollegeFees(collegeData.college_id);
          // API returns array, but there's only one fee structure per college per academic year
          const feeStructure =
            Array.isArray(feesData) && feesData.length > 0 ? feesData[0] : null;
          setFees(feeStructure);
        } catch (feesErr) {
          console.log("No fees structure found for this college");
          setFees(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching college:", err);
        setError("College not found");
        setLoading(false);
      }
    };
    fetchCollegeData();
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const getLogoLetters = (collegeName) => {
    if (!collegeName) return "CL";
    const words = collegeName.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "N/A";
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Get tuition fee for a specific course with quota support
  const getCourseTuitionFee = (course, quotaType = selectedQuota) => {
    if (!course) return 0;

    if (quotaType === "management") {
      return parseFloat(course.tuition_fee_management) || 0;
    } else {
      return parseFloat(course.tuition_fee_government) || 0;
    }
  };

  // Get formatted tuition fee string
  const getFormattedCourseFee = (course, quotaType = selectedQuota) => {
    const fee = getCourseTuitionFee(course, quotaType);
    if (fee > 0) {
      return formatCurrency(fee);
    }
    return "Contact College";
  };

  // Get both quota fees for a course
  const getCourseFeesByQuota = (course) => {
    if (!course) return { management: 0, government: 0 };
    return {
      management: parseFloat(course.tuition_fee_management) || 0,
      government: parseFloat(course.tuition_fee_government) || 0,
    };
  };

  // Calculate total fee (tuition + admission)
  const getTotalFee = (course) => {
    const tuition = getCourseTuitionFee(course, selectedQuota);
    const admission = fees ? parseFloat(fees.admission_fee) || 0 : 0;
    return tuition + admission;
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading college details...</p>
        </div>
      </>
    );
  }

  if (error || !college) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>{error || "College not found"}</h3>
          <Link to="/colleges" className="back-btn">
            Back to Colleges
          </Link>
        </div>
      </>
    );
  }

  const description =
    college.description || college.address || "No description available.";

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="college-details-page">
        {/* Hero Section */}
        <div className="college-hero">
          <div className="college-hero-content">
            <div className="college-logo-large">
              {college.logo_url ? (
                <img
                  src={college.logo_url}
                  alt={getLogoLetters(college.college_name)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "24px",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = getLogoLetters(
                      college.college_name,
                    );
                  }}
                />
              ) : (
                getLogoLetters(college.college_name)
              )}
            </div>

            <div className="college-title-section">
              <h1>{college.college_name}</h1>
              <div className="college-meta">
                <span className="meta-item">
                  {college.location_city}, {college.location_state}
                </span>
                {college.type && (
                  <span
                    className="meta-item"
                    style={{ textTransform: "capitalize" }}
                  >
                    {college.type.replace("_", " ")}
                  </span>
                )}
                {college.affiliation && (
                  <span className="meta-item">{college.affiliation}</span>
                )}
              </div>
              <div className="college-quick-stats">
                {college.placement_percentage && (
                  <div className="stat">
                    <span className="stat-label">Placement</span>
                    <span className="stat-value">
                      {college.placement_percentage}%
                    </span>
                  </div>
                )}
                {college.median_salary && (
                  <div className="stat">
                    <span className="stat-label">Median Package</span>
                    <span className="stat-value">
                      ₹{parseFloat(college.median_salary).toFixed(1)} LPA
                    </span>
                  </div>
                )}
                {college.nirf_rank && (
                  <div className="stat">
                    <span className="stat-label">NIRF Rank</span>
                    <span className="stat-value">#{college.nirf_rank}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="tab-content">
          <Link
            to="/colleges"
            className="back-btn"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              marginBottom: "24px",
              gap: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Colleges
          </Link>

          {/* Quota Selector */}
          <div className="quota-selector-container">
            <div className="quota-selector">
              <span className="quota-label">Select Admission Type:</span>
              <button
                className={`quota-btn ${selectedQuota === "management" ? "active" : ""}`}
                onClick={() => setSelectedQuota("management")}
              >
                Management Quota
              </button>
              <button
                className={`quota-btn ${selectedQuota === "government" ? "active" : ""}`}
                onClick={() => setSelectedQuota("government")}
              >
                Government Quota
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              Courses & Fees ({courses.length})
            </button>
            <button
              className={`tab-button ${activeTab === "admissions" ? "active" : ""}`}
              onClick={() => setActiveTab("admissions")}
            >
              Admissions
            </button>
            <button
              className={`tab-button ${activeTab === "placements" ? "active" : ""}`}
              onClick={() => setActiveTab("placements")}
            >
              Placements
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-grid">
              {/* Left Column */}
              <div className="overview-left">
                {/* About Card */}
                <div className="info-card">
                  <h3>About {college.college_name}</h3>

                  <div className="badges-container">
                    {college.type && (
                      <span
                        className="badge badge-dark"
                        style={{ textTransform: "capitalize" }}
                      >
                        {college.type.replace("_", " ")}
                      </span>
                    )}
                    {college.affiliation && (
                      <span
                        className="badge badge-outline"
                        style={{ textTransform: "capitalize" }}
                      >
                        {college.affiliation.replace("_", " ")}
                      </span>
                    )}
                    {college.hostel_available && (
                      <span className="badge badge-outline">
                        Hostel Available
                      </span>
                    )}
                  </div>

                  <div className="stats-info-grid">
                    {college.naac_grade && (
                      <div className="stat-info-card">
                        <div className="stat-info-label">NAAC Grade</div>
                        <div className="stat-info-value">
                          {college.naac_grade}
                        </div>
                      </div>
                    )}
                    {college.nirf_rank && (
                      <div className="stat-info-card">
                        <div className="stat-info-label">NIRF Ranking</div>
                        <div className="stat-info-value">
                          #{college.nirf_rank}
                        </div>
                      </div>
                    )}
                    {college.established_year && (
                      <div className="stat-info-card">
                        <div className="stat-info-label">Established</div>
                        <div className="stat-info-value">
                          {college.established_year}
                        </div>
                      </div>
                    )}
                    {college.counselling_code && (
                      <div className="stat-info-card">
                        <div className="stat-info-label">Counselling Code</div>
                        <div className="stat-info-value">
                          {college.counselling_code}
                        </div>
                      </div>
                    )}
                  </div>

                  <h4>About the College</h4>
                  <p className="college-description">{description}</p>

                  {college.address && college.address !== description && (
                    <div className="address-section">
                      <div className="address-label">Address</div>
                      <div className="address-value">{college.address}</div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(college.contact_phone ||
                    college.email_domain ||
                    college.website_url) && (
                    <div className="contact-section">
                      <h4>Contact Information</h4>
                      <div className="contact-list">
                        {college.contact_phone && (
                          <div className="contact-item">
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                            </svg>
                            <span>{college.contact_phone}</span>
                          </div>
                        )}
                        {college.email_domain && (
                          <div className="contact-item">
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>{college.email_domain}</span>
                          </div>
                        )}
                        {college.website_url && (
                          <div className="contact-item">
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                            </svg>
                            <a
                              href={college.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contact-link"
                            >
                              {college.website_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Action Panel */}
              <div className="overview-right">
                <div className="info-card-action">
                  <h3>Ready to Apply?</h3>

                  {college.median_salary && (
                    <div className="action-item">
                      <div className="action-label">Median Package</div>
                      <div className="action-stat-value">
                        ₹{parseFloat(college.median_salary).toFixed(1)} LPA
                      </div>
                    </div>
                  )}

                  {college.placement_percentage && (
                    <div className="action-item">
                      <div className="action-label">Placement Rate</div>
                      <div className="action-stat-value">
                        {college.placement_percentage}%
                      </div>
                    </div>
                  )}

                  <button className="action-btn">Start Application</button>

                  <div className="action-footer">
                    <Link to="/contact" className="action-link">
                      Need help? Contact us →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses & Fees Tab - Updated for new model */}
          {activeTab === "courses" && (
            <div>
              {courses && courses.length > 0 ? (
                <>
                  <div className="info-card">
                    <div className="quota-badge-container">
                      <span className="quota-badge">
                        Showing fees for:{" "}
                        <strong>
                          {selectedQuota === "management"
                            ? "Management Quota"
                            : "Government Quota"}
                        </strong>
                      </span>
                    </div>
                    <h3>Courses & Fee Structure</h3>
                    <div className="courses-table-container">
                      <table className="courses-table">
                        <thead>
                          <tr>
                            <th>Course Name</th>
                            <th>Degree</th>
                            <th>Duration</th>
                            <th>
                              Tuition Fee (
                              {selectedQuota === "management"
                                ? "Management"
                                : "Government"}
                              )
                            </th>
                            <th>Admission Fee</th>
                            <th>Total Fee</th>
                            <th>Cutoff Marks</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course, index) => {
                            const tuitionFee = getCourseTuitionFee(
                              course,
                              selectedQuota,
                            );
                            const admissionFee = fees
                              ? parseFloat(fees.admission_fee) || 0
                              : 0;
                            const totalFee = tuitionFee + admissionFee;
                            const feesByQuota = getCourseFeesByQuota(course);

                            return (
                              <tr key={course.course_id || index}>
                                <td className="course-name">
                                  <strong>
                                    {course.course_name || course.name}
                                  </strong>
                                </td>
                                <td>
                                  {course.degree_name ||
                                    course.degree_type ||
                                    "N/A"}
                                </td>
                                <td>{course.duration_years || "N/A"} years</td>
                                <td>
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      color: "#333",
                                    }}
                                  >
                                    {tuitionFee > 0
                                      ? formatCurrency(tuitionFee)
                                      : "Contact College"}
                                    {tuitionFee > 0 && (
                                      <small
                                        style={{
                                          fontSize: "11px",
                                          color: "#666",
                                        }}
                                      >
                                        /year
                                      </small>
                                    )}
                                  </div>

                                  {/* Show both fees for comparison */}
                                  {feesByQuota.management !==
                                    feesByQuota.government &&
                                    feesByQuota.government > 0 && (
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#999",
                                          marginTop: "4px",
                                        }}
                                      >
                                        {selectedQuota === "management" ? (
                                          <>
                                            Govt:{" "}
                                            {formatCurrency(
                                              feesByQuota.government,
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            Management:{" "}
                                            {formatCurrency(
                                              feesByQuota.management,
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                </td>
                                <td>
                                  {admissionFee > 0
                                    ? formatCurrency(admissionFee)
                                    : "N/A"}
                                </td>
                                <td>
                                  <div
                                    style={{
                                      fontWeight: "bold",
                                      color: "#2c7da0",
                                    }}
                                  >
                                    {totalFee > 0
                                      ? formatCurrency(totalFee)
                                      : "N/A"}
                                  </div>
                                  <small style={{ fontSize: "10px" }}>
                                    per year
                                  </small>
                                </td>
                                <td>
                                  <span className="cutoff-marks">
                                    {course.cutoff_oc || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="apply-now-btn"
                                    onClick={() =>
                                      alert(
                                        `Applied to ${course.course_name} via ${selectedQuota === "management" ? "Management" : "Government"} Quota`,
                                      )
                                    }
                                  >
                                    Apply
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Common Fee Breakdown - College-wide Fees */}
                  {fees && (
                    <div className="fee-breakdown-container">
                      <h3 className="fee-breakdown-title">
                        College Fee Structure (Common for All Courses)
                      </h3>

                      <div className="fee-accordion-item">
                        {/* Accordion Header */}
                        <div
                          className="fee-accordion-header"
                          onClick={() =>
                            setExpandedFees({
                              ...expandedFees,
                              common: !expandedFees.common,
                            })
                          }
                        >
                          <div className="fee-accordion-title">
                            <div className="fee-course-name">
                              Common Fees
                              {fees.academic_year && (
                                <span className="fee-badge">
                                  {fees.academic_year}
                                </span>
                              )}
                            </div>
                            <div className="fee-accordion-icon">
                              {expandedFees.common ? "−" : "+"}
                            </div>
                          </div>

                          {/* Quick Stats Summary when collapsed */}
                          {!expandedFees.common && (
                            <div className="fee-quick-stats">
                              {fees.admission_fee > 0 && (
                                <div className="quick-stat">
                                  <span className="quick-stat-label">
                                    Admission
                                  </span>
                                  <span className="quick-stat-value">
                                    {formatCurrency(
                                      parseFloat(fees.admission_fee),
                                    )}
                                  </span>
                                </div>
                              )}
                              {fees.hostel_options &&
                                fees.hostel_options.length > 0 && (
                                  <div className="quick-stat">
                                    <span className="quick-stat-label">
                                      Hostel
                                    </span>
                                    <span className="quick-stat-value">
                                      From ₹
                                      {Math.min(
                                        ...fees.hostel_options.map(
                                          (o) => o.hostel_fee,
                                        ),
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              {(fees.transport_fee_min > 0 ||
                                fees.transport_fee_max > 0) && (
                                <div className="quick-stat">
                                  <span className="quick-stat-label">
                                    Transport
                                  </span>
                                  <span className="quick-stat-value">
                                    {formatCurrency(
                                      parseFloat(fees.transport_fee_min),
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="quick-stat">
                                <span className="quick-stat-label">Total with Transport (Min)</span>
                                <span className="quick-stat-value">
                                  {formatCurrency(
                                    parseFloat(3500) +
                                      (parseFloat(3500) || 0) +
                                      (parseFloat(fees.transport_fee_min) || 0),
                                  )}
                                </span>
                              </div>
                              <div className="quick-stat">
                                <span className="quick-stat-label">Total with Hostel (Min)</span>
                                <span className="quick-stat-value">
                                  {formatCurrency(
                                    parseFloat(3500) +
                                      (parseFloat(3500) || 0) +
                                      Math.min(
                                        ...fees.hostel_options.map(
                                          (opt) => opt.hostel_fee,
                                        ),
                                      ),
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Accordion Content (Expanded) */}
                        {expandedFees.common && (
                          <div className="fee-accordion-content">
                            {/* Menu Tabs */}
                            <div className="fee-tabs-container">
                              <button
                                className={`fee-tab-btn ${activeFeeTab.common === "admission" ? "active" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFeeTab({
                                    ...activeFeeTab,
                                    common: "admission",
                                  });
                                }}
                              >
                                <span className="fee-tab-icon">📝</span>
                                Admission & One-time
                              </button>

                              {fees.hostel_options &&
                                fees.hostel_options.length > 0 && (
                                  <button
                                    className={`fee-tab-btn ${activeFeeTab.common === "hostel" ? "active" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFeeTab({
                                        ...activeFeeTab,
                                        common: "hostel",
                                      });
                                    }}
                                  >
                                    <span className="fee-tab-icon">🏠</span>
                                    Hostel
                                  </button>
                                )}

                              <button
                                className={`fee-tab-btn ${activeFeeTab.common === "transport" ? "active" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFeeTab({
                                    ...activeFeeTab,
                                    common: "transport",
                                  });
                                }}
                              >
                                <span className="fee-tab-icon">📚</span>
                                Transport
                              </button>
                              <button
                                className={`fee-tab-btn ${activeFeeTab.common === "other" ? "active" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFeeTab({
                                    ...activeFeeTab,
                                    common: "other",
                                  });
                                }}
                              >
                                <span className="fee-tab-icon">🔍</span>
                                Other Fees
                              </button>
                              <button
                                className={`fee-tab-btn ${activeFeeTab.common === "summary" ? "active" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFeeTab({
                                    ...activeFeeTab,
                                    common: "summary",
                                  });
                                }}
                              >
                                <span className="fee-tab-icon">📊</span>
                                Summary
                              </button>
                            </div>

                            <div className="fee-card-body">
                              {/* Admission & One-time Tab */}
                              {(activeFeeTab.common === "admission" ||
                                !activeFeeTab.common) && (
                                <div className="fee-tab-content">
                                  <div className="fee-grid">
                                    {fees.admission_fee > 0 && (
                                      <div className="fee-item">
                                        <div className="fee-item-label">
                                          ADMISSION FEE
                                        </div>
                                        <div className="fee-item-value">
                                          {formatCurrency(
                                            parseFloat(fees.admission_fee),
                                          )}
                                        </div>
                                        <div className="fee-item-desc">
                                          One-time payment at admission
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Hostel Options Tab */}
                              {activeFeeTab.common === "hostel" &&
                                fees.hostel_options &&
                                fees.hostel_options.length > 0 && (
                                  <div className="fee-tab-content">
                                    <div className="hostel-options-grid">
                                      {fees.hostel_options.map(
                                        (option, idx) => (
                                          <div
                                            key={idx}
                                            className="hostel-option-card"
                                          >
                                            <div className="hostel-room-type">
                                              {option.room_type_display}
                                              <span className="hostel-room-badge">
                                                Type {option.room_type}
                                              </span>
                                            </div>
                                            <div className="hostel-fee-amount">
                                              ₹
                                              {option.hostel_fee.toLocaleString()}
                                              <small>/year</small>
                                            </div>
                                            {option.available_seats && (
                                              <div className="hostel-seats">
                                                🪑 {option.available_seats}{" "}
                                                seats available
                                              </div>
                                            )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                    <div className="fee-note-info">
                                      <small>
                                        💡 Hostel fees are separate and vary by
                                        room type
                                      </small>
                                    </div>
                                  </div>
                                )}

                              {/* Transport Fees Tab */}
                              {activeFeeTab.common === "transport" && (
                                <div className="fee-tab-content">
                                  {(fees.transport_fee_min > 0 ||
                                    fees.transport_fee_max > 0) && (
                                    <div className="transport-details">
                                      <div className="transport-info-card">
                                        <div className="transport-range-display">
                                          <div className="transport-min-card">
                                            <div className="transport-label">
                                              Minimum Transport Fee
                                            </div>
                                            <div className="transport-amount">
                                              {fees.transport_fee_min > 0
                                                ? formatCurrency(
                                                    parseFloat(
                                                      fees.transport_fee_min,
                                                    ),
                                                  )
                                                : "Not specified"}
                                              <small>/year</small>
                                            </div>
                                          </div>
                                          <div className="transport-arrow">
                                            →
                                          </div>
                                          <div className="transport-max-card">
                                            <div className="transport-label">
                                              Maximum Transport Fee
                                            </div>
                                            <div className="transport-amount">
                                              {fees.transport_fee_max > 0
                                                ? formatCurrency(
                                                    parseFloat(
                                                      fees.transport_fee_max,
                                                    ),
                                                  )
                                                : "Not specified"}
                                              <small>/year</small>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="transport-note">
                                          🚍 Transport fee varies based on
                                          distance and route
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {!fees.transport_fee_min &&
                                    !fees.transport_fee_max && (
                                      <div className="fee-note-info">
                                        <small>
                                          ℹ️ No transport facility available
                                        </small>
                                      </div>
                                    )}
                                </div>
                              )}

                              {/* Other Fees Tab */}
                              {activeFeeTab.common === "other" && (
                                <div className="fee-tab-content">
                                  <div className="other-fees-grid">
                                    <div className="other-fee-item">
                                      <div className="other-fee-label">
                                        Book Fee
                                      </div>
                                      <div className="other-fee-value">
                                        ₹3500/semester
                                      </div>
                                    </div>

                                    <div className="other-fee-item">
                                      <div className="other-fee-label">
                                        Exam Fee
                                      </div>
                                      <div className="other-fee-value">
                                        ₹3500/semester
                                      </div>
                                    </div>

                                    {/* Add more fee types here if available */}
                                  </div>
                                  {!(
                                    fees.book_fee > 0 || fees.exam_fee > 0
                                  ) && (
                                    <div className="fee-note-info">
                                      <small>
                                        ℹ️ No additional fees specified
                                      </small>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Summary Tab */}
                              {activeFeeTab.common === "summary" && (
                                <div className="fee-tab-content">
                                  <div className="summary-grid">
                                    {fees.admission_fee > 0 && (
                                      <div className="summary-item">
                                        <div className="summary-label">
                                          Admission Fee
                                        </div>
                                        <div className="summary-amount">
                                          {formatCurrency(
                                            parseFloat(fees.admission_fee),
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="summary-item">
                                      <div className="summary-label">
                                        Book Fee
                                      </div>
                                      <div className="summary-amount">
                                        ₹3500/semester
                                      </div>
                                    </div>

                                    <div className="summary-item">
                                      <div className="summary-label">
                                        Exam Fee
                                      </div>
                                      <div className="summary-amount">
                                        ₹3500/semester
                                      </div>
                                    </div>

                                    {fees.hostel_options &&
                                      fees.hostel_options.length > 0 && (
                                        <div className="summary-item">
                                          <div className="summary-label">
                                            Hostel Fee Range
                                          </div>
                                          <div className="summary-amount">
                                            {(() => {
                                              const hostelFees =
                                                fees.hostel_options.map(
                                                  (opt) => opt.hostel_fee,
                                                );
                                              const minHostel = Math.min(
                                                ...hostelFees,
                                              );
                                              const maxHostel = Math.max(
                                                ...hostelFees,
                                              );
                                              return `₹${minHostel.toLocaleString()} - ₹${maxHostel.toLocaleString()}`;
                                            })()}
                                            <small>/year</small>
                                          </div>
                                        </div>
                                      )}

                                    {(fees.transport_fee_min > 0 ||
                                      fees.transport_fee_max > 0) && (
                                      <div className="summary-item">
                                        <div className="summary-label">
                                          Transport Fee Range
                                        </div>
                                        <div className="summary-amount">
                                          {formatCurrency(
                                            parseFloat(fees.transport_fee_min),
                                          )}
                                          {fees.transport_fee_max >
                                            fees.transport_fee_min &&
                                            ` - ${formatCurrency(parseFloat(fees.transport_fee_max))}`}
                                          <small>/year</small>
                                        </div>
                                      </div>
                                    )}

                                    <div className="summary-item total-summary">
                                      <div className="summary-label">
                                        Total with Transport (Min)
                                      </div>
                                      <div className="summary-amount total-amount">
                                        {formatCurrency(
                                          (parseFloat(3500) || 0) +
                                            (parseFloat(3500) || 0) +
                                            (parseFloat(
                                              fees.transport_fee_min,
                                            ) || 0),
                                        )}
                                        <small>/year</small>
                                      </div>
                                    </div>

                                    {fees.hostel_options &&
                                      fees.hostel_options.length > 0 && (
                                        <div className="summary-item total-summary">
                                          <div className="summary-label">
                                            Total with Hostel (Min)
                                          </div>
                                          <div className="summary-amount total-amount">
                                            {formatCurrency(
                                              (parseFloat(3500) || 0) +
                                                (parseFloat(3500) || 0) +
                                                +Math.min(
                                                  ...fees.hostel_options.map(
                                                    (opt) => opt.hostel_fee,
                                                  ),
                                                ),
                                            )}
                                            <small>/year</small>
                                          </div>
                                        </div>
                                      )}
                                  </div>

                                  <div className="summary-disclaimer">
                                    <small>
                                      ⚠️ Tuition fees vary by course and are
                                      shown in the Courses table above
                                    </small>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="info-card">
                  <h3>Courses & Fee Structure</h3>
                  <p>No course information available for this college.</p>
                </div>
              )}
            </div>
          )}

          {/* Admissions Tab */}
          {activeTab === "admissions" && (
            <div className="info-card">
              <h3>Admission Information</h3>

              <div style={{ marginBottom: "24px" }}>
                <h4>Admission Process</h4>
                <ol style={{ lineHeight: "1.8", paddingLeft: "20px" }}>
                  <li>Fill out the online application form</li>
                  <li>Submit required documents</li>
                  <li>Appear for entrance exam (if applicable)</li>
                  <li>Counseling and seat allocation</li>
                  <li>Fee payment and admission confirmation</li>
                </ol>
              </div>

              <div>
                <h4>Required Documents</h4>
                <ul style={{ lineHeight: "1.8", paddingLeft: "20px" }}>
                  <li>10th and 12th mark sheets</li>
                  <li>Transfer certificate</li>
                  <li>Community certificate</li>
                  <li>Income certificate (if applying for scholarship)</li>
                  <li>First Graduate certificate (if applicable)</li>
                  <li>Passport size photographs</li>
                </ul>
              </div>
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === "placements" && (
            <div>
              <div className="info-card">
                <h3>Placement Statistics</h3>

                <div className="stats-grid" style={{ marginBottom: "32px" }}>
                  {college.placement_percentage && (
                    <div className="stat-card">
                      <div className="stat-value">
                        {college.placement_percentage}%
                      </div>
                      <div className="stat-label">Placement Rate</div>
                    </div>
                  )}
                  {college.highest_salary && (
                    <div className="stat-card">
                      <div className="stat-value">
                        ₹{parseFloat(college.highest_salary).toFixed(1)} LPA
                      </div>
                      <div className="stat-label">Highest Package</div>
                    </div>
                  )}
                  {college.avg_salary && (
                    <div className="stat-card">
                      <div className="stat-value">
                        ₹{parseFloat(college.avg_salary).toFixed(1)} LPA
                      </div>
                      <div className="stat-label">Average Package</div>
                    </div>
                  )}
                  {college.median_salary && (
                    <div className="stat-card">
                      <div className="stat-value">
                        ₹{parseFloat(college.median_salary).toFixed(1)} LPA
                      </div>
                      <div className="stat-label">Median Package</div>
                    </div>
                  )}
                </div>

                <div>
                  <h4>Placement Process</h4>
                  <p>
                    The college has a dedicated placement cell that organizes
                    campus recruitment drives.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CollegeDetail;
