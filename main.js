window.addEventListener("load", () => {
  const hamburger = document.querySelector("nav span")
  const nav = document.querySelector("nav")
  const leftEyeball = document.querySelector("#eye-left")
  const rightEyeball = document.querySelector("#eye-right")
  const skull = document.querySelector("#skull")

  // toggle menu on mobile
  hamburger.addEventListener("click", () => nav.classList.toggle("active"))

  // move eyeballs on mousemove
  window.addEventListener("mousemove", e => {
    const mouseX = e.clientX
    const mouseY = e.clientY
    const rect = skull.getBoundingClientRect()
    const anchorX = rect.left + rect.width / 2
    const anchorY = rect.top + rect.height / 2
    const angleDegLeft = angle(
      mouseX,
      mouseY,
      anchorX - leftEyeball.offsetWidth,
      anchorY
    )
    const angleDegRight = angle(
      mouseX,
      mouseY,
      anchorX + rightEyeball.offsetWidth,
      anchorY
    )
    leftEyeball.style.transform = `rotate(${90 + angleDegLeft}deg)`
    rightEyeball.style.transform = `rotate(${90 + angleDegRight}deg)`
  })

  // gets angle value
  const angle = (cx, cy, ex, ey) => {
    const dy = ey - cy,
      dx = ex - cx,
      rad = Math.atan2(dy, dx), // range (-PI, PI)
      deg = (rad * 180) / Math.PI // rads to degrees, range (-180, 180)
    return deg
  }
})
