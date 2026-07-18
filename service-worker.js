/* ==========================================================================
   service-worker.js
   PWAの土台。ネットワーク優先(常に最新を取りに行く)+ 取得成功時にキャッシュ更新。
   オフライン時のみキャッシュ、それも無ければ offline.html を返す。
   ========================================================================== */

var CACHE_NAME = "he-media-cache-v1";

var CORE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/css/base.css",
  "/assets/css/components.css",
  "/assets/css/pages.css",
  "/assets/js/app.js",
  "/assets/js/data.js",
  "/assets/js/ui.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, copy);
        });
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("/offline.html");
          return undefined;
        });
      })
  );
});
