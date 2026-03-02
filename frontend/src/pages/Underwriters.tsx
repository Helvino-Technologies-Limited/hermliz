import { useState, useEffect } from 'react';
import { Plus, Building2, Edit } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

// ✅ DEFINED OUTSIDE
const UWForm = ({ initial, onSave, onClose }: { initial?: any; onSave: () => void; onClose: () => void }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    shortName: initial?.shortName || '',
    contactPerson: initial?.contactPerson || '',
    contactPhone: initial?.contactPhone || '',
    contactEmail: initial?.contactEmail || '',
    address: initial?.address || '',
    website: initial?.website || '',
    defaultCommissionRate: initial?.defaultCommissionRate || '12',
    motorCommission: initial?.motorCommission || '',
    medicalCommission: initial?.medicalCommission || '',
    lifeCommission: initial?.lifeCommission || '',
    notes: initial?.notes || '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initial?.id) await api.put(`/underwriters/${initial.id}`, form);
      else await api.post('/underwriters', form);
      toast.success(initial ? 'Underwriter updated!' : 'Underwriter added!');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Company Name <span className="text-red-500">*</span></label>
          <input className="input" value={form.name} onChange={handleChange('name')} required />
        </div>
        <div>
          <label className="label">Short Name <span className="text-red-500">*</span></label>
          <input className="input" value={form.shortName} onChange={handleChange('shortName')} required placeholder="e.g. APA" />
        </div>
        <div>
          <label className="label">Contact Person</label>
          <input className="input" value={form.contactPerson} onChange={handleChange('contactPerson')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.contactPhone} onChange={handleChange('contactPhone')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.contactEmail} onChange={handleChange('contactEmail')} />
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={form.website} onChange={handleChange('website')} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Default Commission %</label>
          <input type="number" className="input" value={form.defaultCommissionRate} onChange={handleChange('defaultCommissionRate')} />
        </div>
        <div>
          <label className="label">Motor Commission %</label>
          <input type="number" className="input" value={form.motorCommission} onChange={handleChange('motorCommission')} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Medical Commission %</label>
          <input type="number" className="input" value={form.medicalCommission} onChange={handleChange('medicalCommission')} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Life Commission %</label>
          <input type="number" className="input" value={form.lifeCommission} onChange={handleChange('lifeCommission')} placeholder="Optional" />
        </div>
        <div className="col-span-2">
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={handleChange('address')} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={handleChange('notes')} />
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
  const [underwriters, setUnderwriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [stats, setStats] = useState<Record<string, any>>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/underwriters');
      setUnderwriters(data.data);
      const statsMap: Record<string, any> = {};
      await Promise.all(
        data.data.map(async (uw: any) => {
          try {
            const s = await api.get(`/underwriters/${uw.id}/stats`);
            statsMap[uw.id] = s.data.data;
          } catch {}
        })
      );
      setStats(statsMap);
    } catch {
      toast.error('Failed to load underwriters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <Layout title="Underwriters">
      <div className="page-header">
        <h2 className="page-title">Underwriter Management</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} /> Add Underwriter
        </button>
      </div>

      {loading ? <LoadingSpinner /> : underwriters.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No underwriters"
          description="Add your partner underwriters."
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Add Underwriter</button>}
        />
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
                  <button onClick={() => { setEditing(uw); setShowForm(true); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Edit size={15} />
                  </button>
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
                  Default Commission: <strong>{uw.defaultCommissionRate}%</strong>
                  {uw.contactPhone && <span> · {uw.contactPhone}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Underwriter' : 'Add Underwriter'} size="lg">
        <UWForm
          initial={editing}
          onSave={() => { setShowForm(false); fetchAll(); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </Layout>
  );
}
