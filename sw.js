// Service Worker : cache statique pour fonctionnement offline
const CACHE_NAME = 'portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/html/about.html',
  '/html/contact.html',
  '/html/cv.html',
  '/html/projets.html',
  // Font Awesome CDN (optionnel : gros fichier)
  // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installation du service worker + cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation + nettoyage old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch : chercher en cache d'abord, puis réseau (offline first)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // Ignorer POST, etc.

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response; // Trouvé en cache
      
      return fetch(event.request).then((response) => {
        // Mettre en cache les nouvelles requêtes (sauf PDFs)
        if (response.status === 200 && !event.request.url.includes('.pdf')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Si erreur réseau et pas en cache
        return new Response('Offline - page non disponible', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});
