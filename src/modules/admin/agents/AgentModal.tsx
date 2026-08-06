import React, { useState, useEffect } from 'react';
import { User, Shield, Phone, Mail, Award, Star, Hash, Lock, Building2 } from 'lucide-react';
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
    companyService.getCompanies({ limit: 1000 } as any)
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

  const title = mode === 'create' ? 'Onboard New Agent' : mode === 'edit' ? 'Update Agent Credentials' : 'Agent Dossier';
  const score = agent?.agent_profile?.performance_score ?? 0;

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title={title}
      subtitle="Certified Field Operative / LIC Personnel Department"
      accentColor="brand" mode={mode} onSubmit={handleSubmit}
      loading={loading} submitLabel={mode === 'create' ? 'Register Agent' : 'Save Changes'}
      footer={
        mode === 'details' && agent ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${agent.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-surface-100 text-slate-500 border-surface-200'}`}>
              <Shield size={10} /> {agent.is_active ? 'Active Service' : 'Deactivated'}
            </span>
            {score >= 80 && (
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-700 border-indigo-100 flex items-center gap-1.5">
                <Star size={10} /> Elite Status
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-400 flex items-center gap-2"><User size={13} /> Agent Registry</div>
        )
      }
    >
      {error && mode !== 'details' && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">!</div>
          {error}
        </div>
      )}
      {mode === 'details' && agent ? (
        <>
          {/* Performance Banner */}
          <div className="mb-6 p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-green-200">
            <div>
              <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Performance Score</div>
              <div className="text-4xl font-black">{score}<span className="text-2xl opacity-70">%</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Policies Sold</div>
              <div className="text-4xl font-black">#{agent.num_clients}</div>
            </div>
          </div>

          <DetailGroup title="Personal Details">
            <DetailRow label="Full Name" value={`${agent.first_name} ${agent.last_name}`} icon={<User size={15} />} accent="bg-green-50 text-green-600" />
            <DetailRow label="Username / HQ-ID" value={`@${agent.username}`} icon={<Hash size={15} />} accent="bg-surface-100 text-slate-500" />
          </DetailGroup>
          <DetailGroup title="Contact Information">
            <DetailRow label="Email" value={<a href={`mailto:${agent.email}`} className="text-blue-600 hover:underline">{agent.email}</a>} icon={<Mail size={15} />} accent="bg-blue-50 text-blue-500" />
            <DetailRow label="Phone" value={agent.phone_number || '—'} icon={<Phone size={15} />} accent="bg-violet-50 text-violet-500" />
            <DetailRow label="Associated Company" value={agent.company_name || 'Unassigned'} icon={<Building2 size={15} />} accent="bg-amber-50 text-amber-600" />
          </DetailGroup>
          <DetailGroup title="Credentials & Certifications">
            <DetailRow label="License Number" value={agent.agent_profile?.license_number || 'PENDING'} icon={<Shield size={15} />} accent="bg-green-50 text-green-600" />
            <DetailRow label="Specialization" value={agent.agent_profile?.specialization || 'Certified Generalist'} icon={<Award size={15} />} accent="bg-amber-50 text-amber-600" />
          </DetailGroup>
        </>
      ) : (
        <ModalGrid>
          <ModalField label="Username / ID" required error={fieldErrors.username}>
            <ModalInput disabled={mode !== 'create'} type="text" value={formData.username} required error={!!fieldErrors.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="agent.x" />
          </ModalField>
          <ModalField label="Official Email" required error={fieldErrors.email}>
            <ModalInput disabled={mode === 'details'} type="email" value={formData.email} required error={!!fieldErrors.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="contact@lic-ops.com" />
          </ModalField>
          <ModalField label="First Name" required error={fieldErrors.first_name}>
            <ModalInput disabled={mode === 'details'} type="text" value={formData.first_name} required error={!!fieldErrors.first_name}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" />
          </ModalField>
          <ModalField label="Last Name" required error={fieldErrors.last_name}>
            <ModalInput disabled={mode === 'details'} type="text" value={formData.last_name} required error={!!fieldErrors.last_name}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" />
          </ModalField>
          <ModalField label="Contact Phone">
            <ModalInput disabled={mode === 'details'} type="text" value={formData.phone_number}
              onChange={e => setFormData({ ...formData, phone_number: e.target.value })} placeholder="+977-98XXXXXXXX" />
          </ModalField>
          <ModalField label="Associated Company" icon={<Building2 size={14} />} required={mode === 'create'} error={fieldErrors.company}>
            <ModalSelect
              disabled={mode === 'details'}
              required={mode === 'create'}
              error={!!fieldErrors.company}
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            >
              <option value="">— Select company —</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </ModalSelect>
            {mode === 'create' && companies.length === 0 && (
              <p className="mt-2 text-[10px] text-amber-500 font-medium">No companies found — create a company first.</p>
            )}
          </ModalField>
          <ModalField label="Security Status">
            <ModalSelect disabled={mode === 'details'} value={formData.is_active ? 'active' : 'inactive'}
              onChange={e => setFormData({ ...formData, is_active: e.target.value === 'active' })}>
              <option value="active">Active Service</option>
              <option value="inactive">Suspended / Deactivated</option>
            </ModalSelect>
          </ModalField>
          <ModalField label={mode === 'create' ? 'Account Password' : 'Change Password'} icon={<Lock size={14} />} required={mode === 'create'} error={fieldErrors.password}>
            <ModalInput
              disabled={mode === 'details'}
              required={mode === 'create'}
              error={!!fieldErrors.password}
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
            />
            {mode === 'edit' && <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Leave blank to keep the current password.</p>}
          </ModalField>
        </ModalGrid>
      )}
    </AppModal>
  );
};

export default AgentModal;

