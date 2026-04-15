import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
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
  useEffect(() => {
    window.pickSubj = function(btn){
      document.querySelectorAll('#subject-grid .subj-chip').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    };
    window.doSubmit = function(btn){
      btn.querySelector('.btn-label').style.display='none';
      document.getElementById('form-spinner').style.display='block';
      btn.classList.add('loading');
      setTimeout(()=>{
        document.getElementById('form-view').style.display='none';
        document.getElementById('success-view').style.display='block';
      },1800);
    };
    window.resetForm = function(){
      document.getElementById('form-view').style.display='';
      document.getElementById('success-view').style.display='none';
      const btn=document.querySelector('.submit-btn');
      btn.querySelector('.btn-label').style.display='';
      document.getElementById('form-spinner').style.display='none';
      btn.classList.remove('loading');
    };
    window.toggleFaq = function(el){
      const ans=el.nextElementSibling;
      const isOpen=ans.classList.contains('open');
      document.querySelectorAll('.faq-a').forEach(a=>a.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(q=>q.classList.remove('open'));
      if(!isOpen){ans.classList.add('open');el.classList.add('open')}
    };
  }, []);

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
*{box-sizing:border-box;margin:0;padding:0}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
body,div,p,h1,h2,h3,span,a,button,input,select,textarea,label{font-family:'Inter',sans-serif}

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
.nav-btn:hover{background:#5BB8E0}

.hero{background:#87CEEB;padding:60px 40px;position:relative;overflow:hidden;text-align:center}
.hero-ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,0.18);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.4);border-radius:50px;padding:5px 16px;font-size:11px;font-weight:700;color:#fff;margin-bottom:16px;letter-spacing:.3px}
.badge-dot{width:6px;height:6px;border-radius:50%;background:#fff;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.hero h1{font-size:clamp(30px,5vw,50px);font-weight:800;color:#fff;letter-spacing:-1.8px;line-height:1.08;margin-bottom:12px}
.hero p{font-size:15px;color:rgba(255,255,255,.85);max-width:480px;margin:0 auto;line-height:1.65}

.info-bar{background:#fff;border-bottom:1px solid #E2ECF5}
.info-inner{max-width:1060px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);padding:0 40px}
.info-item{padding:26px 24px;display:flex;align-items:center;gap:14px;border-right:1px solid #E2ECF5}
.info-item:last-child{border-right:none}
.info-icon{width:44px;height:44px;border-radius:11px;background:#EAF7FD;border:1px solid #C8EBF8;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.info-icon svg{width:18px;height:18px;color:#3AAAD4}
.info-label{font-size:11px;font-weight:700;color:#A8C4D8;letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px}
.info-val{font-size:13px;font-weight:700;color:#0A1628;letter-spacing:-0.2px}
.info-sub{font-size:11px;color:#A8C4D8;margin-top:1px}

.body-wrap{max-width:1060px;margin:0 auto;padding:56px 40px;display:grid;grid-template-columns:1fr 420px;gap:48px;align-items:start}

.form-card{background:#fff;border:1px solid #E2ECF5;border-radius:20px;padding:36px;overflow:hidden;position:relative}
.form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:#87CEEB}
.form-title{font-size:22px;font-weight:800;color:#0A1628;letter-spacing:-0.8px;margin-bottom:6px}
.form-sub{font-size:13px;color:#7A9BB5;margin-bottom:28px;line-height:1.55}

.field{margin-bottom:18px}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
label{display:block;font-size:11px;font-weight:700;color:#7A9BB5;margin-bottom:7px;letter-spacing:.4px;text-transform:uppercase}
.input-wrap{position:relative}
.input-wrap svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:#A8D4E8;pointer-events:none}
input[type=text],input[type=email],input[type=tel],select,textarea{width:100%;border:1.5px solid #C8EBF8;border-radius:10px;font-size:13px;font-family:'Inter',sans-serif;color:#0A1628;background:#FAFCFF;transition:border-color .2s,box-shadow .2s;outline:none}
input[type=text],input[type=email],input[type=tel]{height:42px;padding:0 12px 0 38px}
select{height:42px;padding:0 12px 0 38px;-webkit-appearance:none;cursor:pointer}
textarea{padding:12px 12px 12px 38px;resize:vertical;min-height:110px;line-height:1.6}
input::placeholder,textarea::placeholder{color:#B0CEDE}
input:focus,select:focus,textarea:focus{border-color:#87CEEB;box-shadow:0 0 0 3px rgba(135,206,235,0.18);background:#fff}

.select-arrow{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none}
.select-arrow svg{width:14px;height:14px;color:#A8C4D8}

.subject-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:2px}
.subj-chip{padding:9px 12px;border:1.5px solid #C8EBF8;border-radius:9px;font-size:12px;font-weight:600;color:#5A7A95;cursor:pointer;transition:all .2s;background:#FAFCFF;text-align:center;font-family:'Inter',sans-serif}
.subj-chip:hover{border-color:#87CEEB;color:#3AAAD4;background:#EAF7FD}
.subj-chip.active{border-color:#87CEEB;background:#EAF7FD;color:#3AAAD4}

.submit-btn{width:100%;height:48px;background:#87CEEB;border:none;border-radius:12px;font-size:15px;font-weight:800;color:#fff;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:-0.2px;transition:all .2s;position:relative;margin-top:6px}
.submit-btn:hover{background:#5BB8E0;transform:translateY(-1px)}
.submit-btn:active{transform:scale(0.99)}
.submit-btn.loading{opacity:.8;pointer-events:none}
.spinner{display:none;width:18px;height:18px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}

.success-state{display:none;text-align:center;padding:32px 0}
.success-icon{width:60px;height:60px;border-radius:50%;background:#EAF7FD;border:2px solid #C8EBF8;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.success-icon svg{width:26px;height:26px;color:#3AAAD4}
.success-state h3{font-size:19px;font-weight:800;color:#0A1628;letter-spacing:-0.5px;margin-bottom:8px}
.success-state p{font-size:13px;color:#7A9BB5;line-height:1.65;max-width:280px;margin:0 auto 20px}
.reset-btn{padding:10px 24px;background:#EAF7FD;border:1.5px solid #C8EBF8;border-radius:10px;font-size:13px;font-weight:700;color:#3AAAD4;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.reset-btn:hover{background:#D4F0FC}

.right-col{display:flex;flex-direction:column;gap:20px}

.map-card{background:#EAF7FD;border:1px solid #C8EBF8;border-radius:20px;overflow:hidden}
.map-visual{height:180px;background:#C8EBF8;position:relative;display:flex;align-items:center;justify-content:center}
.map-grid{position:absolute;inset:0;opacity:.3;background-image:linear-gradient(#87CEEB 1px,transparent 1px),linear-gradient(90deg,#87CEEB 1px,transparent 1px);background-size:28px 28px}
.map-roads{position:absolute;inset:0}
.map-pin{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center}
.pin-dot{width:20px;height:20px;background:#fff;border:3px solid #3AAAD4;border-radius:50%;position:relative}
.pin-dot::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #3AAAD4}
.pin-pulse{position:absolute;width:36px;height:36px;border-radius:50%;border:2px solid #3AAAD4;opacity:.4;animation:ping 1.5s infinite}
@keyframes ping{0%{transform:scale(.8);opacity:.5}100%{transform:scale(1.6);opacity:0}}
.pin-label{margin-top:14px;background:#fff;border:1px solid #C8EBF8;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;color:#3AAAD4;white-space:nowrap}
.map-footer{padding:16px 20px;display:flex;align-items:center;justify-content:space-between}
.map-addr{font-size:12px;color:#5A7A95;line-height:1.5;font-weight:500}
.map-btn{padding:7px 14px;background:#87CEEB;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:'Inter',sans-serif;transition:background .2s}
.map-btn:hover{background:#5BB8E0}

.hours-card{background:#fff;border:1px solid #E2ECF5;border-radius:16px;padding:22px}
.hours-title{font-size:14px;font-weight:800;color:#0A1628;letter-spacing:-0.3px;margin-bottom:4px;display:flex;align-items:center;gap:8px}
.live-dot{width:7px;height:7px;border-radius:50%;background:#3AAAD4;animation:pulse 2s infinite;flex-shrink:0}
.hours-sub{font-size:12px;color:#A8C4D8;margin-bottom:16px}
.hours-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #F0F5F9;font-size:12px}
.hours-row:last-child{border-bottom:none}
.day{font-weight:600;color:#5A7A95}
.time{font-weight:700;color:#0A1628}
.time.closed{color:#E2737A}
.today-badge{font-size:10px;font-weight:700;background:#EAF7FD;color:#3AAAD4;padding:2px 8px;border-radius:50px;margin-left:6px}

.social-card{background:#fff;border:1px solid #E2ECF5;border-radius:16px;padding:22px}
.social-title{font-size:14px;font-weight:800;color:#0A1628;letter-spacing:-0.3px;margin-bottom:16px}
.social-links{display:flex;flex-direction:column;gap:10px}
.social-link{display:flex;align-items:center;gap:12px;padding:11px 14px;border:1.5px solid #E2ECF5;border-radius:11px;text-decoration:none;transition:all .2s;cursor:pointer;background:#FAFCFF}
.social-link:hover{border-color:#87CEEB;background:#EAF7FD}
.s-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.s-icon svg{width:16px;height:16px}
.s-name{font-size:13px;font-weight:700;color:#0A1628}
.s-handle{font-size:11px;color:#A8C4D8;margin-top:1px}
.s-arr{margin-left:auto;color:#C8EBF8;font-size:14px}

.faq-card{background:#fff;border:1px solid #E2ECF5;border-radius:16px;overflow:hidden}
.faq-header{padding:20px 22px 0;font-size:14px;font-weight:800;color:#0A1628;letter-spacing:-0.3px;margin-bottom:14px}
.faq-item{border-top:1px solid #F0F5F9}
.faq-q{padding:13px 22px;font-size:12px;font-weight:700;color:#0A1628;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:background .2s;user-select:none}
.faq-q:hover{background:#FAFCFF}
.faq-q svg{width:14px;height:14px;color:#A8C4D8;transition:transform .25s;flex-shrink:0}
.faq-q.open svg{transform:rotate(180deg)}
.faq-a{font-size:12px;color:#7A9BB5;line-height:1.65;padding:0 22px;max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s}
.faq-a.open{max-height:100px;padding:0 22px 14px}

footer{background:#fff;border-top:1px solid #E2ECF5;padding:24px 40px;display:flex;align-items:center;justify-content:space-between}
.ft-logo{font-size:14px;font-weight:800;color:#0A1628}.ft-logo span{color:#3AAAD4}
.ft-copy{font-size:12px;color:#A8C4D8}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.hero-badge{animation:fadeUp .5s ease both}.hero h1{animation:fadeUp .55s .08s ease both}.hero p{animation:fadeUp .55s .16s ease both}
      `}} />
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
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/contact" className="nav-link active">Contact</Link>
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

      <div className="hero" style={{background:'#87CEEB',padding:'60px 40px',position:'relative',overflow:'hidden',textAlign:'center'}}>
        <div className="hero-ring" style={{width:'360px',height:'360px',top:'-120px',right:'-80px'}}></div>
        <div className="hero-ring" style={{width:'200px',height:'200px',bottom:'-70px',left:'-50px'}}></div>
        <div className="hero-badge"><span className="badge-dot"></span>Send your college plan questions</div>
        <h1 style={{fontSize:'clamp(30px,5vw,50px)',fontWeight:'800',color:'#fff',letterSpacing:'-1.8px',lineHeight:'1.08',marginBottom:'12px'}}>Talk to the ICE Labs team<br />about your next step.</h1>
        <p style={{fontSize:'15px',color:'rgba(255,255,255,.85)',maxWidth:'460px',margin:'0 auto',lineHeight:'1.65'}}>Whether you need help with matching, applications, or scholarships, our startup support team is here to help.</p>
      </div>

      <div className="info-bar">
        <div className="info-inner">
          <div className="info-item">
            <div className="info-icon"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg></div>
            <div><div className="info-label">Phone</div><div className="info-val">+91 94443 12345</div><div className="info-sub">Mon – Sat, 9 AM – 6 PM</div></div>
          </div>
          <div className="info-item">
            <div className="info-icon"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
            <div><div className="info-label">Email</div><div className="info-val">hello@icelabs.co</div><div className="info-sub">We reply within 24 hours</div></div>
          </div>
          <div className="info-item">
            <div className="info-icon"><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <div><div className="info-label">Office</div><div className="info-val">Anna Salai, Chennai</div><div className="info-sub">Tamil Nadu — 600 002</div></div>
          </div>
        </div>
      </div>

      <div className="body-wrap">

        <div className="form-card">
          <div id="form-view">
            <div className="form-title">Start your college plan</div>
            <div className="form-sub">Tell us about your goals and we’ll connect you with tailored options and next-step support.</div>

            <div className="field">
              <div className="field-row">
                <div>
                  <label>First name</label>
                  <div className="input-wrap">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" placeholder="Arjun" />
                  </div>
                </div>
                <div>
                  <label>Last name</label>
                  <div className="input-wrap">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" placeholder="Kumar" />
                  </div>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Email address</label>
              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" placeholder="you@example.com" />
              </div>
            </div>

            <div className="field">
              <label>Phone number</label>
              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
                <input type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="field">
              <label>I'm enquiring about</label>
              <div className="subject-grid" id="subject-grid">
                <button className="subj-chip active" onClick={(e) => window.pickSubj(e.target)}>Admissions strategy</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Scholarship support</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Course fit</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Application review</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Campus planning</button>
                <button className="subj-chip" onClick={(e) => window.pickSubj(e.target)}>Other startup help</button>
              </div>
            </div>

            <div className="field">
              <label>How did you hear about us?</label>
              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <select>
                  <option value="">Select a source...</option>
                  <option>Google Search</option>
                  <option>Social Media</option>
                  <option>Friend / Family</option>
                  <option>School Counselor</option>
                  <option>Newspaper / Magazine</option>
                  <option>Other</option>
                </select>
                <div className="select-arrow"><svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
              </div>
            </div>

            <div className="field">
              <label>Your message</label>
              <div className="input-wrap">
                <svg style={{top:'14px',transform:'none'}} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <textarea placeholder="Tell us a little about yourself and what you're looking for..."></textarea>
              </div>
            </div>

            <button className="submit-btn" onClick={(e) => window.doSubmit(e.target)}>
              <span className="btn-label">Send message</span>
              <div className="spinner" id="form-spinner"></div>
            </button>
          </div>

          <div className="success-state" id="success-view">
            <div className="success-icon"><svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
            <h3>Message sent!</h3>
            <p>Thank you for reaching out. One of our counselors will get back to you within 24 hours.</p>
            <button className="reset-btn" onClick={() => window.resetForm()}>Send another message</button>
          </div>
        </div>

        <div className="right-col">

          <div className="map-card">
            <div className="map-visual">
              <div className="map-grid"></div>
              <svg style={{position:'absolute',inset:'0',width:'100%',height:'100%',opacity:'.18'}} viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="60" x2="300" y2="60" stroke="#3AAAD4" strokeWidth="6"/>
                <line x1="0" y1="120" x2="300" y2="120" stroke="#3AAAD4" strokeWidth="3"/>
                <line x1="80" y1="0" x2="80" y2="180" stroke="#3AAAD4" strokeWidth="4"/>
                <line x1="180" y1="0" x2="180" y2="180" stroke="#3AAAD4" strokeWidth="4"/>
                <line x1="130" y1="60" x2="130" y2="180" stroke="#3AAAD4" strokeWidth="2"/>
                <line x1="0" y1="90" x2="80" y2="90" stroke="#3AAAD4" strokeWidth="2"/>
                <rect x="20" y="68" width="40" height="22" rx="3" fill="#3AAAD4" opacity=".5"/>
                <rect x="90" y="30" width="30" height="18" rx="3" fill="#3AAAD4" opacity=".4"/>
                <rect x="195" y="68" width="50" height="30" rx="3" fill="#3AAAD4" opacity=".3"/>
                <rect x="100" y="95" width="60" height="15" rx="3" fill="#3AAAD4" opacity=".35"/>
              </svg>
              <div className="map-pin">
                <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div className="pin-pulse"></div>
                  <div className="pin-dot"></div>
                </div>
                <div className="pin-label">ICE Labs HQ</div>
              </div>
            </div>
            <div className="map-footer">
              <div className="map-addr">12, Anna Salai, 3rd Floor<br />Chennai, Tamil Nadu 600 002</div>
              <button className="map-btn">Get directions →</button>
            </div>
          </div>

          <div className="hours-card">
            <div className="hours-title"><div className="live-dot"></div>Office hours</div>
            <div className="hours-sub">Walk-ins welcome during open hours</div>
            <div className="hours-row"><span className="day">Monday<span className="today-badge">Today</span></span><span className="time">9:00 AM – 6:00 PM</span></div>
            <div className="hours-row"><span className="day">Tuesday</span><span className="time">9:00 AM – 6:00 PM</span></div>
            <div className="hours-row"><span className="day">Wednesday</span><span className="time">9:00 AM – 6:00 PM</span></div>
            <div className="hours-row"><span className="day">Thursday</span><span className="time">9:00 AM – 6:00 PM</span></div>
            <div className="hours-row"><span className="day">Friday</span><span className="time">9:00 AM – 6:00 PM</span></div>
            <div className="hours-row"><span className="day">Saturday</span><span className="time">10:00 AM – 3:00 PM</span></div>
            <div className="hours-row"><span className="day">Sunday</span><span className="time closed">Closed</span></div>
          </div>

          <div className="social-card">
            <div className="social-title">Connect with us</div>
            <div className="social-links">
              <div className="social-link">
                <div className="s-icon" style={{background:'#E8F0FE'}}><svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                <div><div className="s-name">Facebook</div><div className="s-handle">@icelabs.in</div></div>
                <span className="s-arr">→</span>
              </div>
              <div className="social-link">
                <div className="s-icon" style={{background:'#E8F5FD'}}><svg viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></div>
                <div><div className="s-name">Twitter / X</div><div className="s-handle">@icelabs</div></div>
                <span className="s-arr">→</span>
              </div>
              <div className="social-link">
                <div className="s-icon" style={{background:'#FFF0F0'}}><svg viewBox="0 0 24 24"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div>
                <div><div className="s-name">Instagram</div><div className="s-handle">@icelabs</div></div>
                <span className="s-arr">→</span>
              </div>
            </div>
          </div>

          <div className="faq-card">
            <div className="faq-header">Quick answers</div>
            <div className="faq-item"><div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}><span>How soon will I hear back?</span><svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div><div className="faq-a">We aim to respond to all enquiries within 24 hours on business days. For urgent queries, please call us directly.</div></div>
            <div className="faq-item"><div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}><span>Is the initial consultation free?</span><svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div><div className="faq-a">Yes! Your first 30-minute consultation with an ICE Labs advisor is completely free with no obligations.</div></div>
            <div className="faq-item"><div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}><span>Can I visit the office directly?</span><svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div><div className="faq-a">Absolutely. Walk-ins are welcome during office hours. We recommend calling ahead so our team can prepare for your visit.</div></div>
            <div className="faq-item"><div className="faq-q" onClick={(e) => window.toggleFaq(e.target.parentElement)}><span>Do you offer online counselling?</span><svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div><div className="faq-a">Yes, we offer full online counselling via video call. Students from across India can access our services remotely.</div></div>
          </div>

        </div>
      </div>

      <footer>
        <div className="ft-logo"><span>ICE</span> Labs</div>
        <div className="ft-copy">© 2025 ICE Labs. Supporting future-ready students across India.</div>
      </footer>
    </div>
  );
};

export default Contact;