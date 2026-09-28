import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * The app's own confirmation dialog, replacing window.confirm().
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Approve request?', tone: 'success', confirmLabel: 'Approve' })) { ... }
 *
 * One dialog is rendered by <ConfirmProvider> at the app root. Calls resolve
 * true on confirm and false on Cancel, Escape, the close button or a click on
 * the backdrop.
 */
export type ConfirmTone = 'danger' | 'success' | 'primary';

export interface ConfirmOptions {
  title: string;
  message?: React.ReactNode;
  /** Label/value rows shown above the buttons, e.g. the record being acted on. */
  details?: Array<{ label: string; value: React.ReactNode }>;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return confirm;
};

const TONES: Record<ConfirmTone, { icon: React.ReactNode; iconClass: string; button: string }> = {
  danger: {
    icon: <AlertTriangle size={20} />,
    iconClass: 'bg-rose-50 text-rose-600',
    button: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/30',
  },
  success: {
    icon: <CheckCircle2 size={20} />,
    iconClass: 'bg-brand-50 text-brand-600',
    button: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500/30',
  },
  primary: {
    icon: <HelpCircle size={20} />,
    iconClass: 'bg-blue-50 text-blue-600',
    button: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500/30',
  },
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending((current) => {
          // A second confirm while one is open cancels the first.
          current?.resolve(false);
          return { ...options, resolve };
        });
      }),
    [],
  );

  const settle = useCallback((ok: boolean) => {
    setPending((current) => {
      current?.resolve(ok);
      return null;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && <ConfirmDialogView options={pending} onSettle={settle} />}
    </ConfirmContext.Provider>
  );
};

const ConfirmDialogView: React.FC<{ options: ConfirmOptions; onSettle: (ok: boolean) => void }> = ({ options, onSettle }) => {
  const { title, message, details, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'primary' } = options;
  const t = TONES[tone];
  const titleId = React.useId();
  const messageId = React.useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus the safe choice first for destructive actions; otherwise the action.
  // Escape cancels; Tab stays between the two buttons; focus goes back to the
  // opener afterwards. The effect runs once per dialog (deps are stable).
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (tone === 'danger' ? cancelRef.current : confirmRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onSettle(false); return; }
      if (e.key === 'Tab') {
        const items = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        const i = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        items[(i + (e.shiftKey ? items.length - 1 : 1)) % items.length]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [onSettle, tone]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-modal-backdrop"
        onClick={() => onSettle(false)}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-modal-panel"
      >
        <button
          type="button"
          onClick={() => onSettle(false)}
          aria-label="Close"
          tabIndex={-1}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4 px-6 pt-6">
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', t.iconClass)}>{t.icon}</span>
          <div className="min-w-0 pr-6">
            <h2 id={titleId} className="text-base font-semibold text-slate-900">{title}</h2>
            {message && <div id={messageId} className="mt-1 text-sm text-slate-600">{message}</div>}
          </div>
        </div>

        {details && details.length > 0 && (
          <dl className="mx-6 mt-4 divide-y divide-surface-200 rounded-[var(--radius-control)] border border-surface-200 bg-surface-50 text-sm">
            {details.map((row) => (
              <div key={row.label} className="flex gap-4 px-3 py-2">
                <dt className="w-20 shrink-0 text-slate-500">{row.label}</dt>
                <dd className="min-w-0 break-words text-slate-800">{row.value || <span className="text-slate-400">-</span>}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-surface-200 bg-surface-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onSettle(false)}
            className="h-10 rounded-[var(--radius-control)] border border-surface-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onSettle(true)}
            className={cn('h-10 rounded-[var(--radius-control)] px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2', t.button)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmProvider;
