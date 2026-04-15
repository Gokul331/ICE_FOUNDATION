import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const passwordStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

const strengthLabel = ['','Weak','Fair','Good','Strong'];
const strengthColor = ['transparent','#E24B4A','#EF9F27','#87CEEB','#1D9E75'];

function Auth({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const strengthValue = useMemo(
    () => passwordStrength(registerPassword),
    [registerPassword]
  );

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register');
    setStatusMessage(null);
    setStatusType('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setStatusMessage('Please enter your email and password.');
      setStatusType('error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setStatusMessage('Signed in successfully.');
        setStatusType('success');
        setTimeout(() => navigate('/'), 800);
      } else {
        setStatusMessage(data.error || 'Login failed. Check your credentials.');
        setStatusType('error');
      }
    } catch (error) {
      setStatusMessage('Unable to sign in. Please try again later.');
      setStatusType('error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !agreeTerms) {
      setStatusMessage('Please complete all fields and accept the terms.');
      setStatusType('error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerEmail,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMessage('Account created successfully. You can sign in now.');
        setStatusType('success');
        setTimeout(() => switchTab('login'), 1000);
      } else {
        setStatusMessage(data.error || data.password?.[0] || data.username?.[0] || 'Registration failed.');
        setStatusType('error');
      }
    } catch (error) {
      setStatusMessage('Unable to register. Please try again later.');
      setStatusType('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-[20px] shadow-[0_30px_80px_rgba(33,43,54,0.12)] overflow-hidden border border-sky-100 flex flex-col md:flex-row">
        <div className="relative md:w-[280px] w-full bg-gradient-to-br from-sky-400 to-sky-500 p-8 flex flex-col justify-between overflow-hidden">
          <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-white/15"></div>
          <div className="absolute -bottom-16 -left-14 w-36 h-36 rounded-full bg-white/10"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-[11px] bg-white text-sky-600 font-extrabold tracking-[-0.05em] mb-4">
              ICE
            </div>
            <div className="text-white font-extrabold text-lg leading-tight tracking-[-0.04em]">
              ICE Foundation
              <small className="block text-sm font-normal opacity-80 mt-2">Your Bridge to Success</small>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-white text-[19px] font-extrabold leading-tight tracking-[-0.04em] mb-3">
              Find your perfect college.
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed">
              Expert guidance for 12th-grade students across India.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-3 mt-8">
            <div className="rounded-[10px] bg-white/15 p-3">
              <div className="text-white text-xl font-extrabold">500+</div>
              <div className="text-white/80 text-[11px] mt-1">Partner Colleges</div>
            </div>
            <div className="rounded-[10px] bg-white/15 p-3">
              <div className="text-white text-xl font-extrabold"></div>
              <div className="text-white/80 text-[11px] mt-1">Scholarships Secured</div>
            </div>
          </div>
        </div>

        <div className="w-full p-8 md:p-10">
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex rounded-[11px] bg-slate-100 border border-slate-200 p-[4px] gap-3">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className={`flex-1 rounded-[8px] px-4 py-2 text-sm font-semibold transition ${activeTab === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className={`flex-1 rounded-[8px] px-4 py-2 text-sm font-semibold transition ${activeTab === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Create account
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-[9px] border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
              >
                Back to home
              </button>
            </div>
            {statusMessage && (
              <div className={`rounded-2xl px-4 py-3 text-sm ${statusType === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {statusMessage}
              </div>
            )}
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <div className="text-2xl font-extrabold text-slate-900 mb-2">Welcome back</div>
                <p className="text-sm text-slate-500">
                  No account? <button type="button" onClick={() => switchTab('register')} className="text-sky-500 font-semibold">Register free</button>
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button type="button" className="flex items-center justify-center gap-2 h-11 rounded-[9px] border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 text-xs font-semibold">G</span>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 h-11 rounded-[9px] border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 text-xs font-semibold">D</span>
                  Discord
                </button>
              </div>
              <div className="divider">or with email</div>
              <div className="space-y-4">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email address</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 pl-11 pr-3 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Password</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="m9 11 3-3 3 3"/>
                  </svg>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full h-11 pl-11 pr-11 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                  >
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-sky-500 text-sm font-semibold">Forgot password?</button>
              </div>
              <button type="submit" className="w-full h-11 rounded-[11px] bg-sky-500 text-white font-semibold transition hover:bg-sky-600">Sign in</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <div className="text-2xl font-extrabold text-slate-900 mb-2">Join ICE Foundation</div>
                <p className="text-sm text-slate-500">
                  Have an account? <button type="button" onClick={() => switchTab('login')} className="text-sky-500 font-semibold">Sign in</button>
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">First name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      placeholder="Arjun"
                      className="w-full h-11 pl-11 pr-3 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Last name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      type="text"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      placeholder="Kumar"
                      className="w-full h-11 pl-11 pr-3 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email address</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 pl-11 pr-3 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Phone number</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 pl-11 pr-3 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Password</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="m9 11 3-3 3 3"/>
                  </svg>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-11 pl-11 pr-11 rounded-[10px] border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                  >
                    {showRegisterPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${strengthValue * 25}%`, backgroundColor: strengthColor[strengthValue] }} />
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: strengthColor[strengthValue] }}>
                    {strengthLabel[strengthValue] || 'Enter a password'}
                  </div>
                </div>
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-sky-500 rounded"
                />
                <span className="leading-6">
                  I agree to the <Link to="/" className="text-sky-500 font-semibold">Terms of Service</Link> and <Link to="/" className="text-sky-500 font-semibold">Privacy Policy</Link>
                </span>
              </label>
              <button type="submit" className="w-full h-11 rounded-[11px] bg-sky-500 text-white font-semibold transition hover:bg-sky-600">Create account</button>
              <p className="text-[11px] text-slate-400 text-center">
                By continuing you agree to our <Link to="/" className="text-sky-500 font-semibold">Terms</Link> & <Link to="/" className="text-sky-500 font-semibold">Privacy Policy</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;

