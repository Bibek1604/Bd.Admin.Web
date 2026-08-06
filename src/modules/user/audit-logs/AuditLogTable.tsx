import React from 'react';
import { type AuditLog } from './auditLogsService';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

interface AuditLogRowProps {
  log: AuditLog;
  onClick: (log: AuditLog) => void;
}

const AuditLogRow: React.FC<AuditLogRowProps> = ({ log, onClick }) => {
  const formattedTime = new Date(log.timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const variant = log.action.toLowerCase().includes('delete') ? 'error' : log.action.toLowerCase().includes('create') ? 'success' : log.action.toLowerCase().includes('update') ? 'info' : 'default';

  return (
    <tr onClick={() => onClick(log)} className="cursor-pointer hover:bg-surface-50 transition-colors border-b border-surface-100">
      <td className="px-6 py-4 align-middle">
        <Badge variant={variant} className="text-xs font-bold capitalize">{log.action}</Badge>
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold">{String(log.admin_user || 'A').charAt(0)}</div>
          <span className="font-semibold text-slate-800">{log.admin_user || 'Admin'}</span>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <span className="text-sm text-slate-500">{formattedTime}</span>
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="max-w-[320px]">
          <span className="text-sm text-slate-500 truncate block">{log.details || 'No additional info'}</span>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-right">
        <Button variant="ghost" size="sm">View</Button>
      </td>
    </tr>
  );
};

interface AuditLogTableProps {
  logs: AuditLog[];
  onRowClick: (log: AuditLog) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onRowClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden matte-shadow">
      <table className="w-full text-left min-w-[800px]">
        <thead className="bg-surface-50 border-b border-surface-100">
          <tr>
            <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Admin User</th>
            <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
            <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <AuditLogRow key={log.id} log={log} onClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TableSkeleton: React.FC = () => (
  <div className="p-6 bg-white rounded-2xl">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-6 py-4 border-b border-surface-100">
        <div className="w-24 h-3 bg-surface-100 rounded" />
        <div className="w-32 h-3 bg-surface-100 rounded" />
        <div className="w-28 h-3 bg-surface-100 rounded" />
        <div className="flex-1 h-3 bg-surface-100 rounded" />
        <div className="w-16 h-3 bg-surface-100 rounded" />
      </div>
    ))}
  </div>
);

export default AuditLogTable;
