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
          <span className="badge-dot"></span>Est. 2026 · Namakkal, TamilNadu
        </div>
        <h1>We exist to open every door for you.</h1>
        <p>ICE Foundation was built by educators and counselors who believe every 12th-grade student deserves a clear, confident path to the right college.</p>
      </section>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">1<span>+</span></div>
            <div className="stat-lbl">Years in market</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">1<span>k+</span></div>
            <div className="stat-lbl">Students onboarded</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">100<span>+</span></div>
            <div className="stat-lbl">College partners</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">₹5<span>k</span> - ₹40<span>k</span></div>
            <div className="stat-lbl">Scholarships Available</div>
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
              <div className="tl-year">January 2026</div>
              <div className="tl-title">ICE Foundation Founded</div>
              <div className="tl-desc">
                ICE Foundation was started with a vision to guide students in choosing the right college, course, and career path.
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">February 2026</div>
              <div className="tl-title">Initial College Partnerships</div>
              <div className="tl-desc">
                Partnered with multiple colleges across Tamil Nadu to provide students with verified admission opportunities.
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">March 2026</div>
              <div className="tl-title">Scholarship Support Initiated</div>
              <div className="tl-desc">
                Started helping students secure scholarships and financial support based on merit and eligibility.
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">April 2026</div>
              <div className="tl-title">Platform Launch</div>
              <div className="tl-desc">
                Launched the ICE Foundation digital platform to connect students with colleges and expert guidance.
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-year">End of 2026 (Target)</div>
              <div className="tl-title">3000+ Students Supported</div>
              <div className="tl-desc">
                Our goal is to guide over <strong>3000+ students</strong> and help them secure more than <strong>₹3 Crore</strong> in scholarships.
              </div>
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
              <div className="team-avatar" style={{ background: '#87CEEB' }}>GP</div>
              <div className="team-body">
                <div className="team-name">Gokul Palanisamy</div>
                <div className="team-role">Founder & Director</div>
                <div className="team-bio">
                  Entrepreneur with a vision to inspire, connect, and empower students by guiding them towards the right college and career path.
                </div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#5BB8E0' }}>MM</div>
              <div className="team-body">
                <div className="team-name">Manikandan Murugesan</div>
                <div className="team-role">Head of Counselling</div>
                <div className="team-bio">
                  Experienced student counsellor dedicated to helping students identify the right courses and colleges based on their interests and strengths.
                </div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#3AAAD4' }}>DK</div>
              <div className="team-body">
                <div className="team-name">Dinesh Kumar</div>
                <div className="team-role">Scholarship Specialist</div>
                <div className="team-bio">
                  Specializes in identifying scholarship opportunities and assisting students in securing financial support for their education.
                </div>
              </div>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#87CEEB' }}>GN</div>
              <div className="team-body">
                <div className="team-name">Gnanasridhar Nagaraj</div>
                <div className="team-role">College Relations Lead</div>
                <div className="team-bio">
                  Focuses on building strong relationships with colleges to ensure students get the best admission opportunities and guidance.
                </div>
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