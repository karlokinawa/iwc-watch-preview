const CACHE_NAME = 'iwc-watch-pwa-v1';
const APP_SHELL = [
  "a2-background.webp",
  "chronoclickaudio.m4a",
  "cm.webp",
  "cs.webp",
  "debug-marker.webp",
  "glint.webp",
  "h.webp",
  "icon-180.png",
  "icon-192.png",
  "icon-256.png",
  "icon-512.png",
  "index.html",
  "iwc-original-watch.jpeg",
  "iwc-preview.webp",
  "m.webp",
  "manifest.webmanifest",
  "mo.webp",
  "s.webp",
  "service-worker.js",
  "tg.webp",
  "tickloudaudio.mp3",
  "ticksoftaudio.mp3",
  "wo.webp"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return response;
      }).catch(() => caches.match('index.html'));
    })
  );
});
