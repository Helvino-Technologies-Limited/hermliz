import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { navItems } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/policies', icon: FileText, label: 'Policies' },
  { to: '/installments', icon: CreditCard, label: 'Payments' },
];

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Bottom nav */}
      <nav className="mobile-nav md:hidden">
        {mainNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setShowMore(false)}>
            <div className="nav-icon-wrap">
              <Icon size={20} />
            </div>
            {label}
          </NavLink>
        ))}
        <button
          className={`mobile-nav-item ${showMore ? 'active' : ''}`}
          onClick={() => setShowMore(!showMore)}>
          <div className="nav-icon-wrap" style={showMore ? { background: 'var(--primary-light)' } : {}}>
            <MoreHorizontal size={20} />
          </div>
          More
        </button>
      </nav>

      {/* More drawer */}
      {showMore && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-[68px] left-0 right-0 rounded-t-2xl p-4 slide-up"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>

            {/* User info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ background: 'var(--primary)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm">{user?.name}</div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{user?.role?.replace(/_/g, ' ')}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {navItems.slice(4).map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-colors ${isActive ? 'text-blue-600' : ''}`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--primary-light)' : 'var(--surface-2)',
                    color: isActive ? 'var(--primary)' : 'var(--text-2)',
                  })}
                  onClick={() => setShowMore(false)}>
                  <Icon size={22} />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={() => { logout(); setShowMore(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium"
                style={{ background: '#fff1f1', color: '#e53e3e' }}>
                <LogOut size={22} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
