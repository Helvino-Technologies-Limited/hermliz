import { useState, useEffect } from 'react';
import { Plus, Eye, RotateCcw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor, getInsuranceClassLabel, daysUntil } from '../utils/helpers';
import toast from 'react-hot-toast';

const CLASSES = [
  { value: 'motor_private', label: 'Motor - Private' },
  { value: 'motor_commercial', label: 'Motor - Commercial' },
  { value: 'motor_psv', label: 'Motor - PSV' },
  { value: 'medical', label: 'Medical' },
  { value: 'life', label: 'Life' },
  { value: 'education', label: 'Education' },
  { value: 'pension', label: 'Pension' },
  { value: 'travel', label: 'Travel' },
  { value: 'fire', label: 'Fire' },
  { value: 'public_liability', label: 'Public Liability' },
  { value: 'professional_indemnity', label: 'Professional Indemnity' },
  { value: 'other', label: 'Other' },
];

interface PolicyFormProps {
  onSave: () => void;
  onClose: () => void;
  prefillClientId?: string;
}

const PolicyForm = ({ onSave, onClose, prefillClientId = '' }: PolicyFormProps) => {
  const [clientId, setClientId] = useState(prefillClientId);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [underwriterId, setUnderwriterId] = useState('');
  const [insuranceClass, setInsuranceClass] = useState('motor_private');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('12');
  const [sumInsured, setSumInsured] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('full');
  const [renewalReminderDays, setRenewalReminderDays] = useState('30');
  const [vehicleReg, setVehicleReg] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [notes, setNotes] = useState('');

  const [clients, setClients] = useState<any[]>([]);
  const [underwriters, setUnderwriters] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  useEffect(() => {
    api.get('/underwriters').then(r => setUnderwriters(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (clientSearch.length > 1) {
      api.get('/clients', { params: { search: clientSearch, limit: 10 } })
        .then(r => { setClients(r.data.data); setShowClientDropdown(true); })
        .catch(() => {});
    } else {
      setShowClientDropdown(false);
    }
  }, [clientSearch]);

  const selectClient = (client: any) => {
    setClientId(client.id);
    setSelectedClientName(`${client.fullName} (${client.phone})`);
    setClientSearch('');
    setShowClientDropdown(false);
    setClients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error('Please search and select a client.');
      return;
    }
    if (!underwriterId) {
      toast.error('Please select an underwriter.');
      return;
    }
    try {
      await api.post('/policies', {
        clientId,
        underwriterId,
        insuranceClass,
        premiumAmount,
        commissionPercent,
        sumInsured: sumInsured || null,
        startDate,
        endDate,
        paymentPlan,
        renewalReminderDays,
        vehicleReg: vehicleReg || null,
        vehicleMake: vehicleMake || null,
        vehicleModel: vehicleModel || null,
        notes: notes || null,
      });
      toast.success('Policy created successfully!');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating policy');
    }
  };

  const commission = premiumAmount && commissionPercent
    ? (parseFloat(premiumAmount) * parseFloat(commissionPercent)) / 100
    : 0;

  const isMotor = insuranceClass?.startsWith('motor');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">

        {/* Client Search */}
        <div className="col-span-2">
          <label className="label">Client <span className="text-red-500">*</span></label>
          {selectedClientName ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium text-sm flex-1">✓ {selectedClientName}</span>
              <button type="button" onClick={() => { setClientId(''); setSelectedClientName(''); }} className="text-xs text-red-500 hover:underline">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                className="input"
                placeholder="Type client name or phone to search..."
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
              />
              {showClientDropdown && clients.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {clients.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectClient(c)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{c.fullName}</div>
                      <div className="text-xs text-gray-500">{c.phone} {c.nationalId ? `· ID: ${c.nationalId}` : ''}</div>
                    </button>
                  ))}
                </div>
              )}
              {clientSearch.length > 1 && clients.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No clients found. <Link to="/clients" className="text-blue-600 hover:underline">Add client first →</Link></p>
              )}
            </div>
          )}
        </div>

        {/* Underwriter */}
        <div>
          <label className="label">Underwriter <span className="text-red-500">*</span></label>
          <select className="input" value={underwriterId} onChange={e => setUnderwriterId(e.target.value)} required>
            <option value="">Select Underwriter</option>
            {underwriters.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {/* Insurance Class */}
        <div>
          <label className="label">Insurance Class <span className="text-red-500">*</span></label>
          <select className="input" value={insuranceClass} onChange={e => setInsuranceClass(e.target.value)}>
            {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Premium */}
        <div>
          <label className="label">Premium Amount (KES) <span className="text-red-500">*</span></label>
          <input type="number" className="input" value={premiumAmount} onChange={e => setPremiumAmount(e.target.value)} required placeholder="e.g. 25000" />
        </div>

        {/* Commission */}
        <div>
          <label className="label">Commission %</label>
          <input type="number" className="input" value={commissionPercent} onChange={e => setCommissionPercent(e.target.value)} placeholder="12" />
        </div>

        {/* Sum Insured */}
        <div>
          <label className="label">Sum Insured (KES)</label>
          <input type="number" className="input" value={sumInsured} onChange={e => setSumInsured(e.target.value)} placeholder="e.g. 1000000" />
        </div>

        {/* Payment Plan */}
        <div>
          <label className="label">Payment Plan</label>
          <select className="input" value={paymentPlan} onChange={e => setPaymentPlan(e.target.value)}>
            <option value="full">Full Payment</option>
            <option value="two_installments">2 Installments</option>
            <option value="three_installments">3 Installments</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="label">Start Date <span className="text-red-500">*</span></label>
          <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>

        {/* End Date */}
        <div>
          <label className="label">End Date <span className="text-red-500">*</span></label>
          <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </div>

        {/* Renewal Reminder */}
        <div>
          <label className="label">Renewal Reminder</label>
          <select className="input" value={renewalReminderDays} onChange={e => setRenewalReminderDays(e.target.value)}>
            <option value="7">7 Days Before</option>
            <option value="14">14 Days Before</option>
            <option value="30">30 Days Before</option>
            <option value="60">60 Days Before</option>
          </select>
        </div>

        {/* Motor fields */}
        {isMotor && (
          <>
            <div>
              <label className="label">Vehicle Reg</label>
              <input className="input" value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} placeholder="e.g. KCA 123A" />
            </div>
            <div>
              <label className="label">Vehicle Make</label>
              <input className="input" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="e.g. Toyota" />
            </div>
            <div>
              <label className="label">Vehicle Model</label>
              <input className="input" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g. Corolla" />
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Commission Preview */}
      {commission > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          💰 <strong>Commission Earned: {formatCurrency(commission)}</strong>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Policy</button>
      </div>
    </form>
  );
};

export default function Policies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', insuranceClass: '' });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/policies', { params: { ...filters, page, limit: 20 } });
      setPolicies(data.data);
      setMeta({ total: data.total, pages: data.pages });
    } catch {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, [filters, page]);

  return (
    <Layout title="Policies">
      <div className="page-header">
        <div>
          <h2 className="page-title">Policy Management</h2>
          <p className="text-sm text-gray-500 mt-1">{meta.total} total policies</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> New Policy
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-4 flex-wrap">
          <select className="input max-w-xs" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="renewed">Renewed</option>
          </select>
          <select className="input max-w-xs" value={filters.insuranceClass} onChange={e => setFilters(f => ({ ...f, insuranceClass: e.target.value }))}>
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : policies.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No policies found"
            description="Create your first policy to get started."
            action={<button onClick={() => setShowForm(true)} className="btn-primary">New Policy</button>}
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Policy #</th><th>Client</th><th>Class</th><th>Underwriter</th>
                    <th>Premium</th><th>Balance</th><th>Expires</th><th>Status</th><th>Actions</th>
                  </tr>
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
                        <td className={parseFloat(p.outstandingBalance) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {formatCurrency(p.outstandingBalance)}
                        </td>
                        <td>
                          <div>{formatDate(p.endDate)}</div>
                          {p.status === 'active' && days <= 30 && (
                            <span className={`badge text-xs ${days <= 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {days}d left
                            </span>
                          )}
                        </td>
                        <td><span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <Link to={`/policies/${p.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye size={14} /></Link>
                            <Link to="/renewals" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Renew"><RotateCcw size={14} /></Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <Pagination page={page} pages={meta.pages} total={meta.total} limit={20} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Policy" size="lg">
        <PolicyForm
          onSave={() => { setShowForm(false); fetchPolicies(); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </Layout>
  );
}
