import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const UWForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {
    name: '', shortName: '', contactPerson: '', contactPhone: '', contactEmail: '',
    address: '', website: '', defaultCommissionRate: '12',
    motorCommission: '', medicalCommission: '', lifeCommission: '', notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initial?.id) await api.put(`/underwriters/${initial.id}`, form);
      else await api.post('/underwriters', form);
      toast.success(initial ? 'Underwriter updated!' : 'Underwriter added!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const Field = ({ label, k, type = 'text', required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
      <input type={type} className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} required={required} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company Name" k="name" required />
        <Field label="Short Name" k="shortName" required />
        <Field label="Contact Person" k="contactPerson" />
        <Field label="Phone" k="contactPhone" />
        <Field label="Email" k="contactEmail" type="email" />
        <Field label="Website" k="website" />
        <Field label="Default Commission %" k="defaultCommissionRate" type="number" />
        <Field label="Motor Commission %" k="motorCommission" type="number" />
        <Field label="Medical Commission %" k="medicalCommission" type="number" />
        <Field label="Life Commission %" k="lifeCommission" type="number" />
        <div className="col-span-2">
          <label className="label">Address</label>
          <input className="input" value={form.address || ''} onChange={e => set('address', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Update' : 'Add Underwriter'}</button>
      </div>
    </form>
  );
};

export default function Underwriters() {
  const [underwriters, setUnderwriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [stats, setStats] = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/underwriters');
      setUnderwriters(data.data);
      const statsMap = {};
      for (const uw of data.data) {
        try {
          const s = await api.get(`/underwriters/${uw.id}/stats`);
          statsMap[uw.id] = s.data.data;
        } catch {}
      }
      setStats(statsMap);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <Layout title="Underwriters">
      <div className="page-header">
        <h2 className="page-title">Underwriter Management</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Add Underwriter</button>
      </div>

      {loading ? <LoadingSpinner /> : underwriters.length === 0 ? (
        <EmptyState icon={Building2} title="No underwriters" description="Add your partner underwriters." action={<button onClick={() => setShowForm(true)} className="btn-primary">Add Underwriter</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {underwriters.map(uw => {
            const s = stats[uw.id] || {};
            return (
              <div key={uw.id} className="card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="font-bold text-blue-700 text-sm">{uw.shortName}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{uw.name}</div>
                      <div className="text-xs text-gray-500">{uw.contactPerson}</div>
                    </div>
                  </div>
                  <button onClick={() => { setEditing(uw); setShowForm(true); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Edit size={15} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500 text-xs">Active Policies</div>
                    <div className="font-bold text-gray-900">{s.activePolicies || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500 text-xs">Total Premium</div>
                    <div className="font-bold text-gray-900">{formatCurrency(s.totalPremium || 0)}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 col-span-2">
                    <div className="text-blue-600 text-xs">Commission Earned</div>
                    <div className="font-bold text-blue-700">{formatCurrency(s.totalCommission || 0)}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Default Commission: <strong>{uw.defaultCommissionRate}%</strong> · {uw.contactPhone}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Underwriter' : 'Add Underwriter'} size="lg">
        <UWForm initial={editing} onSave={() => { setShowForm(false); fetch(); }} onClose={() => setShowForm(false)} />
      </Modal>
    </Layout>
  );
}
