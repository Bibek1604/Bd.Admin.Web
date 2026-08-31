import React, { useState, useMemo } from 'react';
import { useCompanies } from './useCompanies';
import CompanyCard, { CompanySkeleton } from './CompanyCard';
import CompanyDetailsModal from './CompanyDetailsModal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CompaniesList: React.FC = () => {
  const { companies, loading, error, refetch } = useCompanies();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  if (error) {
    return (
      <div className="text-center p-12 bg-rose-50 rounded-2xl border border-rose-100">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-lg font-extrabold text-rose-700">Could not load companies</h3>
        <p className="text-sm text-rose-600 my-3">{error}</p>
        <Button variant="ghost" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="companies-container animate-fade-in py-10">
      <header className="flex items-center justify-between flex-wrap gap-6 mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-900">All Registered Companies</h2>
          <p className="text-sm text-slate-500 font-medium">Listing all admin-managed companies and agencies.</p>
        </div>

        <div className="w-full max-w-md">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <CompanySkeleton key={i} />)}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="py-24 bg-white rounded-2xl border-2 border-dashed border-surface-100 text-center">
          <div className="text-5xl mb-6 opacity-40">🔍</div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">No matches found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search filters.</p>
          {searchTerm && <Button variant="ghost" className="mt-4" onClick={() => setSearchTerm('')}>Clear Search</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              onClick={(id) => setSelectedCompanyId(id)}
            />
          ))}
        </div>
      )}

      <CompanyDetailsModal 
        isOpen={!!selectedCompanyId} 
        company={selectedCompany} 
        onClose={() => setSelectedCompanyId(null)}
      />

      
    </div>
  );
};

export default CompaniesList;
