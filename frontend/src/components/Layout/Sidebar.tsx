import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, CreditCard, Building2,
  AlertTriangle, BarChart3, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/policies', icon: FileText, label: 'Policies' },
  { to: '/installments', icon: CreditCard, label: 'Installments' },
  { to: '/renewals', icon: AlertTriangle, label: 'Renewals' },
  { to: '/underwriters', icon: Building2, label: 'Underwriters' },
  { to: '/claims', icon: Shield, label: 'Claims' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-[240px]'} hidden md:flex flex-col transition-all duration-300 flex-shrink-0`}
      style={{ background: 'var(--sidebar-bg)', minHeight: '100vh' }}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
          style={{ background: 'var(--primary)' }}>HIA</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-white text-sm leading-tight truncate">Hermliz Insurance</div>
            <div className="text-xs text-white/40 mt-0.5">IBMS v1.0</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[22px] -right-3 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors"
        style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            title={collapsed ? label : ''}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl transition-all duration-150 font-medium text-sm
              ${isActive
                ? 'text-white'
                : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }
              ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}`
            }
            style={({ isActive }) => isActive ? { background: 'var(--sidebar-active)' } : {}}>
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'var(--primary)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-xs text-white/40 capitalize truncate">{user?.role?.replace(/_/g, ' ')}</div>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 transition-colors flex-shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="p-1.5 text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
