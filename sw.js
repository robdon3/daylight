// Daylight service worker: keeps the app opening when you're offline.
const CACHE = 'daylight-v3';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const EXTRA = ['data/arlington-va/places.json', 'data/arlington-va/events.json', 'data/arlington-va/guide.json'];
const VENDOR = ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.addAll(SHELL);
    await Promise.all([...VENDOR, ...EXTRA].map((u) => c.add(u).catch(() => {})));   // best effort
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const ours = url.origin === location.origin || VENDOR.includes(e.request.url);
  if (e.request.method !== 'GET' || !ours) return;       // weather and map tiles go straight to the network
  e.respondWith(fetch(e.request).then((r) => {             // newest first, saved copy when offline
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
