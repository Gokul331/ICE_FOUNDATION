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

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <h1>My Applications</h1>
        <p>View and download your submitted applications</p>
      </div>

      {/* Stats */}
      <div className="myapps-stats">
        <div className="stat-card">
          <span className="stat-number">{applications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{applications.filter(a => a.status === 'submitted').length}</span>
          <span className="stat-label">Submitted</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{applications.filter(a => a.status === 'approved').length}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{applications.filter(a => a.status === 'pending' || a.status === 'under_review').length}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="myapps-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by ID, college, or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="myapps-empty">
          <p>No applications found</p>
          <button className="btn-browse" onClick={() => navigate("/colleges")}>
            Browse Colleges
          </button>
        </div>
      ) : (
        <div className="myapps-list">
          {filteredApplications.map((app) => (
            <div key={app.application_id} className="myapps-card">
              <div className="card-header">
                <div>
                  <span className="app-id">{app.application_id}</span>
                  <span className={`status ${app.status}`}>
                    {app.status?.replace("_", " ")}
                  </span>
                </div>
              </div>
              
              <div className="card-body">
                <h3>{app.college_name || "N/A"}</h3>
                <div className="details">
                  <p><strong>Name:</strong> {app.first_name} {app.last_name}</p>
                  <p><strong>Quota:</strong> {app.quota_type}</p>
                  <p><strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="btn-download"
                  onClick={() => handleDownloadPDF(app.application_id)}
                  disabled={downloading === app.application_id}
                >
                  {downloading === app.application_id ? "Downloading..." : "📥 Download PDF"}
                </button>
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/applications/${app.application_id}`)}
                >
                  👁️ View Details
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