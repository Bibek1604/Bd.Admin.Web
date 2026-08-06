import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => {
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 lg:left-[var(--admin-sidebar-w)] bg-slate-900/40 backdrop-blur-sm animate-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className={`relative flex w-full ${maxWidth} max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-modal-panel`}>
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div className="min-w-0">
            {title && <h2 className="truncate text-lg font-bold tracking-tight text-slate-800">{title}</h2>}
            {subtitle && <p className="mt-0.5 truncate text-xs font-medium text-slate-400">{subtitle}</p>}
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
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
