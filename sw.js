// Call install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    // static is an appropriate name for a cache name.
    // This caches all the assets so that the site is usable offline
    caches.open('static').then((cache) => {
      return cache.addAll([
        './',
        './main.js',
        './style.css',
        './favicon.ico',
        './favicon.svg',
        './matrix-rain.html',
        './wake-up.html',
        './images/dog_left_right_white.png',
        './images/eye.png',
        './images/favicon.ico',
        './images/icon-192x192.png',
        './images/icon-256x256.png',
        './images/icon-384x384.png',
        './images/icon-512x512.png',
        './images/maskable_icon_x512.png',
        './images/pig.png',
        './images/skull.png',
        './images/sinbad-cut1.mp4',
        './audio-visualiser/favicon.svg',
        './audio-visualiser/index.html',
        './audio-visualiser/script.js',
        './audio-visualiser/style.css',
        './game-state-management/index.html',
        './game-state-management/input.js',
        './game-state-management/player.js',
        './game-state-management/script.js',
        './game-state-management/state.js',
        './game-state-management/utils.js',
        './game-state-management/style.css',
        './knight-of-cups/index.html',
        './knight-of-cups/script.js',
        './knight-of-cups/style.css',
        './knight-of-cups/media/Brick_01.png',
        './knight-of-cups/media/cuphead-lr.png',
        './knight-of-cups/media/erase.wav',
        './knight-of-cups/media/ooma.png',
        './mobile-sidescoller/index.html',
        './mobile-sidescoller/style.css',
        './mobile-sidescoller/main.js',
        './mobile-sidescoller/images/background_single.png',
        './mobile-sidescoller/images/enemy_1.png',
        './mobile-sidescoller/images/player.png',
        './styles/style.css',
        './trappedPig/trapped-pig.html',
        './trappedPig/grass.jpg',
        './trappedPig/mud.png',
        './weather-app/index.html',
        './weather-app/script.js',
        './weather-app/favicon.svg',
        './weather-app/styles/css/style.css',
        './weather-app/icons/broken-clouds.svg',
        './weather-app/icons/clear-day.svg',
        './weather-app/icons/clear-night.svg',
        './weather-app/icons/mist-day.svg',
        './weather-app/icons/mist-night.svg',
        './weather-app/icons/moon.svg',
        './weather-app/icons/overcast-day.svg',
        './weather-app/icons/overcast-night.svg',
        './weather-app/icons/rain-day.svg',
        './weather-app/icons/rain-night.svg',
        './weather-app/icons/scattered-clouds.svg',
        './weather-app/icons/shower-rain.svg',
        './weather-app/icons/snow-day.svg',
        './weather-app/icons/snow-night.svg',
        './weather-app/icons/sun.svg',
        './weather-app/icons/thunderstorms-day.svg',
        './weather-app/icons/thunderstorms-night.svg',
        './when-pigs-fly/index.html',
        './when-pigs-fly/script.js',
        './when-pigs-fly/style.css',
        './when-pigs-fly/media/blip.wav',
        './when-pigs-fly/media/boom.png',
        './when-pigs-fly/media/flying-pigs.png',
        './when-pigs-fly/media/game-over.wav',
        './when-pigs-fly/media/gun-cursor-1.ico',
        './when-pigs-fly/media/gun-cursor-1.png',
        './when-pigs-fly/media/jungle-bg.jpg',
        './when-pigs-fly/media/oink.wav'
      ])
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
