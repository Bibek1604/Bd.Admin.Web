import React, { useState } from 'react';
import { achievementsService } from './achievementsService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalTextarea } from '../../../components/ui/AppModal';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';
import { Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAchievementModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) { setFieldErrors(clientErrors); setError('Please fix the highlighted fields.'); return; }
    setLoading(true);
    try {
      await achievementsService.create({ title, description, required_xp: points });
      onSuccess();
      onClose();
      setTitle(''); setDescription(''); setPoints(0);
      setFieldErrors({});
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err, 'Failed to create achievement milestone.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title="Define New Milestone"
      subtitle="Create an achievement to reward top-performing agents"
      accentColor="amber" mode="create" onSubmit={handleSubmit}
      loading={loading} submitLabel="Deploy Milestone"
      footer={<div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Award size={14} /> Achievements</div>}
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100">!</span>
          <span>{error}</span>
        </div>
      )}
      <ModalGrid cols={1}>
        <ModalField label="Milestone Title" required error={fieldErrors.title}>
          <ModalInput required error={!!fieldErrors.title} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sales Master: Level 1" />
        </ModalField>
        <ModalField label="Achievement Description" required error={fieldErrors.description}>
          <ModalTextarea required error={!!fieldErrors.description} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed criteria to reach this milestone..." />
        </ModalField>
        <ModalField label="Required XP / Performance Score">
          <ModalInput required type="number" min="0" value={points} onChange={e => setPoints(Number(e.target.value))} placeholder="e.g. 500" />
        </ModalField>
      </ModalGrid>
    </AppModal>
  );
};

export default CreateAchievementModal;
