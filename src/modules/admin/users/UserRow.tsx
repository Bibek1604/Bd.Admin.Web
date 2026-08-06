import React from 'react';
import type { User } from './usersService';
import { Eye, Edit2, Trash2, User as UserIcon, Shield } from 'lucide-react';

interface UserRowProps {
  user: User;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, isSelected, onSelect, onView, onEdit, onDelete }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'AGENT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;

  return (
    <tr className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-brand-50/30' : ''}`}>
      <td className="px-6 py-4">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onSelect(user.id)}
          className="w-5 h-5 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all" 
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:scale-105 transition-transform matte-shadow">
            <UserIcon size={18} />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-[14px] leading-tight">{displayName}</div>
            <div className="text-[12px] font-medium text-slate-400 mt-0.5">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeColor(user.role)}`}>
          <Shield size={11} />
          {user.role}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${user.is_active ? 'text-emerald-600' : 'text-rose-500'}`}>
          <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {user.is_active ? 'Active' : 'Inactive'}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-[13px] font-bold text-slate-500">@{user.username}</div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(user.id)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-100 hover:bg-brand-50 transition-all matte-shadow">
            <Eye size={15} />
          </button>
          <button onClick={() => onEdit(user.id)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-100 hover:bg-sky-50 transition-all matte-shadow">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete(user.id)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all matte-shadow">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
