import React, { useEffect, useState } from 'react';
import { Check, ClipboardList, RefreshCcw, X } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import DataTable, { PrimaryCell, RowAction, type Column } from '../../../components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState, Page, PageHeader, Toolbar, ToolbarSelect } from '../../../components/ui/Page';
import { DEFAULT_PAGE_SIZE } from '../../../hooks/usePagination';
import { useRequests } from './useRequests';
import { type AgentRequest, type RequestStatus } from './requestsService';
import { useConfirm } from '../../../components/ui/ConfirmDialog';

const STATUS_BADGE: Record<RequestStatus, { label: string; variant: 'warning' | 'success' | 'error' }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'error' },
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

type Notice = { kind: 'success' | 'error'; text: string } | null;

const RequestsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [notice, setNotice] = useState<Notice>(null);
  const confirm = useConfirm();

  // Search is server-side, so wait for the admin to stop typing instead of
  // firing one request per keystroke into the client-side rate limiter.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { requests, total, loading, error, busyId, refetch, decide } = useRequests({
    page, pageSize, status: statusFilter, search,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Clamp back into range when the list shrinks (e.g. after a filter change).
  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const handleDecision = async (r: AgentRequest, action: 'approve' | 'reject') => {
    const approving = action === 'approve';
    const ok = await confirm({
      title: approving ? 'Approve this request?' : 'Reject this request?',
      message: approving
        ? 'The person will be told their access request was approved.'
        : 'The person will be told their access request was not approved.',
      details: [
        { label: 'Name', value: r.name },
        { label: 'Email', value: r.email },
        { label: 'Phone', value: r.phone },
        { label: 'Submitted', value: formatDateTime(r.created_at) },
      ],
      confirmLabel: approving ? 'Approve' : 'Reject',
      tone: approving ? 'success' : 'danger',
    });
    if (!ok) return;
    setNotice(null);
    try {
      await decide(r.id, action);
      setNotice({ kind: 'success', text: `Request from ${r.name} ${action === 'approve' ? 'approved' : 'rejected'}.` });
    } catch (err: any) {
      setNotice({ kind: 'error', text: err.errorMessage || err.message || `Could not ${action} the request.` });
    }
  };

  const columns: Column<AgentRequest>[] = [
    {
      header: 'Name',
      cell: (r) => (
        <div className="max-w-[16rem]">
          <PrimaryCell title={r.name} subtitle={r.agent?.full_name ? `Agent: ${r.agent.full_name}` : undefined} />
        </div>
      ),
    },
    { header: 'Email', cell: (r) => (r.email ? <span className="break-all">{r.email}</span> : <span className="text-slate-400">-</span>) },
    { header: 'Phone', cell: (r) => r.phone },
    { header: 'Submitted', cell: (r) => formatDateTime(r.created_at), hideBelowLg: true },
    {
      header: 'Status',
      cell: (r) => {
        const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.PENDING;
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge variant={badge.variant} dot>{badge.label}</Badge>
            {r.status !== 'PENDING' && r.reviewed_at && (
              <span className="text-xs text-slate-400">
                {formatDateTime(r.reviewed_at)}{r.reviewer?.username ? ` · ${r.reviewer.username}` : ''}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (r) =>
        r.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-0.5">
            <RowAction
              label="Approve request"
              disabled={busyId === r.id}
              onClick={() => handleDecision(r, 'approve')}
              className="hover:bg-brand-50 hover:text-brand-700"
            >
              <Check size={16} />
            </RowAction>
            <RowAction
              label="Reject request"
              danger
              disabled={busyId === r.id}
              onClick={() => handleDecision(r, 'reject')}
            >
              <X size={16} />
            </RowAction>
          </div>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
  ];

  const filtersActive = statusFilter !== 'ALL' || search.trim() !== '';

  return (
    <Page>
      <PageHeader
        title="Requests"
        description="Access requests sent from the login page by people without an account. Approve or reject pending ones."
        actions={
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCcw size={16} /> Refresh
          </Button>
        }
      />

      <Toolbar value={searchInput} onChange={setSearchInput} placeholder="Search by name, email or phone">
        <ToolbarSelect
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as RequestStatus | 'ALL'); setPage(1); }}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </ToolbarSelect>
      </Toolbar>

      {notice && (
        <div
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`flex items-start justify-between gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-sm ${
            notice.kind === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-brand-100 bg-brand-50 text-brand-700'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}

      {error ? (
        <ErrorState title="Couldn't load requests" message={error} onRetry={refetch} />
      ) : loading && requests.length === 0 ? (
        <LoadingState label="Loading requests…" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={20} />}
          title={filtersActive ? 'No matching requests' : 'No requests yet'}
          description={
            filtersActive
              ? 'Try a different search term or status filter.'
              : 'Requests sent with Request Access on the login page will appear here.'
          }
        />
      ) : (
        <>
          <DataTable columns={columns} rows={requests} rowKey={(r) => r.id} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            startIndex={total === 0 ? 0 : (page - 1) * pageSize + 1}
            endIndex={Math.min(page * pageSize, total)}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </>
      )}
    </Page>
  );
};

export default RequestsPage;
