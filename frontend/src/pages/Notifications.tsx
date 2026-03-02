import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const typeColor: Record<string, string> = {
  renewal_reminder: '#f59e0b',
  installment_due: '#3b82f6',
  overdue: '#ef4444',
  policy_created: '#10b981',
  payment_received: '#10b981',
  default: '#6366f1',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout title="Notifications">
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs gap-1.5">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {notifications.map(n => (
              <div key={n.id}
                className="flex items-start gap-3 p-4 transition-colors cursor-pointer"
                style={{ background: n.isRead ? 'var(--surface)' : 'var(--primary-light)' }}
                onClick={() => !n.isRead && markRead(n.id)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${typeColor[n.type] || typeColor.default}20` }}>
                  <Bell size={16} style={{ color: typeColor[n.type] || typeColor.default }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-1)' }}>{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--primary)' }} />
                    )}
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-2)' }}>{n.message}</p>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
