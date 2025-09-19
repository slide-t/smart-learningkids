/* service-worker.js
   Aggressive offline-first service worker for static GitHub Pages sites.
   - Update CACHE_VERSION on every deploy to force clients to refresh caches.
   - Put all critical files in PRECACHE_URLS.
   - Use the registration messaging pattern to ask clients to skipWaiting and reload.
*/

const CACHE_VERSION = 'v2025-09-16-01'; // bump this on each deploy (recommended)
const PRECACHE = `slkids-precache-${CACHE_VERSION}`;
const RUNTIME = `slkids-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',                 // index.html
  '/index.html',
  '/manifest.json',
  '/service-worker.js', // include self so newest SW can be fetched
  '/styles.css',       // if you have a central stylesheet
   '/data/classes.json',
  '/games/keyboard.html',
  '/games/mouse.html',
   '/games/keyboard.json',
   '/games/mouse.html',
   '/games/mouse.json',
   '/games/mouse.js',
   '/games/keyboard.js',
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
const isNavigationRequest = (req) => req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));
const shouldBypassCache = (request) => {
  // Never cache POST/PUT/DELETE or requests that look like analytics.
  if (request.method !== 'GET') return true;
  const url = new URL(request.url);
  const bypassHosts = ['www.google-analytics.com', 'analytics.example.com'];
  if (bypassHosts.includes(url.hostname)) return true;
  return false;
};

/* === Install: precache app shell aggressively === */
self.addEventListener('install', (event) => {
  // Immediately take control of the page on install (but won't become active until skipWaiting)
  self.skipWaiting();

  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => {
        // installation finished
        console.log('[SW] Precached assets.');
      })
      .catch((err) => {
        console.error('[SW] Precache failed:', err);
      })
  );
});

/* === Activate: cleanup old caches and claim clients === */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // delete old caches that do not match current version
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          if (![PRECACHE, RUNTIME].includes(k)) {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
      // take control of clients immediately
      await self.clients.claim();
      console.log('[SW] Activated and claimed clients.');
    })()
  );
});

/* === Fetch: aggressive caching strategy === */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // skip cross-origin requests for caching unless it's same-origin assets (optional)
  const isSameOrigin = url.origin === self.location.origin;

  // Bypass cache for non-GETs and analytics
  if (shouldBypassCache(req)) {
    return; // let the request go to the network
  }

  // HTML navigation requests -> Cache-first but with network fallback and offline page
  if (isNavigationRequest(req) && isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cachedResp) => {
        if (cachedResp) {
          // serve cached HTML immediately, but update cache in background
          event.waitUntil(updateCache(req));
          return cachedResp;
        }
        // else try network, then fallback to precached offline page
        return fetch(req)
          .then((networkResp) => {
            // store fresh copy
            event.waitUntil(storeInRuntime(req, networkResp.clone()));
            return networkResp;
          })
          .catch(() => caches.match('/index.html')); // fallback to index for SPA behavior
      })
    );
    return;
  }

  // For other same-origin requests (CSS/JS/images) -> Cache-first then stale-while-revalidate
  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((networkResp) => {
            // store fresh copy in runtime cache (but don't await it)
            event.waitUntil(storeInRuntime(req, networkResp.clone()));
            return networkResp;
          })
          .catch(() => null);

        // If cached, return it immediately, but still update in background
        if (cached) {
          // background revalidation
          event.waitUntil(networkFetch);
          return cached;
        }
        // otherwise wait for network or failover to fallback (images/audio)
        return networkFetch || new Response('', { status: 404, statusText: 'Not found' });
      })
    );
    return;
  }

  // For cross-origin requests: try network, fallback to cache (if any)
  event.respondWith(
    fetch(req)
      .then((res) => res)
      .catch(() => caches.match(req))
  );
});

/* === Helpers for caching runtime responses === */
async function storeInRuntime(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') {
    // We avoid caching opaque responses (CORS) aggressively
    return;
  }
  const cache = await caches.open(RUNTIME);
  try {
    await cache.put(request, response);
    // optionally: implement LRU cleanup here (not included for simplicity)
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
    // network failed, ignore
  }
}

/* === Listen for messages from client to trigger skipWaiting/refresh === */
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type } = event.data;
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
    return;
  }
});

/* === Optional: push notification / sync stubs could be added here === */
