import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/colleges/${id}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('College not found');
        }
        return response.json();
      })
      .then(data => {
        // Enhance with additional data like in Colleges.js
        const enhancedData = {
          ...data,
          city: getCityForCollege(data.name),
          stream: getStreamForCollege(data.name),
          type: getTypeForCollege(data.name),
          rating: 4.5 + Math.random() * 0.4,
          logo: getLogoForCollege(data.name),
          bg: getBgForCollege(data.name),
          fg: getFgForCollege(data.name)
        };
        setCollege(enhancedData);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

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

  // Helper functions (same as Colleges.js)
  const getCityForCollege = (name) => {
    const cities = {
      "IIT Madras": "Chennai, TN",
      "St. Stephen's College": "New Delhi, DL",
      "Loyola College": "Chennai, TN",
      "SRM Institute": "Kattankulathur, TN",
      "Christ University": "Bangalore, KA"
    };
    return cities[name] || "India";
  };

  const getStreamForCollege = (name) => {
    const streams = {
      "IIT Madras": "Engineering",
      "St. Stephen's College": "Arts & Science",
      "Loyola College": "Arts & Science",
      "SRM Institute": "Engineering",
      "Christ University": "Arts & Science"
    };
    return streams[name] || "Engineering";
  };

  const getTypeForCollege = (name) => {
    const types = {
      "IIT Madras": "Government",
      "St. Stephen's College": "Private",
      "Loyola College": "Private",
      "SRM Institute": "Deemed",
      "Christ University": "Deemed"
    };
    return types[name] || "Private";
  };

  const getLogoForCollege = (name) => {
    const logos = {
      "IIT Madras": "IIT",
      "St. Stephen's College": "SS",
      "Loyola College": "LC",
      "SRM Institute": "SRM",
      "Christ University": "CU"
    };
    return logos[name] || name.substring(0, 3).toUpperCase();
  };

  const getBgForCollege = (name) => {
    const bgs = {
      "IIT Madras": "#EAF7FD",
      "St. Stephen's College": "#FFF0EA",
      "Loyola College": "#EAF0FD",
      "SRM Institute": "#EAF7FD",
      "Christ University": "#EDF0FD"
    };
    return bgs[name] || "#EAF7FD";
  };

  const getFgForCollege = (name) => {
    const fgs = {
      "IIT Madras": "#3AAAD4",
      "St. Stephen's College": "#C85A30",
      "Loyola College": "#3A5AD4",
      "SRM Institute": "#1B7AB5",
      "Christ University": "#2A4A8A"
    };
    return fgs[name] || "#3AAAD4";
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading college details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: '18px', color: '#E24B4A', marginBottom: '20px' }}>{error}</div>
        <Link to="/colleges" style={{ color: '#5BB8E0', textDecoration: 'none' }}>← Back to Colleges</Link>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav>
        <Link to="/" className="logo-area nav-link">
                 <div className="logo-mark">ICE</div>
                 <div className="flex flex-col">
                 <span className="logo-text"><span>ICE</span> Foundation</span>
                 <span className = "logo-subtext">Inspire Connect Empower</span>
                 </div>
               </Link>
        <div className="nav-links">
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/colleges" className="nav-link active">College Matches</Link>
          <Link to="/college-suggestion" className="nav-link">College Suggestion</Link>
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

      <div className="page-body" style={{ padding: '28px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/colleges" style={{ color: '#5BB8E0', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>← Back to Colleges</Link>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* College Card */}
          <div style={{
            flex: '1',
            minWidth: '300px',
            background: college.bg,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: `1px solid ${college.fg}20`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${college.fg}, ${college.fg}CC)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '800',
                color: '#fff'
              }}>
                {college.logo}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0A1628', margin: '0 0 4px 0' }}>{college.name}</h2>
                <div style={{ fontSize: '14px', color: '#4A6580' }}>{college.city}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <span style={{
                padding: '4px 12px',
                background: '#fff',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: college.fg
              }}>
                {college.stream}
              </span>
              <span style={{
                padding: '4px 12px',
                background: '#fff',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: college.fg
              }}>
                {college.type}
              </span>
              {college.scholarship && (
                <span style={{
                  padding: '4px 12px',
                  background: '#1D9E75',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Scholarship Available
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580' }}>Rating:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#0A1628' }}>{college.rating.toFixed(1)}</span>
                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{
                      color: i < Math.floor(college.rating) ? '#FFD700' : '#E0E0E0',
                      fontSize: '14px'
                    }}>★</span>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: '#2D3E55', lineHeight: '1.6', margin: '0' }}>
              {college.desc}
            </p>
          </div>

          {/* Action Panel */}
          <div style={{
            flex: '0 0 300px',
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #E2ECF5'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0A1628', margin: '0 0 24px 0' }}>
              Ready to Apply?
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Application Fee</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#0A1628' }}>₹1,500</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#4A6580', marginBottom: '8px' }}>Processing Time</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#0A1628' }}>2-3 weeks</div>
            </div>

            <button style={{
              width: '100%',
              padding: '16px',
              background: college.fg,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Start Application
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/contact" style={{ color: '#5BB8E0', textDecoration: 'none', fontSize: '14px' }}>
                Need help? Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #E2ECF5;
          padding: 0 40px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #87CEEB, #5BB8E0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .logo-text {
          font-size: 17px;
          font-weight: 700;
          color: #0A1628;
          letter-spacing: -0.4px;
        }
        .logo-text span {
          color: #5BB8E0;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #2D3E55;
          text-decoration: none;
          border-radius: 8px;
          transition: all .2s;
          border: none;
          background: none;
          cursor: pointer;
        }
        .nav-link:hover {
          background: #EAF7FD;
          color: #5BB8E0;
        }
        .nav-link.active {
          background: #EAF7FD;
          color: #5BB8E0;
          font-weight: 700;
        }
        .nav-btn {
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: #5BB8E0;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all .2s;
          letter-spacing: -0.2px;
        }
        .nav-btn:hover {
          background: #0A1628;
          transform: translateY(-1px);
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-user-greeting {
          font-size: 14px;
          font-weight: 500;
          color: #2D3E55;
        }
        .page-body {
          min-height: calc(100vh - 72px);
        }
        @media(max-width:992px) {
          nav {
            padding: 0 20px;
          }
          .page-body {
            padding: 20px 20px;
          }
        }
        @media(max-width:640px) {
          nav {
            padding: 0 16px;
          }
          .page-body {
            padding: 16px 16px;
          }
        }
      `}</style>
    </>
  );
}

export default CollegeDetail;