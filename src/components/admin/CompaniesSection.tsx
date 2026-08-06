import React, { useEffect, useState } from 'react';
import { type Company, companyApi } from '../../api/companyApi';
import resolveImage from '../../utils/resolveImage';
import Button from '../ui/Button';

const CompaniesSection: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companyApi.getCompanies();
        setCompanies(data);
      } catch (err) {
        setError('Failed to load companies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-200 border-t-brand-500 mb-4" />
        <p className="text-sm font-medium">Loading companies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-error">
        <div className="text-4xl mb-2">⚠️</div>
        <p className="mb-4 font-semibold">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="companies-section">
      <div className="mb-6">
        <h2 className="text-h2 font-extrabold text-slate-900">All Registered Companies</h2>
        <p className="text-sm font-medium text-slate-500">Browse and manage the companies registered in the system.</p>
      </div>
      
      {companies.length === 0 ? (
        <div className="p-12 text-center bg-surface-50 rounded-2xl border-2 border-dashed border-surface-100 text-slate-500">
          <p className="font-medium">No companies found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl border border-surface-100 matte-shadow flex flex-col overflow-hidden animate-slide-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="h-36 bg-surface-100 flex items-center justify-center border-b border-surface-100">
                {company.image ? (
                  <img src={resolveImage(company.image)} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-pink-500 text-white flex items-center justify-center text-2xl font-extrabold shadow-md">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{company.name}</h3>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-4">Registered on</div>
                <div className="text-sm font-semibold text-slate-800 mb-4">{new Date(company.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div className="mt-auto">
                  <Button variant="outline" className="w-full">View Details</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* animations and spacing now use shared classes from index.css */}
    </div>
  );
};
export default CompaniesSection;