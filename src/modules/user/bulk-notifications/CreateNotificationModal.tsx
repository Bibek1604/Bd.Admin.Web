import React, { useState, useEffect } from 'react';
import { bulkNotificationsService } from './bulkNotificationsService';
import agentsService from '../../admin/agents/agentsService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalTextarea } from '../../../components/ui/AppModal';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';
import { Bell } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNotificationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isOpen) agentsService.getAgents().then(setAgents).catch(console.error);
  }, [isOpen]);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!content.trim()) e.content = 'Message content is required.';
    if (targetType === 'single' && !selectedAgentId) e.selectedAgentId = 'Select a recipient.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) { setFieldErrors(clientErrors); setError('Please fix the highlighted fields.'); return; }
    setLoading(true);
    try {
      await bulkNotificationsService.createBulkNotification({
        title,
        content,
        target_type: targetType,
        target_agent_id: targetType === 'single' ? selectedAgentId : undefined,
      });
      onSuccess();
      onClose();
      setTitle('');
      setContent('');
      setTargetType('all');
      setSelectedAgentId('');
      setFieldErrors({});
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err, 'Failed to send notification.'));
    } finally {
      setLoading(false);
    }
  };

  // Cancel used to keep the last error, so reopening the dialog greeted the
  // admin with a failure from a previous attempt.
  const handleClose = () => {
    setError(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen} onClose={handleClose} title="New notification"
      subtitle="Send a message to your agents."
      accentColor="sky" mode="create" onSubmit={handleSubmit}
      loading={loading} submitLabel="Send"
      footer={<div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Bell size={14} /> Communications System</div>}
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-5 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100">!</span>
          <span>{error}</span>
        </div>
      )}
      <ModalGrid cols={1}>
        <ModalField label="Audience">
          <select
            value={targetType}
            onChange={e => setTargetType(e.target.value as 'all' | 'single')}
            title="Audience"
            aria-label="Audience"
            className="w-full rounded-[var(--radius-control)] border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:bg-white"
          >
            <option value="all">All agents</option>
            <option value="single">A single agent</option>
          </select>
        </ModalField>
        {targetType === 'single' && (
          <ModalField label="Agent" required error={fieldErrors.selectedAgentId}>
            <select
              value={selectedAgentId}
              onChange={e => setSelectedAgentId(e.target.value)}
              required
              title="Agent"
              aria-label="Agent"
              className="w-full rounded-[var(--radius-control)] border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:bg-white"
            >
              <option value="">Select an agent</option>
              {agents.map(a => (
                <option key={a.id} value={String(a.id)}>{a.first_name} {a.last_name} (@{a.username})</option>
              ))}
            </select>
          </ModalField>
        )}
        <ModalField label="Title" required error={fieldErrors.title}>
          <ModalInput required error={!!fieldErrors.title} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly performance update" />
        </ModalField>
        <ModalField label="Message" required error={fieldErrors.content}>
          <ModalTextarea required error={!!fieldErrors.content} rows={4} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your message…" />
        </ModalField>
      </ModalGrid>
    </AppModal>
  );
};

export default CreateNotificationModal;
