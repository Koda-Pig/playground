// Call install event
self.addEventListener('install', event => {
  event.waitUntil(
    // static is an appropriate name for a cache name.
    // This caches all the assets so that the site is usable offline
    caches.open('static').then(cache => {
      return cache.addAll()
    })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== 'static') {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
