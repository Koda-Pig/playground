import "./style.scss"

window.addEventListener("load", () => {
  const canvas = document.querySelector("canvas")
  const ctx = canvas.getContext("2d")
  const startBtn = document.querySelector(".start-btn")
  const restartBtn = document.querySelector(".restart-btn")
  const instructions = document.querySelector(".instructions")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let fpsInterval
  let now
  let then
  let elapsed
  let keys = []
  let enemies = []
  let implosions = []
  let gameOver = false
  let timeToNextEnemy = 0
  let level = 1
  let enemyInterval = 20
  let score = 0
  let scoreCounter = 1
  let startTime
  let highscore = localStorage.getItem("cupHeadLiteHighScore") || 0 // check if a high score is saved in user browser
  let levelCount = 0

  let gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    500,
    canvas.width / 2,
    canvas.height / 2,
    100
  )
  gradient.addColorStop(0, "rgba(205,24,24,0.4")
  gradient.addColorStop(0.1, "rgba(205,24,24,0.2")
  gradient.addColorStop(0.6, "rgba(0,0,0,0.0")

  let player = {
    action: "idle",
    width: 103.0625,
    height: 113.125,
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 - 50,
    speed: 20,
    frameX: 3,
    frameY: 5,
    minFrame: 0,
    maxFrame: 8,
    health: 10,
  }
  let playerImage = document.querySelector("#playerImg")
  let enemyImage = document.querySelector("#enemyImg")

  class Enemy {
    constructor() {
      this.spriteWidth = 255.25
      this.spriteHeight = 398
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.x = Math.random() * (canvas.width - 200)
      this.y = canvas.height + this.height
      this.directionX = 0
      this.directionY = 5 * level
      this.markedForDeletion = false
      this.image = enemyImage
      this.minFrame = 0
      this.maxFrame = 7
      this.frameX = 0
      this.frameY = 0
    }
    update() {
      this.y -= this.directionY
      if (this.y < 0 - this.width) {
        this.markedForDeletion = true
        score++
        levelCount++
      }
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.width * this.frameX,
        this.height * this.frameY,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width / 2,
        this.height / 2
      )
      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = this.minFrame
    }
    collisionDetection() {
      // shrunken hitbox
      if (
        player.x + 20 < this.x + 20 + this.width / 3 &&
        player.x + 20 + player.width * 0.6 > this.x + 20 &&
        player.y + 10 < this.y + 10 + this.height / 3 &&
        player.y + 10 + player.height * 0.8 > this.y + 10
      ) {
        this.markedForDeletion = true
        player.health--
        scoreCounter++
        implosions.push(new Implosion(this.x, this.y))
      }
    }
  }

  class Implosion {
    constructor(x, y) {
      this.image = enemyImage
      this.spriteWidth = 255.25
      this.spriteHeight = 398
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.frameY = 1
      this.frameX = 0
      this.minFrame = 0
      this.maxFrame = 7
      this.x = x
      this.y = y
      this.markedForDeletion = false
      this.sound = document.querySelector("#eraseSound")
    }
    update() {
      this.sound.play()
      if (this.frameX == 7) this.markedForDeletion = true
    }
    draw() {
      ctx.save()
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        this.image,
        this.width * this.frameX,
        this.height * this.frameY,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width / 2,
        this.height / 2
      )
      ctx.restore()
      if (this.frameX < this.maxFrame) this.frameX++
      else this.markedForDeletion = true
    }
  }

  function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH)
  }

  function drawPlayer() {
    drawSprite(
      playerImage,
      player.width * player.frameX,
      player.height * player.frameY,
      player.width,
      player.height,
      player.x,
      player.y,
      player.width,
      player.height
    )
    // animate sprites
    if (player.frameX < player.maxFrame) player.frameX++
    else player.frameX = player.minFrame
    if (player.health == 0) gameOver = true
  }

  function updatePlayer() {
    // checks user input
    if (
      keys["ArrowRight"] &&
      keys["ArrowUp"] &&
      player.x < canvas.width - player.width &&
      player.y > 0
    ) {
      player.frameY = 1
      player.minFrame = 4
      player.maxFrame = 14
      player.y -= player.speed * 0.75
      player.x += player.speed * 0.75
    } else if (
      keys["ArrowRight"] &&
      keys["ArrowDown"] &&
      player.x < canvas.width - player.width &&
      player.y < canvas.height - player.height
    ) {
      player.frameY = 4
      player.minFrame = 4
      player.maxFrame = 15
      player.y += player.speed * 0.75
      player.x += player.speed * 0.75
    } else if (
      keys["ArrowLeft"] &&
      keys["ArrowDown"] &&
      player.x > 0 &&
      player.y < canvas.height - player.height
    ) {
      player.frameY = 12
      player.minFrame = 4
      player.maxFrame = 15
      player.y += player.speed * 0.75
      player.x -= player.speed * 0.75
    } else if (
      keys["ArrowLeft"] &&
      keys["ArrowUp"] &&
      player.x > 0 &&
      player.y > 0
    ) {
      player.frameY = 9
      player.minFrame = 4
      player.maxFrame = 14
      player.y -= player.speed * 0.75
      player.x -= player.speed * 0.75
    } else if (keys["ArrowUp"] && player.y > 0) {
      player.frameY = 0
      player.minFrame = 4
      player.maxFrame = 15
      player.y -= player.speed
    } else if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
      player.frameY = 3
      player.minFrame = 3
      player.maxFrame = 13
      player.x += player.speed
    } else if (keys["ArrowDown"] && player.y < canvas.height - player.height) {
      player.frameY = 6
      player.minFrame = 0
      player.maxFrame = 12
      player.y += player.speed
    } else if (keys["ArrowLeft"] && player.x > 0) {
      player.frameY = 11
      player.minFrame = 3
      player.maxFrame = 13
      player.x -= player.speed
    } else if (keys[" "] && player.y > 0) {
      player.frameY = 7
      player.minFrame = 3
      player.maxFrame = 13
      player.y -= 10
    } else {
      // idle
      player.frameY = 5
      player.minFrame = 0
      player.maxFrame = 8
    }
  }

  function drawHealth() {
    ctx.save()
    ctx.beginPath()
    ctx.arc(
      60,
      canvas.height - 60,
      50,
      -1.49,
      -2.105 + scoreCounter * 0.625,
      true
    )
    ctx.lineWidth = 10
    ctx.strokeStyle = "red"
    ctx.stroke()
    ctx.font = "30px Impact"
    ctx.shadowColor = "black"
    ctx.textAlign = "center"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText(player.health, 60, canvas.height - 46)
    ctx.restore()
  }

  function drawLevel() {
    if (levelCount == 10) {
      level++
      enemyInterval = 20 / level
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

  function drawScore() {
    ctx.save()
    ctx.font = "30px Impact"
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText("Score: " + score, 20, 35)
    ctx.restore()
  }

  function highScore() {
    if (score > localStorage.getItem("cupHeadLiteHighScore")) {
      localStorage.setItem("cupHeadLiteHighScore", score)
      highscore = score
    }
    ctx.save()
    ctx.font = "30px Impact"
    ctx.textAlign = "center"
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.fillStyle = "white"
    ctx.fillText("High Score: " + highscore, canvas.width / 2, 35)
    ctx.restore()
  }

  function drawGameOver() {
    ctx.save()
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.font = "110px Impact"
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2)
    ctx.font = "60px Impact"
    ctx.fillText("score: " + score, canvas.width / 2, canvas.height / 2 + 100)
    ctx.fillText(
      "high score: " + highscore,
      canvas.width / 2,
      canvas.height / 2 + 200
    )
    ctx.restore()
  }

  window.addEventListener("keydown", e => {
    keys[e.key] = true
  })

  window.addEventListener("keyup", e => {
    delete keys[e.key]
  })

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  function animate() {
    if (!gameOver) {
      requestAnimationFrame(animate)
      now = Date.now()
      elapsed = now - then
      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawPlayer()
        updatePlayer()
        drawHealth()
        drawScore()
        highScore()
        drawLevel()
        timeToNextEnemy++
        if (timeToNextEnemy > enemyInterval) {
          enemies.push(new Enemy())
          timeToNextEnemy = 0
        }
        enemies.forEach(object => object.update())
        enemies.forEach(object => object.draw())
        enemies.forEach(object => object.collisionDetection())
        enemies = enemies.filter(object => !object.markedForDeletion)
        implosions.forEach(object => object.update())
        implosions.forEach(object => object.draw())
        implosions = implosions.filter(object => !object.markedForDeletion)
      }
    } else {
      drawGameOver()
    }
  }

  function startAnimating(fps) {
    fpsInterval = 1000 / fps
    then = Date.now() // returns number of milliseconds since Jan 1, 1970
    startTime = then
    animate()
  }

  startBtn.addEventListener("click", () => {
    instructions.classList.add("inactive")
    restartBtn.classList.replace("inactive", "active")
    startAnimating(20)
  })

  restartBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.health = 10
    player.x = canvas.width / 2 - 50
    player.y = canvas.height / 2 - 50
    keys = []
    enemies = []
    implosions = []
    gameOver = false
    timeToNextEnemy = 0
    level = 1
    enemyInterval = 20
    score = 0
    scoreCounter = 1
    highscore = localStorage.getItem("cupHeadLiteHighScore") || 0 // check if a high score is saved in user browser
    levelCount = 0
    startAnimating(20)
  })
})
