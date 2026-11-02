// ============================================================================
// MAHALAKSHMI HOSPITAL HMS — SECURITY-HARDENED PWA SERVICE WORKER
// Strictly caches ONLY the static UI shell for fast multi-device installation.
// NEVER caches /api/* responses or confidential clinical/patient records.
// ============================================================================

const SHELL_CACHE = 'mahalakshmi-hms-shell-v3';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== SHELL_CACHE) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL SECURITY & DEV RULE: Never intercept /api/, non-GET, or Vite HMR/module requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-first for static assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
