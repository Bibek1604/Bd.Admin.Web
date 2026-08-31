import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accentColor?: string;
  mode: 'create' | 'edit' | 'details';
  onSubmit?: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const AppModal: React.FC<AppModalProps> = ({
  isOpen, onClose, title, subtitle,
  mode, onSubmit,
  loading = false, submitLabel, children, footer,
  maxWidth = 'max-w-125',
}) => {
  // Lock background scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 lg:left-[var(--admin-sidebar-w)] bg-slate-900/40 backdrop-blur-sm animate-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative flex w-full ${maxWidth} max-h-[88vh] flex-col overflow-hidden rounded-[var(--radius-panel)] bg-white shadow-[0_16px_48px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 animate-modal-panel`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[13px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body + footer (noValidate disables native browser validation tooltips) */}
        <form
          noValidate
          autoComplete="off"
          onSubmit={onSubmit || (e => e.preventDefault())}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-6 py-2">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-2 flex shrink-0 flex-col-reverse gap-3 border-t border-surface-200 px-6 pt-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
            {footer ? <div className="hidden sm:block">{footer}</div> : <span className="hidden sm:block" />}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-full rounded-[var(--radius-control)] border border-surface-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-surface-50 sm:w-auto"
              >
                {mode === 'details' ? 'Close' : 'Cancel'}
              </button>
              {mode !== 'details' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </span>
                  ) : (
                    submitLabel || (mode === 'create' ? 'Create Record' : 'Save Changes')
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// -- Shared field layout components -------------------------------------------

export const ModalField: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean; icon?: React.ReactNode; error?: string; required?: boolean }> = ({ label, children, fullWidth, icon, error, required }) => (
  <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
    {/* Sentence case at 13px/500 — the old uppercase 10px/900 labels were
        louder than the values they described. */}
    <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
      {icon}
      {label}
      {required && <span className="leading-none text-rose-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

export const DetailRow: React.FC<{ label: string; value?: React.ReactNode; icon?: React.ReactNode; accent?: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-b border-surface-200 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
    <div className="text-[13px] text-slate-500 sm:w-44 sm:shrink-0">{label}</div>
    <div className="text-sm text-slate-800">{value || <span className="text-slate-400">Not provided</span>}</div>
  </div>
);

export const DetailGroup: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    {title && <div className="mb-1 text-[13px] font-medium text-slate-900">{title}</div>}
    <div>{children}</div>
  </div>
);

interface ModalInputProps extends React.InputHTMLAttributes<HTMLInputElement> { error?: boolean }
export const ModalInput: React.FC<ModalInputProps> = ({ error, className, type, autoComplete, maxLength, ...props }) => {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && reveal ? 'text' : type;
  const ac = autoComplete ?? (isPassword ? 'new-password' : 'off');
  const noMax = ['number', 'date', 'time', 'datetime-local', 'month', 'week', 'color', 'range', 'file', 'checkbox', 'radio', 'url'].includes(type || '');
  const max = maxLength ?? (noMax ? undefined : 256);
  const cls = `w-full rounded-[var(--radius-control)] border bg-surface-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-rose-400 bg-rose-50 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'} ${isPassword ? 'pr-11' : ''} ${className || ''}`;
  if (!isPassword) return <input {...props} type={resolvedType} autoComplete={ac} maxLength={max} className={cls} />;
  return (
    <div className="relative">
      <input {...props} type={resolvedType} autoComplete={ac} maxLength={max} className={cls} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setReveal(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
        aria-label={reveal ? 'Hide password' : 'Show password'}
      >
        {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

interface ModalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { error?: boolean }
export const ModalSelect: React.FC<ModalSelectProps> = ({ children, error, className, ...props }) => (
  <select
    {...props}
    title={props.title || props['aria-label'] || 'Select option'}
    className={`w-full rounded-[var(--radius-control)] border bg-surface-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:bg-white disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-slate-400 ${error ? 'border-rose-400 bg-rose-50 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'} ${className || ''}`}
  >
    {children}
  </select>
);

interface ModalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { error?: boolean }
export const ModalTextarea: React.FC<ModalTextareaProps> = ({ error, className, maxLength, ...props }) => (
  <textarea
    {...props}
    maxLength={maxLength ?? 5000}
    className={`w-full resize-none rounded-[var(--radius-control)] border bg-surface-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-rose-400 bg-rose-50 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'} ${className || ''}`}
  />
);

export const ModalGrid: React.FC<{ children: React.ReactNode; cols?: number; className?: string }> = ({ children, cols = 2, className = '' }) => (
  <div className={`grid gap-4 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} ${className}`}>
    {children}
  </div>
);

export default AppModal;
