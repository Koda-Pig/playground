import Player from './player.js';
import { ResizeWindow, drawStatusText } from './utils.js';
import InputHandler from './input.js';

window.addEventListener('load',() => {

  const canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    loading = document.getElementById('loading');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  loading.style.display = 'none';

  const player = new Player(canvas.width, canvas.height);
  const input = new InputHandler;

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update(input.lastKey);
    player.draw(ctx, deltaTime);
    drawStatusText(ctx, input, player);
    requestAnimationFrame(animate);
  }
  animate(0);

  ResizeWindow(canvas.width, canvas.height);
});