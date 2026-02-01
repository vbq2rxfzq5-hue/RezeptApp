/**
 * Secure Service Worker
 * Only caches static assets - no dynamic code execution
 */

const CACHE_NAME = 'secure-rezept-app-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/config.js',
    '/js/validator.js',
    '/js/sanitizer.js',
    '/js/storage.js',
    '/js/dom-builder.js',
    '/js/recipe-helpers.js',
    '/js/router.js',
    '/js/app.js',
    '/js/views/recipe-list.js',
    '/js/views/recipe-detail.js',
    '/js/views/recipe-form.js',
    '/js/views/recipe-edit.js',
    '/js/views/shopping-list.js',
    '/js/views/recipe-select.js',
    '/js/views/fridge-check.js',
    '/js/views/archive-list.js',
    '/js/views/archive-create.js',
    '/js/views/archive-detail.js',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Network request with security headers
                return fetch(event.request, {
                    credentials: 'same-origin',
                    redirect: 'error'
                }).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response for caching
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Return offline page or basic error
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
