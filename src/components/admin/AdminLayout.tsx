import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Briefcase, Bell, UserCheck, LayoutDashboard, LogOut, Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BrandLogo } from '../BrandLogo';

/** Sidebar entries are the routes — the URL is the single source of truth. */
const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/agents', label: 'Agents', icon: UserCheck },
  { to: '/companies', label: 'Companies', icon: Briefcase },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('admin:sidebarCollapsed') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('admin:sidebarCollapsed', isCollapsed ? '1' : '0'); } catch { /* ignore */ }
    document.documentElement.style.setProperty('--admin-sidebar-w', isCollapsed ? '5rem' : '16rem');
  }, [isCollapsed]);

  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.to));

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors',
      isCollapsed ? 'justify-center' : '',
      isActive
        ? 'bg-brand-50 font-medium text-brand-700'
        : 'text-slate-600 hover:bg-surface-100 hover:text-slate-900',
    ].join(' ');

  return (
    <div className="flex min-h-screen bg-surface-50 text-slate-900">
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-surface-200 bg-white transition-[width,transform] duration-200 lg:static lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-surface-200 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          {!isCollapsed && <BrandLogo className="h-8 w-auto max-w-36" />}
          <div className="flex items-center">
            <button
              onClick={() => setIsCollapsed((v) => !v)}
              className="hidden h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-slate-400 transition-colors hover:bg-surface-100 hover:text-slate-600 lg:flex"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              title={isCollapsed ? item.label : undefined}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon size={17} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-surface-200 p-3">
          <button
            onClick={signOut}
            className={`flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="-ml-1 rounded-[var(--radius-control)] p-2 text-slate-600 transition-colors hover:bg-surface-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm text-slate-500">{current?.label ?? 'Admin'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-sm text-slate-600 sm:block">{user?.username || 'Admin'}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white">
              {(user?.username?.[0] || 'A').toUpperCase()}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
