import React, { useState } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { useUsers } from './useUsers';
import UsersTable from './UsersTable';
import UserModal from './UserModal';
import UserDetailsModal from './UserDetailsModal';
import { Plus, Search, Filter, RefreshCw, Users, CheckCircle, XCircle } from 'lucide-react';

const UsersPage: React.FC = () => {
  const { users, loading, refresh, deleteUser, handleBulkAction } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewUserId, setViewUserId] = useState<number | null>(null);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const matchesStatus = statusFilter === '' || (user.is_active ? 'Active' : 'Inactive') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pg = usePagination(filteredUsers);

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    setCurrentUserId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    setCurrentUserId(id);
    setIsModalOpen(true);
  };

  const handleView = (id: number) => {
    setViewUserId(id);
    setIsDetailsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this user? This will revoke all system access.')) {
      await deleteUser(id);
    }
  };

  const onBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`${action === 'activate' ? 'Activate' : 'Deactivate'} ${selectedIds.length} users?`)) {
      await handleBulkAction(selectedIds, action);
      setSelectedIds([]);
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-7xl bg-surface-50 p-4 sm:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600 bg-brand-50 w-fit px-3 py-1 rounded-full border border-brand-100">
             <Users size={14} />
             User Accounts
          </div>
          <h1 className="m-0 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">User Management</h1>
          <p className="mt-1.5 text-sm font-medium text-slate-400">Add, edit, and manage admin and agent accounts and their access.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button
             onClick={() => refresh()}
             className="flex items-center justify-center h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 matte-shadow hover:bg-slate-50 transition-all"
             title="Refresh user list"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button
             onClick={handleCreate}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 h-11 font-bold text-sm text-white shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
           >
             <Plus size={18} />
             Add New User
           </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-slate-900 px-6 py-4 text-white gap-4 shadow-xl">
            <div className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-[10px] flex items-center justify-center font-black">{selectedIds.length}</span>
              Users Selected
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => onBulkAction('activate')}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-[12px] font-bold text-emerald-400 hover:bg-white/20 transition-all"
                >
                    <CheckCircle size={14} /> Activate
                </button>
                <button
                  onClick={() => onBulkAction('deactivate')}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-[12px] font-bold text-rose-400 hover:bg-white/20 transition-all"
                >
                    <XCircle size={14} /> Deactivate
                </button>
            </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 sm:px-6 sm:py-5 matte-shadow">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pr-4 pl-12 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:min-w-[160px]">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-3 pr-10 pl-10 text-[13px] font-bold text-slate-600 outline-none hover:bg-white transition-all cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="AGENT">Agent</option>
              <option value="CLIENT">Client</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
              <Filter size={12} />
            </div>
          </div>

          <div className="relative flex-1 sm:min-w-[160px]">
            <select
              className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-3 pr-10 pl-4 text-[13px] font-bold text-slate-600 outline-none hover:bg-white transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 font-black">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable 
        users={pg.pageItems} 
        loading={loading}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={setSelectedIds}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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

      {/* Modals */}
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refresh}
        userId={currentUserId}
      />
      <UserDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        userId={viewUserId}
      />
    </div>
  );
};

export default UsersPage;
