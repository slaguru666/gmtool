const CACHE = 'director-v1';
// Precache only stable, build-invariant navigation paths. Hashed asset
// bundles (/assets/*) are cached at runtime on first online load by the
// cache-first fetch handler below. (Follow-up: generate a full precache
// list from the Vite build manifest for cold-offline-before-first-visit.)
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
      }
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
