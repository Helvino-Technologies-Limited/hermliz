import { useState, useEffect } from 'react';
import {
  Users, FileText, CreditCard, AlertTriangle,
  TrendingUp, DollarSign, Clock, XCircle
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/UI/StatCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, daysUntil } from '../utils/helpers';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, expiringRes, overdueRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/policies/expiring?days=30'),
          api.get('/installments/overdue'),
        ]);
        setStats(statsRes.data.data);
        setExpiring((expiringRes.data.data || []).slice(0, 5));
        setOverdue((overdueRes.data.data || []).slice(0, 5));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) return <Layout title="Dashboard"><LoadingSpinner text="Loading dashboard..." /></Layout>;

  if (error) return (
    <Layout title="Dashboard">
      <div className="card text-center py-12">
        <p className="text-red-500 font-medium mb-2">Failed to load dashboard</p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    </Layout>
  );

  const chartData = stats?.monthlyRevenue || [];

  return (
    <Layout title="Dashboard">
      {/* Greeting */}
      <div className="mb-5">
        <h2 className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>
          {greeting} 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
          Here's what's happening today
        </p>
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          title="Active Policies"
          value={stats?.activePolicies ?? 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Total Clients"
          value={stats?.totalClients ?? 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Commission Earned"
          value={formatCurrency(stats?.totalCommission ?? 0)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(stats?.totalOutstanding ?? 0)}
          icon={DollarSign}
          color="red"
        />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Expiring (30 days)"
          value={stats?.expiringIn30 ?? 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Expiring (7 days)"
          value={stats?.expiringIn7 ?? 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Overdue Payments"
          value={stats?.overdueInstallments ?? 0}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Due Today"
          value={stats?.dueToday ?? 0}
          icon={CreditCard}
          color="orange"
        />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue chart */}
        <div className="card">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>
            Monthly Revenue (6 months)
          </h3>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-44">
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>No payment data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f4fb" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                  }}
                  formatter={(v: any) => [formatCurrency(v), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expiring policies */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
              Expiring Soon
            </h3>
            <Link to="/renewals" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>
          {expiring.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                No policies expiring in 30 days 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiring.map(p => {
                const days = daysUntil(p.endDate);
                return (
                  <div key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'var(--surface-2)' }}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{p.client?.fullName}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                        {p.policyNumber} · {p.insuranceClass?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0 text-right">
                      <span className={`badge ${days <= 7 ? 'bg-red-100 text-red-700' : days <= 14 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {days}d left
                      </span>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                        {formatDate(p.endDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue installments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
              Overdue Installments
            </h3>
            <Link to="/installments" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>
          {overdue.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                  No overdue installments
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                  All payments are up to date
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {overdue.map(inst => {
                const balance = parseFloat(inst.amountDue || 0) - parseFloat(inst.amountPaid || 0);
                return (
                  <div key={inst.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: '#fff8f8', border: '1px solid #fee2e2' }}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {inst.policy?.client?.fullName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {inst.policy?.policyNumber} · Due {formatDate(inst.dueDate)}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="font-bold text-sm num" style={{ color: 'var(--danger)' }}>
                        {formatCurrency(balance)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--danger)' }}>
                        {inst.overdueDays}d overdue
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
