import "./style.scss"

window.addEventListener("load", () => {
  const restartBtn = document.querySelector(".restart-btn")
  const startBtn = document.querySelector(".start-btn")
  const canvas = document.querySelector("#main-canvas")
  const collisionCanvas = document.querySelector("#collision-canvas")
  const ctx = canvas.getContext("2d")
  const collisionCtx = collisionCanvas.getContext("2d", {
    willReadFrequently: true,
  })
  canvas.width = collisionCanvas.width = window.innerWidth
  canvas.height = collisionCanvas.height = window.innerHeight

  let score = 0
  let highscore = localStorage.getItem("whenPigsFlyHighScore") || 0 // check if a high score is saved in user browser
  let level = 1
  let levelCount = 0
  let gameOver = false
  let health = 10
  let timeToNextPig = 0
  let pigInterval = 300
  let lastTime = 0
  let pigs = []
  let explosions = []
  let particles = []
  let gameOverSound = document.querySelector("#game-over")
  let loseHealthSound = document.querySelector("#blip")

  ctx.font = "30px Impact"

  class Pig {
    constructor() {
      this.spriteWidth = 271 // width divided by horizontal frames
      this.spriteHeight = 194
      this.sizeModifier = Math.random() * 0.6 + 0.4 // preserve aspect ratio
      this.width = this.spriteWidth * this.sizeModifier
      this.height = this.spriteHeight * this.sizeModifier
      this.x = canvas.width
      this.y = Math.random() * (canvas.height - this.height)
      this.directionX = Math.random() * level * 4 + 2 // og was * 5 + 3
      this.directionY = Math.random() * 5 - 2.5
      this.markedForDeletion = false
      this.image = document.querySelector("#flying-pigs")
      this.frame = 0
      this.maxFrame = 4
      this.timeSinceFlap = 0
      this.flapInterval = Math.random() * 50 + 50 // between 50 - 100
      this.randomColors = [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
      ]
      this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`
      this.hasTrail = Math.random() > 0.5 // returns true or false randomly
    }
    update(deltaTime) {
      if (this.y < 0 || this.y > canvas.height - this.height) {
        // to prevent pigs from going off screen on Y axis
        this.directionY = this.directionY * -1
      }
      this.x -= this.directionX
      this.y += this.directionY
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true
        health--
        loseHealthSound.play()
      }
      this.timeSinceFlap += deltaTime
      if (this.timeSinceFlap > this.flapInterval) {
        if (this.frame > this.maxFrame) this.frame = 0
        else this.frame++
        this.timeSinceFlap = 0
        if (this.hasTrail)
          for (let i = 0; i < 4; i++) {
            particles.push(new Particle(this.x, this.y, this.width, this.color))
          }
      }
      if (health < 0) gameOver = true
    }
    draw() {
      collisionCtx.fillStyle = this.color
      collisionCtx.fillRect(this.x, this.y, this.width, this.height)
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
  }

  class Explosion {
    constructor(x, y, size) {
      this.image = document.querySelector("#boom")
      this.spriteWidth = 200
      this.spriteHeight = 179
      this.size = size
      this.x = x
      this.y = y
      this.frame = 0
      this.sound = document.querySelector("#oink")
      this.timeSinceLastFrame = 0
      this.frameInterval = 100
      this.markedForDeletion = false
    }
    update(deltaTime) {
      if (this.frame === 0) this.sound.play()
      this.timeSinceLastFrame += deltaTime
      if (this.timeSinceLastFrame > this.frameInterval) {
        this.frame++
        this.timeSinceLastFrame = 0
        if (this.frame > 5) this.markedForDeletion = true
      }
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y - this.size / 4,
        this.size,
        this.size
      )
    }
  }

  class Particle {
    constructor(x, y, size) {
      this.size = size
      this.x = x + this.size / 2 + Math.random() * 50 - 25
      this.y = y + this.size / 3 + Math.random() * 30 - 15
      this.radius = (Math.random() * this.size) / 10
      this.maxRadius = Math.random() * 20 + 35
      this.markedForDeletion = false
      this.speedX = Math.random() * 1 + 0.5
      this.color = "#d2dbab"
    }
    update() {
      this.x += this.speedX
      this.radius += 0.3
      if (this.radius > this.maxRadius - 5) this.markedForDeletion = true // - 5 to trigger marked for deletion earlier (stops particles from blinking so abrasively)
    }
    draw() {
      ctx.save()
      ctx.globalAlpha = 1 - this.radius / this.maxRadius
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function drawScore() {
    ctx.save()
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText("Score: " + score, 20, 35)
    ctx.restore()
  }

  function highScore() {
    if (score > localStorage.getItem("whenPigsFlyHighScore")) {
      localStorage.setItem("whenPigsFlyHighScore", score)
      highscore = score
    }
    ctx.save()
    ctx.textAlign = "center"
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText("High Score: " + highscore, canvas.width / 2, 35)
    ctx.restore()
  }

  function drawHealth() {
    ctx.save()
    ctx.beginPath()
    ctx.rect(20, canvas.height - 40, 200, 30)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = "red"
    ctx.fillRect(20, canvas.height - 40, 20 * health, 30)
    ctx.font = "30px Impact"
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText("Health: " + health, 20, canvas.height - 56)
    ctx.restore()
  }

  function drawLevel() {
    if (levelCount == 10) {
      level++
      levelCount = 0
    }
    ctx.save()
    ctx.font = "30px Impact"
    ctx.textAlign = "right"
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText("Level: " + level, canvas.width - 10, canvas.height - 10)
    ctx.restore()
  }

  function drawGameOver() {
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.font = "110px Impact"
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2)
    ctx.font = "60px Impact"
    ctx.fillText(
      "your score: " + score,
      canvas.width / 2,
      canvas.height / 2 + 100
    )
    gameOverSound.play()
  }

  window.addEventListener("click", function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    const pixCol = detectPixelColor.data
    pigs.forEach(object => {
      if (
        object.randomColors[0] == pixCol[0] &&
        object.randomColors[1] == pixCol[1] &&
        object.randomColors[2] == pixCol[2]
      ) {
        // collision detected
        object.markedForDeletion = true
        score++
        levelCount++
        explosions.push(new Explosion(object.x, object.y, object.width))
      }
    })
  })

  startBtn.addEventListener("click", () => {
    animate(0)
  })

  restartBtn.addEventListener("click", () => {
    score = 0
    health = 10
    timeToNextPig = 0
    lastTime = 0
    pigs = []
    explosions = []
    particles = []
    level = 1
    if (gameOver) {
      restartBtn.classList.remove("game-over")
      clearInterval(animate)
      gameOver = false
      animate(0)
    }
  })

  function animate(timestamp) {
    restartBtn.classList.add("active")
    startBtn.classList.add("disabled")
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height)
    let deltaTime = (timestamp - lastTime) * 0.5 // * .5 to limit framerate
    lastTime = timestamp
    timeToNextPig += deltaTime
    if (timeToNextPig > pigInterval) {
      pigs.push(new Pig())
      timeToNextPig = 0
      pigs.sort(function (a, b) {
        return a.width - b.width
      })
    }
    drawScore()
    highScore()
    drawHealth()
    drawLevel()
    ;[...particles, ...pigs, ...explosions].forEach(object =>
      object.update(deltaTime)
    ) // array literal spread operator
    ;[...particles, ...pigs, ...explosions].forEach(object => object.draw())
    pigs = pigs.filter(object => !object.markedForDeletion)
    explosions = explosions.filter(object => !object.markedForDeletion)
    particles = particles.filter(object => !object.markedForDeletion)
    if (!gameOver) {
      requestAnimationFrame(animate)
    } else {
      drawGameOver()
      restartBtn.classList.replace("active", "game-over")
    }
    ctx.restore()
  }

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
})
