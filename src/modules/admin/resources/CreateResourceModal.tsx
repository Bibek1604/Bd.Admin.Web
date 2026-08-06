import React, { useState } from 'react';
import { resourcesService } from './resourcesService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalSelect } from '../../../components/ui/AppModal';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';
import { FolderOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateResourceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState<'FILE' | 'LINK'>('FILE');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (resourceType === 'FILE' && !file) e.file = 'Please choose a file to upload.';
    if (resourceType === 'LINK' && !link.trim()) e.link = 'A URL is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) { setFieldErrors(clientErrors); setError('Please fix the highlighted fields.'); return; }
    setLoading(true);
    try {
      await resourcesService.create({
        title,
        file: resourceType === 'FILE' ? file : null,
        link: resourceType === 'LINK' ? link : null,
      });
      onSuccess();
      onClose();
      setTitle(''); setFile(null); setLink(''); setFieldErrors({});
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err, 'Failed to upload resource.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title="Upload Resource"
      subtitle="Add a document or link to the Knowledge Library"
      accentColor="indigo" mode="create" onSubmit={handleSubmit}
      loading={loading} submitLabel="Save Resource"
      footer={<div className="flex items-center gap-2 text-xs font-bold text-slate-400"><FolderOpen size={14} /> Asset Library</div>}
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100">!</span>
          <span>{error}</span>
        </div>
      )}
      <ModalGrid cols={1}>
        <ModalField label="Resource Title" required error={fieldErrors.title}>
          <ModalInput required error={!!fieldErrors.title} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Agent Training Manual 2025" />
        </ModalField>
        <ModalField label="Resource Type">
          <ModalSelect value={resourceType} onChange={e => setResourceType(e.target.value as any)}>
            <option value="FILE">File Upload (PDF, DOCX, etc.)</option>
            <option value="LINK">External Link / URL</option>
          </ModalSelect>
        </ModalField>
        {resourceType === 'FILE' ? (
          <ModalField label="Select File" required error={fieldErrors.file}>
            <input
              required type="file"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all"
            />
          </ModalField>
        ) : (
          <ModalField label="External URL" required error={fieldErrors.link}>
            <ModalInput required error={!!fieldErrors.link} type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://docs.example.com/..." />
          </ModalField>
        )}
      </ModalGrid>
    </AppModal>
  );
};

export default CreateResourceModal;

