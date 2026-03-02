import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const PaymentForm = ({ installment, onSave, onClose }) => {
  const [form, setForm] = useState({
    amount: installment.amountDue - installment.amountPaid,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'mpesa',
    transactionRef: '',
    receiptNumber: '',
    notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/installments/${installment.id}/payment`, form);
      toast.success('Payment recorded!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <div className="font-semibold text-blue-900">{installment.policy?.client?.fullName}</div>
        <div className="text-blue-700">Policy: {installment.policy?.policyNumber}</div>
        <div className="text-blue-700">Due: {formatCurrency(installment.amountDue)} · Paid: {formatCurrency(installment.amountPaid)}</div>
        <div className="font-bold text-blue-900">Outstanding: {formatCurrency(installment.amountDue - installment.amountPaid)}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Amount (KES) *</label>
          <input type="number" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} required max={installment.amountDue - installment.amountPaid} />
        </div>
        <div>
          <label className="label">Payment Date *</label>
          <input type="date" className="input" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} required />
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select className="input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
            <option value="mpesa">M-Pesa</option><option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="card">Card</option>
          </select>
        </div>
        <div>
          <label className="label">Transaction Ref</label>
          <input className="input" value={form.transactionRef} onChange={e => set('transactionRef', e.target.value)} placeholder="e.g. QCX12345" />
        </div>
        <div>
          <label className="label">Receipt Number</label>
          <input className="input" value={form.receiptNumber} onChange={e => set('receiptNumber', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-success">Record Payment</button>
      </div>
    </form>
  );
};

export default function Installments() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [paymentModal, setPaymentModal] = useState(null);
  const [stats, setStats] = useState({ dueToday: 0, overdue: 0 });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter === 'overdue') params.overdue = 'true';
      else if (filter) params.status = filter;
      const [r, due, ov] = await Promise.all([
        api.get('/installments', { params }),
        api.get('/installments/due-today'),
        api.get('/installments/overdue'),
      ]);
      setInstallments(r.data.data);
      setMeta({ total: r.data.total, pages: r.data.pages });
      setStats({ dueToday: due.data.data.length, overdue: ov.data.data.length });
    } catch { toast.error('Failed to load installments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filter, page]);

  return (
    <Layout title="Installments">
      <div className="page-header">
        <h2 className="page-title">Installment Tracking</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('')}>
          <p className="text-sm text-gray-500">Total Tracked</p>
          <p className="text-2xl font-bold text-gray-900">{meta.total}</p>
        </div>
        <div className="stat-card cursor-pointer hover:shadow-md transition-shadow border-yellow-200" onClick={() => setFilter('pending')}>
          <p className="text-sm text-gray-500">Due Today</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.dueToday}</p>
        </div>
        <div className="stat-card cursor-pointer hover:shadow-md transition-shadow border-red-200" onClick={() => setFilter('overdue')}>
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2 flex-wrap">
          {[{ v: '', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'partial', l: 'Partial' }, { v: 'paid', l: 'Paid' }, { v: 'overdue', l: 'Overdue' }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : installments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No installments found" description="No installments match your filters." />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Client</th><th>Policy</th><th>Due Date</th><th>Amount Due</th><th>Paid</th><th>Balance</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {installments.map(inst => (
                    <tr key={inst.id}>
                      <td>{inst.installmentNumber}</td>
                      <td className="font-medium">{inst.policy?.client?.fullName}</td>
                      <td className="text-blue-600">{inst.policy?.policyNumber}</td>
                      <td className={inst.status === 'overdue' ? 'text-red-600 font-medium' : ''}>{formatDate(inst.dueDate)}</td>
                      <td className="font-medium">{formatCurrency(inst.amountDue)}</td>
                      <td className="text-green-600">{formatCurrency(inst.amountPaid)}</td>
                      <td className={parseFloat(inst.amountDue) - parseFloat(inst.amountPaid) > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {formatCurrency(inst.amountDue - inst.amountPaid)}
                      </td>
                      <td><span className={`badge ${getStatusColor(inst.status)}`}>{inst.status}</span></td>
                      <td>
                        {inst.status !== 'paid' && (
                          <button onClick={() => setPaymentModal(inst)} className="btn-success py-1 px-3 text-xs">
                            <DollarSign size={12} /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4"><Pagination page={page} pages={meta.pages} total={meta.total} limit={20} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal isOpen={!!paymentModal} onClose={() => setPaymentModal(null)} title="Record Payment">
        {paymentModal && <PaymentForm installment={paymentModal} onSave={() => { setPaymentModal(null); fetchAll(); }} onClose={() => setPaymentModal(null)} />}
      </Modal>
    </Layout>
  );
}
