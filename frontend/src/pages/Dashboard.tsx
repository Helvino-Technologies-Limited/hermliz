import { useState, useEffect } from 'react';
import { Users, FileText, CreditCard, AlertTriangle, TrendingUp, DollarSign, Clock, XCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/UI/StatCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, daysUntil } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/policies/expiring?days=30'),
      api.get('/installments/overdue'),
    ]).then(([s, e, o]) => {
      setStats(s.data.data);
      setExpiring(e.data.data.slice(0, 5));
      setOverdue(o.data.data.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><LoadingSpinner /></Layout>;

  const chartData = stats?.monthlyRevenue || [];

  return (
    <Layout title="Dashboard">
      {/* Greeting */}
      <div className="mb-5">
        <h2 className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>Here's what's happening today</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard title="Active Policies" value={stats?.activePolicies || 0} icon={FileText} color="blue" />
        <StatCard title="Total Clients" value={stats?.totalClients || 0} icon={Users} color="purple" />
        <StatCard title="Commission" value={formatCurrency(stats?.totalCommission || 0)} icon={TrendingUp} color="green" />
        <StatCard title="Outstanding" value={formatCurrency(stats?.totalOutstanding || 0)} icon={DollarSign} color="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Expiring (30d)" value={stats?.expiringIn30 || 0} icon={Clock} color="yellow" />
        <StatCard title="Expiring (7d)" value={stats?.expiringIn7 || 0} icon={AlertTriangle} color="red" />
        <StatCard title="Overdue" value={stats?.overdueInstallments || 0} icon={XCircle} color="red" />
        <StatCard title="Due Today" value={stats?.dueToday || 0} icon={CreditCard} color="orange" />
      </div>

      {/* Charts + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f4fb" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
                  formatter={(v: any) => [formatCurrency(v), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expiring policies */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Expiring Soon</h3>
            <Link to="/renewals" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>View all →</Link>
          </div>
          {expiring.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>No policies expiring soon</p>
          ) : (
            <div className="space-y-2">
              {expiring.map(p => {
                const days = daysUntil(p.endDate);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'var(--surface-2)' }}>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.client?.fullName}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{p.policyNumber}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ml-2 ${days <= 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {days}d
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue installments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Overdue Installments</h3>
            <Link to="/installments" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>View all →</Link>
          </div>
          {overdue.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>No overdue installments 🎉</p>
          ) : (
            <div className="space-y-2">
              {overdue.map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: '#fff8f8', border: '1px solid #fee2e2' }}>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{inst.policy?.client?.fullName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{inst.policy?.policyNumber} · Due {formatDate(inst.dueDate)}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-bold text-sm num" style={{ color: 'var(--danger)' }}>
                      {formatCurrency(parseFloat(inst.amountDue) - parseFloat(inst.amountPaid))}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--danger)' }}>{inst.overdueDays}d overdue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
