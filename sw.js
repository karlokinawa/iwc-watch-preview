
const CACHE_NAME="iwc-watch-preview-pwa-v17";
const ASSETS=['A2.png?v=17', 'A2_low.webp?v=17', 'apple-touch-icon.png?v=17', 'chrono_click.m4a?v=17', 'icon-192.png?v=17', 'icon-512.png?v=17', 'img_003.png?v=17', 'img_004.png?v=17', 'img_005.png?v=17', 'img_006.png?v=17', 'img_007.png?v=17', 'img_008.png?v=17', 'img_009.png?v=17', 'img_010.png?v=17', 'img_011.png?v=17', 'index.html?v=17', 'knopf_ob.png?v=17', 'knopf_unt.png?v=17', 'm_light.html?v=17', 'manifest.webmanifest?v=17', 'mo.png?v=17', 'tick_loud.mp3?v=17', 'tick_soft.mp3?v=17'];

self.addEventListener("install",e=>{
 self.skipWaiting();
 e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.map(k=>k!==CACHE_NAME && caches.delete(k))
  )).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",e=>{
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
