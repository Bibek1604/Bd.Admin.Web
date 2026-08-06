import React from 'react';
import { Shield, MessageSquare, Star, TrendingUp, UserCheck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentsTableProps {
  data: any[];
  onSendAlert: (agent: any) => void;
  onView: (agent: any) => void;
  onEdit: (agent: any) => void;
  onDelete: (id: number) => void;
}

const AgentsTable: React.FC<AgentsTableProps> = ({ data, onSendAlert, onView, onEdit, onDelete }) => {
  return (
    <div className="w-full space-y-4">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow transition-all duration-300">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-50/70 border-b border-surface-100">
              <th className="px-6 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Agent Identity</th>
              <th className="px-5 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Credentials</th>
              <th className="px-5 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Metrics</th>
              <th className="px-5 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Focus</th>
              <th className="px-6 py-4 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100/70">
            {data.map((agent, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                key={agent.id} 
                className="hover:bg-surface-50/80 transition-colors group"
              >
                <td className="px-6 py-4 py-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-brand-600 font-black text-sm border border-surface-100 group-hover:bg-brand-500 group-hover:text-white transition-all matte-shadow">
                        {agent.first_name[0]}{agent.last_name[0]}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                        {agent.first_name} {agent.last_name}
                        {(agent.agent_profile?.performance_score || 0) >= 90 && <Star size={12} className="text-yellow-500 fill-current" />}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">HQ-ID: {agent.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 py-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <Shield size={12} className="text-brand-500 opacity-60" /> License: {agent.agent_profile?.license_number || 'PENDING'}
                    </div>
                    {(agent.agent_profile?.performance_score || 0) >= 80 && (
                      <span className="w-fit px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[8px] font-black tracking-widest uppercase">Elite Status</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 py-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase text-slate-400 opacity-60">Performance</span>
                       <div className="text-sm font-black text-brand-600 flex items-center gap-1.5">
                          <TrendingUp size={12} />
                          {agent.agent_profile?.performance_score || 0}%
                       </div>
                    </div>
                    <div className="w-[1px] h-6 bg-surface-100" />
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase text-slate-400 opacity-60">Volume</span>
                       <div className="text-sm font-black text-slate-800">#{agent.num_clients}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 py-4 text-[11px] font-bold text-slate-500 italic">
                  {agent.agent_profile?.specialization || 'Certified Generalist'}
                </td>
                <td className="px-6 py-4 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onView(agent)}
                        className="p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all border border-green-100 matte-shadow"
                        title="View Dossier"
                      >
                        <UserCheck size={15} />
                      </button>
                      <button
                        onClick={() => onSendAlert(agent)}
                        className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all border border-surface-200 matte-shadow"
                        title="Send Alert"
                      >
                        <MessageSquare size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(agent)}
                        className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-slate-800 hover:bg-surface-100 transition-all border border-surface-200 matte-shadow"
                        title="Edit Credentials"
                      >
                        <Shield size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(agent.id)}
                        className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-200 matte-shadow"
                        title="Delete"
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

      {/* Mobile Card View (Keep cards for mobile as they look better on small screens) */}
      <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-5">
        {data.map((agent, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={agent.id} 
            className="p-6 bg-white rounded-3xl border border-surface-100 matte-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-lg border border-brand-100">
                    {agent.first_name[0]}{agent.last_name[0]}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800 tracking-tight">{agent.first_name} {agent.last_name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">HQ-ID: {agent.username}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => onView(agent)} className="p-3 bg-surface-50 text-slate-400 rounded-2xl"><UserCheck size={18} /></button>
                  <button onClick={() => onSendAlert(agent)} className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><MessageSquare size={18} /></button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 text-center">
                  <div className="text-[9px] font-black uppercase text-slate-400 mb-1">Score</div>
                  <div className="text-base font-black text-brand-600">{agent.agent_profile?.performance_score || 0}%</div>
               </div>
               <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 text-center">
                  <div className="text-[9px] font-black uppercase text-slate-400 mb-1">Volume</div>
                  <div className="text-base font-black text-slate-800">#{agent.num_clients}</div>
               </div>
            </div>

            <div className="flex gap-3">
               <button onClick={() => onEdit(agent)} className="flex-1 h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm tracking-tight transition-all hover:scale-105 shadow-xl shadow-brand-200 flex justify-center items-center gap-2">Edit Mode</button>
               <button onClick={() => onDelete(agent.id)} className="p-4 bg-rose-50 text-rose-500 rounded-3xl"><Trash2 size={18} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgentsTable;





