import React, { useEffect, useState } from 'react';
import { Users, FileText, AlertTriangle, CreditCard, TrendingUp, DollarSign, Shield, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/UI/StatCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, daysUntil } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/dashboard/revenue-chart'),
        ]);
        setData(dashRes.data.data);
        setChartData(chartRes.data.data);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <Layout title="Dashboard"><LoadingSpinner /></Layout>;

  const { stats, recentPayments, expiringPolicies, overdueInstallments } = data;

  return (
    <Layout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Clients" value={stats.totalClients} icon={Users} color="blue" />
        <StatCard title="Active Policies" value={stats.activePolicies} icon={FileText} color="green" />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} icon={DollarSign} color="green" />
        <StatCard title="Total Outstanding" value={formatCurrency(stats.totalOutstanding)} icon={CreditCard} color="red" subtitle="Unpaid balances" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Expiring (7 days)" value={stats.expiring7} icon={AlertTriangle} color="red" />
        <StatCard title="Expiring (30 days)" value={stats.expiring30} icon={Clock} color="yellow" />
        <StatCard title="Overdue Installments" value={stats.overdueInstallments} icon={CreditCard} color="orange" />
        <StatCard title="Open Claims" value={stats.openClaims} icon={Shield} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expiring Policies */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Expiring Policies (Next 30 Days)</h3>
            <Link to="/renewals" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {expiringPolicies.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No expiring policies</p>
            ) : expiringPolicies.map(p => {
              const days = daysUntil(p.endDate);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-medium text-sm text-gray-800">{p.client?.fullName}</div>
                    <div className="text-xs text-gray-500">{p.policyNumber} · {p.underwriter?.shortName}</div>
                  </div>
                  <span className={`badge ${days <= 7 ? 'bg-red-100 text-red-700' : days <= 14 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {days}d left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Installments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Overdue Installments</h3>
            <Link to="/installments?status=overdue" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {overdueInstallments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">✅ No overdue installments</p>
            ) : overdueInstallments.map(inst => (
              <div key={inst.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-sm text-gray-800">{inst.policy?.client?.fullName}</div>
                  <div className="text-xs text-gray-500">Due: {formatDate(inst.dueDate)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-red-600">{formatCurrency(inst.amountDue - inst.amountPaid)}</div>
                  <div className="badge bg-red-100 text-red-700">{inst.overdueDays}d overdue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Payments</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No payments yet</p>
            ) : recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-sm text-gray-800">{p.policy?.client?.fullName}</div>
                  <div className="text-xs text-gray-500">{formatDate(p.paymentDate)} · {p.paymentMethod}</div>
                </div>
                <span className="font-semibold text-green-600 text-sm">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
