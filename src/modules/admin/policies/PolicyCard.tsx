import React from 'react';
import { Shield, Edit2, Trash2, Building2, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Policy } from './policiesService';

interface PolicyCardProps {
  policy: Policy;
  onView: (p: Policy) => void;
  onEdit: (p: Policy) => void;
  onDelete: (id: string) => void;
  index: number;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onView, onEdit, onDelete, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-3xl border border-surface-100 matte-shadow hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-8 flex flex-col h-full">
        <header className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100 group-hover:bg-brand-500 group-hover:text-white transition-all matte-shadow">
            <Shield size={28} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(policy)}
              className="p-2.5 rounded-xl bg-surface-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-surface-100"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(policy.id)}
              className="p-2.5 rounded-xl bg-surface-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-100">
              {policy.company_name || 'General Policy'}
            </span>
            <span className="px-3 py-1 bg-surface-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-surface-100">
              v1.4
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-brand-600 transition-colors">
            {policy.name}
          </h3>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <Building2 size={14} className="text-slate-300" />
              <span className="truncate">{policy.company_name || 'LIC Approved Provider'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <Calendar size={14} className="text-slate-300" />
              <span>Issued: {new Date(policy.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onView(policy)}
          className="w-full mt-auto bg-surface-50 group-hover:bg-brand-600 text-slate-400 group-hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest border border-surface-100 group-hover:border-brand-500 transition-all flex items-center justify-center gap-2"
        >
          View Full Policy Details
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default PolicyCard;


