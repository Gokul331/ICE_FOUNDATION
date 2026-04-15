import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F7FBFF', color: '#0F2448' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body,div,p,h1,h2,h3,span,a,button,input,select,label{font-family:'Inter',sans-serif}
        nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.96);backdrop-filter:blur(16px);border-bottom:1px solid #E6EEF7;padding:0 32px;height:72px;display:flex;align-items:center;justify-content:space-between}
        .logo-area{display:flex;align-items:center;gap:12px}
        .logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#5BB8E0,#2A7BC1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;letter-spacing:-0.5px}
        .logo-text{font-size:17px;font-weight:700;color:#0F2448;letter-spacing:-0.4px}
        .logo-text span{color:#5BB8E0}
        .logo-subtext{font-size:11px;color:#7A96B2;margin-top:-4px}
        .nav-links{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .nav-link{padding:8px 16px;font-size:14px;font-weight:500;color:#2B3B53;text-decoration:none;border-radius:10px;transition:all .2s;border:none;background:none;cursor:pointer}
        .nav-link:hover{background:#EAF4FF;color:#1C6DD0}
        .nav-link.active{background:#EAF4FF;color:#1C6DD0;font-weight:700}
        .nav-btn{padding:10px 22px;font-size:14px;font-weight:600;color:#fff;background:#1C6DD0;border:none;border-radius:10px;cursor:pointer;transition:all .2s;letter-spacing:-0.2px}
        .nav-btn:hover{background:#164F8E;transform:translateY(-1px)}
        .nav-user{display:flex;align-items:center;gap:12px}
        .nav-user-greeting{font-size:14px;font-weight:500;color:#2B3B53}
        .profile-hero{background:#fff;border-radius:30px;padding:60px 32px 40px;max-width:980px;margin:0 auto 24px;box-shadow:0 20px 50px rgba(46,79,121,0.09);}
        .profile-hero h1{font-size:34px;font-weight:800;color:#102B48;letter-spacing:-0.03em;margin-bottom:14px}
        .profile-hero p{font-size:16px;color:#5A7186;line-height:1.8;max-width:700px}
        .profile-card{background:#fff;border:1px solid #E9F1FB;border-radius:24px;padding:32px;max-width:980px;margin:0 auto;box-shadow:0 18px 48px rgba(21,50,94,0.08)}
        .profile-meta{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}
        .profile-item{background:#F4F9FF;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:8px}
        .profile-label{font-size:12px;font-weight:700;color:#5A7186;text-transform:uppercase;letter-spacing:.18em}
        .profile-value{font-size:18px;font-weight:700;color:#102B48}
        .empty-state{padding:40px;text-align:center;color:#5A7186}
        .empty-state p{margin-top:12px}
        .profile-action{margin-top:24px;display:flex;gap:12px;flex-wrap:wrap}
        .profile-action a{display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;border-radius:14px;border:1px solid #D3E3F7;background:#fff;color:#1C6DD0;font-weight:700;text-decoration:none;transition:all .2s}
        .profile-action a:hover{background:#EBF4FF}
        @media(max-width:780px){.profile-meta{grid-template-columns:1fr}.profile-hero{padding:40px 24px}.profile-card{padding:28px}}
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
          <Link to="/college-suggestion" className="nav-link">College Suggestion</Link>
          <Link to="/profile" className="nav-link active">Profile</Link>
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

      <section className="profile-hero">
        <h1>Profile Details</h1>
        <p>Manage your student profile and see the account details used for ICE Foundation access.</p>
      </section>

      <section className="profile-card">
        {user ? (
          <>
            <div className="profile-meta">
              <div className="profile-item">
                <span className="profile-label">Username</span>
                <span className="profile-value">{user.username}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email || 'Not available'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Account status</span>
                <span className="profile-value">Active</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Member since</span>
                <span className="profile-value">Registered user</span>
              </div>
            </div>
            <div className="profile-action">
              <Link to="/college-suggestion">View college suggestions</Link>
              <Link to="/colleges">Browse college matches</Link>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2>You are not logged in</h2>
            <p>Sign in to view your profile information and access personalized college recommendations.</p>
            <div className="profile-action">
              <Link to="/login">Login</Link>
              <Link to="/register">Create account</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;
