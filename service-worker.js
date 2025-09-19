/* service-worker.js
   Offline-first service worker for Smart Learning Kids
   - Update CACHE_VERSION on every deploy to force clients to refresh caches.
*/

const CACHE_VERSION = 'v2025-09-16-02'; // bumped version
const PRECACHE = `slkids-precache-${CACHE_VERSION}`;
const RUNTIME = `slkids-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',                 // index.html
  '/index.html',
  '/classes.html',
  '/manifest.json',
  '/service-worker.js',
  '/styles.css',
  '/games/keyboard.html',
  '/games/mouse.html',
  '/games/mouse.js',
  '/games/keyboard.js',
   'data/classes.json',
  '/lessons.html',
  '/quizzes.html',
  '/worksheets.html',
  '/about.html',
  '/contact.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // add other core assets you want immediately cached
];

/* === Utility helpers === */
const isNavigationRequest = (req) =>
  req.mode === 'navigate' ||
  (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));

const shouldBypassCache = (request) => {
  if (request.method !== 'GET') return true;
  const url = new URL(request.url);
  const bypassHosts = ['www.google-analytics.com', 'analytics.example.com'];
  if (bypassHosts.includes(url.hostname)) return true;
  return false;
};

const isJsonRequest = (request) =>
  request.destination === 'script' ||
  request.destination === 'document'
    ? false
    : request.url.endsWith('.json');

/* === Install: precache app shell aggressively === */
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => console.log('[SW] Precached app shell.'))
      .catch((err) => console.error('[SW] Precache failed:', err))
  );
});

/* === Activate: cleanup old caches and claim clients === */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          if (![PRECACHE, RUNTIME].includes(k)) {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
      await self.clients.claim();
      console.log('[SW] Activated and claimed clients.');
    })()
  );
});

/* === Fetch: caching strategies === */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (shouldBypassCache(req)) return;

  const isSameOrigin = url.origin === self.location.origin;

  // Handle JSON files with network-first strategy
  if (isSameOrigin && isJsonRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((networkResp) => {
          event.waitUntil(storeInRuntime(req, networkResp.clone()));
          return networkResp;
        })
        .catch(() => caches.match(req)) // fallback to cache when offline
    );
    return;
  }

  // Navigation requests (HTML pages)
  if (isNavigationRequest(req) && isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cachedResp) => {
        if (cachedResp) {
          event.waitUntil(updateCache(req));
          return cachedResp;
        }
        return fetch(req)
          .then((networkResp) => {
            event.waitUntil(storeInRuntime(req, networkResp.clone()));
            return networkResp;
          })
          .catch(() => caches.match('/index.html'));
      })
    );
    return;
  }

  // Same-origin assets (CSS, JS, images)
  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((networkResp) => {
            event.waitUntil(storeInRuntime(req, networkResp.clone()));
            return networkResp;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkFetch);
          return cached;
        }
        return networkFetch || new Response('', { status: 404 });
      })
    );
    return;
  }

  // Cross-origin requests: network first, fallback to cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

/* === Helpers === */
async function storeInRuntime(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  const cache = await caches.open(RUNTIME);
  try {
    await cache.put(request, response);
  } catch (err) {
    console.warn('[SW] Failed to store in runtime cache', err);
  }
}

async function updateCache(request) {
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) {
      const cache = await caches.open(RUNTIME);
      await cache.put(request, resp.clone());
      console.log('[SW] Background updated:', request.url);
    }
  } catch (err) {
    // ignore
  }
}

/* === Messaging === */
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type } = event.data;
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});
