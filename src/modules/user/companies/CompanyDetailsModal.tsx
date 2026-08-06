import React from 'react';
import resolveImage from '../../../utils/resolveImage';
import { X } from 'lucide-react';
import { type CompanyAgent } from './companiesService';

interface CompanyDetailsModalProps {
  company: CompanyAgent | null;
  onClose: () => void;
  isOpen: boolean;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ company, onClose, isOpen }) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-surface-100 matte-shadow overflow-hidden animate-slide-in-up">
        <header className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div>
            <h2 className="text-h2 font-extrabold text-slate-900">Company Profile</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference #{company.id}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-surface-100 overflow-hidden flex items-center justify-center flex-shrink-0 matte-shadow-md">
              {company.image ? (
                <img src={resolveImage(company.image)} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white bg-gradient-to-br from-blue-500 to-pink-500">
                  {company.name?.charAt(0) ?? '-'}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-extrabold text-slate-900">{company.name}</h3>
              <p className="text-sm font-medium text-slate-500">{company.email || '-'}</p>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${company.status === 'ACTIVE' ? 'bg-success-light text-success-dark' : 'bg-error-light text-error'}`}>
                {company.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</div>
              <div className="text-sm font-semibold text-slate-800">{company.phone_number || 'Not provided'}</div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address</div>
              <div className="text-sm font-semibold text-slate-800">{company.address || 'Address not listed'}</div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Registration Date</div>
              <div className="text-sm font-semibold text-slate-800">{new Date(company.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Updated</div>
              <div className="text-sm font-semibold text-slate-800">{new Date(company.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-surface-100 text-right">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 font-semibold transition-all"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CompanyDetailsModal;
