// PASSO IMPORTANTE: Muda a versão do cache para forçar a atualização!
const CACHE_NAME = 'app-treino-cache-v2';

// Ficheiros essenciais para o arranque da aplicação.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // Os outros ficheiros (JS, CSS, imagens) serão guardados em cache dinamicamente.
];

// Evento de instalação: guarda os ficheiros principais em cache.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto e ficheiros principais guardados');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de "fetch": interceta todos os pedidos.
self.addEventListener('fetch', (event) => {
  // Ignora pedidos que não sejam GET.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Tenta obter o recurso do cache.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Se não estiver no cache, tenta obter da rede.
      try {
        const networkResponse = await fetch(event.request);
        // Se o pedido for bem-sucedido, guarda uma cópia no cache.
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // 3. Se a rede falhar (estamos offline), entra a lógica para SPA.
        console.log('Fetch falhou; a tentar fallback...', error);
        
        // Se for um pedido de navegação (para uma página HTML),
        // serve o index.html principal do cache.
        if (event.request.mode === 'navigate') {
          const indexHtml = await cache.match('/index.html');
          return indexHtml;
        }

        // Para outros tipos de pedidos (imagens, etc.), não fazemos nada e deixamos o erro acontecer.
        return Response.error();
      }
    })
  );
});

// Evento de ativação: limpa caches antigos.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});