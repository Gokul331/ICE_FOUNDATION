import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [colleges, setColleges] = useState([]);
  const [user, setUser] = useState(null);

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

  return (
    <div style={{margin:0,padding:0,boxSizing:'border-box',fontFamily:'Inter, sans-serif',background:'#fff',color:'#0A1628',overflowX:'hidden'}}>
      <style>
        {`
          :root {
            --sky: #87CEEB;
            --sky-deep: #5BB8E0;
            --sky-pale: #EAF7FD;
            --sky-mist: #C8EBF8;
            --white: #fff;
            --ink: #0A1628;
            --ink-soft: #2D3E55;
            --ink-muted: #6B7F99;
            --border: #E2ECF5;
            --card-bg: #FAFCFF;
            --radius: 14px;
            --radius-lg: 22px;
          }
          nav {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
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
            background: linear-gradient(135deg, var(--sky), var(--sky-deep));
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
            color: var(--ink);
            letter-spacing: -0.4px;
          }
          .logo-text span {
            color: var(--sky-deep);
          }
          .logo-subtext{font-size:11px;color:#A8C5D9;margin-top:-4px;letter-spacing:0;text-transform:none}

          .nav-links {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .nav-link {
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            color: var(--ink-soft);
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.2s;
            border: none;
            background: none;
            cursor: pointer;
          }
          .nav-link:hover {
            background: var(--sky-pale);
            color: var(--sky-deep);
          }
          .nav-btn {
            padding: 10px 22px;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            background: var(--sky-deep);
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            letter-spacing: -0.2px;
          }
          .nav-btn:hover {
            background: var(--ink);
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
          .hero {
            min-height: 88vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 80px 40px;
          }
          .hero-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 80% 60% at 60% -10%, #C5E9F7 0%, transparent 70%), radial-gradient(ellipse 50% 40% at -10% 80%, #DAEEF8 0%, transparent 60%);
            pointer-events: none;
          }
          .hero-grid {
            position: absolute;
            inset: 0;
            opacity: 0.045;
            background-image: linear-gradient(var(--sky-deep) 1px, transparent 1px), linear-gradient(90deg, var(--sky-deep) 1px, transparent 1px);
            background-size: 60px 60px;
          }
          .hero-content {
            max-width: 760px;
            text-align: center;
            position: relative;
            z-index: 2;
          }
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            background: var(--sky-pale);
            border: 1px solid var(--sky-mist);
            border-radius: 50px;
            font-size: 13px;
            font-weight: 500;
            color: var(--sky-deep);
            margin-bottom: 36px;
          }
          .badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--sky-deep);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
          }
          .hero h1 {
            font-size: clamp(40px, 7vw, 72px);
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -2.5px;
            color: var(--ink);
            margin-bottom: 24px;
          }
          .hero h1 em {
            font-style: normal;
            color: var(--sky-deep);
          }
          .hero-sub {
            font-size: 19px;
            font-weight: 400;
            color: var(--ink-muted);
            line-height: 1.65;
            max-width: 580px;
            margin: 0 auto 48px;
            letter-spacing: -0.2px;
          }
          .hero-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
          }
          .btn-primary {
            padding: 16px 36px;
            font-size: 16px;
            font-weight: 700;
            color: #fff;
            background: var(--sky-deep);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.25s;
            letter-spacing: -0.3px;
            box-shadow: 0 8px 24px rgba(91,184,224,0.3);
          }
          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 16px 32px rgba(91,184,224,0.4);
            background: var(--ink);
          }
          .btn-secondary {
            padding: 16px 32px;
            font-size: 16px;
            font-weight: 600;
            color: var(--ink-soft);
            background: transparent;
            border: 1.5px solid var(--border);
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.25s;
          }
          .btn-secondary:hover {
            border-color: var(--sky-mist);
            background: var(--sky-pale);
            color: var(--sky-deep);
          }
          .hero-stats {
            display: flex;
            gap: 48px;
            justify-content: center;
            margin-top: 72px;
            padding-top: 56px;
            border-top: 1px solid var(--border);
          }
          .stat {
            text-align: center;
          }
          .stat-num {
            font-size: 32px;
            font-weight: 800;
            color: var(--ink);
            letter-spacing: -1.5px;
          }
          .stat-num span {
            color: var(--sky-deep);
          }
          .stat-label {
            font-size: 13px;
            font-weight: 400;
            color: var(--ink-muted);
            margin-top: 4px;
            letter-spacing: 0.3px;
          }
          .colleges {
            padding: 120px 40px;
            background: var(--card-bg);
          }
          .section-header {
            text-align: center;
            margin-bottom: 64px;
          }
          .section-tag {
            display: inline-block;
            padding: 6px 16px;
            background: var(--sky-pale);
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            color: var(--sky-deep);
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          .section-header h2 {
            font-size: clamp(30px, 5vw, 46px);
            font-weight: 800;
            color: var(--ink);
            letter-spacing: -1.5px;
            line-height: 1.1;
          }
          .section-header p {
            font-size: 16px;
            color: var(--ink-muted);
            line-height: 1.7;
            max-width: 480px;
            margin: 16px auto 0;
          }
          .colleges-grid {
            max-width: 1140px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
          }
          .college-card {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 32px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
            cursor: default;
          }
          .college-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--sky), var(--sky-deep));
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s;
          }
          .college-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 24px 56px rgba(135,206,235,0.18);
            border-color: var(--sky-mist);
          }
          .college-card:hover::before {
            transform: scaleX(1);
          }
          .card-top {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
          }
          .card-info {
            flex: 1;
          }
          .card-name {
            font-size: 17px;
            font-weight: 700;
            color: var(--ink);
            letter-spacing: -0.4px;
            line-height: 1.25;
          }
          .card-location {
            font-size: 12px;
            font-weight: 400;
            color: var(--ink-muted);
            margin-top: 3px;
          }
          .card-desc {
            font-size: 14px;
            color: var(--ink-muted);
            line-height: 1.7;
            margin-bottom: 20px;
          }
          .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .scholarship-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            background: linear-gradient(135deg, #E8F9F0, #D4F2E2);
            border: 1px solid #A8E4C0;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            color: #1A7A42;
            letter-spacing: 0.2px;
          }
          .scholarship-tag::before {
            content: '✦';
            font-size: 10px;
            color: #26A65B;
          }
          .card-arrow {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1.5px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--ink-muted);
            font-size: 14px;
            transition: all 0.25s;
          }
          .college-card:hover .card-arrow {
            background: var(--sky-deep);
            border-color: var(--sky-deep);
            color: #fff;
            transform: rotate(-45deg);
          }
          .how {
            padding: 120px 40px;
            background: var(--white);
          }
          .how-inner {
            max-width: 1000px;
            margin: 0 auto;
          }
          .steps {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-top: 0;
          }
          .step {
            padding: 40px 36px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            position: relative;
            text-align: center;
          }
          .step-num {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: var(--sky-pale);
            border: 1.5px solid var(--sky-mist);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 800;
            color: var(--sky-deep);
            margin: 0 auto 20px;
            letter-spacing: -1px;
          }
          .step h3 {
            font-size: 18px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 12px;
            letter-spacing: -0.4px;
          }
          .step p {
            font-size: 14px;
            color: var(--ink-muted);
            line-height: 1.7;
          }
          .step-connector {
            position: absolute;
            top: 50%;
            right: -12px;
            transform: translateY(-50%);
            width: 24px;
            text-align: center;
            color: var(--sky-mist);
            font-size: 18px;
            font-weight: 300;
            z-index: 1;
          }
          .cta-banner {
            margin: 0 40px 80px;
            padding: 72px 64px;
            background: linear-gradient(135deg, var(--ink) 0%, #1a2e4a 100%);
            border-radius: 28px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .cta-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(135,206,235,.12), transparent 70%);
            pointer-events: none;
          }
          .cta-banner h2 {
            font-size: clamp(26px, 4vw, 42px);
            font-weight: 800;
            color: #fff;
            letter-spacing: -1.5px;
            margin-bottom: 16px;
          }
          .cta-banner p {
            font-size: 16px;
            color: rgba(255,255,255,.6);
            margin-bottom: 40px;
            line-height: 1.6;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
          }
          .cta-btn {
            padding: 16px 40px;
            font-size: 16px;
            font-weight: 700;
            color: var(--ink);
            background: var(--sky);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.25s;
            letter-spacing: -0.3px;
          }
          .cta-btn:hover {
            background: #fff;
            transform: translateY(-2px);
          }
          footer {
            padding: 40px;
            border-top: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--card-bg);
          }
          .footer-logo {
            font-size: 15px;
            font-weight: 700;
            color: var(--ink);
            letter-spacing: -0.3px;
          }
          .footer-logo span {
            color: var(--sky-deep);
          }
          .footer-copy {
            font-size: 13px;
            color: var(--ink-muted);
          }
          @media (max-width: 768px) {
            nav {
              padding: 0 20px;
            }
            .nav-links .nav-link {
              display: none;
            }
            .hero {
              padding: 60px 20px;
              min-height: auto;
            }
            .hero-stats {
              gap: 24px;
              padding-top: 40px;
              margin-top: 48px;
            }
            .colleges {
              padding: 80px 20px;
            }
            .colleges-grid {
              grid-template-columns: 1fr;
            }
            .steps {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            .how {
              padding: 80px 20px;
            }
            .cta-banner {
              margin: 0 20px 60px;
              padding: 48px 28px;
            }
            footer {
              padding: 28px 20px;
              flex-direction: column;
              gap: 12px;
              text-align: center;
            }
          }
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .hero-badge {
            animation: fadeUp 0.6s ease both;
          }
          .hero h1 {
            animation: fadeUp 0.7s 0.1s ease both;
          }
          .hero-sub {
            animation: fadeUp 0.7s 0.2s ease both;
          }
          .hero-actions {
            animation: fadeUp 0.7s 0.3s ease both;
          }
          .hero-stats {
            animation: fadeUp 0.7s 0.45s ease both;
          }
        `}
      </style>

      {/* NAVIGATION */}
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
          <Link to="/colleges" className="nav-link">College Matches</Link>
          <Link to="/college-suggestion" className="nav-link">College Suggestion</Link>
          <div className='bg-gray-300 p-2 rounded-full'>
            <Link to="/profile" className=""></Link>
          </div>

          <Link to="/contact" className="nav-link">Contact</Link>
          {user ? (
            <div className="nav-user">
              <span className="nav-user-greeting">Hi, {user.username}</span>
              
            </div>
          ) : (
            <Link to="/login" className="nav-btn">Login / Register</Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
           Your dream college is closer than you think.
          </div>
          <h1>Your Bridge from<br />School to <em>Success.</em></h1>
          <p className="hero-sub">Expert consulting for 12th-grade students to find the perfect college, course, and scholarship — tailored just for you.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/colleges" className="btn-primary">Go to Colleges</Link>
            ) : (
              <Link to="/register" className="btn-primary">Get Started</Link>
            )}
            <Link to="/colleges" className="btn-secondary">Explore Colleges →</Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">500<span>+</span></div>
              <div className="stat-label">Partner Colleges</div>
            </div>
           
            <div className="stat">
              <div className="stat-num">5<span>k</span> - 40<span>k</span></div>
              <div className="stat-label">Scholarships Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COLLEGES */}
      <section className="colleges">
        <div style={{maxWidth: '1140px', margin: '0 auto'}}>
          <div className="section-header">
            <div className="section-tag">Featured Colleges</div>
            <h2>Find Your Perfect Institution</h2>
            <p>Explore top-ranked colleges across India, handpicked by our expert counselors.</p>
          </div>
          <div className="colleges-grid">
            {colleges.slice(0, 15).map((college, index) => {
              const logos = [
                <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="29,1 57,14 57,46 29,61 1,46 1,14" fill="#291a8b" stroke="#C8922A" strokeWidth="2"/>
                  <text x="29" y="28" fontFamily="Georgia,serif" fontSize="11" fontWeight="bold" fill="#F5D78A" textAnchor="middle">ST.</text>
                  <text x="29" y="42" fontFamily="Georgia,serif" fontSize="9" fill="#F5D78A" textAnchor="middle">STEPH</text>
                </svg>,
                <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="29" cy="31" rx="27" ry="29" fill="#1A3A7A" stroke="#4A7ACB" strokeWidth="2"/>
                  <ellipse cx="29" cy="31" rx="19" ry="21" fill="none" stroke="#A8C0EF" strokeWidth="1"/>
                  <text x="29" y="28" fontFamily="Georgia,serif" fontSize="9" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">LOYOLA</text>
                  <text x="29" y="40" fontFamily="Georgia,serif" fontSize="8" fill="#A8C0EF" textAnchor="middle">COLLEGE</text>
                </svg>,
                <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="50" height="46" rx="8" fill="#1B4DAB" stroke="none"/>
                  <polygon points="29,10 50,22 50,38 29,50 8,38 8,22" fill="#E8640A" opacity="0.85"/>
                  <rect x="22" y="24" width="14" height="14" rx="3" fill="#fff" opacity="0.9"/>
                  <text x="29" y="34" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="900" fill="#1B4DAB" textAnchor="middle">SRM</text>
                </svg>,
                <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="29" cy="31" r="27" fill="#FDF0D0" stroke="#C8922A" strokeWidth="2.5"/>
                  <circle cx="29" cy="31" r="19" fill="none" stroke="#8B1A1A" strokeWidth="1"/>
                  <circle cx="29" cy="31" r="5" fill="#8B1A1A"/>
                  <text x="29" y="19" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#8B1A1A" textAnchor="middle">IIT</text>
                  <text x="29" y="47" fontFamily="Georgia,serif" fontSize="6" fill="#8B1A1A" textAnchor="middle">MADRAS</text>
                  <line x1="29" y1="4" x2="29" y2="11" stroke="#C8922A" strokeWidth="1.5"/>
                  <line x1="29" y1="51" x2="29" y2="58" stroke="#C8922A" strokeWidth="1.5"/>
                  <line x1="2" y1="31" x2="9" y2="31" stroke="#C8922A" strokeWidth="1.5"/>
                  <line x1="49" y1="31" x2="56" y2="31" stroke="#C8922A" strokeWidth="1.5"/>
                </svg>,
                <svg viewBox="0 0 58 62" width="58" height="62" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29 1 L55 14 L55 48 L29 61 L3 48 L3 14 Z" fill="#2A4A8A" stroke="#6B8ED0" strokeWidth="1.5"/>
                  <rect x="26" y="12" width="6" height="22" fill="#E8D080"/>
                  <rect x="19" y="20" width="20" height="6" fill="#E8D080"/>
                  <text x="29" y="50" fontFamily="Georgia,serif" fontSize="7" fill="#B8CCF0" textAnchor="middle">CHRIST</text>
                </svg>
              ];
              const locations = ['New Delhi, Delhi', 'Chennai, Tamil Nadu', 'Kattankulathur, Tamil Nadu', 'Chennai, Tamil Nadu', 'Bangalore, Karnataka'];
              const descriptions = [
                'One of India\'s most prestigious liberal arts institutions under the University of Delhi, known for its rich heritage in humanities and science.',
                'A premier Jesuit institution ranked among the best colleges in South India, offering excellence in arts, science, and management studies.',
                'A leading deemed university specializing in engineering and technology, globally recognized for research and industry partnerships.',
                'India\'s #1 ranked institution for engineering and technology, known globally for innovation, research output, and outstanding faculty.',
                'A prestigious deemed university renowned for its multidisciplinary approach, holistic education model, and vibrant campus culture.'
              ];
              return (
                <div key={college.id} className="college-card">
                  <div className="card-top">
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '58px', height: '62px', flexShrink: 0}}>
                      {logos[index % logos.length]}
                    </div>
                    <div className="card-info">
                      <div className="card-name">{college.name}</div>
                      <div className="card-location">{locations[index % locations.length]}</div>
                    </div>
                  </div>
                  <p className="card-desc">{descriptions[index % descriptions.length]}</p>
                  <div className="card-footer">
                    {college.scholarship_available && <span className="scholarship-tag">Scholarship Available</span>}
                    <div className="card-arrow">→</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{textAlign: 'center', marginTop: '48px'}}>
            <Link to="/colleges" className="btn-primary" style={{padding: '14px 32px', fontSize: '15px'}}>
              View All Colleges →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="how-inner">
          <div className="section-header">
            <div className="section-tag">How It Works</div>
            <h2>Three Steps to Your Dream College</h2>
            <p>Our expert counselors guide you through every stage of the admission journey.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <h3>Create Your Profile</h3>
              <p>Share your academic interests, scores, and aspirations. Our system finds your best-fit options instantly.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h3>Get Expert Guidance</h3>
              <p>Meet one-on-one with our certified counselors who specialize in your preferred stream and colleges.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h3>Secure Admission</h3>
              <p>We manage applications, scholarship documents, and follow-ups — so you focus on what matters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <h2>Ready to Find Your Path?</h2>
        <p style={{color: 'rgba(255,255,255,.6)', marginBottom: '36px', lineHeight: '1.65', fontSize: '16px'}}>Join thousands of students who found their perfect college with ICE Foundation's expert guidance.</p>
        <Link to="/register" className="cta-btn">Start Your Journey Today</Link>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo"><span>ICE</span> Foundation</div>
        <div className="footer-copy">© 2025 ICE Foundation. Empowering students across India.</div>
      </footer>
    </div>
  );
}

export default Home;