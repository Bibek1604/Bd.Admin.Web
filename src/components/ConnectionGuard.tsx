import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

// Lightweight, unauthenticated backend health probe (app.get('/health')).
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string || '').replace(/\/$/, '');
const HEALTH_URL = `${API_BASE}/health`;

const ONLINE_POLL_MS = 25000;   // relaxed cadence while everything is healthy
const OFFLINE_POLL_MS = 5000;   // probe more often so recovery feels instant
const PROBE_TIMEOUT_MS = 6000;  // give a slow/cold backend a fair chance
const FAILS_BEFORE_OFFLINE = 2; // avoid flicker on a single transient blip

/**
 * Wraps the app and shows a full-screen "reconnecting" loading screen whenever
 * the internet drops or the backend can't be reached. It recovers on its own —
 * no reload needed — as soon as connectivity returns.
 */
const ConnectionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const failures = useRef(0);

  const check = useCallback(async () => {
    // Browser already knows there's no network — no point probing.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      failures.current = FAILS_BEFORE_OFFLINE;
      setOffline(true);
      return;
    }
    setChecking(true);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
      const res = await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store', signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`status ${res.status}`);
      failures.current = 0;
      setOffline(false);
    } catch {
      failures.current += 1;
      if (failures.current >= FAILS_BEFORE_OFFLINE) setOffline(true);
    } finally {
      setChecking(false);
    }
  }, []);

  // Initial probe + react instantly to browser online/offline events.
  useEffect(() => {
    check();
    const onOnline = () => check();
    const onOffline = () => { failures.current = FAILS_BEFORE_OFFLINE; setOffline(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [check]);

  // Poll faster while offline so the screen clears the moment the server is back.
  useEffect(() => {
    const id = window.setInterval(check, offline ? OFFLINE_POLL_MS : ONLINE_POLL_MS);
    return () => window.clearInterval(id);
  }, [offline, check]);

  return (
    <>
      {children}
      {offline && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-6 bg-surface-50/95 px-6 text-center backdrop-blur-md">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-surface-100">
            <BrandLogo className="h-12 w-auto max-w-44" />
          </div>

          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-base font-bold text-slate-800">
              <WifiOff size={18} className="text-rose-500" />
              Reconnecting…
            </div>
            <p className="mx-auto max-w-xs text-sm font-medium text-slate-400">
              We can&rsquo;t reach the server right now. This will resume automatically once your
              connection is back.
            </p>
          </div>

          <button
            type="button"
            onClick={check}
            disabled={checking}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-70"
          >
            {checking ? 'Checking…' : 'Retry now'}
          </button>
        </div>
      )}
    </>
  );
};

export default ConnectionGuard;
