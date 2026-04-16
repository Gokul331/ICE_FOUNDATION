import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/collegesuggestion.css';

function CollegeSuggestion() {
  const [colleges, setColleges] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    cutoffMark: '',
    communityCategory: '',
    preferredBranch: '',
    preferredDistrict: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/colleges/')
      .then(response => response.json())
      .then(data => setColleges(data))
      .catch(error => console.error('Error fetching colleges:', error));
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter colleges based on criteria
    const filtered = colleges.filter(college => {
      const cutoffMatch = !formData.cutoffMark || parseFloat(college.cutoff_mark) <= parseFloat(formData.cutoffMark);
      const communityMatch = !formData.communityCategory || college.community_category.toLowerCase().includes(formData.communityCategory.toLowerCase());
      const branchMatch = !formData.preferredBranch || college.branch.toLowerCase().includes(formData.preferredBranch.toLowerCase());
      const districtMatch = !formData.preferredDistrict || college.district.toLowerCase().includes(formData.preferredDistrict.toLowerCase());

      return cutoffMatch && communityMatch && branchMatch && districtMatch;
    });

    setTimeout(() => {
      setSuggestions(filtered);
      setLoading(false);
    }, 1000);
  };

  // Generate logo letters from college name
  const getLogoLetters = (collegeName) => {
    const words = collegeName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="suggestion-page">
      <Navbar user={user} onLogout={handleLogout} />  
      
      <div className="hero">
        <div className="hero-ring ring-1"></div>
        <div className="hero-ring ring-2"></div>
        <div className="page-header">
          <div className="panel-icon">✨</div>
          <h1 className="panel-title">College Suggestion</h1>
          <p className="page-subtitle">
            Enter your cutoff mark and preferences to discover colleges you are eligible for.
          </p>
        </div>
      </div>

      <div className="suggestion-container">
        <section className="suggestion-panel">
          <div className="panel-top">
            <div className="panel-icon">🎓</div>
            <div>
              <h2 className="panel-title">Find the best colleges for you</h2>
              <p className="panel-note">Choose your cutoff, community, branch, and district to generate personalized college suggestions.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Your Cutoff Mark *</label>
                <input
                  type="number"
                  name="cutoffMark"
                  value={formData.cutoffMark}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 180"
                  min="0"
                  max="1000"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Community Category *</label>
                <select
                  name="communityCategory"
                  value={formData.communityCategory}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="OC">OC</option>
                  <option value="BC">BC</option>
                  <option value="MBC">MBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred Branch</label>
                <select
                  name="preferredBranch"
                  value={formData.preferredBranch}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">All</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Civil">Civil</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts & Science">Arts & Science</option>
                  <option value="Management">Management</option>
                  <option value="Medical">Medical</option>
                  <option value="Law">Law</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred District</label>
                <select
                  name="preferredDistrict"
                  value={formData.preferredDistrict}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">All</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Tiruchirappalli">Tiruchirappalli</option>
                  <option value="Salem">Salem</option>
                  <option value="Tirunelveli">Tirunelveli</option>
                  <option value="Tiruppur">Tiruppur</option>
                  <option value="Vellore">Vellore</option>
                  <option value="Erode">Erode</option>
                  <option value="Thoothukudi">Thoothukudi</option>
                  <option value="India">Any (India)</option>
                </select>
              </div>
            </div>

            <div className="cta-row">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Finding Colleges...' : 'Find Colleges'}
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <div className="loading">
            <div>Analyzing your preferences...</div>
          </div>
        )}

        {suggestions.length > 0 && !loading && (
          <div className="suggestions-container">
            <h2 className="suggestions-title">
              Recommended Colleges ({suggestions.length})
            </h2>
            {suggestions.map(college => (
              <div key={college.id} className="suggestion-card">
                <div className="suggestion-header">
                  <div className="suggestion-logo">
                    {getLogoLetters(college.name)}
                  </div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{college.name}</div>
                    <div className="suggestion-meta">{college.district}, {college.branch}</div>
                  </div>
                  <Link to={`/colleges/${college.id}`} className="suggestion-link">
                    View Details →
                  </Link>
                </div>
                <div className="suggestion-desc">{college.description}</div>
                <div className="suggestion-details">
                  <span className="detail-item">Cutoff: {college.cutoff_mark}</span>
                  <span className="detail-item">Category: {college.community_category}</span>
                  <span className="detail-item">Branch: {college.branch}</span>
                  <span className="detail-item">District: {college.district}</span>
                  {college.scholarship_available && (
                    <span className="detail-item scholarship-badge">Scholarship Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !loading && formData.cutoffMark && (
          <div className="no-results">
            <div>No colleges found matching your criteria. Try adjusting your preferences.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeSuggestion;