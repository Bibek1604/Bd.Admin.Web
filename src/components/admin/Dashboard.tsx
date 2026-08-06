import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import BulkNotificationsPage from '../../modules/user/bulk-notifications/BulkNotificationsPage';
import AdminCompaniesPage from '../../modules/admin/companies/CompaniesPage';
import UsersPage from '../../modules/admin/users/UsersPage';
import AgentsPage from '../../modules/admin/agents/AgentsPage';
import { getDashboardStats } from '../../modules/admin/dashboard/dashboardService';
import type { DashboardStats } from '../../modules/admin/dashboard/dashboardService';
import {
  Users, Briefcase, Bell, UserCheck, Shield,
  LayoutDashboard, LogOut, Activity, TrendingUp, Menu, X, Search, ChevronRight, ChevronDown, ChevronLeft,
  FileText
} from 'lucide-react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../BrandLogo';
import Input from '../ui/Input';

type TooltipPayloadItem = {
  name?: string;
  value?: number;
  payload?: { status?: string };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

const getIconColorClasses = (color?: string) => {
  const map: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };
  return map[color || 'blue'] || map.blue;
};

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Overview');
  const [navQuery, setNavQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStats, setApiStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setApiStats(data);
      } catch (error: unknown) {
        // Silent fail for stats fetch errors in dashboard
      }
    };
    fetchStats();
  }, []);

  const adminGroups = [
    {
      label: 'Main Menu',
      links: [
        { name: 'Users', icon: Users, color: 'blue' },
        { name: 'Agents', icon: UserCheck, color: 'cyan' },
        { name: 'Companies', icon: Briefcase, color: 'emerald' },
      ]
    },
    {
      label: 'Engagement',
      links: [
        { name: 'Notifications', icon: Bell, color: 'orange' },
      ]
    },
  ];

  const navItems = [{ name: 'Overview', group: 'Main Menu' }, ...adminGroups.flatMap(g => g.links.map(l => ({ name: l.name, group: g.label })))];
  const navMatches = navQuery.trim()
    ? navItems.filter(i =>
        i.name.toLowerCase().includes(navQuery.trim().toLowerCase()) ||
        i.group.toLowerCase().includes(navQuery.trim().toLowerCase()))
    : [];

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    try { const sv = localStorage.getItem('admin:openGroups'); if (sv) return JSON.parse(sv); } catch { /* ignore */ }
    return ['Main Menu', 'Engagement'];
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('admin:sidebarCollapsed') === '1'; } catch { return false; }
  });

  useEffect(() => { try { localStorage.setItem('admin:openGroups', JSON.stringify(openGroups)); } catch { /* ignore */ } }, [openGroups]);
  useEffect(() => {
    try { localStorage.setItem('admin:sidebarCollapsed', isCollapsed ? '1' : '0'); } catch { /* ignore */ }
    document.documentElement.style.setProperty('--admin-sidebar-w', isCollapsed ? '5rem' : '18rem');
  }, [isCollapsed]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  const stats = [
    { label: 'Clients',   value: (apiStats?.total_users ?? 0).toLocaleString(),     color: 'bg-brand-50 text-brand-600',   icon: <Users size={20} /> },
    { label: 'Agents',    value: (apiStats?.total_agents ?? 0).toLocaleString(),    color: 'bg-indigo-50 text-indigo-600', icon: <UserCheck size={20} /> },
    { label: 'Companies', value: (apiStats?.total_companies ?? 0).toLocaleString(), color: 'bg-amber-50 text-amber-600',    icon: <Briefcase size={20} /> },
    { label: 'Policies',  value: (apiStats?.total_policies ?? 0).toLocaleString(),  color: 'bg-blue-50 text-blue-600',      icon: <FileText size={20} /> },
    { label: 'Admins',    value: (apiStats?.total_admins ?? 0).toLocaleString(),    color: 'bg-violet-50 text-violet-600',  icon: <Shield size={20} /> },
  ];

  // Real data derived from the dashboard-overview endpoint
  const sum = apiStats?.summary;
  const totalPolicies = apiStats?.total_policies ?? 0;
  const lapsedPolicies = sum?.lapsed_policies ?? 0;
  const activePolicies = Math.max(0, totalPolicies - lapsedPolicies);
  const compositionData = [
    { name: 'Clients',   value: apiStats?.total_users ?? 0,     fill: '#16a34a' },
    { name: 'Agents',    value: apiStats?.total_agents ?? 0,    fill: '#6366f1' },
    { name: 'Companies', value: apiStats?.total_companies ?? 0, fill: '#f59e0b' },
    { name: 'Policies',  value: totalPolicies,                  fill: '#3b82f6' },
  ];
  const healthBars = [
    { label: 'Active Policies',  value: activePolicies,             total: totalPolicies,           color: 'bg-emerald-500' },
    { label: 'Lapsed Policies',  value: lapsedPolicies,             total: totalPolicies,           color: 'bg-rose-500' },
    { label: 'Active Members',   value: sum?.active_members ?? 0,   total: sum?.total_members ?? 0, color: 'bg-brand-500' },
    { label: 'Inactive Members', value: sum?.inactive_members ?? 0, total: sum?.total_members ?? 0, color: 'bg-amber-500' },
  ];

  return (
    <div className="flex min-h-screen bg-linear-to-br from-surface-50 via-white to-brand-50/20 font-poppins text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden bg-white border-r border-surface-200/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all duration-300 ease-in-out lg:static lg:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className={`flex h-20 shrink-0 items-center border-b border-surface-100 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          {!isCollapsed && (
            <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-surface-100 shrink-0">
              <BrandLogo className="h-12 w-auto max-w-44" />
            </div>
          )}
          <div className="flex items-center gap-1">
            {isCollapsed ? (
              <button onClick={() => setIsCollapsed(false)} className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-surface-100 hover:text-slate-700 transition-all" title="Expand sidebar" aria-label="Expand sidebar">
                <ChevronRight size={20} />
              </button>
            ) : (
              <button onClick={() => setIsCollapsed(true)} className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-surface-100 hover:text-slate-600 transition-all" title="Collapse sidebar" aria-label="Collapse sidebar">
                <ChevronLeft size={16} />
              </button>
            )}
            <button onClick={() => setIsSidebarOpen(false)} title="Close sidebar" aria-label="Close sidebar" className="p-2 lg:hidden text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 custom-scrollbar">
          {/* Overview (pinned) */}
          <button
            onClick={() => { setActiveTab('Overview'); setIsSidebarOpen(false); }}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''} ${activeTab === 'Overview' ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm' : 'text-slate-600 hover:bg-surface-100 hover:text-slate-900 border border-transparent hover:border-surface-200'}`}
            title={isCollapsed ? 'Overview' : ''}
          >
            {activeTab === 'Overview' && !isCollapsed && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />}
            <div className="p-2 rounded-lg shrink-0 transition-all duration-200 bg-brand-100 text-brand-600 group-hover:bg-brand-200 group-hover:shadow-md">
              <LayoutDashboard size={18} />
            </div>
            {!isCollapsed && <span>Overview</span>}
          </button>

          {/* Groups */}
          {adminGroups.map(group => (
            <div key={group.label} className={`mb-3 ${isCollapsed ? 'mt-2 border-t border-surface-100/70 pt-2 first:mt-0 first:border-t-0 first:pt-0' : ''}`}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] hover:text-slate-700 transition-colors rounded-lg hover:bg-surface-50"
                  aria-expanded={openGroups.includes(group.label)}
                >
                  <span>{group.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${openGroups.includes(group.label) ? 'rotate-0' : '-rotate-90'}`} />
                </button>
              )}
              {(isCollapsed || openGroups.includes(group.label)) && (
                <div className="space-y-0.5 mt-2">
                  {group.links.map(item => {
                    const active = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => { setActiveTab(item.name); setIsSidebarOpen(false); }}
                        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-xs' : 'text-slate-600 hover:bg-surface-100 hover:text-slate-900 border border-transparent hover:border-surface-200'} ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.name : ''}
                      >
                        {active && !isCollapsed && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />}
                        <div className={`relative p-2 rounded-lg shrink-0 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 ${getIconColorClasses(item.color)}`}>
                          <item.icon size={16} className="shrink-0" />
                          {active && isCollapsed && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />}
                        </div>
                        {!isCollapsed && <span className="truncate flex-1 text-left">{item.name}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-surface-100 p-3 shrink-0 bg-surface-50">
          <button
            onClick={signOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <div className="p-2 rounded-lg shrink-0 transition-all duration-200 bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:shadow-md group-hover:scale-105">
              <LogOut size={16} />
            </div>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Area Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 lg:px-8 bg-white/85 backdrop-blur-xl border-b border-surface-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} title="Open sidebar" aria-label="Open sidebar" className="p-2.5 rounded-lg bg-surface-100 text-slate-600 lg:hidden hover:bg-surface-200 transition-colors">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold lg:text-2xl tracking-tight text-slate-800">{activeTab}</h1>
              <p className="hidden sm:block text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative hidden md:block">
              <div className="flex items-center px-4 py-2 bg-surface-100 rounded-xl border border-surface-200 focus-within:ring-2 ring-brand-500/20 transition-all">
                <Search size={16} className="text-slate-400 mr-2" />
                <Input
                  placeholder="Jump to section..."
                  value={navQuery}
                  onChange={(e: any) => setNavQuery(e.target.value)}
                  className="w-44 bg-transparent border-none px-0"
                />
              </div>
              {navQuery.trim() && (
                <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl border border-surface-200 bg-white shadow-xl z-50 py-1.5 custom-scrollbar">
                  {navMatches.length === 0 ? (
                    <div className="px-4 py-3 text-xs font-semibold text-slate-400">No matching section</div>
                  ) : navMatches.map(m => (
                    <button
                      key={m.name}
                      onClick={() => { setActiveTab(m.name); setNavQuery(''); setIsSidebarOpen(false); }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <span>{m.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{m.group}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden xs:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-700">{user?.username || 'Admin'}</span>
                <span className="text-[10px] uppercase tracking-tighter text-brand-600 font-black">Super Control</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black shadow-lg shadow-brand-200">
                {user?.username?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar">
          {activeTab === 'Overview' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="group relative p-6 bg-white rounded-3xl border border-surface-100 matte-shadow hover:shadow-xl hover:-translate-y-1 hover:border-brand-200 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                  >
                    {/* Decorative Background Glow */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-linear-to-br from-brand-50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} matte-shadow group-hover:scale-110 transition-transform duration-300`}>
                          {stat.icon}
                        </div>
                        <div className="p-1.5 bg-surface-50 text-slate-300 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                          <TrendingUp size={16} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-3xl font-extrabold tracking-tighter text-slate-800">{stat.value}</div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Data Visualization Section (real data) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Platform Breakdown */}
                <div className="xl:col-span-2 bg-white rounded-[40px] p-8 border border-surface-100 matte-shadow">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Platform Breakdown</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live totals across the system</p>
                  </div>
                  <div className="h-[300px] w-full min-h-0">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={compositionData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}} width={32} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar name="Count" dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                          {compositionData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Policy & Member Health */}
                <div className="bg-white rounded-[40px] p-8 border border-surface-100 matte-shadow flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Policy &amp; Member Health</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Current status</p>
                  </div>
                  <div className="flex-1 space-y-6">
                    {healthBars.map((item, i) => {
                      const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="text-slate-900">{item.value.toLocaleString()}{item.total > 0 && <span className="text-slate-300 font-bold"> / {item.total.toLocaleString()}</span>}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full rounded-full ${item.color}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 matte-shadow">
                        <Activity size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-800 uppercase tracking-tight">Total Members</div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {(sum?.total_members ?? 0).toLocaleString()} people on the platform
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Individual Modules */}
          <div className="max-w-7xl mx-auto">
            {activeTab === 'Users' && <UsersPage />}
            {activeTab === 'Agents' && <AgentsPage />}
            {activeTab === 'Companies' && <AdminCompaniesPage />}
            {activeTab === 'Notifications' && <BulkNotificationsPage />}
          </div>
        </div>
      </main>

      {/* Global CSS Inject */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

const TOOLTIP_DOT_CLASSES = ['bg-amber-500', 'bg-brand-500', 'bg-blue-500', 'bg-rose-500'];

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((p, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${TOOLTIP_DOT_CLASSES[i % TOOLTIP_DOT_CLASSES.length]}`} />
              <div className="flex-1 text-xs font-bold">{p.name || p.payload?.status || 'value'}:</div>
              <div className="text-xs font-black">{p.value?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


export default AdminDashboard;


