const CACHE_NAME = 'yt-transcript-pro-v4.0';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/static/styles.css?v=4.0.0',
  '/static/app.js?v=4.0.0',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial error (ignored):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. API requests: Network-First with friendly JSON on complete disconnect
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            detail: 'Offline Mode: Local server or internet is currently disconnected.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Non-GET requests: let default browser fetch handle
  if (request.method !== 'GET') {
    return;
  }

  // 2. Navigation / HTML Document & Local Scripts:
  // NETWORK-FIRST with OFFLINE CACHE FALLBACK!
  // This guarantees all new UI changes show up immediately when server is running,
  // while still working 100% offline from cache when server is off or no internet!
  const isDocument = request.mode === 'navigate' || request.destination === 'document' || url.pathname === '/';
  const isLocalCode = url.pathname.startsWith('/static/app.js') || url.pathname.startsWith('/static/styles.css');

  if (isDocument || isLocalCode) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback from local cache
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (isDocument) return caches.match('/');
            return new Response('Offline resource not cached', { status: 503 });
          });
        })
    );
    return;
  }

  // 3. For Fonts, Icons, CDN CSS: Stale-While-Revalidate with Cache-First Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
