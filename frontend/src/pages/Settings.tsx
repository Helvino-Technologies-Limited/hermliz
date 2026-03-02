import { useState, memo } from 'react';
import { User, Lock, Info, LogOut } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileForm = memo(({ user }: { user: any }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', { name, phone });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Full Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
});
ProfileForm.displayName = 'ProfileForm';

const PasswordForm = memo(() => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Current Password</label>
        <input type="password" className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
      </div>
      <div>
        <label className="label">New Password</label>
        <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      </div>
      <div>
        <label className="label">Confirm New Password</label>
        <input type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
});
PasswordForm.displayName = 'PasswordForm';

export default function Settings() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password' | 'about'>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Security', icon: Lock },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <Layout title="Settings">
      <h2 className="page-title mb-5">Settings</h2>

      <div className="flex gap-1 p-1 rounded-xl mb-5 w-full md:w-auto md:inline-flex"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-initial justify-center"
            style={{
              background: tab === t.id ? 'var(--surface)' : 'transparent',
              color: tab === t.id ? 'var(--text-1)' : 'var(--text-3)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
            }}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="card max-w-lg">
        {tab === 'profile' && <ProfileForm user={user} />}
        {tab === 'password' && <PasswordForm />}
        {tab === 'about' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white"
                  style={{ background: 'var(--primary)' }}>HIA</div>
                <div>
                  <p className="font-bold">Hermliz Insurance Agency</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>IBMS v1.0.0</p>
                </div>
              </div>
              {[
                ['System', 'Insurance Brokerage Management System'],
                ['Developer', 'Helvino Technologies Limited'],
                ['Website', 'helvino.org'],
                ['Email', 'helvinotech@gmail.com'],
                ['Client', 'Hermliz Insurance Agency'],
                ['Location', 'Bondo, Siaya County, Kenya'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-3)' }}>{k}</span>
                  <span className="font-medium text-right max-w-[60%]" style={{ color: 'var(--text-1)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logout button on mobile */}
      <div className="mt-6 md:hidden">
        <button onClick={logout} className="btn-danger w-full">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </Layout>
  );
}
