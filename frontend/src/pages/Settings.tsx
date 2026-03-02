import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Key } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, fetchMe } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/me', profile);
      await fetchMe();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/auth/me/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <Layout title="Settings">
      <h2 className="page-title mb-6">Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><User size={18} className="text-blue-600" /></div>
            <h3 className="font-semibold text-gray-800">Profile Settings</h3>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className="label">Phone</label><input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <span className="font-medium">Role:</span> <span className="capitalize">{user?.role?.replace(/_/g, ' ')}</span>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">Save Profile</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Key size={18} className="text-purple-600" /></div>
            <h3 className="font-semibold text-gray-800">Change Password</h3>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" className="input" value={password.currentPassword} onChange={e => setPassword(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
            <div><label className="label">New Password</label><input type="password" className="input" value={password.newPassword} onChange={e => setPassword(p => ({ ...p, newPassword: e.target.value }))} required /></div>
            <div><label className="label">Confirm New Password</label><input type="password" className="input" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} required /></div>
            <button type="submit" disabled={loading} className="btn-primary">Change Password</button>
          </form>
        </div>

        {/* System Info */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><SettingsIcon size={18} className="text-green-600" /></div>
            <h3 className="font-semibold text-gray-800">System Information</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'System', value: 'Hermliz IBMS' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Agency', value: 'Hermliz Insurance Agency' },
              { label: 'Location', value: 'Bondo, Siaya County' },
              { label: 'Developer', value: 'Helvino Technologies Ltd' },
              { label: 'Website', value: 'helvino.org' },
              { label: 'Support', value: 'helvinotech@gmail.com' },
              { label: 'Phone', value: '0752555679' },
            ].map(i => (
              <div key={i.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs">{i.label}</p>
                <p className="font-semibold text-gray-800 text-xs mt-0.5">{i.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
