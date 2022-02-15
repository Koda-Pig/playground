const API_KEY = '0eb2c54d15bb3c3aa6072c41c5ac05cd',
      body = document.querySelector('body'),
      wrapper = document.querySelector('.wrapper'),
      inputSect = wrapper.querySelector('.input'),
      infoTxt = inputSect.querySelector('.info-txt'),
      inputField = inputSect.querySelector('input'),
      locationBtn = inputSect.querySelector('button'),
      wIcon = wrapper.querySelector('.weather-sect img'),
      arrowBack = wrapper.querySelector('header i'),
      themeToggle = wrapper.querySelector('.theme-switch input')
let api

inputField.addEventListener('keyup', e => {
  // if user presses enter button and input is not empty
  if (e.key == 'Enter' && inputField.value != '') {
    requestApi(inputField.value)
  }
})

locationBtn.addEventListener('click', () => {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError)
  } else {
    alert(`Either geolocation is not enabled on your device, or your browser doesn't support geolocation.`)
  }
})

function onSuccess(position) {
  const {latitude, longitude} = position.coords  // getting lat and lon of the user device from coords obj
  api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
  fetchData()
}

function onError(error) {
  infoTxt.innerText = error.message
  infoTxt.classList.add('error')
}

function requestApi(city) {
  api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  fetchData()
}

function fetchData() {
  infoTxt.innerText = 'Getting weather details...'
  infoTxt.classList.add('pending')
  // getting api response and returning it with parsing into js obj and in another
  // then function calling weatherDetails function with passing api result as an argument
  fetch(api).then(response => response.json()).then(result => weatherDetails(result))
}

function weatherDetails(info) {

  if(info.cod == '404') {
    infoTxt.classList.replace('pending', 'error')
    infoTxt.innerText = `${inputField.value} isn't a valid city name`
  } else {

    // get props from info object
    const city = info.name,
          country = info.sys.country,
          {description, icon, id} = info.weather[0],
          {feels_like, humidity, temp} = info.main

    // set image based on object icon
    switch (icon) {
      case '01d':
        wIcon.src = 'icons/clear-day.svg'
        break
      case '01n':
        wIcon.src = 'icons/clear-night.svg'
        break
      case '02d':
        wIcon.src = 'icons/overcast-day.svg'
        break
      case '02n':
        wIcon.src = 'icons/overcast-night.svg'
        break
      case '03d':
      case '03n':
        wIcon.src = 'icons/scattered-clouds.svg'
        break
      case '04d':
      case '04n':
        wIcon.src = 'icons/broken-clouds.svg'
        break
      case '09d':
      case '09n':
        wIcon.src = 'icons/shower-rain.svg'
        break
      case '10d':
        wIcon.src = 'icons/rain-day.svg'
        break
      case '10n':
        wIcon.src = 'icons/rain-night.svg'
        break
      case '11d':
        wIcon.src = 'icons/thunderstorms-day.svg'
        break
      case '11n':
        wIcon.src = 'icons/thunderstorms-night.svg'
        break
      case '13d':
        wIcon.src = 'icons/snow-day.svg'
        break
      case '13n':
        wIcon.src = 'icons/snow-night.svg'
        break
      case '50d':
        wIcon.src = 'icons/mist-day.svg'
        break
      case '50n':
        wIcon.src = 'icons/mist-night.svg'
    }

    wrapper.querySelector('.temp .numb').innerText = Math.floor(temp)
    wrapper.querySelector('.weather').innerText = description
    wrapper.querySelector('.location span').innerText = `${city}, ${country}`
    wrapper.querySelector('.temp .numb-2').innerText = Math.floor(feels_like)
    wrapper.querySelector('.humidity span').innerText = `${humidity}%`
    
    infoTxt.classList.remove('pending', 'error')
    wrapper.classList.add('active')
  }
}

// return home
arrowBack.addEventListener('click', () => 
  wrapper.classList.remove('active')
)

// theme switch
themeToggle.addEventListener('change', () => 
  body.classList.toggle('dark-mode')
)

// theme switch if user color scheme is dark
window.addEventListener('load', () => {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) 
    body.classList.toggle('dark-mode')
    themeToggle.checked = true
})