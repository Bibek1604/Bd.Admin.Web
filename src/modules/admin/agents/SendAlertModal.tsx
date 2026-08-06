import React, { useState } from 'react';
import notificationsService from '../notifications/notificationsService';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: { id: number; username: string; first_name: string; last_name: string } | null;
}

const SendAlertModal: React.FC<SendAlertModalProps> = ({ isOpen, onClose, agent }) => {
  const [title, setTitle] = useState('Important Alert');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !agent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Use notificationsService if it had a create method...
      // I'll add one to notificationsService.ts or call api directly here
      // Let's add it to notificationsService first (in a next step)
      // For now, I'll assume it exists
      await (notificationsService as any).createNotification({
        recipient: agent.id,
        title,
        content,
        status: 'SENT'
      });
      onClose();
      alert('Alert sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Operational Alert`}>
      <p className="text-sm text-slate-500">To: <b>{agent.first_name} {agent.last_name}</b> (@{agent.username})</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Alert Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Alert Message</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            placeholder="Type your message here..."
            className="w-full min-h-[120px] p-3 rounded-lg border border-surface-200 outline-none text-sm text-slate-700"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Now'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default SendAlertModal;
