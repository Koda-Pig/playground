export function ResizeWindow(canvasWidth, canvasHeight) {
    window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
  });
}

export function drawStatusText(context, input, player) {
  context.font = '28px Helvetica';
  context.fillText('Last input: ' + input.lastKey, 20, 50);
  context.fillText('Active state: ' + player.currentState.state, 20, 90);
}