
const CORE_CACHE = 'iwc-core-v1';
const MEDIA_CACHE = 'iwc-media-v1';
const CORE_ASSETS = ["index.html", "styles.css", "app.js", "manifest.json", "icon-192.png", "icon-512.png"];
const MEDIA_EXTENSIONS = /\.(?:webp|png|jpg|jpeg|mp3|m4a)$/i;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CORE_CACHE).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => ![CORE_CACHE, MEDIA_CACHE].includes(key))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  if (CORE_ASSETS.some(asset => url.pathname.endsWith('/' + asset) || url.pathname === '/' || url.pathname.endsWith('/'))) {
    event.respondWith((async () => {
      const cache = await caches.open(CORE_CACHE);
      const cached = await cache.match(req, { ignoreSearch: true }) || await cache.match('./index.html');
      if (cached) return cached;
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    })());
    return;
  }

  if (MEDIA_EXTENSIONS.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(MEDIA_CACHE);
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    })());
  }
});
