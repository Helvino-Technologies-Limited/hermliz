import { useState, useEffect } from 'react';
import { Plus, Shield, Edit } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

// ✅ DEFINED OUTSIDE
const ClaimForm = ({ initial, onSave, onClose }: { initial?: any; onSave: () => void; onClose: () => void }) => {
  const [policyId, setPolicyId] = useState(initial?.policyId || '');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(initial?.policy || null);
  const [policySearch, setPolicySearch] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [form, setForm] = useState({
    incidentDate: initial?.incidentDate || '',
    reportedDate: initial?.reportedDate || new Date().toISOString().split('T')[0],
    claimAmount: initial?.claimAmount || '',
    approvedAmount: initial?.approvedAmount || '',
    description: initial?.description || '',
    nextFollowUpDate: initial?.nextFollowUpDate || '',
    status: initial?.status || 'reported',
    notes: initial?.notes || '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    if (policySearch.length > 1) {
      api.get('/policies', { params: { search: policySearch, limit: 10 } })
        .then(r => { setPolicies(r.data.data); setShowDropdown(true); })
        .catch(() => {});
    } else {
      setShowDropdown(false);
    }
  }, [policySearch]);

  const selectPolicy = (p: any) => {
    setPolicyId(p.id);
    setSelectedPolicy(p);
    setPolicySearch('');
    setShowDropdown(false);
    setPolicies([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initial && !policyId) { toast.error('Please select a policy.'); return; }
    try {
      const payload = { ...form, policyId: initial ? initial.policyId : policyId };
      if (initial?.id) await api.put(`/claims/${initial.id}`, payload);
      else await api.post('/claims', payload);
      toast.success(initial ? 'Claim updated!' : 'Claim registered!');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving claim');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initial && (
        <div>
          <label className="label">Policy <span className="text-red-500">*</span></label>
          {selectedPolicy ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium text-sm flex-1">
                ✓ {selectedPolicy.policyNumber} — {selectedPolicy.client?.fullName}
              </span>
              <button type="button" onClick={() => { setPolicyId(''); setSelectedPolicy(null); }} className="text-xs text-red-500 hover:underline">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                className="input"
                placeholder="Search by policy number or client name..."
                value={policySearch}
                onChange={e => setPolicySearch(e.target.value)}
              />
              {showDropdown && policies.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {policies.map(p => (
                    <button key={p.id} type="button" onClick={() => selectPolicy(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0">
                      <div className="font-medium">{p.policyNumber}</div>
                      <div className="text-xs text-gray-500">{p.client?.fullName} · {p.insuranceClass?.replace(/_/g, ' ')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Incident Date</label>
          <input type="date" className="input" value={form.incidentDate} onChange={handleChange('incidentDate')} />
        </div>
        <div>
          <label className="label">Reported Date</label>
          <input type="date" className="input" value={form.reportedDate} onChange={handleChange('reportedDate')} />
        </div>
        <div>
          <label className="label">Claim Amount (KES)</label>
          <input type="number" className="input" value={form.claimAmount} onChange={handleChange('claimAmount')} placeholder="0" />
        </div>
        <div>
          <label className="label">Next Follow Up</label>
          <input type="date" className="input" value={form.nextFollowUpDate} onChange={handleChange('nextFollowUpDate')} />
        </div>
        {initial && (
          <>
            <div>
              <label className="label">Approved Amount (KES)</label>
              <input type="number" className="input" value={form.approvedAmount} onChange={handleChange('approvedAmount')} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={handleChange('status')}>
                <option value="reported">Reported</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={handleChange('description')} placeholder="Describe what happened..." />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={form.notes} onChange={handleChange('notes')} />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Update Claim' : 'Register Claim'}</button>
      </div>
    </form>
  );
};

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/claims', { params: { status: filter, page, limit: 20 } });
      setClaims(data.data);
      setMeta({ total: data.total, pages: data.pages });
    } catch {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, [filter, page]);

  const statuses = [
    { v: '', l: 'All' }, { v: 'reported', l: 'Reported' },
    { v: 'under_review', l: 'Under Review' }, { v: 'approved', l: 'Approved' },
    { v: 'paid', l: 'Paid' }, { v: 'closed', l: 'Closed' },
  ];

  return (
    <Layout title="Claims">
      <div className="page-header">
        <div>
          <h2 className="page-title">Claims Management</h2>
          <p className="text-sm text-gray-500 mt-1">{meta.total} total claims</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} /> Register Claim
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s.v} onClick={() => { setFilter(s.v); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : claims.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No claims registered"
            description="Register your first claim."
            action={<button onClick={() => setShowForm(true)} className="btn-primary">Register Claim</button>}
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Claim #</th><th>Client</th><th>Policy</th><th>Underwriter</th>
                    <th>Amount</th><th>Incident</th><th>Follow Up</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {claims.map(c => (
                    <tr key={c.id}>
                      <td className="font-medium text-blue-700">{c.claimNumber}</td>
                      <td>{c.client?.fullName}</td>
                      <td>{c.policy?.policyNumber}</td>
                      <td>{c.underwriter?.shortName}</td>
                      <td>{formatCurrency(c.claimAmount)}</td>
                      <td>{formatDate(c.incidentDate)}</td>
                      <td className={c.nextFollowUpDate && new Date(c.nextFollowUpDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                        {formatDate(c.nextFollowUpDate)}
                      </td>
                      <td><span className={`badge ${getStatusColor(c.status)}`}>{c.status?.replace('_', ' ')}</span></td>
                      <td>
                        <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <Pagination page={page} pages={meta.pages} total={meta.total} limit={20} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Update Claim' : 'Register Claim'} size="lg">
        <ClaimForm
          initial={editing}
          onSave={() => { setShowForm(false); fetchClaims(); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </Layout>
  );
}
