/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

type WorkboxManifestEntry = string | { url: string; revision: string | null };
type SemearPushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  data?: { url?: string } & Record<string, unknown>;
  tag?: string;
};
type SemearNotificationOptions = NotificationOptions & {
  vibrate?: number[];
};

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST?: WorkboxManifestEntry[];
};

function isWindowClient(client: Client): client is WindowClient {
  return "focus" in client;
}

// Clean up old caches
cleanupOutdatedCaches();

// Precache resources compiled by Vite (self.__WB_MANIFEST is injected at build time)
precacheAndRoute(self.__WB_MANIFEST || []);

// Set up navigate fallback (index.html) for SPA routing
try {
  const handler = createHandlerBoundToURL('/index.html');
  const navigationRoute = new NavigationRoute(handler);
  registerRoute(navigationRoute);
} catch (e) {
  console.error('Failed to register navigate fallback:', e);
}

// 1. API caching: NetworkFirst
registerRoute(
  /^https?:\/\/.*\/api\/.*$/,
  new NetworkFirst({
    cacheName: 'api-runtime',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 2. Lazy chunks and route CSS: cache on first use instead of precaching everything.
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith("/assets/") &&
    (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")),
  new StaleWhileRevalidate({
    cacheName: "app-assets-runtime",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 180,
        maxAgeSeconds: 14 * 24 * 60 * 60
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// 3. PDF runtime: CacheFirst
registerRoute(
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/(?:reports|transparency)\/.*\.pdf$/,
  new CacheFirst({
    cacheName: 'pdf-runtime',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 4. Thumb/Cover runtime: StaleWhileRevalidate
registerRoute(
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/(?:acervo|reports|transparency)\/.*(?:thumb|cover).*\.(?:png|jpg|jpeg|webp|svg)$/,
  new StaleWhileRevalidate({
    cacheName: 'thumb-runtime',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 5. Acervo images: CacheFirst
registerRoute(
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/acervo\/.*(?:\.png|\.jpg|\.jpeg|\.webp|\.svg)$/,
  new CacheFirst({
    cacheName: 'acervo-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 6. Acervo PDFs: NetworkFirst
registerRoute(
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/acervo\/.*\.pdf$/,
  new NetworkFirst({
    cacheName: 'acervo-pdfs',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Self-claim and skip waiting so updates take effect immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

// Push notifications listeners
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;
  try {
    const payload = event.data.json() as SemearPushPayload;
    const title = payload.title || 'Alerta SEMEAR';
    const options: SemearNotificationOptions = {
      body: payload.body || '',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/icon-192.png',
      data: payload.data || {},
      vibrate: [200, 100, 200],
      tag: payload.tag || 'semear-alert',
      requireInteraction: true
    };
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Erro ao processar notificação push:', err);
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Alerta SEMEAR', {
        body: text,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        requireInteraction: true
      })
    );
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there is already a window open with this exact URL path
      for (const client of clientList) {
        const clientUrl = new URL(client.url, self.location.href);
        const targetUrl = new URL(urlToOpen, self.location.href);
        if (clientUrl.pathname === targetUrl.pathname && isWindowClient(client)) {
          if (client.url !== targetUrl.href) {
            client.navigate(targetUrl.href);
          }
          return client.focus();
        }
      }
      // If there is any open window, navigate and focus it
      if (clientList.length > 0) {
        const client = clientList[0];
        if (isWindowClient(client)) {
          client.focus();
          return client.navigate(urlToOpen);
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
