import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Mail, Phone, Lock, Building } from 'lucide-react';
import { usersService } from './usersService';
import type { User } from './usersService';
import companyService, { type Company } from '../companies/companyService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalSelect } from '../../../components/ui/AppModal';
import { sanitizeInput } from '../../../utils/sanitization';
import { extractFieldErrors, extractMessage, type FieldErrors } from '../../../utils/formErrors';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: number | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, userId }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'AGENT',
    is_active: true,
    phone_number: '',
    company: null,
    password: ''
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isOpen) {
      companyService.getCompanies({ limit: 1000 } as any)
        .then((res: any) => setCompanies(Array.isArray(res) ? res : (res?.results ?? [])))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (userId && isOpen) {
      const fetchUser = async () => {
        try {
          setFetching(true);
          const data = await usersService.getById(userId);
          if (data.role === 'AGENT' && data.full_name) {
            const nameParts = data.full_name.trim().split(/\s+/);
            setFormData({
              ...data,
              first_name: nameParts[0] || '',
              last_name: nameParts.slice(1).join(' ') || '',
              password: ''
            });
          } else {
            setFormData({ ...data, password: '' });
          }
        } catch (err) {
          setError('Failed to fetch user data');
        } finally {
          setFetching(false);
        }
      };
      fetchUser();
    } else if (isOpen) {
      setError(null);
      setFieldErrors({});
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'AGENT',
        is_active: true,
        phone_number: '',
        company: null,
        password: ''
      });
    }
  }, [userId, isOpen]);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!String(formData.first_name || '').trim()) e.first_name = 'First name is required.';
    if (!String(formData.last_name || '').trim()) e.last_name = 'Last name is required.';
    if (!String(formData.username || '').trim()) e.username = 'Username is required.';
    if (!String(formData.email || '').trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email).trim())) e.email = 'Enter a valid email address.';
    if (!userId && !String(formData.password || '').trim()) e.password = 'Password is required.';
    else if (String(formData.password || '').trim() && String(formData.password).trim().length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError('Please fix the highlighted fields.');
      return;
    }
    try {
      setLoading(true);
      const payload = { ...formData };
      if (userId && !payload.password) {
        delete payload.password;
      }
      if (userId) {
        await usersService.update(userId, payload);
      } else {
        await usersService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err));
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={userId ? 'Modify User Profile' : 'Register New User'}
      subtitle={userId ? `Updating settings for @${formData.username}` : 'Create a new administrative or field agent account'}
      accentColor={formData.role === 'ADMIN' ? 'violet' : 'indigo'}
      mode={userId ? 'edit' : 'create'}
      onSubmit={handleSubmit}
      loading={loading || fetching}
      submitLabel={userId ? 'Save Changes' : 'Create Account'}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">!</div>
          {error}
        </div>
      )}

      <ModalGrid cols={2}>
        <ModalField label="First Name" icon={<UserIcon size={14} />} required error={fieldErrors.first_name}>
          <ModalInput
            required error={!!fieldErrors.first_name}
            placeholder="John"
            value={formData.first_name || ''}
            onChange={e => setFormData({ ...formData, first_name: sanitizeInput(e.target.value) })}
          />
        </ModalField>
        <ModalField label="Last Name" required error={fieldErrors.last_name}>
          <ModalInput
            required error={!!fieldErrors.last_name}
            placeholder="Doe"
            value={formData.last_name || ''}
            onChange={e => setFormData({ ...formData, last_name: sanitizeInput(e.target.value) })}
          />
        </ModalField>
      </ModalGrid>

      <ModalGrid cols={2} className="mt-4">
        <ModalField label="Username" icon={<span className="text-[10px]">@</span>} required error={fieldErrors.username}>
          <ModalInput
            required error={!!fieldErrors.username}
            placeholder="johndoe"
            value={formData.username || ''}
            onChange={e => setFormData({ ...formData, username: sanitizeInput(e.target.value) })}
          />
        </ModalField>
        <ModalField label="Phone Number" icon={<Phone size={14} />}>
          <ModalInput
            placeholder="+977"
            value={formData.phone_number || ''}
            onChange={e => setFormData({ ...formData, phone_number: sanitizeInput(e.target.value) })}
          />
        </ModalField>
      </ModalGrid>

      <div className="mt-4">
        <ModalField label="Email Address" icon={<Mail size={14} />} required error={fieldErrors.email}>
          <ModalInput
            required error={!!fieldErrors.email}
            type="email"
            placeholder="john@example.com"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: sanitizeInput(e.target.value) })}
          />
        </ModalField>
      </div>

      <ModalGrid cols={2} className="mt-4">
        <ModalField label="Access Level" icon={<Shield size={14} />}>
          <ModalSelect 
            value={formData.role} 
            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
          >
            <option value="AGENT">Field Agent (Restricted)</option>
            <option value="ADMIN">System Administrator (Full Access)</option>
          </ModalSelect>
        </ModalField>
        <ModalField label="Account Status">
          <ModalSelect 
            value={formData.is_active ? 'true' : 'false'} 
            onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
          >
            <option value="true">Active / Operational</option>
            <option value="false">Inactive / Suspended</option>
          </ModalSelect>
        </ModalField>
      </ModalGrid>

      <div className="mt-4">
        <ModalField label="Associated Company" icon={<Building size={14} />}>
          <ModalSelect 
            value={formData.company || ''} 
            onChange={e => setFormData({ ...formData, company: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">No Company Assigned</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </ModalSelect>
        </ModalField>
      </div>

      <div className="mt-4">
        <ModalField label={userId ? "Change Password" : "Account Password"} icon={<Lock size={14} />} required error={fieldErrors.password}>
          <ModalInput
            required={!userId} error={!!fieldErrors.password}
            type="password"
            placeholder="••••••••"
            value={formData.password || ''}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          {userId && <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Leave blank if you don't wish to change the password.</p>}
        </ModalField>
      </div>
    </AppModal>
  );
};

export default UserModal;
