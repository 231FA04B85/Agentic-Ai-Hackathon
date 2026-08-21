const CACHE_NAME = 'agriai-v1';
const APP_SHELL = ['./', './index.html', './css/main.css'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
