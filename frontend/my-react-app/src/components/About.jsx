import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function About() {
  const [user, setUser] = useState(null);

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
    <div className="about-page" style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#0A1628' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .about-page, .about-page div, .about-page p, .about-page h1, .about-page h2, .about-page h3, .about-page span, .about-page a, .about-page button{font-family:'Inter',sans-serif}
        nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border-bottom:1px solid #E2ECF5;padding:0 40px;height:72px;display:flex;align-items:center;justify-content:space-between}
        .logo-area{display:flex;align-items:center;gap:12px}
        .logo-mark{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#87CEEB,#5BB8E0);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;letter-spacing:-0.5px}
        .logo-text{font-size:17px;font-weight:700;color:#0A1628;letter-spacing:-0.4px}
        .logo-text span{color:#5BB8E0}
        .logo-subtext{font-size:11px;color:#A8C5D9;margin-top:-4px;letter-spacing:0;text-transform:none}
        .nav-links{display:flex;align-items:center;gap:8px}
        .nav-link{padding:8px 16px;font-size:14px;font-weight:500;color:#2D3E55;text-decoration:none;border-radius:8px;transition:all .2s;border:none;background:none;cursor:pointer}
        .nav-link:hover{background:#EAF7FD;color:#5BB8E0}
        .nav-link.active{background:#EAF7FD;color:#5BB8E0;font-weight:700}
        .nav-btn{padding:10px 22px;font-size:14px;font-weight:600;color:#fff;background:#5BB8E0;border:none;border-radius:10px;cursor:pointer;transition:all .2s;letter-spacing:-0.2px}
        .nav-btn:hover{background:#0A1628;transform:translateY(-1px)}
        .nav-user{display:flex;align-items:center;gap:12px}
        .nav-user-greeting{font-size:14px;font-weight:500;color:#2D3E55}
        .hero{background:#87CEEB;padding:72px 40px;text-align:center;position:relative;overflow:hidden}
        .hero-ring1{position:absolute;width:380px;height:380px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);top:-100px;right:-80px;pointer-events:none}
        .hero-ring2{position:absolute;width:240px;height:240px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);bottom:-80px;left:-60px;pointer-events:none}
        .hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.4);border-radius:50px;padding:6px 16px;font-size:12px;font-weight:600;color:#fff;margin-bottom:24px;letter-spacing:.3px}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;opacity:.9}
        .hero h1{font-size:clamp(34px,6vw,58px);font-weight:800;color:#fff;letter-spacing:-2px;line-height:1.08;margin-bottom:18px}
        .hero p{font-size:17px;color:rgba(255,255,255,.85);max-width:540px;margin:0 auto;line-height:1.65}
        .stats-bar{background:#fff;border-bottom:1px solid #E2ECF5;padding:0 40px}
        .stats-inner{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);divide-x:1px solid #E2ECF5}
        .stat-item{padding:28px 24px;text-align:center;border-right:1px solid #E2ECF5}
        .stat-item:last-child{border-right:none}
        .stat-num{font-size:30px;font-weight:800;color:#0A1628;letter-spacing:-1.5px}
        .stat-num span{color:#3AAAD4}
        .stat-lbl{font-size:12px;color:#7A9BB5;margin-top:4px;font-weight:500;letter-spacing:.2px}
        .section{padding:88px 40px;background:#fff}
        .section.alt{background:#FAFCFF}
        .section-inner{max-width:1060px;margin:0 auto}
        .section-tag{display:inline-block;padding:5px 14px;background:#EAF7FD;border-radius:50px;font-size:11px;font-weight:700;color:#3AAAD4;letter-spacing:.8px;text-transform:uppercase;margin-bottom:16px}
        .section h2{font-size:clamp(26px,4vw,40px);font-weight:800;color:#0A1628;letter-spacing:-1.2px;line-height:1.1;margin-bottom:14px}
        .section .lead{font-size:16px;color:#5A7A95;line-height:1.72;max-width:560px}
        .mission-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .mission-visual{background:#EAF7FD;border:1px solid #C8EBF8;border-radius:20px;padding:40px;display:flex;flex-direction:column;gap:16px}
        .mv-card{background:#fff;border:1px solid #C8EBF8;border-radius:14px;padding:20px;display:flex;align-items:flex-start;gap:14px}
        .mv-icon{width:40px;height:40px;border-radius:10px;background:#87CEEB;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .mv-icon svg{width:18px;height:18px;color:#fff}
        .mv-title{font-size:14px;font-weight:700;color:#0A1628;margin-bottom:3px}
        .mv-desc{font-size:12px;color:#7A9BB5;line-height:1.6}
        .values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
        .val-card{background:#fff;border:1px solid #E2ECF5;border-radius:16px;padding:28px;transition:all .25s;cursor:default}
        .val-card:hover{border-color:#87CEEB;transform:translateY(-4px)}
        .val-num{font-size:11px;font-weight:800;color:#C8EBF8;letter-spacing:1px;margin-bottom:12px}
        .val-title{font-size:16px;font-weight:800;color:#0A1628;letter-spacing:-0.4px;margin-bottom:8px}
        .val-desc{font-size:13px;color:#7A9BB5;line-height:1.65}
        .val-line{width:32px;height:3px;background:#87CEEB;border-radius:2px;margin-bottom:14px}
        .timeline{margin-top:48px;position:relative;padding-left:28px}
        .timeline::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:#EAF7FD;border-radius:1px}
        .tl-item{position:relative;margin-bottom:36px}
        .tl-item:last-child{margin-bottom:0}
        .tl-dot{position:absolute;left:-28px;top:4px;width:16px;height:16px;border-radius:50%;background:#87CEEB;border:3px solid #fff;outline:2px solid #C8EBF8}
        .tl-year{font-size:11px;font-weight:800;color:#87CEEB;letter-spacing:.8px;margin-bottom:4px}
        .tl-title{font-size:15px;font-weight:700;color:#0A1628;letter-spacing:-0.3px;margin-bottom:4px}
        .tl-desc{font-size:13px;color:#7A9BB5;line-height:1.6}
        .team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px}
        .team-card{background:#fff;border:1px solid #E2ECF5;border-radius:16px;overflow:hidden;transition:all .25s}
        .team-card:hover{border-color:#87CEEB;transform:translateY(-4px)}
        .team-avatar{height:110px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;letter-spacing:-1px}
        .team-body{padding:18px}
        .team-name{font-size:14px;font-weight:800;color:#0A1628;letter-spacing:-0.3px}
        .team-role{font-size:11px;font-weight:600;color:#87CEEB;margin-top:2px;letter-spacing:.2px}
        .team-bio{font-size:12px;color:#7A9BB5;line-height:1.6;margin-top:8px}
        .cta{background:#87CEEB;padding:80px 40px;text-align:center;position:relative;overflow:hidden}
        .cta-ring{position:absolute;width:300px;height:300px;border-radius:50%;border:1px solid rgba(255,255,255,0.2)}
        .cta h2{font-size:clamp(26px,4vw,42px);font-weight:800;color:#fff;letter-spacing:-1.5px;margin-bottom:14px}
        .cta p{font-size:15px;color:rgba(255,255,255,.82);max-width:420px;margin:0 auto 36px;line-height:1.65}
        .cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        .cta-btn-w{padding:14px 32px;font-size:14px;font-weight:700;color:#0A1628;background:#fff;border:none;border-radius:12px;cursor:pointer;transition:all .2s;letter-spacing:-0.2px}
        .cta-btn-w:hover{background:#EAF7FD}
        .cta-btn-o{padding:14px 32px;font-size:14px;font-weight:700;color:#fff;background:transparent;border:2px solid rgba(255,255,255,0.5);border-radius:12px;cursor:pointer;transition:all .2s}
        .cta-btn-o:hover{border-color:#fff;background:rgba(255,255,255,0.1)}
        footer{background:#fff;border-top:1px solid #E2ECF5;padding:28px 40px;display:flex;align-items:center;justify-content:space-between}
        .ft-logo{font-size:14px;font-weight:800;color:#0A1628}
        .ft-logo span{color:#3AAAD4}
        .ft-copy{font-size:12px;color:#A8C4D8}
        @media(max-width:992px){.stats-inner{grid-template-columns:1fr 1fr;grid-row-gap:16px}.mission-grid{grid-template-columns:1fr}.values-grid{grid-template-columns:1fr}.team-grid{grid-template-columns:1fr 1fr}nav{padding:0 20px}.hero{padding:56px 20px}.stats-bar{padding:0 20px}.section{padding:56px 20px}.cta{padding:56px 20px}.footer{padding:24px 20px}}
        @media(max-width:640px){.stats-inner{grid-template-columns:1fr}.team-grid{grid-template-columns:1fr}.nav-links{flex-wrap:wrap;justify-content:center}nav{padding:0 16px}.hero{padding:48px 16px}.section{padding:48px 16px}.cta{padding:48px 16px}}
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
          <Link to="/about" className="nav-link active">About Us</Link>
          <Link to="/colleges" className="nav-link">College Matches</Link>
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

      <section className="hero">
        <div className="hero-ring1"></div>
        <div className="hero-ring2"></div>
        <div className="hero-badge"><span className="badge-dot"></span>Est. 2025 · Namakkal, TamilNadu</div>
        <h1>We exist to open<br />every door for you.</h1>
        <p>ICE Foundation was built by educators and counselors who believe every 12th-grade student deserves a clear, confident path to the right college.</p>
      </section>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item"><div className="stat-num">2<span>+</span></div><div className="stat-lbl">Years in market</div></div>
          <div className="stat-item"><div className="stat-num">1<span>k+</span></div><div className="stat-lbl">Students onboarded</div></div>
          <div className="stat-item"><div className="stat-num">200<span>+</span></div><div className="stat-lbl">College partners</div></div>
          <div className="stat-item"><div className="stat-num">₹6<span>Cr</span></div><div className="stat-lbl">Scholarship value matched</div></div>
        </div>
      </div>

      <section className="section">
        <div className="section-inner">
          <div className="mission-grid">
            <div className="mission-text">
              <span className="section-tag">Our mission</span>
              <h2>Turning ambition into admission.</h2>
              <p className="lead" style={{ marginBottom: '24px' }}>We remove the confusion, anxiety, and information overload from college admissions — replacing it with clarity, data, and personalised expert guidance.</p>
              <p className="lead">From choosing the right stream to securing a scholarship, ICE Foundation walks with every student every step of the way.</p>
            </div>
            <div className="mission-visual">
              <div className="mv-card">
                <div className="mv-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div>
                  <div className="mv-title">Expert college counselling</div>
                  <div className="mv-desc">One-on-one sessions with certified counselors who know every college inside out.</div>
                </div>
              </div>
              <div className="mv-card">
                <div className="mv-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                </div>
                <div>
                  <div className="mv-title">End-to-end support</div>
                  <div className="mv-desc">From shortlisting to submission, we manage every deadline and document for you.</div>
                </div>
              </div>
              <div className="mv-card">
                <div className="mv-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>
                </div>
                <div>
                  <div className="mv-title">Scholarship discovery</div>
                  <div className="mv-desc">We identify and apply for every scholarship your profile qualifies for — nothing left on the table.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="section-inner">
          <span className="section-tag">Our values</span>
          <h2>What we stand for</h2>
          <p className="lead">Our principles shape every interaction — from the first consultation to the final admission letter.</p>
          <div className="values-grid">
            <div className="val-card"><div className="val-num">01</div><div className="val-line"></div><div className="val-title">Student-first always</div><div className="val-desc">Every recommendation we make is driven by what is genuinely best for the student — not by commissions or college partnerships.</div></div>
            <div className="val-card"><div className="val-num">02</div><div className="val-line"></div><div className="val-title">Radical transparency</div><div className="val-desc">We share honest assessments, realistic expectations, and clear data so students and families can make informed decisions.</div></div>
            <div className="val-card"><div className="val-num">03</div><div className="val-line"></div><div className="val-title">Accessible excellence</div><div className="val-desc">World-class counselling should not be reserved for the privileged. We work to make expert guidance available to every student.</div></div>
            <div className="val-card"><div className="val-num">04</div><div className="val-line"></div><div className="val-title">Lifelong relationships</div><div className="val-desc">Our job does not end at admission. We stay connected with our students through university and beyond.</div></div>
            <div className="val-card"><div className="val-num">05</div><div className="val-line"></div><div className="val-title">Data-driven matching</div><div className="val-desc">We combine human expertise with structured data to match students to colleges where they will truly thrive — not just gain admission.</div></div>
            <div className="val-card"><div className="val-num">06</div><div className="val-line"></div><div className="val-title">Continuous growth</div><div className="val-desc">We update our college database, scholarship lists, and counselling methods every year to stay ahead of an evolving landscape.</div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'start' }}>
          <div>
            <span className="section-tag">Our story</span>
            <h2>A decade of opening doors.</h2>
            <p className="lead">What started as a small counselling desk in Chennai has grown into one of South India's most trusted college guidance organisations.</p>
          </div>
          <div className="timeline">
            <div className="tl-item"><div className="tl-dot"></div><div className="tl-year">2015</div><div className="tl-title">ICE Foundation founded</div><div className="tl-desc">Started by three educators in Chennai with a mission to demystify college admissions for Tamil Nadu students.</div></div>
            <div className="tl-item"><div className="tl-dot"></div><div className="tl-year">2017</div><div className="tl-title">100 colleges onboarded</div><div className="tl-desc">Built partnerships with top colleges across South India, expanding our reach to Karnataka and Andhra Pradesh.</div></div>
            <div className="tl-item"><div className="tl-dot"></div><div className="tl-year">2019</div><div className="tl-title">Scholarship programme launched</div><div className="tl-desc">Introduced our dedicated scholarship discovery service, securing over ₹2 Cr for students in the first year alone.</div></div>
            <div className="tl-item"><div className="tl-dot"></div><div className="tl-year">2022</div><div className="tl-title">Digital platform goes live</div><div className="tl-desc">Launched our online counselling portal, making expert guidance accessible to students across India.</div></div>
            <div className="tl-item"><div className="tl-dot"></div><div className="tl-year">2025</div><div className="tl-title">3,000+ students served</div><div className="tl-desc">Milestone reached with 500+ partner colleges and ₹12 Cr in total scholarships secured for our students.</div></div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="section-inner">
          <span className="section-tag">Meet the team</span>
          <h2>The people behind ICE</h2>
          <p className="lead">Our counselors bring decades of combined experience from education, admissions, and student development.</p>
          <div className="team-grid">
            <div className="team-card"><div className="team-avatar" style={{ background: '#87CEEB' }}>RK</div><div className="team-body"><div className="team-name">Dr. Rajesh Kumar</div><div className="team-role">Founder & Director</div><div className="team-bio">20 years in education policy and student counselling across Tamil Nadu and Karnataka.</div></div></div>
            <div className="team-card"><div className="team-avatar" style={{ background: '#5BB8E0' }}>PM</div><div className="team-body"><div className="team-name">Priya Menon</div><div className="team-role">Head of Counselling</div><div className="team-bio">Former admissions officer at Loyola College. Guided 800+ students to their dream institutions.</div></div></div>
            <div className="team-card"><div className="team-avatar" style={{ background: '#3AAAD4' }}>AS</div><div className="team-body"><div className="team-name">Arjun Subramaniam</div><div className="team-role">Scholarship Specialist</div><div className="team-bio">Expert in government and private scholarship programmes. Has secured ₹5 Cr+ for students.</div></div></div>
            <div className="team-card"><div className="team-avatar" style={{ background: '#87CEEB' }}>NV</div><div className="team-body"><div className="team-name">Nithya Venkat</div><div className="team-role">College Relations Lead</div><div className="team-bio">Manages partnerships with 500+ colleges. Ensures students get priority consideration and early offers.</div></div></div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-ring" style={{ top: '-120px', right: '-80px' }}></div>
        <div className="cta-ring" style={{ bottom: '-100px', left: '-60px', width: '220px', height: '220px' }}></div>
        <h2>Ready to find your college?</h2>
        <p>Join thousands of students who found clarity, confidence, and the perfect college with ICE Foundation.</p>
        <div className="cta-btns">
          <Link to="/register" className="cta-btn-w">Get started free</Link>
          <Link to="/login" className="cta-btn-o">Talk to a counselor</Link>
        </div>
      </section>

      <footer>
        <div className="ft-logo"><span>ICE</span> Foundation</div>
        <div className="ft-copy">© 2025 ICE Foundation. Empowering students across India.</div>
      </footer>
    </div>
  );
}

export default About;
