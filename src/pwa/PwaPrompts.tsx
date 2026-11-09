import React, { useEffect, useState } from 'react';
import { applyUpdate, isIOS, promptInstall, setIosGuideOpen, useCanInstall, usePwa } from './pwa';

/* App-specific copy. The agent app (client/) has its own copy of this file. */
const APP_NAME = 'BeemaDiary Admin';
const DISMISS_KEY = 'bd-admin:pwa-install-dismissed-at';
const DISMISS_DAYS = 14;

const readDismissed = (): boolean => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
};

// Inline icons: no dependency on a particular lucide-react version.
const ShareIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="inline h-5 w-5 align-[-4px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" /><path d="m8 7 4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
);
const AddBoxIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="inline h-5 w-5 align-[-4px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" />
  </svg>
);
const DownloadIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
  </svg>
);
const CloseIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/** Compact header button. Renders nothing when installing is not possible. */
export const InstallAppButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canInstall = useCanInstall();
  if (!canInstall) return null;
  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      title={`Install the ${APP_NAME} app`}
      aria-label={`Install the ${APP_NAME} app`}
      className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-3 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-50 hover:text-brand-700 pointer-coarse:min-h-11 pointer-coarse:min-w-11 ${className}`}
    >
      <DownloadIcon />
      <span className="hidden md:inline">Install app</span>
    </button>
  );
};

const IosGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-900/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl border border-surface-200" />
            <div>
              <h2 id="ios-install-title" className="text-base font-semibold text-slate-900">Install {APP_NAME}</h2>
              <p className="text-sm text-slate-500">Add it to your Home Screen</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-surface-100">
            <CloseIcon />
          </button>
        </div>
        <ol className="space-y-3 text-[15px] leading-relaxed text-slate-700">
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">1</span><span>Tap the <strong>Share</strong> button <ShareIcon /> in the browser toolbar.</span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">2</span><span>Scroll down and tap <strong>Add to Home Screen</strong> <AddBoxIcon />.</span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">3</span><span>Tap <strong>Add</strong>. Open {APP_NAME} from its new Home Screen icon.</span></li>
        </ol>
        <p className="mt-4 rounded-xl bg-surface-50 p-3 text-xs leading-relaxed text-slate-500">
          Use Safari. On iOS 16.4 and later, Chrome and Edge also show <strong>Add to Home Screen</strong> in their Share menu. You will need to sign in once inside the installed app.
        </p>
        <button type="button" onClick={onClose} className="mt-5 min-h-12 w-full rounded-xl bg-brand-600 text-base font-semibold text-white hover:bg-brand-700">
          Got it
        </button>
      </div>
    </div>
  );
};

/** Global PWA UI: update banner, install banner and the iOS instructions sheet. */
export const PwaPrompts: React.FC = () => {
  const { updateReady, iosGuideOpen } = usePwa();
  const canInstall = useCanInstall();
  const [dismissed, setDismissed] = useState(readDismissed);
  const ios = isIOS();

  // While a banner is showing, reserve room under the page so it never hides
  // the last control (e.g. the Sign in button on a phone's login screen).
  const bannerShown = updateReady || (canInstall && !dismissed);
  useEffect(() => {
    if (!bannerShown) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = 'calc(6rem + env(safe-area-inset-bottom))';
    return () => { document.body.style.paddingBottom = prev; };
  }, [bannerShown]);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* storage unavailable */ }
  };

  // z-35: above page content, BELOW the nav drawers/overlays (z-40+) and modals (z-1000),
  // so it can never cover the drawer's Sign out button or a dialog's actions.
  const bannerBase =
    'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[35] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-surface-200 bg-white p-3 pl-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]';

  return (
    <>
      {updateReady ? (
        <div role="status" className={bannerBase}>
          <p className="flex-1 text-sm text-slate-700">A new version of {APP_NAME} is available.</p>
          <button type="button" onClick={applyUpdate} className="min-h-11 shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
            Reload
          </button>
        </div>
      ) : canInstall && !dismissed ? (
        <div role="region" aria-label={`Install ${APP_NAME}`} className={bannerBase}>
          <img src="/icons/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl border border-surface-200" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">Install {APP_NAME}</p>
            <p className="truncate text-xs text-slate-500">{ios ? 'Add to your Home Screen' : 'Quick access from your home screen'}</p>
          </div>
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="min-h-11 shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {ios ? 'How to' : 'Install'}
          </button>
          <button type="button" onClick={dismiss} aria-label="Not now" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-surface-100 hover:text-slate-600">
            <CloseIcon />
          </button>
        </div>
      ) : null}
      {iosGuideOpen && <IosGuide onClose={() => setIosGuideOpen(false)} />}
    </>
  );
};
