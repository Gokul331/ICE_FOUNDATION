import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ stream: 'All', type: 'All' });
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/colleges/')
      .then(response => response.json())
      .then(data => {
        // Enhance API data with additional fields for display
        const enhancedData = data.map((college, index) => ({
          ...college,
          id: college.id,
          name: college.name,
          city: getCityForCollege(college.name),
          stream: getStreamForCollege(college.name),
          type: getTypeForCollege(college.name),
          rating: 4.5 + Math.random() * 0.4, // Random rating between 4.5-4.9
          scholarship: college.scholarship_available,
          desc: college.description,
          logo: getLogoForCollege(college.name),
          bg: getBgForCollege(college.name),
          fg: getFgForCollege(college.name)
        }));
        setColleges(enhancedData);
      })
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

  // Helper functions to map college names to additional data
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

  const filteredAndSortedColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      const matchesSearch = searchQuery === '' ||
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.stream.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStream = filters.stream === 'All' || college.stream === filters.stream;
      const matchesType = filters.type === 'All' || college.type === filters.type;

      return matchesSearch && matchesStream && matchesType;
    });

    // Sort colleges
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'scholarship':
          return b.scholarship - a.scholarship;
        default:
          return 0;
      }
    });

    return filtered;
  }, [colleges, searchQuery, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<div key={i} className="star" />);
      } else if (rating >= i - 0.5) {
        stars.push(<div key={i} className="star half" />);
      } else {
        stars.push(<div key={i} className="star empty" />);
      }
    }
    return stars;
  };

  const renderCollegeCard = (college) => {
    if (viewMode === 'grid') {
      return (
        <Link key={college.id} to={`/colleges/${college.id}`} className="college-card-link">
          <div className="college-card" data-stream={college.stream} data-type={college.type} data-name={college.name} data-scholarship={college.scholarship}>
            <div className="card-header">
              <div className="card-logo" style={{ background: college.bg, color: college.fg }}>{college.logo}</div>
              <div className="card-meta">
                <div className="card-name">{college.name}</div>
                <div className="card-location">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {college.city}
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="card-desc">{college.desc}</div>
              <div className="card-tags">
                {college.scholarship && <span className="tag tag-scholarship">Scholarship Available</span>}
                <span className="tag tag-type">{college.type}</span>
                <span className="tag tag-stream">{college.stream}</span>
              </div>
            </div>
            <div className="card-footer">
              <div className="card-rating">
                <div className="stars">{renderStars(college.rating)}</div>
                {college.rating.toFixed(1)}
              </div>
              <button className="apply-btn">Apply now</button>
            </div>
          </div>
        </Link>
      );
    } else {
      return (
        <Link key={college.id} to={`/colleges/${college.id}`} className="college-card-link">
          <div className="list-card" data-stream={college.stream} data-type={college.type} data-name={college.name} data-scholarship={college.scholarship}>
            <div className="list-logo" style={{ background: college.bg, color: college.fg }}>{college.logo}</div>
            <div className="list-info">
              <div className="list-name">{college.name}</div>
              <div className="list-loc">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {college.city}
              </div>
              <div className="list-tags">
                {college.scholarship && <span className="tag tag-scholarship">Scholarship Available</span>}
                <span className="tag tag-type">{college.type}</span>
                <span className="tag tag-stream">{college.stream}</span>
              </div>
            </div>
            <div className="list-right">
              <div className="list-rating">
                <div className="stars">{renderStars(college.rating)}</div>
                {college.rating.toFixed(1)}
              </div>
              <button className="apply-btn">Apply now</button>
            </div>
          </div>
        </Link>
      );
    }
  };

  return (
    <div className="colleges-page" style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#0A1628' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .colleges-page, .colleges-page div, .colleges-page p, .colleges-page h1, .colleges-page h2, .colleges-page h3, .colleges-page span, .colleges-page a, .colleges-page button, .colleges-page input, .colleges-page select, .colleges-page label{font-family:'Inter',sans-serif}
        nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border-bottom:1px solid #E2ECF5;padding:0 40px;height:72px;display:flex;align-items:center;justify-content:space-between}
        .logo-area{display:flex;align-items:center;gap:12px}
        .logo-mark{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#87CEEB,#5BB8E0);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;letter-spacing:-0.5px}
        .logo-text{font-size:17px;font-weight:700;color:#0A1628;letter-spacing:-0.4px}
        .logo-text span{color:#5BB8E0}
        .logo-subtext{font-size:11px;color:#A8C5D9;margin-top:-4px;letter-spacing:0;text-transform:none}Hope your dream college is waiting for you!
        .nav-links{display:flex;align-items:center;gap:8px}
        .nav-link{padding:8px 16px;font-size:14px;font-weight:500;color:#2D3E55;text-decoration:none;border-radius:8px;transition:all .2s;border:none;background:none;cursor:pointer}
        .nav-link:hover{background:#EAF7FD;color:#5BB8E0}
        .nav-link.active{background:#EAF7FD;color:#5BB8E0;font-weight:700}
        .nav-btn{padding:10px 22px;font-size:14px;font-weight:600;color:#fff;background:#5BB8E0;border:none;border-radius:10px;cursor:pointer;transition:all .2s;letter-spacing:-0.2px}
        .nav-btn:hover{background:#0A1628;transform:translateY(-1px)}
        .nav-user{display:flex;align-items:center;gap:12px}
        .nav-user-greeting{font-size:14px;font-weight:500;color:#2D3E55}
        .hero{background:#87CEEB;padding:52px 40px;position:relative;overflow:hidden}
        .hero-ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,0.18);pointer-events:none}
        .hero-content{max-width:1060px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap}
        .hero-left{}
        .hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.4);border-radius:50px;padding:5px 14px;font-size:11px;font-weight:700;color:#fff;margin-bottom:14px;letter-spacing:.3px}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#fff}
        .hero h1{font-size:clamp(26px,4vw,42px);font-weight:800;color:#fff;letter-spacing:-1.5px;line-height:1.1;margin-bottom:10px}
        .hero p{font-size:14px;color:rgba(255,255,255,.82);line-height:1.65;max-width:420px}
        .hero-search{background:#fff;border-radius:14px;padding:6px 6px 6px 16px;display:flex;align-items:center;gap:10px;width:340px;flex-shrink:0;border:1px solid #E2ECF5}
        .hero-search svg{width:16px;height:16px;color:#A8C4D8;flex-shrink:0}
        .hero-search input{flex:1;border:none;outline:none;font-size:14px;color:#0A1628;background:transparent;font-family:'Inter',sans-serif}
        .hero-search input::placeholder{color:#B0CEDE}
        .search-btn{background:#87CEEB;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;font-family:'Inter',sans-serif}
        .search-btn:hover{background:#5BB8E0}
        .filter-bar{background:#FAFCFF;border-bottom:1px solid #E2ECF5;padding:18px 40px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .filter-label{font-size:12px;font-weight:700;color:#7A9BB5;letter-spacing:.4px;text-transform:uppercase;margin-right:4px}
        .chip{padding:7px 16px;border:1.5px solid #E2ECF5;border-radius:50px;font-size:12px;font-weight:600;color:#4A6580;cursor:pointer;transition:all .2s;background:#fff;font-family:'Inter',sans-serif}
        .chip:hover{border-color:#87CEEB;color:#3AAAD4}
        .chip.active{border-color:#87CEEB;background:#EAF7FD;color:#3AAAD4}
        .sort-select{margin-left:auto;padding:7px 14px;border:1.5px solid #E2ECF5;border-radius:10px;font-size:12px;font-weight:600;color:#4A6580;background:#fff;cursor:pointer;outline:none;font-family:'Inter',sans-serif}
        .sort-select:focus{border-color:#87CEEB}
        .page-body{max-width:1060px;margin:0 auto;padding:36px 40px}
        .results-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
        .results-count{font-size:13px;color:#7A9BB5;font-weight:500}
        .view-toggle{display:flex;gap:4px}
        .vt-btn{width:32px;height:32px;border:1.5px solid #E2ECF5;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .vt-btn.active,.vt-btn:hover{border-color:#87CEEB;background:#EAF7FD}
        .vt-btn svg{width:14px;height:14px;color:#4A6580}
        .vt-btn.active svg{color:#3AAAD4}
        .grid-view{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .list-view{display:flex;flex-direction:column;gap:14px}
        .college-card{background:#fff;border:1px solid #E2ECF5;border-radius:16px;overflow:hidden;transition:all .28s;cursor:pointer;position:relative}
        .college-card:hover{border-color:#87CEEB;transform:translateY(-4px)}
        .college-card::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:#87CEEB;transform:scaleX(0);transform-origin:left;transition:transform .28s;border-radius:0}
        .college-card:hover::after{transform:scaleX(1)}
        .card-header{padding:20px 20px 0;display:flex;align-items:flex-start;gap:14px}
        .card-logo{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;border:1px solid #E2ECF5}
        .card-meta{flex:1;min-width:0}
        .card-name{font-size:14px;font-weight:800;color:#0A1628;letter-spacing:-0.3px;line-height:1.3;margin-bottom:3px}
        .card-location{font-size:11px;color:#A8C4D8;font-weight:500;display:flex;align-items:center;gap:4px}
        .card-location svg{width:11px;height:11px}
        .card-body{padding:14px 20px}
        .card-desc{font-size:12px;color:#7A9BB5;line-height:1.65;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
        .tag{padding:4px 10px;border-radius:50px;font-size:11px;font-weight:600}
        .tag-scholarship{background:#EAF7FD;color:#3AAAD4;border:1px solid #C8EBF8}
        .tag-type{background:#F0F4F8;color:#5A7A95;border:1px solid #E2ECF5}
        .tag-stream{background:#F5F0FE;color:#6B4FBE;border:1px solid #E0D5F8}
        .card-footer{border-top:1px solid #F0F5F9;padding:12px 20px;display:flex;align-items:center;justify-content:space-between}
        .card-rating{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#0A1628}
        .stars{display:flex;gap:2px}
        .star{width:11px;height:11px;background:#87CEEB;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
        .star.half{background:#C8EBF8}
        .star.empty{background:#E2ECF5}
        .apply-btn{padding:6px 14px;background:#87CEEB;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;transition:background .2s;font-family:'Inter',sans-serif}
        .apply-btn:hover{background:#5BB8E0}
        .list-card{background:#fff;border:1px solid #E2ECF5;border-radius:14px;padding:18px 22px;display:flex;align-items:center;gap:18px;transition:all .25s;cursor:pointer;position:relative;overflow:hidden}
        .list-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#87CEEB;transform:scaleY(0);transform-origin:top;transition:transform .25s;border-radius:0}
        .list-card:hover{border-color:#87CEEB}
        .list-card:hover::before{transform:scaleY(1)}
        .list-logo{width:48px;height:48px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;border:1px solid #E2ECF5}
        .list-info{flex:1;min-width:0}
        .list-name{font-size:14px;font-weight:800;color:#0A1628;letter-spacing:-0.3px;margin-bottom:3px}
        .list-loc{font-size:11px;color:#A8C4D8;margin-bottom:7px;display:flex;align-items:center;gap:4px}
        .list-loc svg{width:11px;height:11px}
        .list-tags{display:flex;gap:6px;flex-wrap:wrap}
        .list-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
        .list-rating{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#0A1628}
        .pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:40px;padding-bottom:12px}
        .pg-btn{width:34px;height:34px;border:1.5px solid #E2ECF5;border-radius:9px;background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#4A6580;transition:all .2s;font-family:'Inter',sans-serif}
        .pg-btn:hover{border-color:#87CEEB;color:#3AAAD4}
        .pg-btn.active{background:#87CEEB;border-color:#87CEEB;color:#fff}
        .pg-arrow{background:none;border:1.5px solid #E2ECF5;width:34px;height:34px;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .pg-arrow:hover{border-color:#87CEEB}
        .pg-arrow svg{width:14px;height:14px;color:#7A9BB5}
        .college-card-link{text-decoration:none;color:inherit;display:block}
        @media(max-width:992px){.hero-content{flex-direction:column;text-align:center}.hero-search{width:100%;max-width:400px}.filter-bar{flex-direction:column;gap:12px}.grid-view{grid-template-columns:repeat(2,1fr)}.filter-bar{padding:18px 20px}}
        @media(max-width:640px){.grid-view{grid-template-columns:1fr}.hero{padding:48px 20px}.page-body{padding:28px 20px}.filter-bar{padding:18px 16px}}
      `}</style>

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

      <div className="hero">
        <div className="hero-ring" style={{ width: '360px', height: '360px', top: '-120px', right: '-80px' }}></div>
        <div className="hero-ring" style={{ width: '200px', height: '200px', bottom: '-70px', left: '-50px' }}></div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge"><span className="badge-dot"></span>Smart matches in seconds</div>
            <h1>Explore college options built around your goals.</h1>
            <p>Search, compare, and shortlist colleges with fast recommendations from our startup-powered matching engine.</p>
          </div>
          <div className="hero-search">
            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search college or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <span className="filter-label">Stream</span>
        {['All', 'Engineering', 'Arts & Science', 'Management', 'Medical', 'Law'].map(stream => (
          <button
            key={stream}
            className={`chip ${filters.stream === stream ? 'active' : ''}`}
            onClick={() => handleFilterChange('stream', stream)}
          >
            {stream}
          </button>
        ))}
        <span className="filter-label" style={{ marginLeft: '12px' }}>Type</span>
        {['All', 'Government', 'Private', 'Deemed'].map(type => (
          <button
            key={type}
            className={`chip ${filters.type === type ? 'active' : ''}`}
            onClick={() => handleFilterChange('type', type)}
          >
            {type}
          </button>
        ))}
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="rating">Sort: Top rated</option>
          <option value="name">Sort: A–Z</option>
          <option value="scholarship">Sort: Scholarship first</option>
        </select>
      </div>

      <div className="page-body">
        <div className="results-meta">
          <div className="results-count">Showing <strong>{filteredAndSortedColleges.length}</strong> matched college opportunities</div>
          <div className="view-toggle">
            <button
              className={`vt-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={`vt-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'grid-view' : 'list-view'}>
          {filteredAndSortedColleges.map(college => renderCollegeCard(college))}
        </div>

        <div className="pagination">
          <button className="pg-arrow">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="pg-btn active">1</button>
          <button className="pg-btn">2</button>
          <button className="pg-btn">3</button>
          <span style={{ fontSize: '13px', color: '#B0CEDE', padding: '0 4px' }}>...</span>
          <button className="pg-btn">12</button>
          <button className="pg-arrow">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Colleges;
