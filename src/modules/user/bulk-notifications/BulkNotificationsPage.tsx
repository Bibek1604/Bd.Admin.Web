import React, { useMemo, useState } from 'react';
import { Bell, Eye, Plus, Trash2 } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import DataTable, { PrimaryCell, RowAction, type Column } from '../../../components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState, Page, PageHeader, Toolbar, ToolbarSelect } from '../../../components/ui/Page';
import { usePagination } from '../../../hooks/usePagination';
import { useBulkNotifications } from './useBulkNotifications';
import { type BulkNotification } from './bulkNotificationsService';
import BulkNotificationDetailsModal from './BulkNotificationDetailsModal';
import CreateNotificationModal from './CreateNotificationModal';
import { useConfirm } from '../../../components/ui/ConfirmDialog';

const BulkNotificationsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { notifications, allCount, loading, error, refetch, remove } = useBulkNotifications(search, audienceFilter);
  const pg = usePagination(notifications);

  const selected = useMemo(
    () => notifications.find((n) => n.id === selectedId) || null,
    [notifications, selectedId],
  );

  const confirm = useConfirm();
  const handleDelete = async (n: BulkNotification) => {
    const ok = await confirm({
      title: 'Delete this notification?',
      message: 'This cannot be undone.',
      details: [{ label: 'Title', value: n.title }],
      confirmLabel: 'Delete notification',
      tone: 'danger',
    });
    if (ok) remove(n.id).catch(() => refetch());
  };

  const columns: Column<BulkNotification>[] = [
    {
      header: 'Notification',
      cell: (n) => (
        <div className="max-w-[22rem]">
          <PrimaryCell title={n.title} subtitle={n.content} />
        </div>
      ),
    },
    {
      header: 'Audience',
      cell: (n) =>
        n.target_type === 'SINGLE' ? (
          <Badge variant="info">{n.target_agent?.full_name || 'One agent'}</Badge>
        ) : (
          <Badge variant="default">All agents</Badge>
        ),
    },
    {
      header: 'Sent by',
      cell: (n) => n.creator?.username || <span className="text-slate-400">-</span>,
      hideBelowLg: true,
    },
    {
      header: 'Sent',
      cell: (n) =>
        new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      hideBelowLg: true,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (n) => (
        <div className="flex items-center justify-end gap-0.5">
          <RowAction label="View details" onClick={() => setSelectedId(n.id)}><Eye size={15} /></RowAction>
          <RowAction label="Delete notification" danger onClick={() => handleDelete(n)}><Trash2 size={15} /></RowAction>
        </div>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title="Notifications"
        description="Broadcasts sent to your agents."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> New notification
          </Button>
        }
      />

      <Toolbar value={search} onChange={setSearch} placeholder="Search by title or message">
        <ToolbarSelect
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          aria-label="Filter by audience"
        >
          <option value="ALL">All audiences</option>
          <option value="SINGLE">Single agent</option>
        </ToolbarSelect>
      </Toolbar>

      {error ? (
        <ErrorState title="Couldn't load notifications" message={error} onRetry={refetch} />
      ) : loading && notifications.length === 0 ? (
        <LoadingState label="Loading notifications…" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={20} />}
          title={allCount === 0 ? 'No notifications yet' : 'No matching notifications'}
          description={
            allCount === 0
              ? 'Send a broadcast to reach all of your agents at once.'
              : 'Try a different search term or audience filter.'
          }
          action={allCount === 0 ? <Button onClick={() => setIsCreateOpen(true)}><Plus size={16} /> New notification</Button> : undefined}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={pg.pageItems}
            rowKey={(n) => n.id}
            onRowClick={(n) => setSelectedId(n.id)}
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

      <BulkNotificationDetailsModal
        isOpen={!!selectedId}
        notification={selected}
        onClose={() => setSelectedId(null)}
      />
      <CreateNotificationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />
    </Page>
  );
};

export default BulkNotificationsPage;
