const CACHE_VERSION = "vinogora-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.png",
];

const MAX_IMAGE_CACHE = 60;
const MAX_API_CACHE = 30;
const API_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      const cache = await caches.open(cacheName);
      const headers = new Headers(clone.headers);
      headers.set("x-sw-cached-at", Date.now().toString());
      const body = await clone.blob();
      const cachedResponse = new Response(body, { status: clone.status, headers });
      await cache.put(request, cachedResponse);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return caches.match("/");
    }
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());

      if (maxEntries) {
        const keys = await cache.keys();
        if (keys.length > maxEntries) {
          await cache.delete(keys[0]);
        }
      }
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok && response.type === "basic") {
        const cache = caches.open(cacheName);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached || new Response("Offline", { status: 503 }));

  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // Skip third-party and extension requests
  if (url.origin !== self.location.origin && !url.hostname.includes("firebasestorage")) return;

  // API: NetworkFirst with short cache
  if (url.pathname.startsWith("/api")) {
    event.respondWith(networkFirst(request, API_CACHE, API_CACHE_MAX_AGE));
    return;
  }

  // Images: CacheFirst with size limit
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/)
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE));
    return;
  }

  // JS/CSS bundles: StaleWhileRevalidate
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Navigation and other: StaleWhileRevalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// Push notification support (Phase 12)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "",
      icon: "/favicon.png",
      badge: "/favicon.png",
      data: data.url ? { url: data.url } : undefined,
      vibrate: [100, 50, 100],
    };
    event.waitUntil(
      self.registration.showNotification(data.title || "VinoGóra", options)
    );
  } catch {
    // ignore malformed push
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
