import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    }, 1000); // Simulate loading
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#0A1628' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .suggestion-page, .suggestion-page div, .suggestion-page p, .suggestion-page h1, .suggestion-page h2, .suggestion-page h3, .suggestion-page span, .suggestion-page a, .suggestion-page button, .suggestion-page input, .suggestion-page select, .suggestion-page label{font-family:'Inter',sans-serif}
        nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.96);backdrop-filter:blur(16px);border-bottom:1px solid #E6EEF7;padding:0 32px;height:72px;display:flex;align-items:center;justify-content:space-between}
        .logo-area{display:flex;align-items:center;gap:12px}
        .logo-mark{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#5BB8E0,#2A7BC1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;letter-spacing:-0.5px}
        .logo-text{font-size:17px;font-weight:700;color:#0F2448;letter-spacing:-0.4px}
        .logo-text span{color:#5BB8E0}
        .logo-subtext{font-size:11px;color:#7A96B2;margin-top:-4px}
        .nav-links{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .nav-link{padding:8px 16px;font-size:14px;font-weight:500;color:#2B3B53;text-decoration:none;border-radius:10px;transition:all .2s;border:none;background:none;cursor:pointer}
        .nav-link:hover{background:#EAF4FF;color:#1C6DD0}
        .nav-link.active{background:#EAF4FF;color:#1C6DD0;font-weight:700}
        .nav-btn{padding:10px 22px;font-size:14px;font-weight:600;color:#fff;background:#1C6DD0;border:none;border-radius:10px;cursor:pointer;transition:all .2s;letter-spacing:-0.2px}
        .nav-btn:hover{background:#0A3B74;transform:translateY(-1px)}
        .nav-user{display:flex;align-items:center;gap:12px}
        .nav-user-greeting{font-size:14px;font-weight:500;color:#2B3B53}
        .hero{background:#F8FBFF;padding:80px 20px 40px;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;top:14px;left:50%;transform:translateX(-50%);width:72px;height:72px;border-radius:50%;background:rgba(91,184,224,0.12);}
        .hero-ring{position:absolute;border-radius:50%;border:1px solid rgba(91,184,224,0.24);pointer-events:none}
        .hero-ring.ring-1{width:280px;height:280px;top:-120px;right:-100px}
        .hero-ring.ring-2{width:180px;height:180px;bottom:-70px;left:-70px}
        .page-header{max-width:760px;margin:0 auto 32px;text-align:center;position:relative;z-index:1}
        .page-subtitle{margin-top:12px;font-size:16px;color:#5A7186;line-height:1.8;max-width:620px;margin-left:auto;margin-right:auto}
        .suggestion-panel{background:#fff;border:1px solid #E9F1FB;border-radius:24px;box-shadow:0 24px 80px rgba(18,66,110,0.08);padding:36px 32px;max-width:980px;margin:0 auto;transform:translateY(-40px);}
        .panel-top{display:flex;align-items:flex-start;gap:16px;margin-bottom:28px}
        .panel-icon{width:56px;height:56px;border-radius:18px;background:#E6F2FF;display:flex;align-items:center;justify-content:center;color:#1C6DD0;font-size:22px;box-shadow:0 12px 28px rgba(64,138,255,0.12)}
        .panel-title{font-size:28px;font-weight:800;color:#102B48;line-height:1.05;margin-bottom:6px}
        .panel-note{font-size:15px;color:#5A7186;line-height:1.75}
        .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:14px}
        .form-field{display:flex;flex-direction:column;gap:10px}
        .form-label{font-size:13px;font-weight:700;color:#42526E}
        .form-input{width:100%;min-height:48px;padding:14px 16px;border:1px solid #D9E6F4;border-radius:16px;background:#F7FBFF;color:#102B48;font-size:14px}
        .form-input:focus{outline:none;border-color:#5BB8E0;box-shadow:0 0 0 4px rgba(91,184,224,0.12)}
        .cta-row{display:flex;align-items:center;justify-content:flex-start;gap:14px;margin-top:16px}
        .submit-btn{padding:15px 24px;background:#1C6DD0;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:10px}
        .submit-btn:hover{background:#164F8E;transform:translateY(-1px)}
        .submit-btn:disabled{background:#9FBFDD;cursor:not-allowed;transform:none}
        .suggestions-container{margin-top:36px}
        .suggestion-card{background:#fff;border-radius:20px;padding:28px;margin-bottom:18px;border:1px solid #E6EFF8;box-shadow:0 12px 36px rgba(15,45,86,0.08)}
        .suggestion-header{display:flex;align-items:center;gap:18px;margin-bottom:18px}
        .suggestion-logo{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#5BB8E0,#1C6DD0);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff}
        .suggestion-name{font-size:18px;font-weight:700;color:#102B48;margin-bottom:4px}
        .suggestion-meta{font-size:14px;color:#6B7D98}
        .suggestion-desc{font-size:14px;color:#415973;line-height:1.75;margin-bottom:16px}
        .suggestion-details{display:flex;flex-wrap:wrap;gap:12px}
        .detail-item{font-size:12px;color:#2C4F74;background:#EFF7FF;padding:8px 12px;border-radius:12px}
        .loading,.no-results{text-align:center;padding:40px 0;color:#4E6B88}
        @media(max-width:980px){.form-grid{grid-template-columns:1fr}}
        @media(max-width:640px){nav{padding:0 18px;height:auto;min-height:72px;flex-wrap:wrap;gap:12px}
          .hero{padding:48px 16px 24px}
          .suggestion-panel{padding:28px 22px;transform:none}
          .panel-title{font-size:24px}
          .page-header{margin-bottom:20px}
          .form-field{gap:8px}
          .submit-btn{width:100%;justify-content:center}}
      `}</style>

      <nav>
        <Link to="/" className="logo-area nav-link">
          <div className="logo-mark">ICE</div>
          <div className="flex flex-col">
            <span className="logo-text"><span>ICE</span> Foundation</span>
            <span className="logo-subtext">Inspire Connect Empower</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/colleges" className="nav-link">College Matches</Link>
          <Link to="/college-suggestion" className="nav-link active">College Suggestion</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {user ? (
            <div className="nav-user">
              <span className="nav-user-greeting">Hi, {user.username}</span>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="nav-btn">Login / Register</Link>
          )}
        </div>
      </nav>

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

      <div style={{padding:'0 20px 60px',maxWidth:'1080px',margin:'0 auto'}}>
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
            <h2 style={{fontSize:'28px',fontWeight:'700',color:'#0A1628',marginBottom:'24px',textAlign:'center'}}>
              Recommended Colleges ({suggestions.length})
            </h2>
            {suggestions.map(college => (
              <div key={college.id} className="suggestion-card">
                <div className="suggestion-header">
                  <div className="suggestion-logo">{college.logo_description || college.name.substring(0, 2).toUpperCase()}</div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{college.name}</div>
                    <div className="suggestion-meta">{college.district}, {college.branch}</div>
                  </div>
                  <Link to={`/colleges/${college.id}`} style={{color:'#5BB8E0',textDecoration:'none',fontSize:'14px',fontWeight:'600'}}>
                    View Details →
                  </Link>
                </div>
                <div className="suggestion-desc">{college.description}</div>
                <div className="suggestion-details">
                  <span className="detail-item">Cutoff: {college.cutoff_mark}</span>
                  <span className="detail-item">Category: {college.community_category}</span>
                  <span className="detail-item">Branch: {college.branch}</span>
                  <span className="detail-item">District: {college.district}</span>
                  {college.scholarship_available && <span className="detail-item" style={{background:'#1D9E75',color:'#fff'}}>Scholarship Available</span>}
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