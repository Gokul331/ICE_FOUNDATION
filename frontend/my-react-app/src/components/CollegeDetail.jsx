import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCollegeDetail,
  getCollegeCourses,
  getCollegeFees,
  getCourseFees,
} from "../services/api";
import Navbar from "./Navbar";
import "../styles/collegedetails.css";

function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState([]);
  const [courseFees, setCourseFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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

          // Fetch individual course fees for each course
          const feesMap = {};
          for (const course of coursesList) {
            if (course.course_id) {
              try {
                const courseFeeData = await getCourseFees(course.course_id);
                feesMap[course.course_id] = courseFeeData;
              } catch (err) {
                console.log(`No fees found for course ${course.course_id}`);
                feesMap[course.course_id] = null;
              }
            }
          }
          setCourseFees(feesMap);
        } catch (coursesErr) {
          console.log("No courses found for this college");
          setCourses([]);
        }

        // Fetch fees structure
        try {
          const feesData = await getCollegeFees(id);
          setFees(Array.isArray(feesData) ? feesData : feesData.results || []);
        } catch (feesErr) {
          console.log("No fees structure found for this college");
          setFees([]);
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
    if (!amount) return "N/A";
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Get fee for a specific course from the fetched courseFees
  const getCourseFee = (courseId) => {
    const feeData = courseFees[courseId];

    if (feeData) {
      if (feeData.tuition_fee) return formatCurrency(feeData.tuition_fee);
    }
    return "Contact College";
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
                    {college.scholarship_available && (
                      <span className="badge badge-dark">
                        Scholarship Available
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
                  {(college.phone || college.email || college.website) && (
                    <div className="contact-section">
                      <h4>Contact Information</h4>
                      <div className="contact-list">
                        {college.phone && (
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
                            <span>{college.phone}</span>
                          </div>
                        )}
                        {college.email && (
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
                            <span>{college.email}</span>
                          </div>
                        )}
                        {college.website && (
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
                              href={college.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contact-link"
                            >
                              {college.website}
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
                        ₹{parseFloat(college.median_salary)} LPA
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

          {/* Courses & Fees Tab */}
          {activeTab === "courses" && (
            <div>
              {courses && courses.length > 0 ? (
                <>
                  <div className="info-card">
                    <h3>Courses & Fee Structure</h3>
                    <div className="courses-table-container">
                      <table className="courses-table">
                        <thead>
                          <tr>
                            <th>Course Name</th>
                            <th>Degree</th>
                            <th>Duration</th>
                            <th>Course Fee</th>
                            <th>Scholarship Amount</th>
                            <th>Cutoff Marks</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course, index) => (
                            <tr key={course.course_id || index}>
                              <td className="course-name">
                                <strong>
                                  {course.course_name || course.name}
                                </strong>
                              </td>
                              <td>
                                {course.degree_name || course.degree || "N/A"}
                              </td>
                              <td>
                                {course.duration_years ||
                                  course.duration ||
                                  "N/A"}{" "}
                                years
                              </td>
                              <td>
                                {(() => {
                                  const feeData = courseFees[course.course_id];

                                  // Check if feeData exists and is an array with data
                                  if (
                                    feeData &&
                                    Array.isArray(feeData) &&
                                    feeData[0] &&
                                    feeData[0].tuition_fee
                                  ) {
                                    return (
                                      <div
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: "500",
                                          color: "#333",
                                        }}
                                      >
                                        ₹
                                        {parseFloat(
                                          feeData[0].tuition_fee,
                                        ).toLocaleString()}
                                        /year
                                      </div>
                                    );
                                  }
                                  // Also handle if feeData is a direct object (not array)
                                  if (feeData && feeData.tuition_fee) {
                                    return (
                                      <div
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: "500",
                                          color: "#333",
                                        }}
                                      >
                                        ₹
                                        {parseFloat(
                                          feeData.tuition_fee,
                                        ).toLocaleString()}
                                        /year
                                      </div>
                                    );
                                  }
                                  return (
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#999",
                                      }}
                                    >
                                      Contact College
                                    </div>
                                  );
                                })()}
                              </td>
                              <td>
                                <span className="scholarship-amount">
                                  {course.scholarship_amount
                                    ? formatCurrency(
                                        parseFloat(course.scholarship_amount),
                                      )
                                    : "N/A"}
                                </span>
                              </td>
                              <td>
                                <span className="cutoff-marks">
                                  {course.cutoff_oc ||
                                    course.cutoff_marks ||
                                    "N/A"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="apply-now-btn"
                                  onClick={() =>
                                    alert(`Applied to ${course.course_name}`)
                                  }
                                >
                                  Apply
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Fee Breakdown */}
                  {fees && fees.length > 0 && (
                    <div className="fee-breakdown-container">
                      <h3 className="fee-breakdown-title">Fee Breakdown</h3>
                      {fees.map((fee, index) => {
                        const course = courses.find(
                          (c) => c.course_id === fee.course,
                        );
                        return (
                          <div key={index} className="fee-card">
                            <div className="fee-card-header">
                              <div className="fee-course-name">
                                {course?.course_name ||
                                  fee.course_name ||
                                  "Course"}
                                {fee.academic_year && (
                                  <span className="fee-badge">
                                    {fee.academic_year}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="fee-card-body">
                              <div className="fee-grid">
                                {/* Tuition Fee */}
                                {fee.tuition_fee && (
                                  <div className="fee-item">
                                    <div className="fee-item-label">
                                      TUITION FEE
                                    </div>
                                    <div className="fee-item-value">
                                      {formatCurrency(
                                        parseFloat(fee.tuition_fee),
                                      )}
                                      <small>/year</small>
                                    </div>
                                  </div>
                                )}

                                {/* Admission Fee */}
                                {fee.admission_fee && (
                                  <div className="fee-item">
                                    <div className="fee-item-label">
                                      ADMISSION FEE
                                    </div>
                                    <div className="fee-item-value">
                                      {formatCurrency(
                                        parseFloat(fee.admission_fee),
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Hostel Options */}
                                {fee.hostel_options &&
                                  fee.hostel_options.length > 0 && (
                                    <div className="hostel-section">
                                      <div className="hostel-title">
                                        Hostel Accommodation
                                      </div>
                                      <div className="hostel-options-grid">
                                        {fee.hostel_options.map(
                                          (option, idx) => (
                                            <div
                                              key={idx}
                                              className="hostel-option-card"
                                            >
                                              <div className="hostel-room-type">
                                                {option.room_type_display}
                                                <span className="hostel-room-badge">
                                                  Room Type {option.room_type}
                                                </span>
                                              </div>
                                              <div className="hostel-fee-amount">
                                                ₹
                                                {option.hostel_fee.toLocaleString()}
                                                <small>/year</small>
                                              </div>
                                              {option.available_seats && (
                                                <div className="hostel-seats">
                                                  {option.available_seats} seats
                                                  available
                                                </div>
                                              )}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Transport Fee */}
                                {fee.transport_fee_min &&
                                  fee.transport_fee_max && (
                                    <div className="transport-section">
                                      <div className="fee-item-label">
                                        TRANSPORT FEE
                                      </div>
                                      <div className="transport-range">
                                        <span className="transport-min">
                                          {formatCurrency(
                                            parseFloat(fee.transport_fee_min),
                                          )}
                                        </span>
                                        <span className="transport-separator">
                                          —
                                        </span>
                                        <span className="transport-max">
                                          {formatCurrency(
                                            parseFloat(fee.transport_fee_max),
                                          )}
                                        </span>
                                        <small>/year</small>
                                      </div>
                                    </div>
                                  )}

                                {/* Total Fee */}
                                {fee.total_fee && (
                                  <div className="total-fee-section">
                                    <div className="total-fee-label">
                                      TOTAL FEE (Excluding Hostel)
                                    </div>
                                    <div className="total-fee-amount">
                                      {formatCurrency(
                                        parseFloat(fee.total_fee),
                                      )}
                                    </div>
                                    <div className="total-fee-note">
                                      *Excludes hostel & transport charges
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Fee Notes */}
                              {fee.fee_notes && (
                                <div className="fee-notes">
                                  <div className="fee-notes-text">
                                    {fee.fee_notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

                {college.top_recruiters &&
                  college.top_recruiters.length > 0 && (
                    <div style={{ marginBottom: "32px" }}>
                      <h4>Top Recruiters</h4>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginTop: "16px",
                        }}
                      >
                        {college.top_recruiters.map((recruiter, index) => (
                          <span key={index} className="recruiter-badge">
                            {recruiter}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h4>Placement Process</h4>
                  <p>
                    {college.placement_process ||
                      "The college has a dedicated placement cell that organizes campus recruitment drives."}
                  </p>
                </div>
              </div>

              {/* Recent Placements */}
              {college.recent_placements &&
                college.recent_placements.length > 0 && (
                  <div className="info-card" style={{ marginTop: "24px" }}>
                    <h4>Recent Placements</h4>
                    <div className="courses-table-container">
                      <table className="courses-table">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Company</th>
                            <th>Package</th>
                          </tr>
                        </thead>
                        <tbody>
                          {college.recent_placements.map((placement, index) => (
                            <tr key={index}>
                              <td>{placement.student_name}</td>
                              <td>{placement.course}</td>
                              <td>{placement.company}</td>
                              <td>{formatCurrency(placement.package)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CollegeDetail;
