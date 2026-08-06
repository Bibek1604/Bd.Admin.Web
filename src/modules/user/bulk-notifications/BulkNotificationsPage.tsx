import React, { useState, useMemo } from 'react';
import { useBulkNotifications } from './useBulkNotifications';
import BulkNotificationDetailsModal from './BulkNotificationDetailsModal';
import CreateNotificationModal from './CreateNotificationModal';
import { Plus, Search, Bell, Eye, Calendar, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  COMPLETED: { label: 'Sent', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  FAILED: { label: 'Failed', color: 'bg-rose-50 text-rose-600 border-rose-100' },
};

const BulkNotificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedNotifId, setSelectedNotifId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { notifications, loading, error, refetch } = useBulkNotifications(searchTerm, statusFilter);

  const selectedNotification = useMemo(() =>
    notifications.find(n => n.id === selectedNotifId) || null,
    [notifications, selectedNotifId]
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-3xl border border-surface-100 matte-shadow">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6"><AlertCircle size={40} /></div>
      <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Notifications Unavailable</h2>
      <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto mb-8">{error}</p>
      <button onClick={refetch} className="flex items-center gap-3 px-8 bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-700 transition-all shadow-xl">
        <RefreshCcw size={18} /> Refresh Feed
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-widest bg-sky-50 w-fit px-4 py-1.5 rounded-full border border-sky-100/50 mb-4">
            <Bell size={16} /> Broadcast System
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">Bulk Communications</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">View official broadcast messages and scheduled notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white px-5 py-4 py-3.5 rounded-2xl border border-surface-200 text-sm font-bold text-slate-600 outline-none appearance-none matte-shadow"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
          </select>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm tracking-tight transition-all hover:scale-105 shadow-xl shadow-brand-200 flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={16} /> New Broadcast
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-surface-100 matte-shadow flex items-center gap-4">
        <Search size={18} className="text-slate-300" />
        <input
          type="text"
          placeholder="Search notifications by title or content..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
        />
        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{notifications.length} broadcasts</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-24 text-center text-slate-300 font-bold italic">Fetching broadcasts...</div>
      ) : notifications.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
          <div className="text-6xl mb-6">📩</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Broadcast Messages</h3>
          <p className="text-sm text-slate-400">No messages match your current filters.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow"
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Notification</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Audience</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Status</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Sent</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notifications.map((notif, i) => {
                const status = statusConfig[notif.status as keyof typeof statusConfig] || { label: notif.status, color: 'bg-surface-50 text-slate-500 border-surface-200' };
                return (
                  <motion.tr
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100/50 flex-shrink-0 matte-shadow">
                          <Bell size={17} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 max-w-[200px] truncate">{notif.title}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5 max-w-[200px] truncate">{notif.content}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 py-4">
                      <span className="px-2.5 py-1 bg-surface-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-surface-100">
                        {notif.target_audience || 'AGENTS'}
                      </span>
                    </td>
                    <td className="px-5 py-4 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Calendar size={12} className="opacity-60" />
                        {new Date(notif.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedNotifId(notif.id)}
                        className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-surface-100 matte-shadow"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      <BulkNotificationDetailsModal
        isOpen={!!selectedNotifId}
        notification={selectedNotification}
        onClose={() => setSelectedNotifId(null)}
      />
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default BulkNotificationsPage;




