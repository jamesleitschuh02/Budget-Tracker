const FILES_TO_CACHE = [
    '/',
    './assets/css/style.css',
    './indexedDB.html',
    './assets/images/icons/icon-192x192.png',
    './assets/images/icons/icon-512x512.png'
];

const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v2";

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
