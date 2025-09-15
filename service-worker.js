const CACHE_NAME = "slkids-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/lessons.html",
  "/games.html",
  "/quizzes.html",
  "/worksheets.html",
  "/about.html",
  "/contact.html"
];

// Install SW & cache resources
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Serve from cache, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
