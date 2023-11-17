window.addEventListener("load", () => {
  const canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    moth = document.querySelector("#moth"),
    mothGradient = moth.querySelector("#gradient"),
    mothGradientStops = mothGradient.querySelectorAll("stop"),
    fullscreenWrapper = document.querySelector("#fullscreen-wrapper"),
    fullscreenBtn = document.querySelector("#fullscreen-btn"),
    fullscreenArrow = document.querySelector("#fullscreen-arrow"),
    colorInput = Array.from(document.querySelectorAll("input[type=range]")),
    windowWidth = window.innerWidth,
    windowHeight = window.innerHeight,
    cursorTimeout = 3000
  canvas.width = windowWidth
  canvas.height = windowHeight

  class Bar {
    constructor(x, y, width, height, color, index) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.color = color
      this.index = index
    }
    update(micInput) {
      const sound = micInput * 1500
      if (sound > this.height) {
        this.height = sound
      } else this.height -= this.height * 0.01
    }
    draw(context) {
      if (this.index % 3 === 0) {
        context.strokeStyle = this.color
        context.lineWidth = this.width
        context.save()
        context.rotate(this.index * -0.005)
        context.beginPath()
        context.bezierCurveTo(
          this.x / 2,
          this.y / 2,
          this.height * -0.5 - 0.2569373072970195 * windowHeight,
          this.height + 450,
          this.x,
          this.y
        )
        context.stroke()
        if (this.index > 100) {
          context.beginPath()
          context.arc(
            this.x,
            this.y + 10 + this.height / 2,
            this.height * 0.1,
            0,
            Math.PI * 2
          )
          context.stroke()
          context.beginPath()
          context.moveTo(this.x, this.y + 20)
          context.lineTo(this.x, this.y + 10 + this.height / 2)
          context.stroke()
        }
        context.restore()
      }
    }
  }

  class Microphone {
    constructor(fftSize) {
      // Fast Fourier Transform - used by web audio api,
      // to slice raw stream data into a specific amount of audio samples
      this.initialized = false
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          this.audioContext = new AudioContext()
          this.microphone = this.audioContext.createMediaStreamSource(stream)
          this.analyser = this.audioContext.createAnalyser()
          this.analyser.fftSize = fftSize
          const bufferLength = this.analyser.frequencyBinCount
          this.dataArray = new Uint8Array(bufferLength)
          this.microphone.connect(this.analyser)
          this.initialized = true
        })
        .catch(err => {
          alert(err)
        })
    }
    getSamples() {
      this.analyser.getByteTimeDomainData(this.dataArray)
      let normSamples = [...this.dataArray].map(e => e / 128 - 1)
      return normSamples
    }
    getVolume() {
      this.analyser.getByteTimeDomainData(this.dataArray)
      let normSamples = [...this.dataArray].map(e => e / 128 - 1)
      let sum = 0
      for (let i = 0; i < normSamples.length; i++) {
        sum += normSamples[i] * normSamples[i]
      }
      let volume = Math.sqrt(sum / normSamples.length)
      return volume
    }
  }

  let fftSize = 512
  const microphone = new Microphone(fftSize)
  let barsLeft = []
  let barsRight = []
  const colorTemplate = (color1, color2, color3, index) =>
    `rgb(${color1}, ${index * 0.6} , ${Math.random() * 200})`

  const createBars = () => {
    for (let i = 1; i < fftSize / 1.9; i++) {
      let color = "rgb(0" + "," + i * 0.6 + "," + Math.random() * 200 + ")"
      barsLeft.push(new Bar(0, i * 1.5, 1.4, 1, color, i))
      barsRight.push(new Bar(0, i * 1.5, 1.4, 1, color, i))
    }
  }
  createBars()

  let softVolume = 0
  const animate = () => {
    if (microphone.initialized) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const samples = microphone.getSamples()
      const volume = microphone.getVolume()

      // left wing
      ctx.save()
      ctx.translate(canvas.width / 2 + 21, canvas.height / 2 - 120)
      ctx.scale(1, 1)
      ctx.rotate(1.7)
      barsLeft.forEach((bar, i) => {
        bar.update(samples[i])
        bar.draw(ctx)
      })
      ctx.restore()

      //right wing
      ctx.save()
      ctx.translate(canvas.width / 2 - 21, canvas.height / 2 - 120)
      ctx.scale(-1, 1)
      ctx.rotate(1.7)
      barsRight.forEach((bar, i) => {
        bar.update(samples[i])
        bar.draw(ctx)
      })
      ctx.restore()

      // Round to 4 decimal places
      softVolume = (softVolume * 0.1 + volume * 0.1).toFixed(4)
      ;(moth.style.transform =
        "translate(-50%, -50%) scale(" + (0.82 + softVolume * 3)),
        0 + softVolume * 3 + ")"
    }

    requestAnimationFrame(animate)
  }
  animate()

  let userColorSet = [0, 0, 0]
  colorInput.forEach((input, index) => {
    input.addEventListener("change", e => {
      changeWingColors(e, index)
      changeMothColors(e, index)
    })
  })

  const changeWingColors = (e, index) => {
    userColorSet[index] = +e.target.value
    barsLeft.forEach((bar, index) => {
      bar.color = colorTemplate(
        userColorSet[0],
        userColorSet[1],
        userColorSet[2],
        index
      )
    })
    barsRight.forEach((bar, index) => {
      bar.color = colorTemplate(
        userColorSet[0],
        userColorSet[1],
        userColorSet[2],
        index
      )
    })
  }

  const changeMothColors = () => {
    mothGradientStops.forEach((stop, index) => {
      stop.setAttribute(
        "stop-color",
        `rgb(${userColorSet[0]},${userColorSet[1]},${userColorSet[2]})`
      )
    })
  }

  // Hide cursor after 3 seconds
  let timeoutID
  const hideCursor = () => {
    document.body.classList.add("hide-cursor")
  }

  const resetCursorHideTimer = () => {
    clearTimeout(timeoutID) // Clear the existing timeout
    document.body.classList.remove("hide-cursor") // Show the cursor
    timeoutID = setTimeout(hideCursor, cursorTimeout) // Reset the timer to hide the cursor again
  }

  // Set initial timeout to hide cursor
  timeoutID = setTimeout(hideCursor, cursorTimeout)

  // Add event listener for mouse movement
  window.addEventListener("mousemove", resetCursorHideTimer)

  // Add event listener for arrow to show fullscreen button
  fullscreenArrow.addEventListener("click", () => {
    fullscreenWrapper.classList.toggle("show")
  })

  // Add event listener for fullscreen button
  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  })

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // Keep screen from going to sleep
  // Check if the wakeLock API is supported by the browser
  if ("wakeLock" in navigator) {
    let wakeLock = null

    // Function to request and enable the wakeLock
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request("screen")
      } catch (error) {
        console.error("Failed to activate screen wakeLock:", error)
      }
    }

    // Request wakeLock on initial page load
    requestWakeLock()

    // Add event listener to handle visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        if (wakeLock !== null) {
          wakeLock
            .release()
            .then(() => console.log("Screen wakeLock released!"))
            .catch(error =>
              console.error("Failed to release screen wakeLock:", error)
            )
          wakeLock = null
        }
      } else {
        if (wakeLock === null) {
          requestWakeLock()
        }
      }
    })
  } else {
    console.warn("The wakeLock API is not supported by this browser.")
  }
})
