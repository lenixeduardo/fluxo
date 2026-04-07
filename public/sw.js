// public/sw.js
// Cache strategy:
//   - API routes  → Network-first, fallback to cache (offline support)
//   - Static assets → Cache-first, populate on first request

const CACHE   = "fluxo-v1";
const API_RE  = /\/api\//;

self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
);

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const isAPI = API_RE.test(new URL(e.request.url).pathname);

  e.respondWith(
    isAPI
      ? fetch(e.request)
          .then((r) => {
            caches.open(CACHE).then((c) => c.put(e.request, r.clone()));
            return r;
          })
          .catch(() => caches.match(e.request))
      : caches.match(e.request).then(
          (cached) =>
            cached ||
            fetch(e.request).then((r) => {
              caches.open(CACHE).then((c) => c.put(e.request, r.clone()));
              return r;
            })
        )
  );
});

// Background sync — notify clients when connection is restored
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-transactions") {
    e.waitUntil(
      self.clients.matchAll().then((clients) =>
        clients.forEach((c) => c.postMessage({ type: "SYNC_REQUESTED" }))
      )
    );
  }
});
