import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-3 border-t border-gray-100">
          © 2024 Hermliz Insurance Agency · Powered by Helvino Technologies Limited
        </footer>
      </div>
    </div>
  );
}
