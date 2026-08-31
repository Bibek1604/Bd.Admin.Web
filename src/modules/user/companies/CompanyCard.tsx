import React from 'react';
import resolveImage from '../../../utils/resolveImage';
import { type CompanyAgent } from './companiesService';

interface CompanyCardProps {
  company: CompanyAgent;
  onClick: (id: number) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => {
  const isOnline = company.status === 'ACTIVE';

  return (
    <div
      onClick={() => onClick(company.id)}
      className="bg-white rounded-2xl border border-surface-100 p-4 cursor-pointer transition-all hover:shadow-md flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-100 flex items-center justify-center">
          {company.image ? (
            <img src={resolveImage(company.image)} alt={company.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-bold">{company.name.charAt(0)}</div>
          )}
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-success-light text-success-dark' : 'bg-error-light text-error'}`}>
          {company.status}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-slate-900">{company.name}</h3>
        <p className="text-sm text-slate-500">{company.email}</p>

        <div className="flex items-center gap-2 mt-3 text-[13px] text-slate-600">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">ID:</span>
          <span className="font-medium">{company.id}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-surface-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">Joined</div>
          <div className="text-sm font-semibold text-slate-800">{new Date(company.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
};

export const CompanySkeleton: React.FC = () => (
  <div className="h-44 bg-surface-50 rounded-2xl p-4 border border-surface-100 animate-pulse" />
);

export default CompanyCard;
