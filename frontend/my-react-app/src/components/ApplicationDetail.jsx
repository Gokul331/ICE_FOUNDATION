import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationDetail, downloadApplicationPDF } from '../services/api';
import '../styles/applicationdetail.css';

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      const data = await getApplicationDetail(id);
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await downloadApplicationPDF(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="detail-error">
        <p>Application not found</p>
        <button onClick={() => navigate('/my-applications')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-nav">
        <button onClick={() => navigate('/')} className="nav-btn home-btn">
          🏠 Home
        </button>
        <button onClick={() => navigate('/my-applications')} className="nav-btn back-btn">
          ← My Applications
        </button>
      </div>

      <div className="detail-header">
        <h1>Application Details</h1>
        <div className={`status-badge ${application.status}`}>
          {application.status?.replace('_', ' ')}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-section">
          <h3>Application Information</h3>
          <div className="fields-grid">
            <div className="detail-row">
              <span className="label">Application ID:</span>
              <span className="value">{application.application_id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Submitted Date:</span>
              <span className="value">{new Date(application.submitted_at).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">College:</span>
              <span className="value">{application.college_name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Course ID:</span>
              <span className="value">{application.course_id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Quota:</span>
              <span className="value">{application.quota_type}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Personal Information</h3>
          <div className="fields-grid">
            <div className="detail-row">
              <span className="label">Full Name:</span>
              <span className="value">{application.first_name} {application.last_name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Gender:</span>
              <span className="value">{application.gender || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Date of Birth:</span>
              <span className="value">{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Mobile:</span>
              <span className="value">{application.mobile_number}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email:</span>
              <span className="value">{application.email_id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Blood Group:</span>
              <span className="value">{application.blood_group || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Community:</span>
              <span className="value">{application.community || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Aadhar:</span>
              <span className="value">{application.aadhar_number || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Parent Information</h3>
          <div className="fields-grid">
            <div className="detail-row">
              <span className="label">Father's Name:</span>
              <span className="value">{application.father_name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Father's Mobile:</span>
              <span className="value">{application.father_mobile || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Mother's Name:</span>
              <span className="value">{application.mother_name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Mother's Mobile:</span>
              <span className="value">{application.mother_mobile || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Annual Income:</span>
              <span className="value">₹{application.family_annual_income?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Address</h3>
          <div className="detail-row full-width">
            <span className="label">Address:</span>
            <span className="value">
              {application.address_line1}
              {application.address_line2 && `, ${application.address_line2}`}
              {application.city && `, ${application.city}`}
              {application.state && `, ${application.state}`}
              {application.pincode && ` - ${application.pincode}`}
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Education</h3>
          
          <div className="sub-section">
            <strong>10th Standard</strong>
            <div className="fields-grid">
              <div className="detail-row">
                <span className="label">School:</span>
                <span className="value">{application.tenth_school_name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Board:</span>
                <span className="value">{application.tenth_board || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Year:</span>
                <span className="value">{application.tenth_year_of_passing || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Percentage:</span>
                <span className="value">{application.tenth_marks_percentage ? `${application.tenth_marks_percentage}%` : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="sub-section">
            <strong>12th Standard</strong>
            <div className="fields-grid">
              <div className="detail-row">
                <span className="label">School:</span>
                <span className="value">{application.twelfth_school_name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Board:</span>
                <span className="value">{application.twelfth_board || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Year:</span>
                <span className="value">{application.twelfth_year_of_passing || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Percentage:</span>
                <span className="value">{application.twelfth_marks_percentage ? `${application.twelfth_marks_percentage}%` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button 
            className="btn-download"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            📥 {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button 
            className="btn-print"
            onClick={() => window.print()}
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;