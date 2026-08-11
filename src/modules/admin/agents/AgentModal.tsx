import React, { useState, useEffect } from 'react';
import type { Agent } from './agentsService';
import companyService, { type Company } from '../companies/companyService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalSelect, DetailRow, DetailGroup } from '../../../components/ui/AppModal';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  agent?: Agent | null;
  mode: 'create' | 'edit' | 'details';
}

const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, onSubmit, agent, mode }) => {
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '', phone_number: '', password: '', is_active: true, company: '',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Load companies for the required "associated company" selector
  useEffect(() => {
    if (!isOpen || mode === 'details') return;
    // No page/limit: the list endpoint returns everything when pagination is
    // not requested. Asking for limit:1000 opted INTO pagination and the server
    // capped it at 100, silently hiding companies past the 100th.
    companyService.getCompanies()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.results ?? []);
        setCompanies(list.filter((c: any) => String(c.status).toUpperCase() !== 'INACTIVE'));
      })
      .catch(() => setCompanies([]));
  }, [isOpen, mode]);

  useEffect(() => {
    if (agent) {
      setFormData({
        username: agent.username, email: agent.email,
        first_name: agent.first_name, last_name: agent.last_name,
        phone_number: agent.phone_number || '', is_active: agent.is_active,
        password: '', company: agent.company != null ? String(agent.company) : '',
      });
    } else {
      setFormData({ username: '', email: '', first_name: '', last_name: '', phone_number: '', password: '', is_active: true, company: '' });
    }
    setError(null);
    setFieldErrors({});
  }, [agent, isOpen]);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!formData.username.trim()) e.username = 'Username is required.';
    if (!formData.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) e.email = 'Enter a valid email address.';
    if (!formData.first_name.trim()) e.first_name = 'First name is required.';
    if (!formData.last_name.trim()) e.last_name = 'Last name is required.';
    if (mode === 'create' && !formData.company) e.company = 'Select an associated company.';
    if (mode === 'create' && !formData.password.trim()) e.password = 'Password is required.';
    else if (formData.password.trim() && formData.password.trim().length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'details') return;
    setError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError('Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = { ...formData };
      payload.company = payload.company ? String(payload.company) : null;
      if (mode === 'edit' && !payload.password.trim()) {
        delete payload.password;
      }
      await onSubmit(payload);
      if (mode !== 'create') onClose(); // create mode: parent switches to the details view instead of closing
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'create' ? 'New agent' : mode === 'edit' ? 'Edit agent' : 'Agent details';

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title={title}
      subtitle={mode === 'create' ? 'Create a login for a field agent.' : undefined}
      accentColor="brand" mode={mode} onSubmit={handleSubmit}
      loading={loading} submitLabel={mode === 'create' ? 'Create agent' : 'Save changes'}
    >
      {error && mode !== 'details' && (
        <div className="mb-5 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
          {error}
        </div>
      )}
      {mode === 'details' && agent ? (
        <div className="pt-1">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-100 text-sm font-medium text-slate-600">
              {`${agent.first_name?.[0] ?? ''}${agent.last_name?.[0] ?? ''}`.toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900">{agent.first_name} {agent.last_name}</div>
              <div className="truncate text-[13px] text-slate-500">{agent.email}</div>
            </div>
            <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${agent.is_active ? 'bg-brand-50 text-brand-700' : 'bg-surface-100 text-slate-600'}`}>
              {agent.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <DetailGroup title="Account">
            <DetailRow label="Username" value={agent.username} />
            <DetailRow label="Company" value={agent.company_name || 'Unassigned'} />
            <DetailRow label="Clients" value={String(agent.num_clients ?? 0)} />
          </DetailGroup>
          <DetailGroup title="Contact">
            <DetailRow label="Email" value={<a href={`mailto:${agent.email}`} className="text-brand-700 hover:underline">{agent.email}</a>} />
            <DetailRow label="Phone" value={agent.phone_number} />
          </DetailGroup>
          <DetailGroup title="Credentials">
            <DetailRow label="License number" value={agent.agent_profile?.license_number} />
            <DetailRow label="Specialisation" value={agent.agent_profile?.specialization} />
          </DetailGroup>
        </div>
      ) : (
        <ModalGrid>
          <ModalField label="Username" required error={fieldErrors.username}>
            <ModalInput disabled={mode !== 'create'} type="text" value={formData.username} required error={!!fieldErrors.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="agent.name" />
          </ModalField>
          <ModalField label="Email" required error={fieldErrors.email}>
            <ModalInput disabled={mode === 'details'} type="email" value={formData.email} required error={!!fieldErrors.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="agent@example.com" />
          </ModalField>
          <ModalField label="First name" required error={fieldErrors.first_name}>
            <ModalInput disabled={mode === 'details'} type="text" value={formData.first_name} required error={!!fieldErrors.first_name}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" />
          </ModalField>
          <ModalField label="Last name" required error={fieldErrors.last_name}>
            <ModalInput disabled={mode === 'details'} type="text" value={formData.last_name} required error={!!fieldErrors.last_name}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" />
          </ModalField>
          <ModalField label="Phone">
            <ModalInput disabled={mode === 'details'} type="text" value={formData.phone_number}
              onChange={e => setFormData({ ...formData, phone_number: e.target.value })} placeholder="+977 98XXXXXXXX" />
          </ModalField>
          <ModalField label="Company" required={mode === 'create'} error={fieldErrors.company}>
            <ModalSelect
              disabled={mode === 'details'}
              required={mode === 'create'}
              error={!!fieldErrors.company}
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            >
              <option value="">Select a company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </ModalSelect>
            {mode === 'create' && companies.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">No companies found — create a company first.</p>
            )}
          </ModalField>
          <ModalField label="Status">
            <ModalSelect disabled={mode === 'details'} value={formData.is_active ? 'active' : 'inactive'}
              onChange={e => setFormData({ ...formData, is_active: e.target.value === 'active' })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </ModalSelect>
          </ModalField>
          <ModalField label={mode === 'create' ? 'Password' : 'New password'} required={mode === 'create'} error={fieldErrors.password}>
            <ModalInput
              disabled={mode === 'details'}
              required={mode === 'create'}
              error={!!fieldErrors.password}
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 6 characters"
            />
            {mode === 'edit' && <p className="mt-1.5 text-xs text-slate-500">Leave blank to keep the current password.</p>}
          </ModalField>
        </ModalGrid>
      )}
    </AppModal>
  );
};

export default AgentModal;

