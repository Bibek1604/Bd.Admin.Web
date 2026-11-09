/**
 * PWA runtime: service-worker registration, the Android/desktop install
 * prompt, iOS "Add to Home Screen" detection and update handling.
 *
 * Kept framework-free (a tiny external store) so it can start listening for
 * `beforeinstallprompt` before React mounts — Chrome fires it early and only
 * once per page load.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaState {
  /** Deferred Chrome/Edge/Samsung install prompt, when the browser offers one. */
  installEvent: BeforeInstallPromptEvent | null;
  /** The app was installed during this session. */
  installed: boolean;
  /** A new version is installed and waiting; applyUpdate() switches to it. */
  updateReady: boolean;
  /** The iOS "Add to Home Screen" instructions sheet is open. */
  iosGuideOpen: boolean;
}

let state: PwaState = { installEvent: null, installed: false, updateReady: false, iosGuideOpen: false };
const listeners = new Set<() => void>();
const setState = (patch: Partial<PwaState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export const usePwa = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const isStandalone = (): boolean => {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
};

/** iPhone/iPad, including iPadOS which reports itself as a Mac. */
export const isIOS = (): boolean => {
  const ua = navigator.userAgent || '';
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/** True when the browser can install the app now, or the user is on iOS and can add it manually. */
export const useCanInstall = () => {
  const { installEvent, installed } = usePwa();
  const [standalone, setStandalone] = useState(isStandalone);
  useEffect(() => {
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandalone());
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);
  if (standalone || installed) return false;
  return !!installEvent || isIOS();
};

let waitingWorker: ServiceWorker | null = null;
let userAcceptedUpdate = false;

export const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  const ev = state.installEvent;
  if (!ev) {
    if (isIOS() && !isStandalone()) setState({ iosGuideOpen: true });
    return 'unavailable';
  }
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  // The event can only be used once.
  setState({ installEvent: null, installed: outcome === 'accepted' || state.installed });
  return outcome;
};

export const setIosGuideOpen = (open: boolean) => setState({ iosGuideOpen: open });

/** Activate the waiting service worker; the page reloads on controllerchange. */
export const applyUpdate = () => {
  userAcceptedUpdate = true;
  const worker = waitingWorker;
  if (worker && worker.state === 'installed') {
    worker.postMessage({ type: 'SKIP_WAITING' });
    // Fallback: if controllerchange never arrives, reload anyway so the user is never stuck.
    window.setTimeout(() => window.location.reload(), 3000);
  } else {
    // Already activated (by another tab, or the browser itself): just load the new version.
    window.location.reload();
  }
};

/**
 * Called on logout. The worker never caches user data (see public/sw.js);
 * this is a defence-in-depth sweep of any non-static cache.
 */
export const clearServiceWorkerRuntime = () => {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_RUNTIME' });
  } catch { /* no service worker */ }
};

let initialised = false;

export const initPwa = () => {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Suppress the default mini-infobar; our own Install button shows instead.
    e.preventDefault();
    setState({ installEvent: e as BeforeInstallPromptEvent });
  });
  window.addEventListener('appinstalled', () => setState({ installEvent: null, installed: true }));

  // Dev builds never register a worker, so HMR and local debugging are unaffected.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  // Service workers require a secure context (HTTPS, or localhost).
  if (!window.isSecureContext) return;

  const register = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });

      const markWaiting = (worker: ServiceWorker | null) => {
        // Only an *update* needs a prompt; the very first install has nothing to replace.
        if (!worker || !navigator.serviceWorker.controller) return;
        waitingWorker = worker;
        setState({ updateReady: true });
      };
      markWaiting(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed') markWaiting(reg.waiting ?? nw);
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // First install (clients.claim) must not reload; only an accepted update does.
        if (!userAcceptedUpdate) return;
        window.location.reload();
      });

      // Look for a new deploy hourly and whenever the app returns to the foreground.
      const check = () => { reg.update().catch(() => {}); };
      window.setInterval(check, 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    } catch {
      // Registration failure leaves the app working exactly as a normal website.
    }
  };

  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => void register(), { once: true });
};
