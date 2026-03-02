import React, { useState, useEffect } from 'react';
import { Plus, Shield, Edit } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const ClaimForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {
    policyId: '', incidentDate: '', reportedDate: new Date().toISOString().split('T')[0],
    claimAmount: '', description: '', nextFollowUpDate: '', notes: '',
  });
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (search.length > 1) api.get('/policies', { params: { search, limit: 10 } }).then(r => setPolicies(r.data.data)).catch(() => {});
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initial?.id) await api.put(`/claims/${initial.id}`, form);
      else await api.post('/claims', form);
      toast.success(initial ? 'Claim updated!' : 'Claim registered!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initial && (
        <div>
          <label className="label">Search Policy *</label>
          <input className="input mb-1" placeholder="Search by policy # or client..." value={search} onChange={e => setSearch(e.target.value)} />
          {policies.length > 0 && (
            <select className="input" value={form.policyId} onChange={e => { set('policyId', e.target.value); setSearch(''); setPolicies([]); }} required>
              <option value="">-- Select Policy --</option>
              {policies.map(p => <option key={p.id} value={p.id}>{p.policyNumber} - {p.client?.fullName}</option>)}
            </select>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Incident Date</label><input type="date" className="input" value={form.incidentDate} onChange={e => set('incidentDate', e.target.value)} /></div>
        <div><label className="label">Reported Date</label><input type="date" className="input" value={form.reportedDate} onChange={e => set('reportedDate', e.target.value)} /></div>
        <div><label className="label">Claim Amount (KES)</label><input type="number" className="input" value={form.claimAmount} onChange={e => set('claimAmount', e.target.value)} /></div>
        <div><label className="label">Next Follow Up</label><input type="date" className="input" value={form.nextFollowUpDate || ''} onChange={e => set('nextFollowUpDate', e.target.value)} /></div>
        {initial && (
          <>
            <div><label className="label">Approved Amount</label><input type="number" className="input" value={form.approvedAmount || ''} onChange={e => set('approvedAmount', e.target.value)} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="reported">Reported</option><option value="under_review">Under Review</option>
                <option value="approved">Approved</option><option value="rejected">Rejected</option>
                <option value="paid">Paid</option><option value="closed">Closed</option>
              </select>
            </div>
          </>
        )}
      </div>
      <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Update Claim' : 'Register Claim'}</button>
      </div>
    </form>
  );
};

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/claims', { params: { status: filter, page, limit: 20 } });
      setClaims(data.data);
      setMeta({ total: data.total, pages: data.pages });
    } catch { toast.error('Failed to load claims'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter, page]);

  return (
    <Layout title="Claims">
      <div className="page-header">
        <div><h2 className="page-title">Claims Management</h2><p className="text-sm text-gray-500 mt-1">{meta.total} total claims</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Register Claim</button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2 flex-wrap">
          {[{ v: '', l: 'All' }, { v: 'reported', l: 'Reported' }, { v: 'under_review', l: 'Under Review' }, { v: 'approved', l: 'Approved' }, { v: 'paid', l: 'Paid' }, { v: 'closed', l: 'Closed' }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.l}</button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : claims.length === 0 ? (
          <EmptyState icon={Shield} title="No claims" description="No claims registered yet." action={<button onClick={() => setShowForm(true)} className="btn-primary">Register Claim</button>} />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Claim #</th><th>Client</th><th>Policy</th><th>Underwriter</th><th>Claim Amount</th><th>Incident</th><th>Follow Up</th><th>Status</th><th>Action</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {claims.map(c => (
                    <tr key={c.id}>
                      <td className="font-medium text-blue-700">{c.claimNumber}</td>
                      <td>{c.client?.fullName}</td>
                      <td>{c.policy?.policyNumber}</td>
                      <td>{c.underwriter?.shortName}</td>
                      <td>{formatCurrency(c.claimAmount)}</td>
                      <td>{formatDate(c.incidentDate)}</td>
                      <td className={c.nextFollowUpDate && new Date(c.nextFollowUpDate) < new Date() ? 'text-red-600 font-medium' : ''}>{formatDate(c.nextFollowUpDate)}</td>
                      <td><span className={`badge ${getStatusColor(c.status)}`}>{c.status?.replace('_', ' ')}</span></td>
                      <td><button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4"><Pagination page={page} pages={meta.pages} total={meta.total} limit={20} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Update Claim' : 'Register Claim'} size="lg">
        <ClaimForm initial={editing} onSave={() => { setShowForm(false); fetch(); }} onClose={() => setShowForm(false)} />
      </Modal>
    </Layout>
  );
}
