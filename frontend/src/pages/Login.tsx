import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('admin@hermliz.com');
  const [password, setPassword] = useState('Admin@1234');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const features = ['No Forgotten Debts', 'No Missed Renewals', 'Full Client Visibility', 'Automated Alerts'];

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
            style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
            Insurance Brokerage<br />Management System
          </h1>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Complete digital solution for managing policies, clients, renewals, and revenue — all in one place.
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

        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Developed by Helvino Technologies Limited · helvino.org
        </p>
      </div>

      {/* Right panel — form */}
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

          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--primary-light)' }}>
                <Shield size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="font-bold text-2xl" style={{ color: 'var(--text-1)' }}>Sign In</h2>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ height: 46 }}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-12"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ height: 46 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--text-3)' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full"
              style={{ height: 46, fontSize: 15, marginTop: 8 }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--primary-light)', border: '1px solid #d6e2ff' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>Demo Credentials</p>
            <p className="text-xs" style={{ color: '#1342b0' }}>admin@hermliz.com · Admin@1234</p>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
            Powered by Helvino Technologies Limited
          </p>
        </div>
      </div>
    </div>
  );
}
