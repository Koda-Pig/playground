window.addEventListener('load', () => {
  const hamburger = document.querySelector('nav span'),
    nav = document.querySelector('nav'),
    leftEyeball = document.querySelector('#eye-left'),
    rightEyeball = document.querySelector('#eye-right'),
    skull = document.querySelector('#skull'),
    eyes = document.querySelectorAll('.eye')

  // toggle menu on mobile
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active')
  })

  // move eyeballs on mousemove
  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX,
      mouseY = e.clientY,
      rect = skull.getBoundingClientRect(),
      anchorX = rect.left + rect.width / 2,
      anchorY = rect.top + rect.height / 2,
      angleDeg = angle(mouseX, mouseY, anchorX, anchorY)
    eyes.forEach((eye) => {
      eye.style.transform = `rotate(${90 + angleDeg}deg)`
    })
  })

  // gets angle value
  function angle(cx, cy, ex, ey) {
    const dy = ey - cy,
      dx = ex - cx,
      rad = Math.atan2(dy, dx), // range (-PI, PI)
      deg = (rad * 180) / Math.PI // rads to degrees, range (-180, 180)
    return deg
  }

  // service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('sw.js')
      .then((registration) => {
        console.info('SW registered')
      })
      .catch((error) => {
        console.error('SW Registration failed', error)
      })
  } else {
    console.error('Your device does not support service workers')
  }
})
