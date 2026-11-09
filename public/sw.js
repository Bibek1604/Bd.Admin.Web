/* BeemaDiary service worker.
 *
 * SECURITY MODEL — read before changing:
 *   This worker caches ONLY public, build-time static files (hashed JS/CSS
 *   bundles, icons, the manifest and the offline page). It never stores:
 *     - API responses (same-origin /api/* or the cross-origin API host),
 *     - uploaded files, policy documents, evidence images or attachments,
 *     - HTML navigations (every page load goes to the network),
 *     - any non-GET request.
 *   It works on an ALLOWLIST: a request that does not match one of the
 *   static rules below is not intercepted at all, so the browser handles it
 *   exactly as it would without a service worker. Insurance and admin data
 *   therefore always come from the network, are never available offline, and
 *   can never be shown to the next person who uses the device.
 *
 * Placeholders replaced at build time by the `bd-service-worker` Vite plugin:
 *   __BD_APP__       app id ("agent" | "admin"), used to name caches
 *   __BD_BUILD__     unique build id, so each deploy gets a fresh cache
 *   __BD_PRECACHE__  JSON array of hashed /assets/* files in this build
 */
'use strict';

const APP = '__BD_APP__';
const BUILD = '__BD_BUILD__';
const PRECACHE_ASSETS = /* injected */ [];

const CACHE_PREFIX = `bd-${APP}-`;
const STATIC_CACHE = `${CACHE_PREFIX}static-${BUILD}`;
const OFFLINE_URL = '/offline.html';

const SHELL_FILES = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.png',
];

// Never intercepted, even if a later rule would match. Same-origin API and
// file routes (used when the API is reverse-proxied under the app host).
const NEVER_INTERCEPT = [
  /^\/api(\/|$)/,
  /^\/uploads(\/|$)/,
  /^\/private/,
  /^\/files(\/|$)/,
  /^\/media(\/|$)/,
  /^\/socket\.io(\/|$)/,
  /^\/sw\.js$/,
];

// Public static files served from /public, refreshed in the background.
const PUBLIC_STATIC = [
  /^\/icons\/[\w.-]+\.(png|svg|webp)$/,
  /^\/manifest\.webmanifest$/,
  /^\/offline\.html$/,
  /^\/(favicon|logo|icons)\.(png|svg|ico|webp)$/,
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // `cache: 'reload'` bypasses the HTTP cache so the precache matches this build.
    await cache.addAll(SHELL_FILES.map((url) => new Request(url, { cache: 'reload' })));
    // Hashed bundles: best effort. A single failure must not block install.
    await Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url)));
  })());
  // Do NOT skipWaiting here: the page asks the user before activating a new
  // version (see src/pwa/registerServiceWorker.ts), so a running session is
  // never switched to new code mid-form.
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  // Sent on logout. Nothing user-specific is ever cached here; this is a
  // defence-in-depth sweep of anything outside the current static cache.
  if (type === 'CLEAR_RUNTIME') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)),
      )),
    );
  }
});

const isOk = (response) =>
  response && response.ok && response.status === 200 && response.type === 'basic' && !response.redirected;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Cross-origin (API host, Cloudinary, fonts): not ours, never cached here.
  if (url.origin !== self.location.origin) return;
  if (NEVER_INTERCEPT.some((re) => re.test(url.pathname))) return;

  // Page loads: always network. The HTML is not cached, so a stale or
  // previous user's screen can never be served. Offline -> static notice.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        const cached = await caches.match(OFFLINE_URL);
        return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  // Content-hashed build output: immutable, cache-first. Keeps lazily loaded
  // chunks of the running version available after a new deploy.
  if (url.pathname.startsWith('/assets/') && !url.search) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (isOk(response)) cache.put(request, response.clone()).catch(() => {});
      return response;
    })());
    return;
  }

  // Public static files: stale-while-revalidate.
  if (PUBLIC_STATIC.some((re) => re.test(url.pathname)) && !url.search) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (isOk(response)) cache.put(request, response.clone()).catch(() => {});
          return response;
        })
        .catch(() => hit || Response.error());
      return hit || network;
    })());
  }
  // Anything else: not intercepted.
});
