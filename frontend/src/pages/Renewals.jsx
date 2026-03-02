import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import api from '../utils/api';
import { formatCurrency, formatDate, daysUntil, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const RenewalStatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-700', contacted: 'bg-blue-100 text-blue-700',
    quoted: 'bg-purple-100 text-purple-700', renewed: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700',
  };
  return <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
};

const RenewForm = ({ policy, onSave, onClose }) => {
  const start = new Date(policy.endDate);
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  const [form, setForm] = useState({
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    premiumAmount: policy.premiumAmount,
    commissionPercent: policy.commissionPercent,
    paymentPlan: policy.paymentPlan,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/policies/${policy.id}/renew`, form);
      toast.success('Policy renewed!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <strong>{policy.client?.fullName}</strong> · {policy.policyNumber} · {policy.underwriter?.shortName}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">New Start Date</label><input type="date" className="input" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></div>
        <div><label className="label">New End Date</label><input type="date" className="input" value={form.endDate} onChange={e => set('endDate', e.target.value)} required /></div>
        <div><label className="label">Premium (KES)</label><input type="number" className="input" value={form.premiumAmount} onChange={e => set('premiumAmount', e.target.value)} required /></div>
        <div><label className="label">Commission %</label><input type="number" className="input" value={form.commissionPercent} onChange={e => set('commissionPercent', e.target.value)} /></div>
        <div><label className="label">Payment Plan</label>
          <select className="input" value={form.paymentPlan} onChange={e => set('paymentPlan', e.target.value)}>
            <option value="full">Full</option><option value="two_installments">2 Installments</option><option value="three_installments">3 Installments</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary"><RotateCcw size={14} /> Renew Policy</button>
      </div>
    </form>
  );
};

export default function Renewals() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [renewModal, setRenewModal] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/policies/expiring', { params: { days } });
      setPolicies(data.data);
    } catch { toast.error('Failed to load renewals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [days]);

  const updateStatus = async (id, renewalStatus) => {
    try {
      await api.put(`/policies/${id}/renewal-status`, { renewalStatus });
      toast.success('Status updated!');
      fetch();
    } catch { toast.error('Error'); }
  };

  return (
    <Layout title="Renewals">
      <div className="page-header">
        <div>
          <h2 className="page-title">Renewal Management</h2>
          <p className="text-sm text-gray-500 mt-1">{policies.length} policies expiring in {days} days</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 60].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-2 rounded-lg text-sm font-medium ${days === d ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : policies.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No expiring policies" description={`No policies expiring in the next ${days} days.`} />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Client</th><th>Policy #</th><th>Class</th><th>Underwriter</th><th>Premium</th><th>Expiry</th><th>Days Left</th><th>Renewal Status</th><th>Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {policies.map(p => {
                  const d = daysUntil(p.endDate);
                  return (
                    <tr key={p.id}>
                      <td className="font-medium">{p.client?.fullName}</td>
                      <td className="text-blue-700">{p.policyNumber}</td>
                      <td className="text-xs">{p.insuranceClass?.replace(/_/g, ' ')}</td>
                      <td>{p.underwriter?.shortName}</td>
                      <td>{formatCurrency(p.premiumAmount)}</td>
                      <td>{formatDate(p.endDate)}</td>
                      <td><span className={`badge font-bold ${d <= 7 ? 'bg-red-100 text-red-700' : d <= 14 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{d} days</span></td>
                      <td>
                        <select
                          value={p.renewalStatus}
                          onChange={e => updateStatus(p.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option><option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option><option value="renewed">Renewed</option><option value="lost">Lost</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => setRenewModal(p)} className="btn-success py-1 px-3 text-xs">
                          <RotateCcw size={12} /> Renew
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!renewModal} onClose={() => setRenewModal(null)} title="Renew Policy">
        {renewModal && <RenewForm policy={renewModal} onSave={() => { setRenewModal(null); fetch(); }} onClose={() => setRenewModal(null)} />}
      </Modal>
    </Layout>
  );
}
