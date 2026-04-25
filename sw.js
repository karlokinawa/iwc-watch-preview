const CACHE_NAME = "iwc-watch-preview-pwa-v6";
const CORE_ASSETS = [
  "A2.png?v=6",
  "A2_low.webp?v=6",
  "apple-touch-icon.png?v=6",
  "audio_001.mp3?v=6",
  "audio_002.mp3?v=6",
  "audio_003.bin?v=6",
  "icon-192.png?v=6",
  "icon-512.png?v=6",
  "image_001.png?v=6",
  "image_002.png?v=6",
  "image_003.png?v=6",
  "image_004.png?v=6",
  "image_005.png?v=6",
  "image_006.png?v=6",
  "image_007.png?v=6",
  "image_008.png?v=6",
  "image_009.png?v=6",
  "image_010.png?v=6",
  "image_011.png?v=6",
  "image_012.png?v=6",
  "image_013.png?v=6",
  "index.html?v=6",
  "m_light.html?v=6",
  "manifest.webmanifest?v=6"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url, {cache: "reload"}))))
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
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("index.html?v=6") || caches.match("index.html"));
    })
  );
});
