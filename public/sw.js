/// <reference lib="webworker" />

// Service Worker for KabuNav PWA
const SW_VERSION = '1.0.1';
const CACHE_NAME = `kabunav-v${SW_VERSION}`;

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API routes and auth
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('clerk') ||
      url.pathname.includes('sign-in') ||
      url.pathname.includes('sign-up')) {
    return;
  }

  // Always use network for dynamic app pages to prevent stale class statuses
  if (event.request.mode === 'navigate' || url.pathname.startsWith('/dashboard')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let data = {
    title: 'KabuNav',
    body: 'You have a class update',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    tag: 'class-update',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon.svg',
    badge: data.badge || '/icons/icon.svg',
    tag: data.tag || 'class-update',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: {
      url: data.url || '/dashboard',
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-class-updates') {
    event.waitUntil(syncClassUpdates());
  }
});

async function syncClassUpdates() {
  // Sync any pending class status updates when back online
  console.log('[ServiceWorker] Syncing class updates...');
}
