import React from 'react';
import type { Notification } from './notificationsService';

interface TableProps {
  data: Notification[];
  onView: (notification: Notification) => void;
}

import { motion } from 'framer-motion';
import { User, Bell, Calendar, Clock, CheckCircle, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

const NotificationsTable: React.FC<TableProps> = ({ data, onView }) => {
  const getStatusBadge = (status: Notification['status']) => {
    switch (status) {
      case 'SENT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'READ': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={16} className="text-rose-500" />;
      case 'warning': return <ShieldAlert size={16} className="text-amber-500" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-50/70 border-b border-surface-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Recipient</th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Subject</th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Status</th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Preview</th>
              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100/70">
            {data.map((notif, i) => (
              <motion.tr
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-surface-50/80 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <User size={16} />
                    </div>
                    <div className="text-sm font-black text-slate-700">{notif.recipient_username || `User #${notif.recipient}`}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(notif.type || 'info')}
                    <div className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{notif.title}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(notif.status)}`}>
                    {notif.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs font-medium text-slate-400 truncate max-w-[200px]">{notif.content}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={12} className="opacity-60" />
                      {new Date(notif.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 mt-1">
                      <Clock size={10} className="opacity-60" />
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onView(notif)} className="px-4 py-2 bg-white text-slate-400 hover:text-brand-600 hover:bg-brand-50 border border-slate-100 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest matte-shadow">
                    Detail
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
        {data.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[32px] border border-surface-100 matte-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Bell size={20} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Recipient</div>
                   <div className="text-sm font-black text-slate-800">@{notif.recipient_username || notif.recipient}</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(notif.status)}`}>
                {notif.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-6">
               <div className="flex items-center gap-2 mb-2">
                 {getTypeIcon(notif.type || 'info')}
                 <h4 className="text-sm font-black text-slate-800">{notif.title}</h4>
               </div>
               <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{notif.content}</p>
            </div>

            <div className="flex items-center justify-between">
               <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                  <Calendar size={12} />
                  {new Date(notif.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
               </div>
               <button onClick={() => onView(notif)} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-100">
                 Read
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsTable;
