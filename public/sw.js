
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js');

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
