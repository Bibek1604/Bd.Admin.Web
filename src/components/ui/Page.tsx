import React from 'react';
import { AlertCircle, RefreshCcw, SearchX } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Shared page furniture. Agents, Companies and Notifications all render through
 * these so they share one container width, one header rhythm and one set of
 * empty/error/loading states instead of three hand-rolled variants.
 */

export const Page: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('mx-auto w-full max-w-6xl space-y-6', className)}>{children}</div>
);

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-[22px] font-semibold text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </header>
);

/** Search + filters row. Children are rendered to the right of the search box. */
export const Toolbar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}> = ({ value, onChange, placeholder = 'Search…', children }) => (
  <div className="panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
    <label className="relative flex-1">
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[var(--radius-control)] border border-surface-200 bg-surface-50 pl-3 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:bg-white"
      />
    </label>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

/** Select styled to match Toolbar's input. */
export const ToolbarSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  ...props
}) => (
  <select
    {...props}
    className={cn(
      'h-10 min-w-[9rem] cursor-pointer rounded-[var(--radius-control)] border border-surface-200 bg-surface-50 px-3 text-sm text-slate-700 outline-none transition-colors hover:bg-white focus:border-brand-500 focus:bg-white',
      className,
    )}
  />
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="panel flex flex-col items-center justify-center gap-3 py-20">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => (
  <div className="panel flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
    <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-surface-100 text-slate-400">
      {icon ?? <SearchX size={20} />}
    </span>
    <h3 className="text-base font-medium text-slate-800">{title}</h3>
    {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{ title?: string; message?: string; onRetry?: () => void }> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => (
  <div className="panel flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
    <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
      <AlertCircle size={20} />
    </span>
    <h3 className="text-base font-medium text-slate-800">{title}</h3>
    {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-surface-50"
      >
        <RefreshCcw size={15} /> Try again
      </button>
    )}
  </div>
);
