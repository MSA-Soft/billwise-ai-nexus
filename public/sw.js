// Service Worker for BillWise AI Nexus PWA
// CRITICAL: Increment version to force cache clear when code changes
const CACHE_NAME = 'billwise-ai-nexus-v2'; // Changed from v1 to v2 to clear old cache
const RUNTIME_CACHE = 'billwise-runtime-v2'; // Changed from v1 to v2
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.svg',
  // '/icon-192.png',  // Uncomment when PNG icons are created
  // '/icon-512.png',  // Uncomment when PNG icons are created
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // CRITICAL: Don't cache JavaScript/TypeScript files - always fetch fresh
  const url = new URL(event.request.url);
  const isJSFile = url.pathname.endsWith('.js') || 
                   url.pathname.endsWith('.mjs') || 
                   url.pathname.includes('/src/') ||
                   url.pathname.includes('/node_modules/') ||
                   url.searchParams.has('v'); // Vite adds version params
  
  // For JavaScript files, always fetch from network (no cache)
  if (isJSFile) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Only fallback to cache if network fails (offline)
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other files (HTML, CSS, images), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response (but not JS files)
            if (!isJSFile) {
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // If offline and request is for a page, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'billwise-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BillWise AI Nexus', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Sync data function
async function syncData() {
  try {
    // Get pending data from IndexedDB
    // Sync with server
    console.log('[SW] Syncing data...');
    // Implementation would sync pending operations
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

