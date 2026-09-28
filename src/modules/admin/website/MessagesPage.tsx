import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Inbox, Mail, RefreshCcw, RotateCcw, X } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import DataTable, { PrimaryCell, RowAction, type Column } from '../../../components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState, Page, PageHeader, Toolbar, ToolbarSelect } from '../../../components/ui/Page';
import { DetailRow } from '../../../components/ui/AppModal';
import { DEFAULT_PAGE_SIZE } from '../../../hooks/usePagination';
import { websiteService, SUBJECT_LABELS, type ContactMessage, type MessageStatus } from './websiteService';

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

/** Messages visitors send from the public Contact page. */
const MessagesPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'ALL'>('NEW');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [unhandled, setUnhandled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState<ContactMessage | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await websiteService.getMessages({
        page,
        limit: pageSize,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setMessages(data.results);
      setTotal(data.total);
      setUnhandled(data.unhandled);
    } catch (err: any) {
      setError(err.errorMessage || err.message || 'Error fetching messages');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const setHandled = async (m: ContactMessage, handled: boolean) => {
    setBusyId(m.id);
    setActionError(null);
    try {
      const updated = await websiteService.setMessageHandled(m.id, handled);
      setOpen((current) => (current?.id === m.id ? { ...current, ...updated } : current));
      await fetchMessages();
    } catch (err: any) {
      setActionError(err.errorMessage || err.message || 'Could not update the message.');
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<ContactMessage>[] = [
    {
      header: 'From',
      cell: (m) => (
        <div className="max-w-[14rem]">
          <PrimaryCell title={m.name} subtitle={m.email} />
        </div>
      ),
    },
    { header: 'Subject', cell: (m) => SUBJECT_LABELS[m.subject] || m.subject },
    {
      header: 'Message',
      cell: (m) => <p className="max-w-[20rem] truncate text-slate-600">{m.message}</p>,
      hideBelowLg: true,
    },
    { header: 'Received', cell: (m) => formatDateTime(m.created_at), hideBelowLg: true },
    {
      header: 'Status',
      cell: (m) => (m.status === 'NEW' ? <Badge variant="warning" dot>New</Badge> : <Badge variant="success" dot>Handled</Badge>),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (m) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          {m.status === 'NEW' ? (
            <RowAction label="Mark handled" disabled={busyId === m.id} onClick={() => setHandled(m, true)}
              className="hover:bg-brand-50 hover:text-brand-700"><CheckCircle2 size={16} /></RowAction>
          ) : (
            <RowAction label="Mark as new" disabled={busyId === m.id} onClick={() => setHandled(m, false)}>
              <RotateCcw size={15} />
            </RowAction>
          )}
        </div>
      ),
    },
  ];

  const filtersActive = statusFilter !== 'NEW' || search.trim() !== '';

  return (
    <Page>
      <PageHeader
        title="Messages"
        description={unhandled > 0
          ? `Sent from the website's Contact page. ${unhandled} waiting for a reply.`
          : "Sent from the website's Contact page. Nothing waiting for a reply."}
        actions={
          <Button variant="outline" onClick={fetchMessages} disabled={loading}>
            <RefreshCcw size={16} /> Refresh
          </Button>
        }
      />

      <Toolbar value={searchInput} onChange={setSearchInput} placeholder="Search by name, email, phone or message">
        <ToolbarSelect
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as MessageStatus | 'ALL'); setPage(1); }}
          aria-label="Filter by status"
        >
          <option value="NEW">New</option>
          <option value="HANDLED">Handled</option>
          <option value="ALL">All messages</option>
        </ToolbarSelect>
      </Toolbar>

      {actionError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100"><X size={15} /></button>
        </div>
      )}

      {error ? (
        <ErrorState title="Couldn't load messages" message={error} onRetry={fetchMessages} />
      ) : loading && messages.length === 0 ? (
        <LoadingState label="Loading messages…" />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<Inbox size={20} />}
          title={filtersActive ? 'No matching messages' : 'No new messages'}
          description={filtersActive ? 'Try a different search term or status filter.' : 'Messages sent from the Contact page will appear here.'}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={messages} rowKey={(m) => m.id} onRowClick={(m) => setOpen(m)} />
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

      <Modal isOpen={!!open} onClose={() => setOpen(null)} title="Message" subtitle={open ? `${open.name} · ${formatDateTime(open.created_at)}` : undefined}>
        {open && (
          <div className="space-y-4">
            <div>
              <DetailRow label="From" value={open.name} />
              <DetailRow label="Email" value={<a href={`mailto:${open.email}`} className="text-brand-700 hover:underline">{open.email}</a>} />
              <DetailRow label="Phone" value={open.phone ? <a href={`tel:${open.phone}`} className="text-brand-700 hover:underline">{open.phone}</a> : ''} />
              <DetailRow label="Subject" value={SUBJECT_LABELS[open.subject] || open.subject} />
              <DetailRow label="Status" value={open.status === 'NEW' ? 'New' : `Handled ${formatDateTime(open.handled_at)}`} />
            </div>
            <p className="whitespace-pre-line rounded-[var(--radius-control)] bg-surface-50 p-4 text-sm text-slate-800">{open.message}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${SUBJECT_LABELS[open.subject] || 'Your message'}`)}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-surface-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-surface-50"
              >
                <Mail size={16} /> Reply by email
              </a>
              {open.status === 'NEW' ? (
                <Button onClick={() => setHandled(open, true)} disabled={busyId === open.id}>
                  <CheckCircle2 size={16} /> Mark handled
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setHandled(open, false)} disabled={busyId === open.id}>
                  <RotateCcw size={15} /> Mark as new
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
};

export default MessagesPage;
