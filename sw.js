const CACHE_NAME = "iwc-watch-preview-pwa-v15";
const CORE_ASSETS = [
  "A2.png?v=15",
  "A2_low.webp?v=15",
  "apple-touch-icon.png?v=15",
  "chrono_click.m4a?v=15",
  "icon-192.png?v=15",
  "icon-512.png?v=15",
  "img_003.png?v=15",
  "img_004.png?v=15",
  "img_005.png?v=15",
  "img_006.png?v=15",
  "img_007.png?v=15",
  "img_008.png?v=15",
  "img_009.png?v=15",
  "img_010.png?v=15",
  "img_011.png?v=15",
  "index.html?v=15",
  "knopf_ob.png?v=15",
  "knopf_unt.png?v=15",
  "m_light.html?v=15",
  "manifest.webmanifest?v=15",
  "mo.png?v=15",
  "tick_loud.mp3?v=15",
  "tick_soft.mp3?v=15"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(
      CORE_ASSETS.map(url => new Request(url, {cache: "reload"}))
    ))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match("index.html?v=15"));
    })
  );
});
