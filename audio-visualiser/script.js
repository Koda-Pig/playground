const startListening = () => {
  /* NODES: */
  const canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    moth = document.querySelector("#moth"),
    mothGradient = moth.querySelector("#gradient"),
    mothGradientStops = mothGradient.querySelectorAll("stop"),
    fullscreenWrapper = document.querySelector("#fullscreen-wrapper"),
    fullscreenBtn = document.querySelector("#fullscreen-btn"),
    fullscreenArrow = document.querySelector("#fullscreen-arrow"),
    colorRanges = Array.from(document.querySelectorAll("input[type=range]")),
    colorInputs = Array.from(document.querySelectorAll("input[type=color]"))
  /* NODES end */

  /* HELPER VARIABLEES: */
  let softVolume = 0,
    userColorSet = [255, 255, 255],
    timeoutID,
    fftSize = 512,
    barsLeft = [],
    barsRight = [],
    cursorTimeout = 3000,
    wakeLock = null
  /* HELPER VARIABLES end */

  /* SET CANVAS SIZE */
  const windowWidth = window.innerWidth,
    windowHeight = window.innerHeight

  canvas.width = windowWidth
  canvas.height = windowHeight
  /* SET CANVAS SIZE end */

  /* CLASSES */
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
      if (this.index % 3 !== 0) return

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

  class Microphone {
    constructor(fftSize) {
      // Fast Fourier Transform - used by web audio api,
      // to slice raw stream data into a specific amount of audio samples
      this.fftSize = fftSize
      this.initialized = false
      this.init(fftSize)
    }
    init() {
      const media = navigator.mediaDevices
      media
        .getUserMedia({ audio: true })
        .then(stream => {
          this.handleStream(stream)
          this.initialized = true
        })
        .catch(err => {
          alert(err)
        })
    }
    handleStream(stream) {
      this.audioContext = new AudioContext()
      this.microphone = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = this.fftSize
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
      this.microphone.connect(this.analyser)
    }
    get samples() {
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
  /* CLASSES end */

  /* FUNCTIONS */
  const colorTemplate = (color1, color2, color3) => {
    return `rgb(${color1}, ${color2} , ${color3})`
  }

  const createBars = () => {
    for (let i = 1; i < fftSize / 1.9; i++) {
      let color = colorTemplate(0, i * 0.6, Math.random() * 200)
      barsLeft.push(new Bar(0, i * 1.5, 1.4, 1, color, i))
      barsRight.push(new Bar(0, i * 1.5, 1.4, 1, color, i))
    }
  }

  const animate = () => {
    if (!microphone.initialized) {
      requestAnimationFrame(animate)
      return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const samples = microphone.samples
    const volume = microphone.getVolume()

    Array.from(["left", "right"]).forEach((wing, i) => {
      let isLeft = wing === "left"
      ctx.save()
      if (isLeft) {
        ctx.translate(canvas.width / 2 + 21, canvas.height / 2 - 120)
        ctx.scale(1, 1)
      }
      if (!isLeft) {
        ctx.translate(canvas.width / 2 - 21, canvas.height / 2 - 120)
        ctx.scale(-1, 1)
      }
      ctx.rotate(1.7)
      barsLeft.forEach((bar, i) => {
        bar.update(samples[i])
        bar.draw(ctx)
      })
      ctx.restore()
    })

    softVolume = (softVolume * 0.1 + volume * 0.1).toFixed(4)
    moth.style.scale = 0.82 + softVolume * 3

    requestAnimationFrame(animate)
  }

  const changeWingColors = colorArray => {
    Array.from([...barsLeft, ...barsRight]).forEach((bar, index) => {
      bar.color = colorTemplate(
        colorArray[0],
        index * colorArray[1],
        Math.random() * colorArray[2]
      )
    })
  }

  const changeMothColors = (e, index) => {
    mothGradientStops[index].setAttribute("stop-color", e.target.value)
  }

  const hideCursor = () => {
    document.body.classList.add("hide-cursor")
  }

  const resetCursorHideTimer = () => {
    clearTimeout(timeoutID) // Clear the existing timeout
    document.body.classList.remove("hide-cursor") // Show the cursor
    timeoutID = setTimeout(hideCursor, cursorTimeout) // Reset the timer to hide the cursor again
  }

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request("screen")
    } catch (error) {
      console.error("Failed to activate screen wakeLock:", error)
    }
  }

  const handleVisibilityChange = () => {
    if (wakeLock === null) return

    if (document.visibilityState === "visible") {
      requestWakeLock()
    } else {
      wakeLock
        .release()
        .then(() => console.info("Screen wakeLock released"))
        .catch(error =>
          console.error("Failed to release screen wakeLock:", error)
        )
      wakeLock = null
    }
  }
  /* FUNCTIONS end */

  /* INIT */
  // Create microphone instance
  const microphone = new Microphone(fftSize)
  // Create bars (wings)
  createBars()
  // Start animation
  animate()
  // Set initial timeout to hide cursor
  timeoutID = setTimeout(hideCursor, cursorTimeout)
  /* INIT end */

  /* EVENT LISTENERS */
  // Add event listener for mouse movement
  window.addEventListener("mousemove", resetCursorHideTimer)

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // Add event listener for arrow to show fullscreen button
  fullscreenArrow.addEventListener("click", () =>
    fullscreenWrapper.classList.toggle("show")
  )

  colorRanges.forEach((input, index) => {
    input.addEventListener("change", e => {
      userColorSet[index] = +e.target.value
      changeWingColors(userColorSet)
    })
  })

  colorInputs.forEach((input, index) => {
    input.addEventListener("change", e => {
      changeMothColors(e, index)
    })
  })

  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
  })

  // Keep screen from going to sleep
  // Check if the wakeLock API is supported by the browser
  if ("wakeLock" in navigator) {
    requestWakeLock()

    // Add event listener to handle visibility change
    document.addEventListener("visibilitychange", () => {
      handleVisibilityChange()
    })
  } else {
    console.warn("The wakeLock API is not supported by this browser.")
  }
  /* EVENT LISTENERS end */
}

window.addEventListener("load", startListening)
