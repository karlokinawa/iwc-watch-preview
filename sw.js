const CACHE_NAME = "iwc-watch-preview-pwa-v7";
const CORE_ASSETS = [
  "A2.png",
  "A2.png?v=7",
  "A2_low.webp",
  "A2_low.webp?v=7",
  "apple-touch-icon.png",
  "apple-touch-icon.png?v=7",
  "audio_001.mp3",
  "audio_001.mp3?v=7",
  "audio_002.mp3",
  "audio_002.mp3?v=7",
  "audio_003.bin",
  "audio_003.bin?v=7",
  "icon-192.png",
  "icon-192.png?v=7",
  "icon-512.png",
  "icon-512.png?v=7",
  "image_001.png",
  "image_001.png?v=7",
  "image_002.png",
  "image_002.png?v=7",
  "image_003.png",
  "image_003.png?v=7",
  "image_004.png",
  "image_004.png?v=7",
  "image_005.png",
  "image_005.png?v=7",
  "image_006.png",
  "image_006.png?v=7",
  "image_007.png",
  "image_007.png?v=7",
  "image_008.png",
  "image_008.png?v=7",
  "image_009.png",
  "image_009.png?v=7",
  "image_010.png",
  "image_010.png?v=7",
  "image_011.png",
  "image_011.png?v=7",
  "image_012.png",
  "image_012.png?v=7",
  "image_013.png",
  "image_013.png?v=7",
  "index.html",
  "index.html?v=7",
  "m_light.html",
  "m_light.html?v=7",
  "manifest.webmanifest",
  "manifest.webmanifest?v=7"
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
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("index.html") || caches.match("index.html?v=7"));
    })
  );
});
