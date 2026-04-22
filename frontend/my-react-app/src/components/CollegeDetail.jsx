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
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredStat, setHoveredStat] = useState(null);

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
          setCourses(
            Array.isArray(coursesData)
              ? coursesData
              : coursesData.results || [],
          );
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

  // Get fee for a specific course
  const getCourseFee = (courseId) => {
    const fee = fees.find((f) => f.course_id === courseId);
    return fee ? formatCurrency(fee.total_fees) : "Contact College";
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
                  alt={college.college_name}
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
                      ₹{(college.median_salary / 100000).toFixed(1)} LPA
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
              className={`tab-button ${activeTab === "facilities" ? "active" : ""}`}
              onClick={() => setActiveTab("facilities")}
            >
              Facilities
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

              {/* Right Column - Action Panel (hidden on mobile/tablet via CSS) */}
              <div className="overview-right">
                <div className="info-card-action">
                  <h3>Ready to Apply?</h3>

                  {college.median_salary && (
                    <div className="action-item">
                      <div className="action-label">Median Package</div>
                      <div className="action-stat-value">
                        ₹{(college.median_salary / 100000).toFixed(1)} LPA
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
                <div className="info-card">
                  <h3>Courses & Fee Structure</h3>
                  <div className="courses-table-container">
                    <table className="courses-table">
                      <thead>
                        <tr>
                          <th>Course Name</th>
                          <th>Degree</th>
                          <th>Duration</th>
                          <th>Intake</th>
                          <th>Total Fees</th>
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
                              {course.specialization && (
                                <div
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  {course.specialization}
                                </div>
                              )}
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
                            <td>{course.intake_seats || "N/A"}</td>
                            <td>
                              {getCourseFee(course.course_id)}
                              {fees.find(
                                (f) => f.course_id === course.course_id,
                              )?.fee_per_year && (
                                <div
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  ₹
                                  {fees
                                    .find(
                                      (f) => f.course_id === course.course_id,
                                    )
                                    .fee_per_year.toLocaleString()}
                                  /year
                                </div>
                              )}
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

                  {/* Detailed Fee Breakdown */}
                  {fees.length > 0 && (
                    <div style={{ marginTop: "32px" }}>
                      <h4>Fee Breakdown</h4>
                      {fees.map((fee, index) => {
                        const course = courses.find(
                          (c) => c.course_id === fee.course_id,
                        );
                        return (
                          <div
                            key={index}
                            style={{
                              marginBottom: "24px",
                              padding: "16px",
                              background: "#fafafa",
                              borderRadius: "12px",
                            }}
                          >
                            <h5 style={{ marginBottom: "12px" }}>
                              {course?.course_name || "Course"} - Fee Structure
                            </h5>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "12px",
                              }}
                            >
                              {fee.tuition_fee && (
                                <div>
                                  <strong>Tuition Fee:</strong>{" "}
                                  {formatCurrency(fee.tuition_fee)}
                                </div>
                              )}
                              {fee.admission_fee && (
                                <div>
                                  <strong>Admission Fee:</strong>{" "}
                                  {formatCurrency(fee.admission_fee)}
                                </div>
                              )}
                              {fee.caution_deposit && (
                                <div>
                                  <strong>Caution Deposit:</strong>{" "}
                                  {formatCurrency(fee.caution_deposit)}
                                </div>
                              )}
                              {fee.library_fee && (
                                <div>
                                  <strong>Library Fee:</strong>{" "}
                                  {formatCurrency(fee.library_fee)}
                                </div>
                              )}
                              {fee.lab_fee && (
                                <div>
                                  <strong>Lab Fee:</strong>{" "}
                                  {formatCurrency(fee.lab_fee)}
                                </div>
                              )}
                              {fee.hostel_fee && (
                                <div>
                                  <strong>Hostel Fee:</strong>{" "}
                                  {formatCurrency(fee.hostel_fee)}
                                </div>
                              )}
                              {fee.mess_fee && (
                                <div>
                                  <strong>Mess Fee:</strong>{" "}
                                  {formatCurrency(fee.mess_fee)}
                                </div>
                              )}
                              {fee.transport_fee && (
                                <div>
                                  <strong>Transport Fee:</strong>{" "}
                                  {formatCurrency(fee.transport_fee)}
                                </div>
                              )}
                              {fee.total_fees && (
                                <div>
                                  <strong>Total Fees:</strong>{" "}
                                  {formatCurrency(fee.total_fees)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="info-card">
                  <p>No courses available for this college.</p>
                </div>
              )}
            </div>
          )}

          {/* Admissions Tab */}
          {activeTab === "admissions" && (
            <div className="info-card">
              <h3>Admission Information</h3>

              <div style={{ marginBottom: "24px" }}>
                <h4>Eligibility Criteria</h4>
                <p>
                  {college.eligibility_criteria ||
                    "Contact college for detailed eligibility criteria."}
                </p>
              </div>

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

              <div style={{ marginBottom: "24px" }}>
                <h4>Important Dates</h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  {college.application_deadline && (
                    <div>
                      <strong>Application Deadline:</strong>{" "}
                      {new Date(
                        college.application_deadline,
                      ).toLocaleDateString()}
                    </div>
                  )}
                  {college.entrance_exam_date && (
                    <div>
                      <strong>Entrance Exam Date:</strong>{" "}
                      {new Date(
                        college.entrance_exam_date,
                      ).toLocaleDateString()}
                    </div>
                  )}
                  {college.counseling_date && (
                    <div>
                      <strong>Counseling Date:</strong>{" "}
                      {new Date(college.counseling_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4>Required Documents</h4>
                <ul style={{ lineHeight: "1.8", paddingLeft: "20px" }}>
                  <li>10th and 12th mark sheets</li>
                  <li>Transfer certificate</li>
                  <li>Community certificate (if applicable)</li>
                  <li>Passport size photographs</li>
                  <li>Entrance exam score card</li>
                </ul>
              </div>
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === "facilities" && (
            <div className="info-card">
              <h3>Campus Facilities</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {college.hostel_available && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Hostel Facility</span>
                  </div>
                )}
                {college.library_available && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                    <span>Library</span>
                  </div>
                )}
                {college.lab_facilities && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 12H4M12 4v16" />
                    </svg>
                    <span>Laboratories</span>
                  </div>
                )}
                {college.sports_facilities && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="2" />
                      <path d="M12 2a15 15 0 000 20 15 15 0 000-20z" />
                    </svg>
                    <span>Sports Facilities</span>
                  </div>
                )}
                {college.cafeteria && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 8c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6z" />
                      <path d="M12 14v8M9 22h6" />
                    </svg>
                    <span>Cafeteria</span>
                  </div>
                )}
                {college.medical_facility && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 12h-4l-3 9-4-18-3 9H2" />
                    </svg>
                    <span>Medical Facility</span>
                  </div>
                )}
                {college.wifi_campus && (
                  <div className="facility-item">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    <span>Wi-Fi Campus</span>
                  </div>
                )}
              </div>

              <div>
                <h4>Infrastructure</h4>
                <p>
                  {college.infrastructure_details ||
                    "Modern infrastructure with state-of-the-art facilities."}
                </p>
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
                        ₹{(college.highest_salary / 100000).toFixed(1)} LPA
                      </div>
                      <div className="stat-label">Highest Package</div>
                    </div>
                  )}
                  {college.avg_salary && (
                    <div className="stat-card">
                      <div className="stat-value">
                        ₹{(college.avg_salary / 100000).toFixed(1)} LPA
                      </div>
                      <div className="stat-label">Average Package</div>
                    </div>
                  )}
                  {college.median_salary && (
                    <div className="stat-card">
                      <div className="stat-value">
                        ₹{(college.median_salary / 100000).toFixed(1)} LPA
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
