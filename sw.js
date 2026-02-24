
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js');

// VERSION: 3.0.1 - FORCE CACHE CLEAR
const CACHE_NAME = 'merello-planner-v3.0.1';

self.addEventListener('install', function(event) {
  self.skipWaiting(); // Obliga al nuevo SW a activarse inmediatamente
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de todos los clientes inmediatamente
  );
});
