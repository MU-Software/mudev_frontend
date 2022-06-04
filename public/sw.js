// Minimal service worker for PWA support

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
