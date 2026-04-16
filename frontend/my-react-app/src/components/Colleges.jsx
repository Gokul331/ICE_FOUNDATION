import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/colleges.css';

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
        const enhancedData = data.map((college, index) => ({
          ...college,
          id: college.id,
          name: college.name,
          city: getCityForCollege(college.name),
          stream: getStreamForCollege(college.name),
          type: getTypeForCollege(college.name),
          rating: 4.5 + Math.random() * 0.4,
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
          <div className="college-card">
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
          <div className="list-card">
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
    <div className="colleges-page">
      <Navbar user={user} onLogout={handleLogout} />

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