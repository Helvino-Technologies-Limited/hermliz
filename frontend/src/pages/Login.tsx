import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, EMAIL_KEY, REMEMBER_KEY } from '../context/AuthContext';
import { Eye, EyeOff, Shield, CheckCircle, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

type View = 'login' | 'forgot' | 'verify' | 'reset';

const features = [
  'No Forgotten Debts',
  'No Missed Renewals',
  'Full Client Visibility',
  'Automated Alerts',
];

export default function Login() {
  const savedEmail = localStorage.getItem(EMAIL_KEY) || '';
  const savedRemember = localStorage.getItem(REMEMBER_KEY) === 'true';

  const [view, setView] = useState<View>('login');

  // Login state
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(savedRemember);
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot password state
  const [fpEmail, setFpEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [devCode, setDevCode] = useState('');

  // Verify code state
  const [code, setCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // --- LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(email, password, remember);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: fpEmail });
      if (data.devCode) {
        setDevCode(data.devCode);
        toast.success('Dev mode: code shown below');
      } else {
        toast.success('Reset code sent to your email!');
      }
      setView('verify');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setFpLoading(false);
    }
  };

  // --- VERIFY CODE ---
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setView('reset');
  };

  // --- RESET PASSWORD ---
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { email: fpEmail, code, newPassword });
      toast.success('Password reset successfully! Please log in.');
      setEmail(fpEmail);
      setPassword('');
      setView('login');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--surface-2)' }}>

      {/* Left panel — desktop only */}
      <div className="hidden md:flex w-[45%] flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1a56db 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 80%, #60a5fa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 50%)' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              HIA
            </div>
            <div>
              <div className="font-bold text-white text-base">Hermliz Insurance Agency</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>A Credible, Reliable Insurance Partner</div>
            </div>
          </div>

          <h1 className="font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
            Insurance Brokerage<br />Management System
          </h1>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Complete digital solution for managing policies, clients, renewals, and revenue.
          </p>

          <div className="space-y-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Developed by Helvino Technologies Limited · helvino.org
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'var(--primary)' }}>HIA</div>
            <div>
              <div className="font-bold text-sm">Hermliz Insurance Agency</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>IBMS v1.0</div>
            </div>
          </div>

          {/* ===== LOGIN VIEW ===== */}
          {view === 'login' && (
            <div className="fade-in">
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--primary-light)' }}>
                    <Shield size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h2 className="font-bold text-2xl" style={{ color: 'var(--text-1)' }}>Sign In</h2>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                  Enter your credentials to access your dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@hermliz.com"
                    style={{ height: 46 }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label" style={{ marginBottom: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => { setFpEmail(email); setView('forgot'); }}
                      className="text-xs font-medium hover:underline"
                      style={{ color: 'var(--primary)' }}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input pr-12"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      style={{ height: 46 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: 'var(--text-3)' }}>
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setRemember(!remember)}
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: remember ? 'var(--primary)' : 'var(--surface)',
                      border: `2px solid ${remember ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                    {remember && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>Remember me for 7 days</span>
                </label>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-primary w-full"
                  style={{ height: 46, fontSize: 15, marginTop: 4 }}>
                  {loginLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    : 'Sign In'
                  }
                </button>
              </form>

              <p className="text-center text-xs mt-8" style={{ color: 'var(--text-3)' }}>
                Powered by Helvino Technologies Limited
              </p>
            </div>
          )}

          {/* ===== FORGOT PASSWORD VIEW ===== */}
          {view === 'forgot' && (
            <div className="fade-in">
              <button
                onClick={() => setView('login')}
                className="flex items-center gap-1.5 text-sm mb-8 font-medium"
                style={{ color: 'var(--text-2)' }}>
                <ArrowLeft size={16} /> Back to sign in
              </button>

              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--primary-light)' }}>
                  <Mail size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <h2 className="font-bold text-2xl mb-2" style={{ color: 'var(--text-1)' }}>Forgot Password?</h2>
                <p className="text-sm" style={{ color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Enter your email address and we'll send you a 6-digit reset code.
                </p>
              </div>

              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    value={fpEmail}
                    onChange={e => setFpEmail(e.target.value)}
                    required
                    placeholder="you@hermliz.com"
                    autoFocus
                    style={{ height: 46 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={fpLoading}
                  className="btn-primary w-full"
                  style={{ height: 46, fontSize: 15 }}>
                  {fpLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    : 'Send Reset Code'
                  }
                </button>
              </form>
            </div>
          )}

          {/* ===== VERIFY CODE VIEW ===== */}
          {view === 'verify' && (
            <div className="fade-in">
              <button
                onClick={() => setView('forgot')}
                className="flex items-center gap-1.5 text-sm mb-8 font-medium"
                style={{ color: 'var(--text-2)' }}>
                <ArrowLeft size={16} /> Back
              </button>

              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: '#dcfce7' }}>
                  <KeyRound size={22} style={{ color: '#16a34a' }} />
                </div>
                <h2 className="font-bold text-2xl mb-2" style={{ color: 'var(--text-1)' }}>Enter Reset Code</h2>
                <p className="text-sm" style={{ color: 'var(--text-3)', lineHeight: 1.6 }}>
                  We sent a 6-digit code to <strong>{fpEmail}</strong>. Check your inbox.
                </p>
              </div>

              {/* Dev mode code display */}
              {devCode && (
                <div className="mb-4 p-4 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde047' }}>
                  <p className="text-xs font-bold text-yellow-800 mb-1">⚠️ Dev Mode — Email not configured</p>
                  <p className="text-xs text-yellow-700">Your code is: <strong className="font-mono text-base tracking-widest">{devCode}</strong></p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="label">6-Digit Code</label>
                  <input
                    className="input text-center font-mono text-2xl tracking-[0.3em]"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    style={{ height: 56 }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  style={{ height: 46, fontSize: 15 }}
                  disabled={code.length !== 6}>
                  Verify Code
                </button>
                <button
                  type="button"
                  onClick={() => handleForgot({ preventDefault: () => {} } as any)}
                  className="w-full text-sm text-center"
                  style={{ color: 'var(--primary)' }}>
                  Resend code
                </button>
              </form>
            </div>
          )}

          {/* ===== RESET PASSWORD VIEW ===== */}
          {view === 'reset' && (
            <div className="fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--primary-light)' }}>
                  <Shield size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <h2 className="font-bold text-2xl mb-2" style={{ color: 'var(--text-1)' }}>New Password</h2>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="input pr-12"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="Min. 6 characters"
                      autoFocus
                      style={{ height: 46 }}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: 'var(--text-3)' }}>
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    style={{ height: 46 }}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || newPassword !== confirmPassword}
                  className="btn-primary w-full"
                  style={{ height: 46, fontSize: 15 }}>
                  {resetLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                    : 'Reset Password'
                  }
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
