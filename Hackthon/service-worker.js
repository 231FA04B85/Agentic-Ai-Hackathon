/**
 * AgriAI Service Worker — Cache-First PWA Strategy
 */
const CACHE_NAME = 'agriai-v1.2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/farm-management.html',
    '/crop-analysis.html',
    '/weather.html',
    '/soil-irrigation.html',
    '/pest-disease.html',
    '/market-intelligence.html',
    '/recommendations.html',
    '/explainability.html',
    '/farmer-feedback.html',
    '/css/variables.css',
    '/css/main.css',
    '/css/dashboard.css',
    '/css/components.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/js/vendor/chart.min.js',
    '/js/config.js',
    '/js/main.js',
    '/js/utils/formatters.js',
    '/js/agents/orchestrator-agent.js',
    '/js/agents/crop-agent.js',
    '/js/agents/weather-agent.js',
    '/js/agents/soil-agent.js',
    '/js/agents/pest-agent.js',
    '/js/agents/market-agent.js',
    '/js/agents/explanation-agent.js',
    '/js/pages/dashboard.js',
    '/js/pages/farm-management.js',
    '/js/pages/crop-analysis.js',
    '/js/pages/weather.js',
    '/js/pages/soil-irrigation.js',
    '/js/pages/pest-disease.js',
    '/js/pages/market-intelligence.js',
    '/js/pages/recommendations.js',
    '/js/pages/explainability.js',
    '/js/pages/farmer-feedback.js',
    '/assets/data/sample-crops.json',
    '/assets/data/sample-fields.json',
    '/assets/data/sample-recommendations.json'
];

// Install: pre-cache all static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing AgriAI service worker…');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('[SW] Pre-cache failed for some assets:', err))
    );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating AgriAI service worker…');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for static, network-first for API calls
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and external API requests (weather, market APIs)
    if (request.method !== 'GET') return;
    if (url.hostname !== location.hostname && !url.pathname.startsWith('/')) return;

    // Network-first for API endpoints
    if (url.pathname.includes('/api/') || url.hostname.includes('openweathermap') || url.hostname.includes('commoditymarket')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first for all other assets
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (response.ok && response.type !== 'opaque') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() => {
                // Offline fallback for HTML pages
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// Background sync placeholder
self.addEventListener('sync', event => {
    if (event.tag === 'sync-feedback') {
        console.log('[SW] Syncing farmer feedback…');
    }
});
