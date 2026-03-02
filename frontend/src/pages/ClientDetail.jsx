import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, FileText, CreditCard, Shield } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor, getInsuranceClassLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cRes, sRes] = await Promise.all([api.get(`/clients/${id}`), api.get(`/clients/${id}/stats`)]);
        setClient(cRes.data.data);
        setStats(sRes.data.data);
      } catch { toast.error('Failed to load client'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <Layout title="Client Detail"><LoadingSpinner /></Layout>;
  if (!client) return <Layout title="Client Detail"><p className="text-center py-20 text-gray-500">Client not found.</p></Layout>;

  return (
    <Layout title="Client Detail">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link to="/clients" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h2 className="page-title">{client.fullName}</h2>
            <p className="text-sm text-gray-500">Client Profile</p>
          </div>
        </div>
        <Link to={`/policies/new?clientId=${client.id}`} className="btn-primary"><FileText size={16} /> New Policy</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Info Card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl">{client.fullName[0]}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{client.fullName}</h3>
              {client.businessName && <p className="text-gray-500 text-sm">{client.businessName}</p>}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {client.phone && <div className="flex items-center gap-2 text-gray-600"><Phone size={14} /><a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a></div>}
            {client.email && <div className="flex items-center gap-2 text-gray-600"><Mail size={14} />{client.email}</div>}
            {client.address && <div className="flex items-center gap-2 text-gray-600"><MapPin size={14} />{client.address}</div>}
            {client.nationalId && <div className="text-gray-600"><span className="font-medium">ID:</span> {client.nationalId}</div>}
            {client.kraPin && <div className="text-gray-600"><span className="font-medium">KRA PIN:</span> {client.kraPin}</div>}
            {client.occupation && <div className="text-gray-600"><span className="font-medium">Occupation:</span> {client.occupation}</div>}
          </div>
          {client.nextOfKinName && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Next of Kin</p>
              <p className="text-sm font-medium">{client.nextOfKinName}</p>
              <p className="text-sm text-gray-500">{client.nextOfKinPhone} · {client.nextOfKinRelationship}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {stats && [
            { label: 'Total Policies', value: stats.totalPolicies, icon: FileText, color: 'blue' },
            { label: 'Active Policies', value: stats.activePolicies, icon: FileText, color: 'green' },
            { label: 'Total Premium', value: formatCurrency(stats.totalPremium), icon: CreditCard, color: 'purple' },
            { label: 'Outstanding Balance', value: formatCurrency(stats.totalBalance), icon: CreditCard, color: 'red' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Policies ({client.policies?.length || 0})</h3>
        {client.policies?.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No policies yet</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Policy #</th><th>Class</th><th>Underwriter</th><th>Premium</th><th>Balance</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {client.policies?.map(p => (
                  <tr key={p.id}>
                    <td><Link to={`/policies/${p.id}`} className="text-blue-600 hover:underline font-medium">{p.policyNumber}</Link></td>
                    <td>{getInsuranceClassLabel(p.insuranceClass)}</td>
                    <td>{p.underwriter?.shortName}</td>
                    <td>{formatCurrency(p.premiumAmount)}</td>
                    <td className={parseFloat(p.outstandingBalance) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{formatCurrency(p.outstandingBalance)}</td>
                    <td>{formatDate(p.startDate)}</td>
                    <td>{formatDate(p.endDate)}</td>
                    <td><span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
