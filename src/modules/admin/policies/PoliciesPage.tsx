import React, { useState, useMemo } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { usePolicies } from './usePolicies';
import PoliciesTable from './PoliciesTable';
import PolicyModal from './PolicyModal';
import type { Policy } from './policiesService';
import { Shield, Plus, Search, RefreshCcw } from 'lucide-react';

const PoliciesPage: React.FC = () => {
  const { policies, loading, error, createPolicy, updatePolicy, deletePolicy, refresh } = usePolicies();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'details'>('create');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.company_name && p.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || p.company_name === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [policies, searchTerm, typeFilter]);

  const pg = usePagination(filteredPolicies);

  const companyNames = useMemo(() =>
    Array.from(new Set(policies.map(p => p.company_name).filter(Boolean))),
    [policies]
  );

  const handleOpenModal = (mode: 'create' | 'edit' | 'details', policy?: Policy) => {
    setModalMode(mode);
    setSelectedPolicy(policy || null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (modalMode === 'create') await createPolicy(data);
    else if (modalMode === 'edit' && selectedPolicy) await updatePolicy(selectedPolicy.id, data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this policy? This cannot be undone.')) {
      deletePolicy(id);
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="text-6xl mb-6">📜</div>
      <h2 className="text-xl font-black text-rose-500 mb-2">Couldn't load policies</h2>
      <p className="text-sm text-slate-400">{error}</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-violet-600 font-black text-xs uppercase tracking-widest bg-violet-50 w-fit px-4 py-1.5 rounded-full border border-violet-100/50 mb-4">
            <Shield size={16} /> Policies
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">Policy Management</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Create and manage the insurance policies you offer.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white px-5 py-4 py-3.5 rounded-2xl border border-surface-200 text-sm font-bold text-slate-600 outline-none appearance-none matte-shadow"
          >
            <option value="all">All Companies</option>
            {companyNames.map(name => (
              <option key={name as string} value={name as string}>{name}</option>
            ))}
          </select>
          <button onClick={() => refresh()} title="Reload latest data" aria-label="Reload"
            className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl border border-surface-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => handleOpenModal('create')}
            className="px-8 h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm tracking-tight transition-all hover:scale-105 shadow-xl shadow-brand-200 flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={16} /> Create Policy
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-surface-100 matte-shadow flex items-center gap-4">
        <Search size={18} className="text-slate-300" />
        <input
          type="text"
          placeholder="Search by policy name or company..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
        />
        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{filteredPolicies.length} policies</span>
      </div>

      {loading && policies.length === 0 ? (
        <div className="py-24 text-center text-slate-300 font-bold italic">Loading policies...</div>
      ) : filteredPolicies.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
          <div className="text-6xl mb-6">📜</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Policies Found</h3>
          <p className="text-sm text-slate-400">Check your filters or create a new policy to get started.</p>
        </div>
      ) : (
        <>
        <PoliciesTable
          data={pg.pageItems}
          onView={p => handleOpenModal('details', p)}
          onEdit={p => handleOpenModal('edit', p)}
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
        </>
      )}

      <PolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        policy={selectedPolicy}
        mode={modalMode}
      />
    </div>
  );
};

export default PoliciesPage;




