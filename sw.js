self.addEventListener('install', (event) => {
  event.waitUntil(
    // static is an appropriate name for a cache name
    caches.open('static').then((cache) => {
      return cache.addAll(['./', './style.css', './images/skull.png'])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
