import React, { useState } from 'react';
import { BarChart3, FileText, Download } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, getInsuranceClassLabel, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const TABS = ['Policy Register', 'Commission Report', 'Debt Report', 'Income Report', 'Renewal Forecast', 'Aging Report'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Policy Register');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', underwriterId: '' });
  const [underwriters, setUnderwriters] = useState([]);

  React.useEffect(() => { api.get('/underwriters').then(r => setUnderwriters(r.data.data)).catch(() => {}); }, []);

  const run = async () => {
    setLoading(true);
    try {
      const endpoints = {
        'Policy Register': '/reports/policies',
        'Commission Report': '/reports/commissions',
        'Debt Report': '/reports/debts',
        'Income Report': '/reports/income',
        'Renewal Forecast': '/reports/renewals',
        'Aging Report': '/reports/aging',
      };
      const { data: r } = await api.get(endpoints[activeTab], { params: filters });
      setData(r.data);
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const downloadCSV = (rows, filename) => {
    if (!rows?.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${r[k] || ''}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `${filename}.csv`;
    a.click();
  };

  const renderTable = () => {
    if (!data) return null;
    const policies = data.policies || (Array.isArray(data) ? data : []);

    if (activeTab === 'Debt Report') {
      return (
        <div>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-bold text-xl">{formatCurrency(data.totalDebt)}</p>
            <p className="text-red-600 text-sm">Total Outstanding Debt</p>
          </div>
          <table className="table"><thead><tr><th>Client</th><th>Policy</th><th>Premium</th><th>Outstanding</th></tr></thead>
            <tbody>{policies.map(p => <tr key={p.id}><td>{p.client?.fullName}</td><td>{p.policyNumber}</td><td>{formatCurrency(p.premiumAmount)}</td><td className="text-red-600 font-bold">{formatCurrency(p.outstandingBalance)}</td></tr>)}</tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'Commission Report') {
      return (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4"><p className="text-blue-800 font-bold text-xl">{formatCurrency(data.totalCommission)}</p><p className="text-blue-600 text-sm">Total Commission</p></div>
            <div className="bg-green-50 rounded-lg p-4"><p className="text-green-800 font-bold text-xl">{formatCurrency(data.totalPremium)}</p><p className="text-green-600 text-sm">Total Premium</p></div>
          </div>
          <table className="table"><thead><tr><th>Client</th><th>Policy</th><th>Underwriter</th><th>Premium</th><th>Comm %</th><th>Commission</th></tr></thead>
            <tbody>{policies.map(p => <tr key={p.id}><td>{p.client?.fullName}</td><td>{p.policyNumber}</td><td>{p.underwriter?.shortName}</td><td>{formatCurrency(p.premiumAmount)}</td><td>{p.commissionPercent}%</td><td className="text-blue-700 font-bold">{formatCurrency(p.commissionAmount)}</td></tr>)}</tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'Income Report') {
      return (
        <div>
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-bold text-xl">{formatCurrency(data.total)}</p>
            <p className="text-green-600 text-sm">{data.period}</p>
          </div>
          <table className="table"><thead><tr><th>Date</th><th>Client</th><th>Policy</th><th>Method</th><th>Amount</th></tr></thead>
            <tbody>{(data.payments || []).map(p => <tr key={p.id}><td>{formatDate(p.paymentDate)}</td><td>{p.policy?.client?.fullName}</td><td>{p.policy?.policyNumber}</td><td className="capitalize">{p.paymentMethod}</td><td className="font-bold text-green-700">{formatCurrency(p.amount)}</td></tr>)}</tbody>
          </table>
        </div>
      );
    }

    return (
      <table className="table">
        <thead><tr><th>Client</th><th>Policy #</th><th>Class</th><th>Underwriter</th><th>Premium</th><th>Balance</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
        <tbody>
          {policies.map(p => (
            <tr key={p.id}>
              <td>{p.client?.fullName}</td>
              <td className="font-medium text-blue-700">{p.policyNumber}</td>
              <td className="text-xs">{getInsuranceClassLabel(p.insuranceClass)}</td>
              <td>{p.underwriter?.shortName}</td>
              <td>{formatCurrency(p.premiumAmount)}</td>
              <td className={parseFloat(p.outstandingBalance) > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(p.outstandingBalance)}</td>
              <td>{formatDate(p.startDate)}</td>
              <td>{formatDate(p.endDate)}</td>
              <td><span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Layout title="Reports">
      <div className="page-header">
        <h2 className="page-title">Reports & Analytics</h2>
        {data && <button onClick={() => downloadCSV(data.policies || [], activeTab)} className="btn-secondary"><Download size={16} /> Export CSV</button>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => { setActiveTab(t); setData(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>{t}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input w-40" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input w-40" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Underwriter</label>
            <select className="input w-48" value={filters.underwriterId} onChange={e => setFilters(f => ({ ...f, underwriterId: e.target.value }))}>
              <option value="">All Underwriters</option>
              {underwriters.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <button onClick={run} className="btn-primary"><BarChart3 size={16} /> Generate Report</button>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner text="Generating report..." /> : !data ? (
          <div className="text-center py-16 text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Select filters and click Generate Report</p>
          </div>
        ) : (
          <div className="table-container">{renderTable()}</div>
        )}
      </div>
    </Layout>
  );
}
