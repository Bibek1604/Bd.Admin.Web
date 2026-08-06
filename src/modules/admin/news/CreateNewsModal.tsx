import React, { useState } from 'react';
import { newsService } from './newsService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalTextarea } from '../../../components/ui/AppModal';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';
import { Newspaper } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNewsModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
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
      await newsService.create({ title, description, image });
      onSuccess();
      onClose();
      setTitle(''); setDescription(''); setImage(null);
      setFieldErrors({});
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err, 'Failed to publish news.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title="Publish Announcement"
      subtitle="Broadcast a news article or update to all agents"
      accentColor="brand" mode="create" onSubmit={handleSubmit}
      loading={loading} submitLabel="Publish Announcement"
      footer={<div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Newspaper size={14} /> Agent Communications</div>}
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100">!</span>
          <span>{error}</span>
        </div>
      )}
      <ModalGrid cols={1}>
        <ModalField label="Headline / Title" required error={fieldErrors.title}>
          <ModalInput required error={!!fieldErrors.title} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. System Maintenance Update" />
        </ModalField>
        <ModalField label="Full Description" required error={fieldErrors.description}>
          <ModalTextarea required error={!!fieldErrors.description} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Elaborate on the news content..." />
        </ModalField>
        <ModalField label="Cover Image (Optional)">
          <input
            type="file" accept="image/*"
            onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all"
          />
        </ModalField>
      </ModalGrid>
    </AppModal>
  );
};

export default CreateNewsModal;

