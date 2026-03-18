const VERSION = 'dev';
const CACHE = `los-${VERSION}`;

const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/daisyui@4.7.2/dist/full.min.css',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css',
    'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js',
    'https://unpkg.com/lucide@latest',
];

const CDN_ORIGINS = [
    'https://cdn.jsdelivr.net',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => {
            const base = self.registration.scope;
            return cache.addAll([
                base,
                base + 'index.html',
                base + 'app.js',
                base + 'styles.css',
                ...CDN_ASSETS,
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = event.request.url;
    const isSameOrigin = url.startsWith(self.location.origin);
    const isCDN = CDN_ORIGINS.some(o => url.startsWith(o));

    if (!isSameOrigin && !isCDN) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            const network = fetch(event.request).then(response => {
                if (response.ok) {
                    caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
                }
                return response;
            });
            // Return cache immediately, update in background (stale-while-revalidate)
            return cached || network;
        })
    );
});
