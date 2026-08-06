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

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title="Dispatch Notification"
      subtitle="Broadcast a message to users across your network"
      accentColor="sky" mode="create" onSubmit={handleSubmit}
      loading={loading} submitLabel="Send Broadcast"
      footer={<div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Bell size={14} /> Communications System</div>}
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100">!</span>
          <span>{error}</span>
        </div>
      )}
      <ModalGrid cols={1}>
        <ModalField label="Target Audience">
          <select
            value={targetType}
            onChange={e => setTargetType(e.target.value as 'all' | 'single')}
            title="Target Audience"
            aria-label="Target Audience"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none font-medium text-sm text-slate-700 focus:border-brand-500 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Users (Network-wide)</option>
            <option value="single">Select Single User</option>
          </select>
        </ModalField>
        {targetType === 'single' && (
          <ModalField label="Select User" required error={fieldErrors.selectedAgentId}>
            <select
              value={selectedAgentId}
              onChange={e => setSelectedAgentId(e.target.value)}
              required
              title="Select User"
              aria-label="Select User"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none font-medium text-sm text-slate-700 focus:border-brand-500 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Choose User --</option>
              {agents.map(a => (
                <option key={a.id} value={String(a.id)}>{a.first_name} {a.last_name} ({a.username}) - {a.role || 'User'}</option>
              ))}
            </select>
          </ModalField>
        )}
        <ModalField label="Notification Title" required error={fieldErrors.title}>
          <ModalInput required error={!!fieldErrors.title} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly Performance Update" />
        </ModalField>
        <ModalField label="Message Content" required error={fieldErrors.content}>
          <ModalTextarea required error={!!fieldErrors.content} rows={4} value={content} onChange={e => setContent(e.target.value)} placeholder="Type your official message here..." />
        </ModalField>
      </ModalGrid>
    </AppModal>
  );
};

export default CreateNotificationModal;
