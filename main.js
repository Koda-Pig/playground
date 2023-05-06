window.addEventListener('load', () => {
  const hamburger = document.querySelector('nav span'),
    nav = document.querySelector('nav'),
    leftEyeball = document.querySelector('#eye-left'),
    rightEyeball = document.querySelector('#eye-right'),
    skull = document.querySelector('#skull')

  // toggle menu on mobile
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active')
  })

  // move eyeballs on mousemove
  window.addEventListener('mousemove', e => {
    const mouseX = e.clientX,
      mouseY = e.clientY,
      rect = skull.getBoundingClientRect(),
      anchorX = rect.left + rect.width / 2,
      anchorY = rect.top + rect.height / 2,
      angleDegLeft = angle(
        mouseX,
        mouseY,
        anchorX - leftEyeball.offsetWidth,
        anchorY
      ),
      angleDegRight = angle(
        mouseX,
        mouseY,
        anchorX + rightEyeball.offsetWidth,
        anchorY
      )
    leftEyeball.style.transform = `rotate(${90 + angleDegLeft}deg)`
    rightEyeball.style.transform = `rotate(${90 + angleDegRight}deg)`
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
  //// remove old service worker
  if (window.navigator && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister()
      }
    })
  }
})
