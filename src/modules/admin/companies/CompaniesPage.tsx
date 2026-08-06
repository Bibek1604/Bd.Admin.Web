import React, { useState, useMemo } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { useCompanies } from './useCompanies';
import CompaniesTable from './CompaniesTable';
import CompanyModal from './CompanyModal';
import { type Company } from './companyService';

import { Plus, Search, Filter } from 'lucide-react';

const CompaniesPage: React.FC = () => {
  const { companies, loading, error, createCompany, updateCompany, deleteCompany } = useCompanies();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'details'>('create');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filteredCompanies = useMemo(() => {
    return (companies || []).filter(c => {
      const matchesSearch = (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const pg = usePagination(filteredCompanies);

  const handleOpenModal = (mode: 'create' | 'edit' | 'details', company?: Company) => {
    setModalMode(mode);
    setSelectedCompany(company || null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (modalMode === 'create') {
      await createCompany(data);
    } else if (modalMode === 'edit' && selectedCompany) {
      await updateCompany(selectedCompany.id, data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company? This cannot be undone.')) {
      deleteCompany(id);
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="text-6xl mb-6 grayscale opacity-50">🏢</div>
      <h2 className="text-xl font-black text-rose-500 mb-2">Couldn't load companies</h2>
      <p className="text-sm font-medium text-slate-400">{error}</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100/50 mb-4">
             🏢 Companies
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Company Management</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Add and manage the insurance companies you work with.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('create')}
          className="w-full sm:w-auto h-12 px-8 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-100 shadow-xl shadow-brand-100 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add New Company
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/60 matte-shadow">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none pl-10 pr-10 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-600 outline-none hover:bg-white transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             ▼
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && companies.length === 0 ? (
        <div className="py-24 text-center animate-pulse">
          <div className="text-6xl mb-6 grayscale opacity-40">🏢</div>
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">Loading companies data...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
          <div className="text-6xl mb-6 grayscale opacity-30">📁</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Companies Found</h3>
          <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">No companies match your search. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="animate-slide-up">
          <CompaniesTable 
            data={pg.pageItems}
            onView={(c) => handleOpenModal('details', c)}
            onEdit={(c) => handleOpenModal('edit', c)}
            onDelete={handleDelete}
          />
          <Pagination
            page={pg.page}
            pageSize={pg.pageSize}
            total={pg.total}
            totalPages={pg.totalPages}
            startIndex={pg.startIndex}
            endIndex={pg.endIndex}
            onPageChange={pg.setPage}
            onPageSizeChange={pg.setPageSize}
          />
        </div>
      )}

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        company={selectedCompany}
        mode={modalMode}
      />
    </div>
  );
};

export default CompaniesPage;
