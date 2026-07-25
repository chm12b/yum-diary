/* Yum Diary PWA Foundation — Service Worker
 *
 * Registers only. No Cache / Offline / Runtime cache / Workbox.
 */

self.addEventListener("install", (event) => {
  // Activate immediately on first install.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
