import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const typeColors = {
  installment_due: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  installment_overdue: 'bg-red-100 text-red-700 border-red-200',
  renewal_reminder: 'bg-blue-100 text-blue-700 border-blue-200',
  renewal_overdue: 'bg-orange-100 text-orange-700 border-orange-200',
  payment_received: 'bg-green-100 text-green-700 border-green-200',
  policy_created: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { limit: 50 } });
      setNotifications(data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
  };

  const markAll = async () => {
    await api.put('/notifications/mark-all-read');
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    toast.success('All notifications marked as read.');
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <Layout title="Notifications">
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          {unread > 0 && <p className="text-sm text-gray-500 mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && <button onClick={markAll} className="btn-secondary"><CheckCheck size={16} /> Mark All Read</button>}
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.isRead ? 'bg-white border-gray-100 opacity-70' : `${typeColors[n.type] || 'bg-blue-50 border-blue-200'} shadow-sm`}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-blue-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-semibold text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <span className={`badge text-xs mt-1 ${typeColors[n.type] || 'bg-gray-100 text-gray-600'}`}>{n.type?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
