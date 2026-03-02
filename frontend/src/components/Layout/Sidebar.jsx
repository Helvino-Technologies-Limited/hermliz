import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, CreditCard, Building2,
  AlertTriangle, BarChart3, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
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
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300 min-h-screen relative`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-gray-700 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0">HIA</div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm leading-tight">Hermliz Insurance</div>
            <div className="text-xs text-gray-400">IBMS v1.0</div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-gray-700 rounded-full p-1 hover:bg-gray-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium
              ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : ''}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`border-t border-gray-700 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-white truncate max-w-[100px]">{user?.name}</div>
                <div className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
