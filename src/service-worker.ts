/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// O programa roda inteiro no navegador, então vale a pena guardá-lo: depois da
// primeira visita ele abre offline e instalado na tela inicial do celular.
const CACHE = `planejador-3d-${version}`;
const PRECACHE = [...build, ...files];

const worker = self as unknown as ServiceWorkerGlobalScope;

worker.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => worker.skipWaiting()),
  );
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => worker.clients.claim()),
  );
});

worker.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Arquivos da versão publicada nunca mudam: servir direto do cache.
    if (PRECACHE.includes(url.pathname)) {
      const hit = await cache.match(url.pathname);
      if (hit) return hit;
    }

    try {
      const response = await fetch(request);
      // Uma resposta parcial (206) não pode ser guardada no cache.
      if (response.status === 200) cache.put(request, response.clone());
      return response;
    } catch {
      const hit = await cache.match(request);
      if (hit) return hit;
      // Sem rede e sem cache: a página inicial atende a navegação.
      if (request.mode === 'navigate') {
        const shell = await cache.match('/') ?? await cache.match('/index.html');
        if (shell) return shell;
      }
      throw new Error('Sem conexão e sem cópia guardada deste arquivo.');
    }
  })());
});
