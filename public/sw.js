const CACHE_NAME = "firstdraft-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/Moment_1_-_The_Diner.png",
  "/images/Moment_2_-_The_Campfire.png",
  "/images/Moment_3_-_The_Road.png",
  "/images/Moment_4_-_The_Rooftop.png",
  "/images/Moment_5_-_The_Dock.png",
  "/images/Moment_6_-_The_Doorway.png",
  "/images/Moment_7_-_The_Porch.png",
  "/images/Moment_8_-_The_Forest.png",
  "/images/Moment_9_-_The_Hill.png",
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@400;500&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Don't cache API calls — those need to be live
  if (url.pathname.includes("/.netlify/functions/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses for fonts and assets
        if (response.ok && (url.origin === self.location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and not cached, return a basic offline message for navigation
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
