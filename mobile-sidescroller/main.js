window.addEventListener('load', () => {
  const canvas = document.querySelector('#canvas'),
    restartBtn = document.querySelector('button.restart'),
    fullscreenBtn = document.querySelector('button.fullscreen'),
    container = document.querySelector('div.container'),
    ctx = canvas.getContext('2d')
  canvas.width = 1600
  canvas.height = 720
  let enemies = [],
    score = 0,
    gameOver = false,
    lastTime = 0,
    enemyTimer = 0,
    enemyInterval = 2000,
    randomEnemyInterval = Math.random() * 1000 + 500

  restartBtn.addEventListener('click', () => restartGame())
  fullscreenBtn.addEventListener('click', () => toggleFullScreen())

  class InputHandler {
    constructor() {
      this.keys = []
      this.touchY = ''
      this.touchX = ''
      this.touchThreshold = 30
      // keyboard
      window.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowUp':
          case 'ArrowRight':
          case 'ArrowDown':
          case 'ArrowLeft':
            if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key)
            break
          case 'Enter':
            if (gameOver) restartGame()
        }
      })
      window.addEventListener('keyup', (e) => {
        if (this.keys.indexOf(e.key) > -1) {
          this.keys.splice(this.keys.indexOf(e.key), 1)
        }
      })
      // touch screen
      window.addEventListener('touchstart', (e) => {
        this.touchY = e.changedTouches[0].pageY
        this.touchX = e.changedTouches[0].pageX
      })
      window.addEventListener('touchmove', (e) => {
        const swipeYdist = e.changedTouches[0].pageY - this.touchY
        const swipeXdist = e.changedTouches[0].pageX - this.touchX

        if (swipeYdist < -this.touchThreshold && this.keys.indexOf('swipe up') === -1) {
          this.keys.push('swipe up')
        } else if (swipeXdist > this.touchThreshold && this.keys.indexOf('swipe right') === -1) {
          this.keys.push('swipe right')
        } else if (swipeXdist < -this.touchThreshold && this.keys.indexOf('swipe left') === -1) {
          this.keys.push('swipe left')
        } else if (swipeYdist > this.touchThreshold && this.keys.indexOf('swipe down') === -1) {
          this.keys.push('swipe down')
          if (gameOver) restartGame()
        }
      })
      window.addEventListener('touchend', () => {
        this.keys.splice(this.keys.indexOf('swipe up', 1))
        this.keys.splice(this.keys.indexOf('swipe down', 1))
        this.keys.splice(this.keys.indexOf('swipe right', 1))
        this.keys.splice(this.keys.indexOf('swipe left', 1))
      })
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth
      this.gameHeight = gameHeight
      this.width = 200
      this.height = 200
      this.x = 0
      this.y = this.gameHeight - this.height
      this.image = document.querySelector('#playerImg')
      this.frameX = 0
      this.frameY = 0
      this.maxFrame = 8
      this.speed = 0
      this.vy = 0
      this.weight = 1
      this.fps = 20 // fps of sprites frames, not game
      this.frameTimer = 0
      this.frameInterval = 1000 / this.fps
    }
    draw(context) {
      // draw hitbox
      context.lineWidth = 5
      context.strokeStyle = 'white'
      context.beginPath()
      context.arc(this.x + this.width / 2, this.y + this.height / 2 + 20, this.width / 3, 0, Math.PI * 2)
      context.stroke()
      /////////////////////

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
    update(input, deltaTime, enemies) {
      // collision detection
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - 20 - (this.x + this.width / 2)
        const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2 + 20)
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < enemy.width / 3 + this.width / 3) gameOver = true
      })
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0
        else this.frameX++
        this.frameTimer = 0
      } else this.frameTimer += deltaTime

      if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
        this.vy -= 32
      } else if (input.keys.indexOf('ArrowRight') > -1 || input.keys.indexOf('swipe right') > -1) {
        this.speed = 10
      } else if (input.keys.indexOf('ArrowLeft') > -1 || input.keys.indexOf('swipe left') > -1) {
        this.speed = -10
      } else {
        this.speed = 0
      }
      // horizontal movement
      this.x += this.speed
      if (this.x < 0) this.x = 0
      else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
      // vertical movement
      this.y += this.vy
      if (!this.onGround()) {
        this.vy += this.weight
        this.maxFrame = 5
        this.frameY = 1
      } else {
        this.vy = 0
        this.maxFrame = 8
        this.frameY = 0
      }
      if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
    }
    onGround() {
      return this.y >= this.gameHeight - this.height
    }
    restart() {
      this.x = 100
      this.y = this.gameHeight - this.height
      this.maxFrame = 8
      this.frameY = 0
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth
      this.gameHeight = gameHeight
      this.image = document.querySelector('#bgImg')
      this.x = 0
      this.y = 0
      this.width = 2400
      this.height = 720
      this.speed = 2
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height)
      context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height)
    }
    update() {
      this.x -= this.speed
      if (this.x < 0 - this.width) this.x = 0
    }
    restart() {
      this.x = 0
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth
      this.gameHeight = gameHeight
      this.width = 160
      this.height = 119
      this.image = document.querySelector('#enemyImg')
      this.x = this.gameWidth
      this.y = this.gameHeight - this.height
      this.frameX = 0
      this.maxFrame = 5
      this.fps = 20 // fps of sprites frames, not game
      this.frameTimer = 0
      this.frameInterval = 1000 / this.fps
      this.speed = 3
      this.markedForDeletion = false
    }
    draw(context) {
      context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
      // draw hitbox
      context.lineWidth = 5
      context.strokeStyle = 'white'
      context.beginPath()
      context.arc(this.x + this.width / 2 - 20, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2)
      context.stroke()
      //////////////
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0
        else this.frameX++
        this.frameTimer = 0
      } else this.frameTimer += deltaTime
      this.x -= this.speed
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true
        score++
      }
    }
  }

  function handleEnemies(deltaTime) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height))
      randomEnemyInterval = Math.random() * 1500
      enemyTimer = 0
    } else {
      enemyTimer += deltaTime
    }
    enemies.forEach((enemy) => {
      enemy.draw(ctx)
      enemy.update(deltaTime)
    })
    enemies = enemies.filter((enemy) => !enemy.markedForDeletion)
  }

  function displayStatusText(context) {
    context.textAlign = 'left'
    context.fillStyle = 'black'
    context.font = 'bold 40px Helvetica'
    context.fillText('Score: ' + score, 18, 48)
    context.fillText('Score: ' + score, 21, 51)
    context.fillStyle = 'white'
    context.fillText('Score: ' + score, 22, 52)
    if (gameOver) {
      context.textAlign = 'center'
      context.fillStyle = 'black'
      context.fillText(`GAME OVER! swipe down to restart`, canvas.width / 2, 200)
      context.fillStyle = 'white'
      context.fillText(`GAME OVER! swipe down to restart`, canvas.width / 2 + 4, 202)
      restartBtn.classList.toggle('shown')
    }
  }

  function restartGame() {
    restartBtn.classList.toggle('shown')
    player.restart()
    bg.restart()
    enemies = []
    score = 0
    gameOver = false
    animate(0)
  }

  function toggleFullScreen() {
    // checks if full screen, then toggles
    if (!document.fullscreenElement) {
      // requestFullscreen is an asyn method that returns a promise
      container.requestFullscreen().catch((error) => {
        alert(`Error, can't enable fullscreen mode: ${error.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const input = new InputHandler()
  const player = new Player(canvas.width, canvas.height)
  const bg = new Background(canvas.width, canvas.height)

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    bg.draw(ctx)
    // bg.update()
    player.draw(ctx)
    player.update(input, deltaTime, enemies)
    handleEnemies(deltaTime)
    displayStatusText(ctx)
    if (!gameOver) requestAnimationFrame(animate)
  }

  animate(0)
})
