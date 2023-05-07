// Call install event
self.addEventListener('install', () => {
  // Cache nothing
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName)
        })
      )
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request))
})
