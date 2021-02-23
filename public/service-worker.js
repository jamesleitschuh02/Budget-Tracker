const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v2";

const FILES_TO_CACHE = [
    '/',
    './assets/css/style.css',
    './assets/index.js',
    './index.html',
    './manifest.webmanifest',
    './assets/images/icons/icon-192x192.png',
    './assets/images/icons/icon-512x512.png'
];


//Installation
self.addEventListener("install",function(evt) {
    //Pre-cache image data
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
        );
    //Pre-cache all static assets
    evt.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    //Browser immediately activates service worker once this finishes installing
    self.skipWaiting();
});

//Activate service worker and remove old data from cache
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key!== STATIC_CACHE && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    )
    self.clients.claim();
});

//Enable service worker to intercept network requests
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api')) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
        );
        return;
    }
    evt.respondWith(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request);
            });
        })
    );
});