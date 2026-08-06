import React, { useState, useEffect } from 'react';
import type { Policy, CreatePolicyData } from './policiesService';
import { extractFieldErrors } from './usePolicies';
import companyService from '../companies/companyService';
import type { Company } from '../companies/companyService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalSelect } from '../../../components/ui/AppModal';
import { Shield, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePolicyData) => Promise<void>;
  policy?: Policy | null;
  mode: 'create' | 'edit' | 'details';
}

interface FormErrors {
  name?: string;
  company?: string;
  general?: string;
}

const FIELD_ERROR_CLASS = 'border-rose-400 bg-rose-50 focus:border-rose-500';

const PolicyModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, policy, mode }) => {
  const [formData, setFormData] = useState<CreatePolicyData>({ name: '', company: null });
  const [companies, setCompanies]   = useState<Company[]>([]);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<FormErrors>({});
  const [touched, setTouched]       = useState<Record<string, boolean>>({});

  // ── Load companies on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      companyService.getCompanies({ limit: 1000 } as any)
        .then((res: any) => setCompanies(Array.isArray(res) ? res : (res?.results ?? [])))
        .catch(() => { /* silently ignore network failure */ });
    }
  }, [isOpen]);

  // ── Reset form when mode/policy changes ────────────────────────────────────
  useEffect(() => {
    if (policy) {
      setFormData({ name: policy.name, company: policy.company });
    } else {
      setFormData({ name: '', company: null });
    }
    setErrors({});
    setTouched({});
  }, [policy, isOpen]);

  // ── Validation (runs client-side, mirrors backend rules) ───────────────────
  const validate = (data: CreatePolicyData): FormErrors => {
    const errs: FormErrors = {};
    const name = data.name?.trim() ?? '';

    if (!name) {
      errs.name = 'Policy name is required';
    } else if (name.length < 3) {
      errs.name = 'Policy name must be at least 3 characters';
    } else if (name.length > 100) {
      errs.name = 'Policy name must not exceed 100 characters';
    }

    if (!data.company) {
      errs.company = 'Insurance provider is required';
    }

    return errs;
  };

  // Revalidate whenever form data changes (after first touch)
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(prev => ({ ...validate(formData), general: prev.general }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, touched]);

  const isFormValid = Object.keys(validate(formData)).length === 0;

  // ── Field change handlers ──────────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, name: true }));
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTouched(prev => ({ ...prev, company: true }));
    setFormData(prev => ({ ...prev, company: e.target.value || null }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'details') return;

    // Mark all fields touched so errors show
    setTouched({ name: true, company: true });

    const clientErrors = validate(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return; // block submit — show all errors at once
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit({ ...formData, name: formData.name.trim() });
      onClose();
    } catch (err: any) {
      // Map backend field errors to form fields
      const fieldErrors = extractFieldErrors(err);
      const newErrors: FormErrors = {};
      if (fieldErrors.name)    newErrors.name    = fieldErrors.name;
      if (fieldErrors.company) newErrors.company = fieldErrors.company;

      // Surface a general error if no field was matched
      if (Object.keys(newErrors).length === 0) {
        const message = err?.response?.data?.message || err?.message || 'Failed to save policy. Please try again.';
        newErrors.general = message;
      }
      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'create'
    ? 'Register New Policy'
    : mode === 'edit'
    ? 'Update Policy Definition'
    : 'Policy Specification';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Policy details"
      accentColor="violet"
      mode={mode}
      onSubmit={handleSubmit}
      loading={loading || (!isFormValid && Object.keys(touched).length > 0 ? false : loading)}
      submitLabel={mode === 'create' ? 'Initialize Policy' : 'Sync Changes'}
      footer={
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Shield size={14} /> Policy Registry
        </div>
      }
      maxWidth="max-w-lg"
    >
      {/* General error banner */}
      {errors.general && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span className="font-medium">{errors.general}</span>
        </div>
      )}

      <ModalGrid cols={1}>
        {/* Policy Name */}
        <ModalField label="Policy Identifier Name *">
          <ModalInput
            disabled={mode === 'details'}
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            placeholder="e.g. Life Insurance Standard Policy"
            className={touched.name && errors.name ? FIELD_ERROR_CLASS : ''}
            aria-invalid={!!(touched.name && errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            maxLength={100}
          />
          {touched.name && errors.name && (
            <p id="name-error" className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertCircle size={11} /> {errors.name}
            </p>
          )}
        </ModalField>

        {/* Insurance Provider */}
        <ModalField label="Insurance Provider Authority *">
          <ModalSelect
            disabled={mode === 'details'}
            value={formData.company ?? ''}
            onChange={handleCompanyChange}
            onBlur={() => setTouched(prev => ({ ...prev, company: true }))}
            className={touched.company && errors.company ? FIELD_ERROR_CLASS : ''}
            aria-invalid={!!(touched.company && errors.company)}
            aria-describedby={errors.company ? 'company-error' : undefined}
          >
            <option value="">Select an authorized agency</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </ModalSelect>
          {touched.company && errors.company && (
            <p id="company-error" className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertCircle size={11} /> {errors.company}
            </p>
          )}
        </ModalField>

        {mode !== 'details' && (
          <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 text-xs font-bold text-violet-700 leading-relaxed">
            ℹ️ Confirming this data will propagate the policy specifications across the entire agent network. Use caution with naming conventions.
          </div>
        )}
      </ModalGrid>
    </AppModal>
  );
};

export default PolicyModal;
