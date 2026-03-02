import { useState, useEffect } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function Header({ title }: { title: string }) {
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/clients?search=${encodeURIComponent(search.trim())}`);
      setShowSearch(false);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 56,
      }}>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="absolute inset-0 flex items-center px-4 gap-3 md:hidden"
          style={{ background: 'var(--surface)', zIndex: 10 }}>
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <Search size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              autoFocus
              className="flex-1 outline-none text-sm bg-transparent"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ color: 'var(--text-1)', fontFamily: 'DM Sans, sans-serif' }}
            />
          </form>
          <button onClick={() => { setShowSearch(false); setSearch(''); }}
            className="p-1.5 rounded-lg" style={{ color: 'var(--text-2)' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <h1 className="font-bold text-base md:text-lg" style={{ color: 'var(--text-1)' }}>{title}</h1>

      <div className="flex items-center gap-1.5">
        {/* Search - desktop */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            className="input pl-8 pr-4 text-sm"
            style={{ height: 36, width: 220, fontSize: 13 }}
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Search - mobile icon */}
        <button className="btn-icon md:hidden" onClick={() => setShowSearch(true)}>
          <Search size={17} />
        </button>

        {/* Notifications */}
        <Link to="/notifications" className="btn-icon relative">
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
              style={{ background: 'var(--danger)' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
