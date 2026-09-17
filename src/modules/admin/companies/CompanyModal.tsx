import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Company, CreateCompanyData } from './companyService';
import AppModal, { ModalField, ModalGrid, ModalInput, ModalSelect, DetailRow, DetailGroup } from '../../../components/ui/AppModal';
import resolveImage from '../../../utils/resolveImage';
import { Building2, Mail, Phone, CheckCircle, XCircle, Hash, Calendar, ImageIcon, AlertCircle } from 'lucide-react';
import { sanitizeInput } from '../../../utils/sanitization';
import { extractFieldErrors } from './useCompanies';

// ── Constants ─────────────────────────────────────────────────────────────────
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB — matches backend hard cap
const IMAGE_VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$|^[0-9\-\s()+]{7,20}$/;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  image?: string;
  general?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyData) => Promise<void>;
  company?: Company | null;
  mode: 'create' | 'edit' | 'details';
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ERR_CLASS = 'border-rose-400 bg-rose-50 focus:border-rose-500';

// ── Validation ────────────────────────────────────────────────────────────────
const validateForm = (
  name: string,
  email: string,
  phone: string,
  imageError: string | null,
): FormErrors => {
  const errors: FormErrors = {};
  const trimName = name.trim();
  if (!trimName)                   errors.name = 'Company name is required.';
  else if (trimName.length < 2)    errors.name = 'Company name must be at least 2 characters.';
  else if (trimName.length > 100)  errors.name = 'Company name must not exceed 100 characters.';

  const trimEmail = email.trim();
  if (!trimEmail)                        errors.email = 'Email address is required.';
  else if (!EMAIL_REGEX.test(trimEmail)) errors.email = 'Email address is invalid.';

  const trimPhone = phone.trim();
  if (trimPhone && !PHONE_REGEX.test(trimPhone)) errors.phone_number = 'Please enter a valid phone number.';

  if (imageError) errors.image = imageError;

  return errors;
};

// ── Component ─────────────────────────────────────────────────────────────────
const CompanyModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, company, mode }) => {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [address, setAddress]     = useState('');
  const [status, setStatus]         = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [errors, setErrors]         = useState<FormErrors>({});
  const [touched, setTouched]       = useState<Record<string, boolean>>({});
  const [loading, setLoading]       = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // ── Populate form when editing ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && company && mode === 'edit') {
      setName(company.name);
      setEmail(company.email || '');
      setPhone(company.phone_number || '');
      setAddress(company.address || '');
      setStatus(company.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
      setImagePreview(company.image ? resolveImage(company.image) : null);
    } else if (isOpen && mode === 'create') {
      setName(''); setEmail(''); setPhone(''); setAddress(''); setStatus('ACTIVE');
      setImageFile(null); setImagePreview(null);
    }
    setErrors({}); setTouched({}); setImageError(null);
  }, [isOpen, company, mode]);

  // ── Live revalidation after first touch ────────────────────────────────────
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setErrors(validateForm(name, email, phone, imageError));
  }, [name, email, phone, imageError, touched]);


  // ── Image selection ─────────────────────────────────────────────────────────
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_VALID_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, and WebP images are allowed.');
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setImageError('Company logo must be less than 10MB.');
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageError(null);
    setImagePreview(company?.image ? resolveImage(company.image) : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'details') return;

    // Mark all fields touched so every error shows at once
    setTouched({ name: true, email: true, phone_number: true, image: true });
    const validationErrors = validateForm(name, email, phone, imageError);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData: CreateCompanyData = {
      name:         name.trim(),
      email:        email.trim() || undefined,
      phone_number: phone.trim() || undefined,
      address:      address.trim() || undefined,
      status,
      ...(imageFile instanceof File ? { image: imageFile } : {}),
    };

    setLoading(true);
    try {
      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      const fieldErrs = extractFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) {
        setErrors(fieldErrs);
      } else {
        const msg = err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'create' ? 'New company' : mode === 'edit' ? 'Edit company' : 'Company details';

  return (
    <AppModal
      isOpen={isOpen} onClose={onClose} title={title}
      mode={mode} onSubmit={handleSubmit}
      loading={loading}
      submitLabel={mode === 'create' ? 'Create company' : 'Save changes'}
    >
      {mode === 'details' && company ? (
        <>
          <DetailGroup title="Company">
            <DetailRow label="Name" value={company.name}       icon={<Building2 size={16} />} />
            <DetailRow label="ID"   value={`#${company.id}`}  icon={<Hash size={16} />} />
          </DetailGroup>
          <DetailGroup title="Contact">
            <DetailRow
              label="Email"
              value={<a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">{company.email || '—'}</a>}
              icon={<Mail size={16} />}
            />
            <DetailRow label="Phone" value={company.phone_number || '—'} icon={<Phone size={16} />} />
          </DetailGroup>
          <DetailGroup title="Status">
            <DetailRow
              label="Status"
              value={
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  company.status === 'ACTIVE' ? 'bg-brand-50 text-brand-700' : 'bg-surface-100 text-slate-600'
                }`}>
                  {company.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              }
              icon={company.status === 'ACTIVE' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            />
            <DetailRow
              label="Added"
              value={company.created_at ? new Date(company.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              icon={<Calendar size={16} />}
            />
          </DetailGroup>
        </>
      ) : (
        <>
          {/* General error banner */}
          {errors.general && (
            <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Logo upload — no alert(), no native validation */}
          <ModalField label="Logo">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload company logo"
              />
              {imagePreview ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-200 shrink-0">
                  <img src={imagePreview} alt="Company logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center text-slate-300 shrink-0">
                  <ImageIcon size={20} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={imageFile ? handleRemoveImage : () => fileInputRef.current?.click()}
                  className="rounded-[var(--radius-control)] border border-surface-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-surface-50"
                >
                  {imageFile ? 'Remove' : 'Upload logo'}
                </button>
                <span className="text-xs text-slate-500">JPG, PNG, WebP · max 10 MB</span>
              </div>
            </div>
            {errors.image && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle size={12} /> {errors.image}
              </p>
            )}
          </ModalField>

          <ModalGrid>
            {/* Company Name */}
            <ModalField label="Company Name *">
              <ModalInput
                type="text"
                value={name}
                placeholder="e.g. Nepal Life Insurance"
                className={touched.name && errors.name ? ERR_CLASS : ''}
                onChange={e => setName(sanitizeInput(e.target.value))}
                onBlur={() => touch('name')}
              />
              {touched.name && errors.name && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </ModalField>

            {/* Email */}
            <ModalField label="Email Address *">
              <ModalInput
                type="email"
                value={email}
                placeholder="contact@company.com"
                className={touched.email && errors.email ? ERR_CLASS : ''}
                onChange={e => setEmail(sanitizeInput(e.target.value))}
                onBlur={() => touch('email')}
              />
              {touched.email && errors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </ModalField>

            {/* Phone */}
            <ModalField label="Phone">
              <ModalInput
                type="text"
                value={phone}
                placeholder="+977 9800000000"
                className={touched.phone_number && errors.phone_number ? ERR_CLASS : ''}
                onChange={e => setPhone(sanitizeInput(e.target.value))}
                onBlur={() => touch('phone_number')}
              />
              {touched.phone_number && errors.phone_number && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <AlertCircle size={12} /> {errors.phone_number}
                </p>
              )}
            </ModalField>

            {/* Address.
                The details modal has always rendered `company.address`, but
                neither create nor update accepted it and the serializer omitted
                it, so it permanently read "Address not listed". The API stores
                it now; this is the input that fills it. */}
            <ModalField label="Address">
              <ModalInput
                type="text"
                value={address}
                placeholder="Ward 12, Lalitpur, Bagmati"
                maxLength={255}
                className={touched.address && errors.address ? ERR_CLASS : ''}
                onChange={e => setAddress(sanitizeInput(e.target.value))}
                onBlur={() => touch('address')}
              />
              {touched.address && errors.address && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <AlertCircle size={12} /> {errors.address}
                </p>
              )}
            </ModalField>

            {/* Status */}
            <ModalField label="Operational Status *">
              <ModalSelect
                value={status}
                title="Select company operational status"
                onChange={e => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </ModalSelect>
            </ModalField>
          </ModalGrid>
        </>
      )}
    </AppModal>
  );
};

export default CompanyModal;
