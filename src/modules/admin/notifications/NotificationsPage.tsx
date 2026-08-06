import React, { useState, useMemo } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { useNotifications } from './useNotifications';
import NotificationsTable from './NotificationsTable';
import NotificationDetailsModal from './NotificationDetailsModal';
import type { Notification } from './notificationsService';

const NotificationsPage: React.FC = () => {
  const { notifications, loading, error } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredNotifications = useMemo(() => {
    return (notifications || []).filter(n => {
      const matchesSearch = (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (n.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || (n.type || 'info') === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [notifications, searchTerm, typeFilter]);

  const pg = usePagination(filteredNotifications);

  const handleView = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsModalOpen(true);
  };

  if (error) return (
    <div className="p-10 text-center text-error">
      <div className="text-4xl mb-2">⚠️</div>
      <h3 className="text-lg font-bold">Couldn't load notifications</h3>
      <p className="text-sm text-slate-500">{error}</p>
    </div>
  );

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto bg-surface-50 min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[13px] text-success font-semibold uppercase tracking-wider mb-2">🔔 Notifications</div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">View system alerts and important messages.</p>
      </header>

      <div className="flex gap-4 mb-8 bg-white p-4 rounded-2xl border border-surface-100 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by title or message content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-surface-200 bg-surface-50 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <select
          aria-label="Filter notifications by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="min-w-45 px-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm font-semibold text-slate-700"
        >
          <option value="all">All Types</option>
          <option value="info">Information</option>
          <option value="alert">Alerts</option>
          <option value="warning">Warnings</option>
          <option value="system">System</option>
          <option value="success">Success</option>
        </select>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-sm text-slate-500 font-medium">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-12 px-8 text-center bg-white rounded-2xl border-2 border-dashed border-surface-100">
          <div className="text-4xl mb-4">📬</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Notifications Found</h3>
          <p className="text-sm text-slate-500">There are no messages matching your search criteria.</p>
        </div>
      ) : (
        <>
        <NotificationsTable data={pg.pageItems} onView={handleView} />
        <Pagination
          page={pg.page}
          pageSize={pg.pageSize}
          total={pg.total}
          totalPages={pg.totalPages}
          startIndex={pg.startIndex}
          endIndex={pg.endIndex}
          onPageChange={pg.setPage}
          onPageSizeChange={pg.setPageSize}
        />
        </>
      )}

      <NotificationDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        notification={selectedNotif} 
      />
    </div>
  );
};

export default NotificationsPage;
