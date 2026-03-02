import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
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
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">HIA</div>
            <div>
              <div className="font-bold text-xl">Hermliz Insurance Agency</div>
              <div className="text-blue-300 text-sm">A Credible, Reliable Insurance Partner</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Insurance Brokerage<br />Management System</h1>
          <p className="text-blue-200 text-lg">Complete digital solution for managing policies, clients, renewals, and revenue.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {['No Forgotten Debts','No Missed Renewals','Full Client Visibility','Automated Alerts'].map(f => (
            <div key={f} className="bg-white/10 rounded-xl p-4 text-sm font-medium">✓ {f}</div>
          ))}
        </div>
        <p className="text-blue-300 text-sm">Developed by Helvino Technologies Limited · helvino.org</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Shield size={20} className="text-white" /></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-500 text-sm">Access your dashboard</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : 'Sign In'}
              </button>
            </form>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
              <strong>Demo:</strong> admin@hermliz.com / Admin@1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
