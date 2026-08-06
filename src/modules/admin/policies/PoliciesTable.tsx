import React from 'react';
import { Shield, Eye, Edit2, Trash2, Building2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Policy } from './policiesService';

interface TableProps {
  data: Policy[];
  onView: (policy: Policy) => void;
  onEdit: (policy: Policy) => void;
  onDelete: (id: string) => void;
}

const PoliciesTable: React.FC<TableProps> = ({ data, onView, onEdit, onDelete }) => {
  return (
    <div className="w-full space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-50/70 border-b border-surface-100">
              <th className="px-6 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Policy</th>
              <th className="px-5 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Provider Company</th>
              <th className="px-5 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Registered</th>
              <th className="px-6 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100/70">
            {data.map((policy, i) => (
              <motion.tr
                key={policy.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-surface-50/80 transition-colors group"
              >
                <td className="px-6 py-4 py-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 border border-violet-100/50 flex-shrink-0 group-hover:bg-violet-500 group-hover:text-white transition-all matte-shadow">
                      <Shield size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">{policy.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">ID: #{policy.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 py-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Building2 size={13} className="text-slate-300" />
                    <span className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-100/50">
                      {policy.company_name || 'LIC General'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 py-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Calendar size={12} className="opacity-60" />
                    {new Date(policy.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(policy)}
                      className="p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all border border-green-100 matte-shadow"
                      title="View Policy"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(policy)}
                      className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-slate-800 hover:bg-surface-100 transition-all border border-surface-200 matte-shadow"
                      title="Edit Policy"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(policy.id)}
                      className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-100 matte-shadow"
                      title="Delete Policy"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {data.map((policy, i) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 bg-white rounded-3xl border border-surface-100 matte-shadow"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500 border border-violet-100">
                <Shield size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800">{policy.name}</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{policy.id}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-surface-100 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Building2 size={13} /> Company</div>
              <div className="text-xs font-black text-slate-800">{policy.company_name || 'LIC General'}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onView(policy)} className="flex-1 py-3 bg-violet-50 text-violet-600 rounded-2xl font-black text-xs">View</button>
              <button onClick={() => onEdit(policy)} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs">Edit</button>
              <button onClick={() => onDelete(policy.id)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><Trash2 size={16} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PoliciesTable;




