import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Eye, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import DataTable, { Monogram, PrimaryCell, RowAction, type Column } from '../../../components/ui/DataTable';
import { EmptyState, ErrorNotice, ErrorState, LoadingState, Page, PageHeader, Toolbar, ToolbarSelect } from '../../../components/ui/Page';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { extractMessage } from '../../../utils/formErrors';
import { usePagination } from '../../../hooks/usePagination';
import PlanModal from './PlanModal';
import { FREQUENCY_LABELS, planService, type Plan, type PlanCatalog, type PlanInput } from './planService';

const PlansPage: React.FC = () => {
  const [catalog, setCatalog] = useState<PlanCatalog | null>(null);
  const [insurers, setInsurers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState<string | null>(null), [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState(''), [statusFilter, setStatusFilter] = useState('all'), [engineFilter, setEngineFilter] = useState('all');
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit' | 'details'; plan: Plan | null }>({ open: false, mode: 'create', plan: null });
  const confirm = useConfirm();

  // State is only set in promise callbacks, so the initial load can run from an effect.
  const load = useCallback(() => planService.list()
    .then(data => { setCatalog(data); setError(null); })
    .catch(err => setError(extractMessage(err, 'Could not load LIC plans.')))
    .finally(() => setLoading(false)), []);
  const refresh = useCallback(async () => { setLoading(true); await load(); }, [load]);
  useEffect(() => {
    void load();
    planService.insurers().then(setInsurers).catch(() => { /* Insurer list is only needed to verify plan rates. */ });
  }, [load]);

  const plans = useMemo(() => catalog?.plans ?? [], [catalog]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plans.filter(p => (!q || `${p.name} ${p.code} ${p.category}`.toLowerCase().includes(q))
      && (statusFilter === 'all' || p.status === statusFilter) && (engineFilter === 'all' || p.engine === engineFilter));
  }, [plans, search, statusFilter, engineFilter]);
  const pg = usePagination(filtered);

  const open = (mode: 'create' | 'edit' | 'details', plan: Plan | null = null) => setModal({ open: true, mode, plan });
  const handleSubmit = async (data: PlanInput) => {
    if (modal.mode === 'create') await planService.create(data);
    else if (modal.plan) await planService.update(modal.plan.id, data);
    await refresh();
  };
  const toggleStatus = async (plan: Plan) => {
    setActionError(null);
    try { await planService.update(plan.id, { status: plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); await refresh(); }
    catch (err) { setActionError(extractMessage(err, 'Could not change the plan status.')); }
  };
  const handleDelete = async (plan: Plan) => {
    const ok = await confirm({
      title: 'Delete this plan?',
      message: 'Agents will no longer see it or be able to quote it. Quotes already saved keep their history.',
      details: [{ label: 'Plan', value: `${plan.name} (${plan.code})` }],
      confirmLabel: 'Delete plan', tone: 'danger',
    });
    if (!ok) return;
    setActionError(null);
    try { await planService.remove(plan.id); await refresh(); }
    catch (err) { setActionError(extractMessage(err, 'Could not delete the plan.')); }
  };

  const columns: Column<Plan>[] = [
    { header: 'Plan', cell: p => <PrimaryCell avatar={<Monogram text={p.name} />} title={`${p.name} (${p.code})`} subtitle={p.description || p.category} /> },
    { header: 'Category', cell: p => p.category, hideBelowLg: true },
    { header: 'Calculation', cell: p => <Badge variant={p.engine === 'WORKBOOK' ? 'info' : 'default'}>{p.engine === 'WORKBOOK' ? 'Workbook formulas' : 'Configurable'}</Badge>, hideBelowLg: true },
    { header: 'Payment modes', cell: p => p.frequencies.map(f => FREQUENCY_LABELS[f]).join(', '), hideBelowLg: true },
    {
      header: 'Rates', hideBelowLg: true,
      cell: p => p.engine === 'WORKBOOK'
        ? <span className="text-slate-500">Rate versions</span>
        : <Badge variant={p.rateSource?.status === 'VERIFIED' ? 'success' : 'warning'}>{p.rateSource?.status === 'VERIFIED' ? 'Verified' : 'Reference'}</Badge>,
    },
    { header: 'Status', cell: p => <Badge dot variant={p.status === 'ACTIVE' ? 'success' : 'default'}>{p.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge> },
    {
      header: 'Actions', align: 'right',
      cell: p => (
        <div className="flex items-center justify-end gap-0.5">
          <RowAction label="View plan" onClick={() => open('details', p)}><Eye size={15} /></RowAction>
          <RowAction label="Edit plan" onClick={() => open('edit', p)}><Pencil size={15} /></RowAction>
          <RowAction label={p.status === 'ACTIVE' ? 'Deactivate plan' : 'Activate plan'} onClick={() => toggleStatus(p)}><Power size={15} /></RowAction>
          <RowAction label="Delete plan" danger onClick={() => handleDelete(p)}><Trash2 size={15} /></RowAction>
        </div>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title="LIC Plans"
        description="Plans agents can quote in the premium calculator. Workbook plans use the Excel formulas; new plans use the configurable formula."
        actions={<Button onClick={() => open('create')}><Plus size={16} /> New plan</Button>}
      />
      <Toolbar value={search} onChange={setSearch} placeholder="Search by name, code or category">
        <ToolbarSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </ToolbarSelect>
        <ToolbarSelect value={engineFilter} onChange={e => setEngineFilter(e.target.value)} aria-label="Filter by calculation">
          <option value="all">All calculations</option><option value="WORKBOOK">Workbook formulas</option><option value="STANDARD">Configurable</option>
        </ToolbarSelect>
      </Toolbar>
      {actionError && <ErrorNotice message={actionError} onDismiss={() => setActionError(null)} />}
      {error ? (
        <ErrorState title="Couldn't load LIC plans" message={error} onRetry={() => refresh()} />
      ) : loading && !catalog ? (
        <LoadingState label="Loading LIC plans…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BookOpen size={20} />} title={plans.length === 0 ? 'No plans yet' : 'No matching plans'}
          description={plans.length === 0 ? 'Create a plan so agents can quote it.' : 'Try a different search term or filter.'}
          action={plans.length === 0 ? <Button onClick={() => open('create')}><Plus size={16} /> New plan</Button> : undefined} />
      ) : (
        <>
          <DataTable columns={columns} rows={pg.pageItems} rowKey={p => p.id} />
          <Pagination page={pg.page} pageSize={pg.pageSize} total={pg.total} totalPages={pg.totalPages} startIndex={pg.startIndex} endIndex={pg.endIndex} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize} />
        </>
      )}
      {modal.open && <PlanModal key={`${modal.mode}-${modal.plan?.id ?? 'new'}`} isOpen={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))} mode={modal.mode} plan={modal.plan} catalog={catalog} insurers={insurers} onSubmit={handleSubmit} />}
    </Page>
  );
};

export default PlansPage;
