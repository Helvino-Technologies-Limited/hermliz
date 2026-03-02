import { useState, useEffect, memo } from 'react';
import { Plus, Building2, Edit } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const UWForm = memo(({ initial, onSave, onClose }: {
  initial?: any;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(initial?.name || '');
  const [shortName, setShortName] = useState(initial?.shortName || '');
  const [contactPerson, setContactPerson] = useState(initial?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [website, setWebsite] = useState(initial?.website || '');
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(initial?.defaultCommissionRate?.toString() || '12');
  const [motorCommission, setMotorCommission] = useState(initial?.motorCommission?.toString() || '');
  const [medicalCommission, setMedicalCommission] = useState(initial?.medicalCommission?.toString() || '');
  const [lifeCommission, setLifeCommission] = useState(initial?.lifeCommission?.toString() || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name, shortName, contactPerson, contactPhone, contactEmail,
        address, website, defaultCommissionRate,
        motorCommission: motorCommission || null,
        medicalCommission: medicalCommission || null,
        lifeCommission: lifeCommission || null,
        notes,
      };
      if (initial?.id) await api.put(`/underwriters/${initial.id}`, payload);
      else await api.post('/underwriters', payload);
      toast.success(initial ? 'Underwriter updated!' : 'Underwriter added!');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Company Name <span className="text-red-500">*</span></label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="label">Short Name <span className="text-red-500">*</span></label>
          <input className="input" value={shortName} onChange={e => setShortName(e.target.value)} required placeholder="e.g. APA" />
        </div>
        <div>
          <label className="label">Contact Person</label>
          <input className="input" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Default Commission %</label>
          <input type="number" className="input" value={defaultCommissionRate} onChange={e => setDefaultCommissionRate(e.target.value)} />
        </div>
        <div>
          <label className="label">Motor Commission %</label>
          <input type="number" className="input" value={motorCommission} onChange={e => setMotorCommission(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Medical Commission %</label>
          <input type="number" className="input" value={medicalCommission} onChange={e => setMedicalCommission(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Life Commission %</label>
          <input type="number" className="input" value={lifeCommission} onChange={e => setLifeCommission(e.target.value)} placeholder="Optional" />
        </div>
        <div className="col-span-2">
          <label className="label">Address</label>
          <input className="input" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Update' : 'Add Underwriter'}
        </button>
      </div>
    </form>
  );
});
UWForm.displayName = 'UWForm';

export default function Underwriters() {
  const [underwriters, setUnderwriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [modalKey, setModalKey] = useState(0);
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

  const openAdd = () => {
    setEditing(null);
    setModalKey(k => k + 1);
    setShowForm(true);
  };

  const openEdit = (uw: any) => {
    setEditing(uw);
    setModalKey(k => k + 1);
    setShowForm(true);
  };

  return (
    <Layout title="Underwriters">
      <div className="page-header">
        <h2 className="page-title">Underwriter Management</h2>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Underwriter
        </button>
      </div>

      {loading ? <LoadingSpinner /> : underwriters.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No underwriters"
          description="Add your partner underwriters."
          action={<button onClick={openAdd} className="btn-primary">Add Underwriter</button>}
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
                  <button onClick={() => openEdit(uw)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
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

      <Modal
        key={modalKey}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Underwriter' : 'Add Underwriter'}
        size="lg"
      >
        <UWForm
          key={modalKey}
          initial={editing}
          onSave={() => { setShowForm(false); fetchAll(); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </Layout>
  );
}
