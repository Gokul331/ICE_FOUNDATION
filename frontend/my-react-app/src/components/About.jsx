import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/about.css';
import Navbar from './Navbar';

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
    <div className="about-page">
   <Navbar />

      <section className="hero">
        <div className="hero-ring1"></div>
        <div className="hero-ring2"></div>
        <div className="hero-badge">
          <span className="badge-dot"></span>Est. 2025 · Namakkal, TamilNadu
        </div>
        <h1>We exist to open every door for you.</h1>
        <p>ICE Foundation was built by educators and counselors who believe every 12th-grade student deserves a clear, confident path to the right college.</p>
      </section>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">2<span>+</span></div>
            <div className="stat-lbl">Years in market</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">1<span>k+</span></div>
            <div className="stat-lbl">Students onboarded</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">200<span>+</span></div>
            <div className="stat-lbl">College partners</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">₹6<span>Cr</span></div>
            <div className="stat-lbl">Scholarship value matched</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-inner">
          <div className="mission-grid">
            <div className="mission-text">
              <span className="section-tag">Our mission</span>
              <h2>Turning ambition into admission.</h2>
              <p className="lead" style={{ marginBottom: '24px' }}>
                We remove the confusion, anxiety, and information overload from college admissions — replacing it with clarity, data, and personalised expert guidance.
              </p>
              <p className="lead">
                From choosing the right stream to securing a scholarship, ICE Foundation walks with every student every step of the way.
              </p>
            </div>
            <div className="mission-visual">
              <div className="mv-card">
                <div className="mv-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div>
                  <div className="mv-title">Expert college counselling</div>
                  <div className="mv-desc">One-on-one sessions with certified counselors who know every college inside out.</div>
                </div>
              </div>
              <div className="mv-card">
                <div className="mv-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                  </svg>
                </div>
                <div>
                  <div className="mv-title">End-to-end support</div>
                  <div className="mv-desc">From shortlisting to submission, we manage every deadline and document for you.</div>
                </div>
              </div>
              <div className="mv-card">
                <div className="mv-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/>
                  </svg>
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
            <div className="val-card">
              <div className="val-num">01</div>
              <div className="val-line"></div>
              <div className="val-title">Student-first always</div>
              <div className="val-desc">Every recommendation we make is driven by what is genuinely best for the student — not by commissions or college partnerships.</div>
            </div>
            <div className="val-card">
              <div className="val-num">02</div>
              <div className="val-line"></div>
              <div className="val-title">Radical transparency</div>
              <div className="val-desc">We share honest assessments, realistic expectations, and clear data so students and families can make informed decisions.</div>
            </div>
            <div className="val-card">
              <div className="val-num">03</div>
              <div className="val-line"></div>
              <div className="val-title">Accessible excellence</div>
              <div className="val-desc">World-class counselling should not be reserved for the privileged. We work to make expert guidance available to every student.</div>
            </div>
            <div className="val-card">
              <div className="val-num">04</div>
              <div className="val-line"></div>
              <div className="val-title">Lifelong relationships</div>
              <div className="val-desc">Our job does not end at admission. We stay connected with our students through university and beyond.</div>
            </div>
            <div className="val-card">
              <div className="val-num">05</div>
              <div className="val-line"></div>
              <div className="val-title">Data-driven matching</div>
              <div className="val-desc">We combine human expertise with structured data to match students to colleges where they will truly thrive — not just gain admission.</div>
            </div>
            <div className="val-card">
              <div className="val-num">06</div>
              <div className="val-line"></div>
              <div className="val-title">Continuous growth</div>
              <div className="val-desc">We update our college database, scholarship lists, and counselling methods every year to stay ahead of an evolving landscape.</div>
            </div>
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
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">2015</div>
              <div className="tl-title">ICE Foundation founded</div>
              <div className="tl-desc">Started by three educators in Chennai with a mission to demystify college admissions for Tamil Nadu students.</div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">2017</div>
              <div className="tl-title">100 colleges onboarded</div>
              <div className="tl-desc">Built partnerships with top colleges across South India, expanding our reach to Karnataka and Andhra Pradesh.</div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">2019</div>
              <div className="tl-title">Scholarship programme launched</div>
              <div className="tl-desc">Introduced our dedicated scholarship discovery service, securing over ₹2 Cr for students in the first year alone.</div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">2022</div>
              <div className="tl-title">Digital platform goes live</div>
              <div className="tl-desc">Launched our online counselling portal, making expert guidance accessible to students across India.</div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">2025</div>
              <div className="tl-title">3,000+ students served</div>
              <div className="tl-desc">Milestone reached with 500+ partner colleges and ₹12 Cr in total scholarships secured for our students.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="section-inner">
          <span className="section-tag">Meet the team</span>
          <h2>The people behind ICE</h2>
          <p className="lead">Our counselors bring decades of combined experience from education, admissions, and student development.</p>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#87CEEB' }}>RK</div>
              <div className="team-body">
                <div className="team-name">Dr. Rajesh Kumar</div>
                <div className="team-role">Founder & Director</div>
                <div className="team-bio">20 years in education policy and student counselling across Tamil Nadu and Karnataka.</div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#5BB8E0' }}>PM</div>
              <div className="team-body">
                <div className="team-name">Priya Menon</div>
                <div className="team-role">Head of Counselling</div>
                <div className="team-bio">Former admissions officer at Loyola College. Guided 800+ students to their dream institutions.</div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#3AAAD4' }}>AS</div>
              <div className="team-body">
                <div className="team-name">Arjun Subramaniam</div>
                <div className="team-role">Scholarship Specialist</div>
                <div className="team-bio">Expert in government and private scholarship programmes. Has secured ₹5 Cr+ for students.</div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#87CEEB' }}>NV</div>
              <div className="team-body">
                <div className="team-name">Nithya Venkat</div>
                <div className="team-role">College Relations Lead</div>
                <div className="team-bio">Manages partnerships with 500+ colleges. Ensures students get priority consideration and early offers.</div>
              </div>
            </div>
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