import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplications, downloadApplicationPDF } from "../services/api";
import "../styles/myapplication.css";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (applicationId) => {
    setDownloading(applicationId);
    try {
      const pdfBlob = await downloadApplicationPDF(applicationId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application_${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'under_review': return 'Under Review';
      default: return status?.replace('_', ' ');
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.college_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="myapps-loading">
        <div className="myapps-spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="myapps-container">
      {/* Header */}
      <div className="myapps-header">
        <div className="header-content">
          <h1>My Applications</h1>
          <p>Track and manage your college applications</p>
        </div>
        <button className="btn-browse-header" onClick={() => navigate("/colleges")}>
          Browse More Colleges →
        </button>
      </div>

      {/* Stats Cards */}
      <div className="myapps-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-number">{applications.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">{applications.filter(a => a.status === 'submitted').length}</span>
            <span className="stat-label">Submitted</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-number">{applications.filter(a => a.status === 'approved').length}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-number">{applications.filter(a => a.status === 'pending' || a.status === 'under_review').length}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="myapps-filters">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Application ID, College, or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">📋 All Status</option>
          <option value="submitted">📤 Submitted</option>
          <option value="approved">✓ Approved</option>
          <option value="rejected">✗ Rejected</option>
          <option value="pending">⏳ Pending</option>
          <option value="under_review">👀 Under Review</option>
        </select>
      </div>

      {/* Results Count */}
      {filteredApplications.length > 0 && (
        <div className="results-count">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="myapps-empty">
          <div className="empty-icon">📭</div>
          <p>No applications found</p>
          <p className="empty-subtitle">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "You haven't submitted any applications yet"}
          </p>
          <button className="btn-browse" onClick={() => navigate("/colleges")}>
            Browse Colleges
          </button>
        </div>
      ) : (
        <div className="myapps-grid">
          {filteredApplications.map((app) => (
            <div key={app.application_id} className="myapps-card">
              <div className="card-header">
                <div className="app-info">
                  <span className="app-id">#{app.application_id}</span>
                  <span className={`status ${app.status}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>
              </div>
              
              <div className="card-body">
                <h3 className="college-name">{app.college_name || "College Name N/A"}</h3>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Student Name</span>
                    <span className="detail-value">{app.first_name} {app.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Quota Type</span>
                    <span className="detail-value capitalize">{app.quota_type || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted Date</span>
                    <span className="detail-value">{new Date(app.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted Time</span>
                    <span className="detail-value">{new Date(app.submitted_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="btn-download"
                  onClick={() => handleDownloadPDF(app.application_id)}
                  disabled={downloading === app.application_id}
                >
                  {downloading === app.application_id ? (
                    <>⏳ Downloading...</>
                  ) : (
                    <>📥 Download PDF</>
                  )}
                </button>
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/applications/${app.application_id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplications;