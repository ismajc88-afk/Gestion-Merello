// Merello Planner Service Worker
// Version 1.0 - PWA Cache Strategy

const CACHE_NAME = 'merello-v1';
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/index.css',
    '/escudo-merello.png',
    '/icon-512.png'
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone response to cache
                const responseClone = response.clone();

                // Only cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }

                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            console.log('[SW] Serving from cache:', event.request.url);
                            return cachedResponse;
                        }

                        // If not in cache and it's a navigation request, return index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }

                        // Otherwise, return offline page or error
                        return new Response('Offline - No cached version available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({ 'Content-Type': 'text/plain' })
                        });
                    });
            })
    );
});
