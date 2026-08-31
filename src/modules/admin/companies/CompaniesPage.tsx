import React, { useMemo, useState } from 'react';
import { Briefcase, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import DataTable, { Monogram, PrimaryCell, RowAction, type Column } from '../../../components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState, Page, PageHeader, Toolbar, ToolbarSelect } from '../../../components/ui/Page';
import { usePagination } from '../../../hooks/usePagination';
import { useCompanies } from './useCompanies';
import CompanyModal from './CompanyModal';
import { type Company } from './companyService';

const CompaniesPage: React.FC = () => {
  const { companies, loading, error, createCompany, updateCompany, deleteCompany } = useCompanies();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'details'>('create');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (companies || []).filter((c) => {
      const haystack = `${c.name ?? ''} ${c.email ?? ''} ${c.phone_number ?? ''}`.toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = statusFilter === 'all' || (c.status ?? '').toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const pg = usePagination(filtered);

  const openModal = (mode: 'create' | 'edit' | 'details', company?: Company) => {
    setModalMode(mode);
    setSelectedCompany(company || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (modalMode === 'create') {
      await createCompany(data);
    } else if (modalMode === 'edit' && selectedCompany) {
      await updateCompany(selectedCompany.id, data);
    }
  };

  const handleDelete = (company: Company) => {
    if (window.confirm(`Delete ${company.name}? This cannot be undone.`)) {
      deleteCompany(company.id);
    }
  };

  const columns: Column<Company>[] = [
    {
      header: 'Company',
      cell: (c) => (
        <PrimaryCell
          avatar={
            c.image ? (
              <img src={c.image} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <Monogram text={c.name || '?'} />
            )
          }
          title={c.name}
          subtitle={c.email || undefined}
        />
      ),
    },
    { header: 'Phone', cell: (c) => c.phone_number || <span className="text-slate-400">—</span>, hideBelowLg: true },
    {
      header: 'Added',
      cell: (c) =>
        c.created_at
          ? new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
      hideBelowLg: true,
    },
    {
      header: 'Status',
      cell: (c) => (
        <Badge dot variant={(c.status ?? '').toUpperCase() === 'ACTIVE' ? 'success' : 'default'}>
          {(c.status ?? '').toUpperCase() === 'ACTIVE' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-0.5">
          <RowAction label="View details" onClick={() => openModal('details', c)}><Eye size={15} /></RowAction>
          <RowAction label="Edit company" onClick={() => openModal('edit', c)}><Pencil size={15} /></RowAction>
          <RowAction label="Delete company" danger onClick={() => handleDelete(c)}><Trash2 size={15} /></RowAction>
        </div>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title="Companies"
        description="Insurance companies your agents are attached to."
        actions={
          <Button onClick={() => openModal('create')}>
            <Plus size={16} /> New company
          </Button>
        }
      />

      <Toolbar value={search} onChange={setSearch} placeholder="Search by name, email or phone">
        <ToolbarSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </ToolbarSelect>
      </Toolbar>

      {error ? (
        <ErrorState title="Couldn't load companies" message={error} />
      ) : loading && filtered.length === 0 ? (
        <LoadingState label="Loading companies…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={20} />}
          title={companies.length === 0 ? 'No companies yet' : 'No matching companies'}
          description={
            companies.length === 0
              ? 'Add a company before creating agent accounts.'
              : 'Try a different search term or status filter.'
          }
          action={companies.length === 0 ? <Button onClick={() => openModal('create')}><Plus size={16} /> New company</Button> : undefined}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={pg.pageItems} rowKey={(c) => String(c.id)} />
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

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        company={selectedCompany}
        mode={modalMode}
      />
    </Page>
  );
};

export default CompaniesPage;
