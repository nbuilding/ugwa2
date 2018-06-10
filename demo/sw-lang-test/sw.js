const CACHE_NAME = 'ugwa2-lang-sw-test-v01', // change cache name to force update
urlsToCache = [
  './index.html',
  './main.js'
],
FIND_LANG = /(<script src=")\.\/temp\.js(" charset="utf-8">)/;

let lang = 'temp';

function getLangUrl() {
  return `./${lang}.js`;
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
    .then(() => self.skipWaiting()));
});
self.addEventListener('message', ({data}) => {
  lang = data;
  caches.open(CACHE_NAME).then(cache => cache.add(getLangUrl()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(response => {
    if (!response) return fetch(e.request);
    else if (!response.url.includes('index.html')) return response;
    else return response.text().then(html => new Response(
      html.replace(FIND_LANG, (m, p1, p2) => p1 + getLangUrl() + p2),
      {headers: {'Content-Type': 'text/html'}}
    ));
  }));
});
self.addEventListener('activate', e => {
  client.postMessage('ready');
  e.waitUntil(caches.keys()
    .then(names => Promise.all(names.map(cache => CACHE_NAME !== cache && caches.delete(cache))))
    .then(() => self.clients.claim())
    .then(() => clients.get(e.clientId))
    .then(client => client.postMessage('ready'))
  );
});
