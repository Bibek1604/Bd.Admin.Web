import React from 'react';
import type { Company } from './companyService';
import { Eye, Edit2, Trash2, Mail, Phone, Calendar, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import resolveImage from '../../../utils/resolveImage';

interface TableProps {
  data: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

const CompaniesTable: React.FC<TableProps> = ({ data, onView, onEdit, onDelete }) => {
  const getCompanyKey = (company: Company, index: number) => {
    const rawKey = company.id ?? company.name ?? company.email ?? index;
    return `company-${rawKey}-${index}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow transition-all duration-300">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-50/70 border-b border-surface-100">
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Company Identity</th>
              <th className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Contact Details</th>
              <th className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Operational Status</th>
              <th className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Registry Date</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100/70">
            {data.map((company, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={getCompanyKey(company, i)}
                className="hover:bg-surface-50/80 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-lg border border-brand-100/50 overflow-hidden group-hover:scale-110 transition-transform">
                      {company.image ? (
                        <img
                          src={resolveImage(company.image)}
                          alt={company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        company.name?.[0] ?? '?'
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">{company.name}</div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{company.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Mail size={12} className="text-brand-500 opacity-60" /> {company.email || 'No email registered'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Phone size={12} className="text-brand-500 opacity-60" /> {company.phone_number || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${
                    company.status?.toUpperCase() === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                      : 'bg-surface-50 text-slate-400 border-surface-100'
                  }`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${company.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                     {company.status || 'inactive'}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Calendar size={13} className="opacity-50" />
                    {new Date(company.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      <button onClick={() => onView(company)} title="View Details" className="p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all border border-green-100 matte-shadow"><Eye size={15} /></button>
                      <button onClick={() => onEdit(company)} title="Edit" className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-slate-800 hover:bg-surface-100 transition-all border border-surface-200 matte-shadow"><Edit2 size={15} /></button>
                      <button onClick={() => onDelete(company.id)} title="Delete" className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-200 matte-shadow"><Trash2 size={15} /></button>
                   </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid md:hidden grid-cols-1 gap-5">
        {data.map((company, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={getCompanyKey(company, i)}
            className="p-6 bg-white rounded-3xl border border-surface-100 matte-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xl border border-brand-100 overflow-hidden">
                    {company.image ? (
                      <img
                        src={resolveImage(company.image)}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      company.name?.[0] ?? '?'
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">{company.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise #{company.id}</span>
                  </div>
               </div>
               <button type="button" title="More options" aria-label="More options" className="p-2 text-slate-300"><MoreVertical size={20} /></button>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-surface-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Mail size={14} className="text-brand-500" /> Email</div>
                  <div className="text-xs font-black text-slate-800 truncate max-w-37.5">{company.email || 'N/A'}</div>
               </div>
               <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-surface-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Phone size={14} className="text-brand-500" /> Contact</div>
                  <div className="text-xs font-black text-slate-800">{company.phone_number || 'N/A'}</div>
               </div>
               <div className="flex items-center justify-between px-4">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    company.status?.toUpperCase() === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                      : 'bg-surface-50 text-slate-400 border-surface-100'
                  }`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${company.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                     {company.status || 'inactive'}
                  </div>
               </div>
            </div>

            <div className="flex gap-3">
               <button onClick={() => onView(company)} className="flex-1.5 bg-surface-50 rounded-3xl font-black text-xs text-slate-600 hover:bg-surface-100 transition-colors border border-surface-100">View Data</button>
               <button onClick={() => onEdit(company)} className="flex-1.5 bg-brand-500 rounded-3xl font-black text-xs text-white shadow-lg shadow-brand-100 hover:bg-brand-600 transition-all">Edit Mode</button>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
          </motion.div>
        ))}
      </div>
      
      {data.length === 0 && (
         <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
            <div className="text-6xl mb-6">📂</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Registry is Clear</h3>
            <p className="text-sm font-medium text-slate-400">No partner companies have been cataloged in this sector yet.</p>
         </div>
      )}
    </div>
  );
};

export default CompaniesTable;




