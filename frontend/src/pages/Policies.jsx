import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, RotateCcw, FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor, getInsuranceClassLabel, daysUntil } from '../utils/helpers';
import toast from 'react-hot-toast';

const CLASSES = [
  { value: 'motor_private', label: 'Motor - Private' }, { value: 'motor_commercial', label: 'Motor - Commercial' },
  { value: 'motor_psv', label: 'Motor - PSV' }, { value: 'medical', label: 'Medical' },
  { value: 'life', label: 'Life' }, { value: 'education', label: 'Education' },
  { value: 'pension', label: 'Pension' }, { value: 'travel', label: 'Travel' },
  { value: 'fire', label: 'Fire' }, { value: 'public_liability', label: 'Public Liability' },
  { value: 'professional_indemnity', label: 'Professional Indemnity' }, { value: 'other', label: 'Other' },
];

const PolicyForm = ({ onSave, onClose, prefillClientId }) => {
  const [form, setForm] = useState({
    clientId: prefillClientId || '', underwriterId: '', insuranceClass: 'motor_private',
    premiumAmount: '', commissionPercent: '12', sumInsured: '', startDate: '', endDate: '',
    paymentPlan: 'full', renewalReminderDays: '30', vehicleReg: '', vehicleMake: '', vehicleModel: '', notes: '',
  });
  const [clients, setClients] = useState([]);
  const [underwriters, setUnderwriters] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/underwriters').then(r => setUnderwriters(r.data.data));
  }, []);

  useEffect(() => {
    if (clientSearch.length > 1) api.get('/clients', { params: { search: clientSearch, limit: 10 } }).then(r => setClients(r.data.data));
  }, [clientSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/policies', form);
      toast.success('Policy created successfully!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const Field = ({ label, k, type = 'text', required, children }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
      {children || <input type={type} className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} required={required} />}
    </div>
  );

  const isMotor = form.insuranceClass?.startsWith('motor');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Select Client" required>
          <input className="input mb-1" placeholder="Search client..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
          {clients.length > 0 && (
            <select className="input" value={form.clientId} onChange={e => { set('clientId', e.target.value); setClientSearch(''); setClients([]); }} required>
              <option value="">-- Select --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>)}
            </select>
          )}
        </Field>
        <Field label="Underwriter" required>
          <select className="input" value={form.underwriterId} onChange={e => set('underwriterId', e.target.value)} required>
            <option value="">Select Underwriter</option>
            {underwriters.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <Field label="Insurance Class" required>
          <select className="input" value={form.insuranceClass} onChange={e => set('insuranceClass', e.target.value)}>
            {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Payment Plan" required>
          <select className="input" value={form.paymentPlan} onChange={e => set('paymentPlan', e.target.value)}>
            <option value="full">Full Payment</option>
            <option value="two_installments">2 Installments</option>
            <option value="three_installments">3 Installments</option>
          </select>
        </Field>
        <Field label="Sum Insured (KES)" k="sumInsured" type="number" />
        <Field label="Premium Amount (KES)" k="premiumAmount" required type="number" />
        <Field label="Commission %" k="commissionPercent" type="number" />
        <Field label="Start Date" k="startDate" type="date" required />
        <Field label="End Date" k="endDate" type="date" required />
        <Field label="Renewal Reminder (days before)">
          <select className="input" value={form.renewalReminderDays} onChange={e => set('renewalReminderDays', e.target.value)}>
            <option value="7">7 Days</option><option value="14">14 Days</option>
            <option value="30">30 Days</option><option value="60">60 Days</option>
          </select>
        </Field>
        {isMotor && <>
          <Field label="Vehicle Reg" k="vehicleReg" />
          <Field label="Vehicle Make" k="vehicleMake" />
          <Field label="Vehicle Model" k="vehicleModel" />
        </>}
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
      </div>
      {form.premiumAmount && form.commissionPercent && (
        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <strong>Commission: {formatCurrency((form.premiumAmount * form.commissionPercent) / 100)}</strong>
        </div>
      )}
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Policy</button>
      </div>
    </form>
  );
};

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', insuranceClass: '' });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [searchParams] = useSearchParams();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/policies', { params: { ...filters, page, limit: 20 } });
      setPolicies(data.data);
      setMeta({ total: data.total, pages: data.pages });
    } catch { toast.error('Failed to load policies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filters, page]);

  return (
    <Layout title="Policies">
      <div className="page-header">
        <div>
          <h2 className="page-title">Policy Management</h2>
          <p className="text-sm text-gray-500 mt-1">{meta.total} total policies</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> New Policy</button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-4">
          <select className="input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="active">Active</option><option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option><option value="renewed">Renewed</option>
          </select>
          <select className="input" value={filters.insuranceClass} onChange={e => setFilters(f => ({ ...f, insuranceClass: e.target.value }))}>
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : policies.length === 0 ? (
          <EmptyState icon={FileText} title="No policies found" description="Create your first policy." action={<button onClick={() => setShowForm(true)} className="btn-primary">New Policy</button>} />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Policy #</th><th>Client</th><th>Class</th><th>Underwriter</th><th>Premium</th><th>Balance</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {policies.map(p => {
                    const days = daysUntil(p.endDate);
                    return (
                      <tr key={p.id}>
                        <td><span className="font-medium text-blue-700">{p.policyNumber}</span></td>
                        <td>
                          <div className="font-medium">{p.client?.fullName}</div>
                          {p.vehicleReg && <div className="text-xs text-gray-500">{p.vehicleReg}</div>}
                        </td>
                        <td className="text-xs">{getInsuranceClassLabel(p.insuranceClass)}</td>
                        <td>{p.underwriter?.shortName}</td>
                        <td className="font-medium">{formatCurrency(p.premiumAmount)}</td>
                        <td className={parseFloat(p.outstandingBalance) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{formatCurrency(p.outstandingBalance)}</td>
                        <td>
                          <div>{formatDate(p.endDate)}</div>
                          {p.status === 'active' && days <= 30 && <span className={`badge text-xs ${days <= 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{days}d left</span>}
                        </td>
                        <td><span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <Link to={`/policies/${p.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={14} /></Link>
                            <Link to={`/policies/${p.id}/renew`} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><RotateCcw size={14} /></Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4"><Pagination page={page} pages={meta.pages} total={meta.total} limit={20} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Policy" size="lg">
        <PolicyForm onSave={() => { setShowForm(false); fetch(); }} onClose={() => setShowForm(false)} />
      </Modal>
    </Layout>
  );
}
