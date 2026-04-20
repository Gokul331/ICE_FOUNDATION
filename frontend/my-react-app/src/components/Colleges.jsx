import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { getColleges } from '../services/api';
import '../styles/colleges.css';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ stream: 'All', type: 'All' });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchColleges = async () => {
    try {
      setLoading(true);
      const data = await getColleges(); // data is now the actual college array
      // Handle both array and object responses
      const collegesArray = Array.isArray(data) ? data : (data.results || []);
      setColleges(collegesArray);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Failed to load colleges');
      setLoading(false);
    }
  };
  fetchColleges();
}, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Get colors for college based on name hash
  const getCollegeColors = (name) => {
    const colors = [
      { bg: "#EAF7FD", fg: "#3AAAD4" },
      { bg: "#FFF0EA", fg: "#C85A30" },
      { bg: "#EAF0FD", fg: "#3A5AD4" },
      { bg: "#EDF7ED", fg: "#2A8A2A" },
      { bg: "#FDF5EA", fg: "#C8A530" }
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Generate logo letters from college name
  const getLogoLetters = (collegeName) => {
    if (!collegeName) return 'CO';
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

  // Format type for display (capitalize)
  const formatType = (type) => {
    if (!type) return 'Private';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const enhancedColleges = useMemo(() => {
    return colleges.map(college => {
      const colors = getCollegeColors(college.college_name || college.name);
      return {
        ...college,
        // ✅ FIX: Map API fields to component fields
        id: college.college_id || college.id,
        name: college.college_name || college.name,
        city: college.location_city || college.district || 'Tamil Nadu',
        state: college.location_state || college.state,
        address: college.address,
        stream: college.type || 'Engineering',
        type: formatType(college.type),
        scholarship: college.scholarship_available || college.median_salary || false,
        desc: college.description || college.address || 'No description available.',
        logo: college.logo_url || college.logo,
        bg: colors.bg,
        fg: colors.fg,
        placement_percentage: college.placement_percentage,
        nirf_ranking: college.nirf_rank,
        naac_grade: college.naac_grade,
        hostel_available: college.hostel_available,
        fees: college.fees || 'N/A',
        established_year: college.established_year,
        counselling_code: college.counselling_code
      };
    });
  }, [colleges]);

  const filteredAndSortedColleges = useMemo(() => {
    let filtered = enhancedColleges.filter(college => {
      const matchesSearch = searchQuery === '' ||
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.city && college.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filters.type === 'All' || college.type === filters.type;

      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'placement':
          return (b.placement_percentage || 0) - (a.placement_percentage || 0);
        case 'fees':
          { const feesA = a.fees === 'N/A' ? Infinity : parseInt(a.fees);
          const feesB = b.fees === 'N/A' ? Infinity : parseInt(b.fees);
          return feesA - feesB; }
        case 'nirf':
          return (a.nirf_ranking || 999) - (b.nirf_ranking || 999);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enhancedColleges, searchQuery, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const renderCollegeCard = (college) => {
    if (viewMode === 'grid') {
      return (
        <Link key={college.id} to={`/colleges/${college.id}`} className="college-card-link">
          <div className="college-card">
            <div className="card-header">
              <div className="card-logo" style={{ background: college.bg, color: college.fg }}>
                {college.logo ? (
                  <img src={college.logo} alt={college.name} />
                ) : (
                  getLogoLetters(college.name)
                )}
              </div>
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
              <div className="card-desc">{college.desc.substring(0, 100)}...</div>
              <div className="card-tags">
                {college.scholarship && <span className="tag tag-scholarship">💰 Scholarship Available</span>}
                {college.hostel_available && <span className="tag tag-stream">🏠 Hostel Available</span>}
                <span className="tag tag-type">{college.type}</span>
                {college.naac_grade && <span className="tag tag-stream">NAAC: {college.naac_grade}</span>}
                {college.counselling_code && <span className="tag tag-stream">Code: {college.counselling_code}</span>}
              </div>
            </div>
            <div className="card-footer">
              <div className="card-rating">
                {college.nirf_ranking ? (
                  <span>🏆 NIRF: #{college.nirf_ranking}</span>
                ) : (
                  <span>📊 NIRF: Not Ranked</span>
                )}
                {college.placement_percentage && (
                  <span style={{ marginLeft: '12px' }}>💼 Placement: {college.placement_percentage}%</span>
                )}
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
            <div className="list-logo" style={{ background: college.bg, color: college.fg }}>
              {getLogoLetters(college.name)}
            </div>
            <div className="list-info">
              <div className="list-name">{college.name}</div>
              <div className="list-loc">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {college.city}, {college.state}
              </div>
              <div className="list-tags">
                {college.scholarship && <span className="tag tag-scholarship">💰 Scholarship</span>}
                {college.hostel_available && <span className="tag tag-stream">🏠 Hostel</span>}
                <span className="tag tag-type">{college.type}</span>
              </div>
            </div>
            <div className="list-right">
              <div className="list-rating">
                {college.nirf_ranking ? (
                  <span>NIRF: #{college.nirf_ranking}</span>
                ) : (
                  <span>NIRF: N/A</span>
                )}
              </div>
              <button className="apply-btn">Apply now</button>
            </div>
          </div>
        </Link>
      );
    }
  };

  if (loading) {
    return (
      <div className="colleges-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading colleges...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="colleges-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ color: '#E24B4A', marginBottom: '20px' }}>{error}</div>
          <button onClick={() => window.location.reload()} className="apply-btn">Retry</button>
        </div>
      </div>
    );
  }

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
        <span className="filter-label">Type</span>
        {['All', 'Government', 'Private', 'Aided', 'Autonomous'].map(type => (
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
          <option value="name">Sort: A–Z</option>
          <option value="placement">Sort: Placement %</option>
          <option value="fees">Sort: Lowest Fees</option>
          <option value="nirf">Sort: NIRF Ranking</option>
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

        {filteredAndSortedColleges.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4A6580' }}>
            <div style={{ fontSize: '18px', marginBottom: '12px' }}>No colleges found</div>
            <div>Try adjusting your search or filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Colleges;