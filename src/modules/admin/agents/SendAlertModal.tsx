import React, { useEffect, useState } from 'react';
import { bulkNotificationsService } from '../../user/bulk-notifications/bulkNotificationsService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalTextarea } from '../../../components/ui/AppModal';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: { id: string | number; username: string; first_name: string; last_name: string } | null;
}

const SendAlertModal: React.FC<SendAlertModalProps> = ({ isOpen, onClose, agent }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !agent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!content.trim()) errors.content = 'Message is required.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      // A single-agent alert IS a bulk notification with target_type 'single' —
      // /api/admin/bulk-notifications is the only notification endpoint there is.
      await bulkNotificationsService.createBulkNotification({
        title,
        content,
        target_type: 'single',
        target_agent_id: String(agent.id),
      });
      onClose();
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err, 'Failed to send alert'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Send alert"
      subtitle={`To ${agent.first_name} ${agent.last_name} (@${agent.username})`}
      mode="create"
      onSubmit={handleSubmit}
      loading={submitting}
      submitLabel="Send alert"
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-5 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
          {error}
        </div>
      )}
      <ModalGrid cols={1}>
        <ModalField label="Title" required error={fieldErrors.title}>
          <ModalInput
            value={title}
            error={!!fieldErrors.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Policy renewal reminder"
          />
        </ModalField>
        <ModalField label="Message" required error={fieldErrors.content}>
          <ModalTextarea
            rows={5}
            value={content}
            error={!!fieldErrors.content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message…"
          />
        </ModalField>
      </ModalGrid>
    </AppModal>
  );
};

export default SendAlertModal;
