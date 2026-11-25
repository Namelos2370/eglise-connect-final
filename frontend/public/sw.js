/* Église Connect – service worker (hors ligne + installation) */
const VERSION = 'v1';
const SHELL = 'ec-shell-' + VERSION;
const ASSETS = 'ec-assets-' + VERSION;
const API = 'ec-api-' + VERSION;
const IMAGES = 'ec-img-' + VERSION;
const KEEP = [SHELL, ASSETS, API, IMAGES];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((c) => c.addAll(['/', '/offline.html', '/logo192.png', '/favicon.png']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function putLimited(cacheName, request, response, max) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  if (keys.length > max) await cache.delete(keys[0]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Pages (navigation) : réseau d'abord, sinon l'application en cache, sinon page hors ligne
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/', copy));
          return res;
        })
        .catch(async () => (await caches.match('/')) || (await caches.match('/offline.html')))
    );
    return;
  }

  // Fichiers de l'application (JS/CSS avec empreinte) : cache d'abord
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/static/') || /\.(png|jpg|jpeg|svg|ico|woff2?|json)$/.test(url.pathname)) {
      event.respondWith(
        caches.match(req).then((hit) => hit || fetch(req).then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(req, copy)); }
          return res;
        }))
      );
    }
    return;
  }

  // Données de l'API : réseau d'abord, dernières données en cache si hors ligne
  if (url.hostname === 'api.eglise-connect.com') {
    if (url.pathname.startsWith('/api/auth')) return; // jamais en cache
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) putLimited(API, req, res.clone(), 60);
          return res;
        })
        .catch(async () => (await caches.match(req)) || new Response(JSON.stringify({ offline: true, message: 'Hors ligne' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  // Images Cloudinary : cache d'abord (limité)
  if (url.hostname === 'res.cloudinary.com' && req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') putLimited(IMAGES, req, res.clone(), 80);
        return res;
      }).catch(() => hit))
    );
  }
});
