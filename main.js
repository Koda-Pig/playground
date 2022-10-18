let hamburger = document.querySelector('nav span')
let nav = document.querySelector('nav')

hamburger.addEventListener('click', () => {
  nav.classList.toggle('active')
})
