import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function Layout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface-2)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-3 md:p-6 pb-safe overflow-auto fade-in">
          {children}
        </main>
        <footer className="hidden md:block text-center py-3 text-xs" style={{ color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>
          © 2024 Hermliz Insurance Agency · Powered by Helvino Technologies Limited
        </footer>
      </div>
      <MobileNav />
    </div>
  );
}
