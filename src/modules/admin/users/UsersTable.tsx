import React from 'react';
import type { User } from './usersService';
import UserRow from './UserRow';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  loading, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  if (loading) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 matte-shadow">
        <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-400">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <div className="text-6xl mb-6 grayscale opacity-50">👥</div>
        <h3 className="text-lg font-black text-slate-800 mb-2">No users found</h3>
        <p className="text-sm font-medium text-slate-400">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  const isAllSelected = users.length > 0 && selectedIds.length === users.length;

  return (
    <div className="bg-white rounded-3xl border border-surface-100 overflow-hidden matte-shadow overflow-x-auto custom-scrollbar">
      <table className="w-full border-collapse text-left min-w-[800px]">
        <thead>
          <tr className="bg-surface-50/70 border-b border-surface-100">
            <th className="px-6 py-4 w-16">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={() => onSelectAll(isAllSelected ? [] : users.map(u => u.id))}
                className="w-5 h-5 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all" 
              />
            </th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">User Profile</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">System Role</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Joined Date</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100/70">
          {users.map((user) => (
            <UserRow 
              key={user.id} 
              user={user} 
              isSelected={selectedIds.includes(user.id)}
              onSelect={onSelect}
              onView={onView} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
