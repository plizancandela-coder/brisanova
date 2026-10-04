/* Brisa Nova: guarda la app, las librerías y los planos para abrirlos al instante y sin cobertura */
const CACHE = 'brisanova-v3';
const BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const guarda = (req, res) => { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); return res; };
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (/script\.google(usercontent)?\.com$/.test(u.hostname)) return;            // datos: siempre en vivo
  const fijo = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|lh3\.googleusercontent\.com/.test(u.hostname);
  if (fijo) {                                                                       // librerías e imágenes de planos: primero la copia guardada
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => guarda(e.request, res))));
  } else if (u.origin === self.location.origin) {                                  // la propia web: red y, si no hay, copia guardada
    e.respondWith(fetch(e.request).then(res => guarda(e.request, res)).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  }
});
