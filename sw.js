const CACHE_NAME = 'iwc-master-v3-pwa-v1';
const APP_SHELL = ["./app.js", "./apple-touch-icon.png", "./ch-1.webp", "./cm-1.webp", "./cs-1.webp", "./favicon-64.png", "./glintLayer-1.webp", "./glintLayer-2.webp", "./glintLayer-3.webp", "./glintLayer-4.webp", "./glintLayer-5.webp", "./glintLayer-6.webp", "./glintLayer-7.webp", "./h-1.webp", "./icon-192.png", "./icon-512.png", "./index.html", "./l-1.webp", "./l-2.webp", "./l-3.webp", "./l-4.webp", "./l-5.webp", "./m-1.webp", "./manifest.webmanifest", "./mo-1.webp", "./mt-1.webp", "./root-1.webp", "./s-1.webp", "./styles.css", "./tg-1.webp", "./watch-original.webp", "./wo-1.webp"];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
