import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MessageSquare, Pencil, Plus, Trash2, UploadCloud, UserCheck } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import DataTable, { Monogram, PrimaryCell, RowAction, type Column } from '../../../components/ui/DataTable';
import { EmptyState, ErrorNotice, ErrorState, LoadingState, Page, PageHeader, Toolbar, ToolbarSelect } from '../../../components/ui/Page';
import { extractMessage } from '../../../utils/formErrors';
import { usePagination } from '../../../hooks/usePagination';
import { useAgents } from './useAgents';
import SendAlertModal from './SendAlertModal';
import AgentModal from './AgentModal';
import { useConfirm } from '../../../components/ui/ConfirmDialog';

const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { agents, loading, error, refresh, create, update, remove } = useAgents();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'details'>('create');
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (agents || []).filter((agent) => {
      const haystack = `${agent.first_name} ${agent.last_name} ${agent.username} ${agent.email}`.toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? agent.is_active : !agent.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [agents, search, statusFilter]);

  const pg = usePagination(filtered);

  const openModal = (mode: 'create' | 'edit' | 'details', agent?: any) => {
    setModalMode(mode);
    setSelectedAgent(agent || null);
    setIsAgentModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (modalMode === 'create') {
      const created = await create(data);
      setSelectedAgent(created);
      setModalMode('details');
    } else if (modalMode === 'edit' && selectedAgent) {
      await update(selectedAgent.id, data);
    }
  };

  const confirm = useConfirm();
  const handleDelete = async (agent: any) => {
    const ok = await confirm({
      title: 'Delete this agent?',
      message: 'This cannot be undone.',
      details: [
        { label: 'Name', value: `${agent.first_name ?? ''} ${agent.last_name ?? ''}`.trim() },
        { label: 'Email', value: agent.email },
      ],
      confirmLabel: 'Delete agent',
      tone: 'danger',
    });
    if (!ok) return;
    setActionError(null);
    // The rejection used to go unhandled: a refused delete (e.g. the agent
    // still owns clients) looked exactly like nothing happening.
    try {
      await remove(agent.id);
    } catch (err) {
      setActionError(extractMessage(err, 'Could not delete the agent.'));
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Agent',
      cell: (a) => (
        <PrimaryCell
          avatar={<Monogram text={`${a.first_name?.[0] ?? ''}${a.last_name?.[0] ?? ''}` || a.username} />}
          title={`${a.first_name} ${a.last_name}`.trim() || a.username}
          subtitle={a.email}
        />
      ),
    },
    { header: 'Username', cell: (a) => <span className="text-slate-600">{a.username}</span>, hideBelowLg: true },
    { header: 'Company', cell: (a) => a.company_name || <span className="text-slate-400">Unassigned</span>, hideBelowLg: true },
    { header: 'Clients', cell: (a) => <span className="tabular-nums">{a.num_clients ?? 0}</span>, hideBelowLg: true },
    {
      header: 'Status',
      cell: (a) => (
        <Badge dot variant={a.is_active ? 'success' : 'default'}>
          {a.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (a) => (
        <div className="flex items-center justify-end gap-0.5">
          <RowAction label="View details" onClick={() => openModal('details', a)}><Eye size={15} /></RowAction>
          <RowAction
            label="Bulk upload clients"
            onClick={() => navigate(`/clients/bulk-enrollment?agentId=${encodeURIComponent(a.id)}`)}
          >
            <UploadCloud size={15} />
          </RowAction>
          <RowAction label="Send alert" onClick={() => { setSelectedAgent(a); setIsAlertOpen(true); }}><MessageSquare size={15} /></RowAction>
          <RowAction label="Edit agent" onClick={() => openModal('edit', a)}><Pencil size={15} /></RowAction>
          <RowAction label="Delete agent" danger onClick={() => handleDelete(a)}><Trash2 size={15} /></RowAction>
        </div>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title="Agents"
        description="Manage agent accounts and send them alerts."
        actions={
          <Button onClick={() => openModal('create')}>
            <Plus size={16} /> New agent
          </Button>
        }
      />

      <Toolbar value={search} onChange={setSearch} placeholder="Search by name, username or email">
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

      {actionError && <ErrorNotice message={actionError} onDismiss={() => setActionError(null)} />}

      {error ? (
        <ErrorState title="Couldn't load agents" message={error} onRetry={() => refresh()} />
      ) : loading && filtered.length === 0 ? (
        <LoadingState label="Loading agents…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={20} />}
          title={agents.length === 0 ? 'No agents yet' : 'No matching agents'}
          description={
            agents.length === 0
              ? 'Create an agent account to get started.'
              : 'Try a different search term or status filter.'
          }
          action={agents.length === 0 ? <Button onClick={() => openModal('create')}><Plus size={16} /> New agent</Button> : undefined}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={pg.pageItems} rowKey={(a) => String(a.id)} />
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

      <SendAlertModal
        isOpen={isAlertOpen}
        onClose={() => { setIsAlertOpen(false); setSelectedAgent(null); }}
        agent={selectedAgent}
      />

      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => { setIsAgentModalOpen(false); setSelectedAgent(null); }}
        onSubmit={handleSubmit}
        agent={selectedAgent}
        mode={modalMode}
      />
    </Page>
  );
};

export default AgentsPage;
