const CACHE_NAME = 'isabilove-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-same-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Don't cache API responses
        if (url.pathname.startsWith('/api/')) {
          return response;
        }
        // Clone response for cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      }).catch(() => {
        // Return offline fallback for HTML requests
        if (request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Push event: show notification
self.addEventListener('push', (event) => {
  let data = { title: 'IsabiLove', body: 'You have a new reminder', icon: '/images/avatar_partner_1792816163693.jpg' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = { title: 'IsabiLove', body: event.data.text() || 'You have a new reminder' };
    }
  }

  const options = {
    body: data.body || 'You have a new reminder',
    icon: data.icon || '/images/avatar_partner_1792816163693.jpg',
    badge: '/images/avatar_friend_1792816163998.jpg',
    tag: data.tag || 'isabilove-notification',
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Open IsabiLove' },
      { action: 'close', title: 'Close' }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if app is already open
      const existingClient = clients.find((client) => client.url.includes(self.location.origin));
      if (existingClient) {
        return existingClient.focus().then(() => {
          existingClient.postMessage({ type: 'NAVIGATE', url });
        });
      }
      return self.clients.openWindow(url);
    })
  );
});

// Message handler for communication from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
