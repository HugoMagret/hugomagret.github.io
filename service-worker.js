// Service Worker : cache statique pour fonctionnement offline
const CACHE_NAME = 'hugo-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/html/about.html',
  '/html/contact.html',
  '/html/cv.html',
  '/html/projets.html',
  '/images/cv.pdf',
  '/images/cv_anglais.pdf',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

// Installation : mettre en cache les assets statiques
self.addEventListener('install', (event) => {
  console.log('Service Worker : installation et caching des assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Certains assets n\'ont pas pu être cachés :', err);
      });
    })
  );
  self.skipWaiting(); // Activer immédiatement
});

// Activation : nettoyer anciens caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker : activation et nettoyage ancien cache');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Prendre le contrôle
});

// Fetch : stratégie "cache first, network fallback"
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;

  // Ignorer les requêtes externe (non-same-origin)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retourner le cache s'il existe
      if (cachedResponse) {
        return cachedResponse;
      }

      // Sinon, faire la requête réseau
      return fetch(event.request)
        .then((response) => {
          // Cacher la réponse si success
          if (response && response.status === 200 && response.type !== 'error') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si offline et pas en cache, retourner une page de secours (optionnel)
          console.warn('Fetch failed; returning offline version if available');
          return new Response('Vous êtes offline. Veuillez vous reconnecter.', {
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
