const VERSION = 'dev';
const CACHE = `los-${VERSION}`;

const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
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
    // Only handle GET requests for same-origin or cached CDN assets
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            const network = fetch(event.request).then(response => {
                if (response.ok && event.request.url.startsWith(self.location.origin)) {
                    caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
                }
                return response;
            });
            // Return cache immediately, update in background (stale-while-revalidate)
            return cached || network;
        })
    );
});
