import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Briefcase, FileText, Shield } from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getDashboardStats, type DashboardStats } from './dashboardService';
import { Page, PageHeader } from '../../../components/ui/Page';

type TooltipPayloadItem = { name?: string; value?: number };

const ChartTooltip: React.FC<{ active?: boolean; payload?: TooltipPayloadItem[]; label?: string }> = ({
  active, payload, label,
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-control)] border border-surface-200 bg-white px-3 py-2 text-sm shadow-md">
      <div className="text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{(payload[0].value ?? 0).toLocaleString()}</div>
    </div>
  );
};

const OverviewPage: React.FC = () => {
  const [apiStats, setApiStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setApiStats).catch(() => {});
  }, []);

  const stats = [
    { label: 'Clients', value: apiStats?.total_users ?? 0, icon: <Users size={17} /> },
    { label: 'Agents', value: apiStats?.total_agents ?? 0, icon: <UserCheck size={17} /> },
    { label: 'Companies', value: apiStats?.total_companies ?? 0, icon: <Briefcase size={17} /> },
    { label: 'Policies', value: apiStats?.total_policies ?? 0, icon: <FileText size={17} /> },
    { label: 'Admins', value: apiStats?.total_admins ?? 0, icon: <Shield size={17} /> },
  ];

  const sum = apiStats?.summary;
  const totalPolicies = apiStats?.total_policies ?? 0;
  // null means the backend could not compute it — NOT that it is zero. Kept
  // distinct all the way to the screen: "0 lapsed policies" is a specific and
  // reassuring claim, and making it up when the count failed is worse than
  // admitting the number is missing.
  const lapsedPolicies: number | null = sum?.lapsed_policies ?? null;

  const compositionData = [
    { name: 'Clients', value: apiStats?.total_users ?? 0, fill: '#16a34a' },
    { name: 'Agents', value: apiStats?.total_agents ?? 0, fill: '#6366f1' },
    { name: 'Companies', value: apiStats?.total_companies ?? 0, fill: '#f59e0b' },
    { name: 'Policies', value: totalPolicies, fill: '#3b82f6' },
  ];

  const healthBars: Array<{ label: string; value: number | null; total: number; color: string }> = [
    {
      label: 'Active policies',
      value: lapsedPolicies === null ? null : Math.max(0, totalPolicies - lapsedPolicies),
      total: totalPolicies,
      color: 'bg-brand-500',
    },
    { label: 'Lapsed policies', value: lapsedPolicies, total: totalPolicies, color: 'bg-rose-500' },
    { label: 'Active members', value: sum?.active_members ?? 0, total: sum?.total_members ?? 0, color: 'bg-blue-500' },
    { label: 'Inactive members', value: sum?.inactive_members ?? 0, total: sum?.total_members ?? 0, color: 'bg-amber-500' },
  ];

  return (
    <Page>
      <PageHeader title="Overview" description="Live totals across the platform." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-4">
            <div className="flex items-center gap-2 text-slate-400">{stat.icon}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{stat.value.toLocaleString()}</div>
            <div className="mt-0.5 text-[13px] text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="panel p-5 xl:col-span-2">
          <h2 className="text-[15px] font-medium text-slate-900">Platform breakdown</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">Record counts by type.</p>
          <div className="mt-5 h-[280px] w-full min-h-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={compositionData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={34} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar name="Count" dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {compositionData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel flex flex-col p-5">
          <h2 className="text-[15px] font-medium text-slate-900">Policy &amp; member health</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">Current status.</p>
          <div className="mt-5 flex-1 space-y-4">
            {healthBars.map((item) => {
              const unknown = item.value === null;
              const pct = !unknown && item.total > 0 ? Math.round(((item.value as number) / item.total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="text-slate-600">{item.label}</span>
                    <span className={unknown ? 'text-slate-400' : 'text-slate-900'}>
                      {unknown ? (
                        <span title="This figure could not be calculated. Reload to try again.">Unavailable</span>
                      ) : (
                        <>
                          {(item.value as number).toLocaleString()}
                          {item.total > 0 && <span className="text-slate-400"> / {item.total.toLocaleString()}</span>}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 border-t border-surface-200 pt-4 text-[13px] text-slate-500">
            {(sum?.total_members ?? 0).toLocaleString()} people on the platform
          </p>
        </section>
      </div>
    </Page>
  );
};

export default OverviewPage;
