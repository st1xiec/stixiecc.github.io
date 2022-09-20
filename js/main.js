import { Background } from './background.js';
import { BACKGROUND_CANVAS_ID } from './constants.js';

/** @param {Background} background */
function animate (background) {
  requestAnimationFrame(() => {
    background.draw();
    animate(background);
  });
}

const canvas = document.getElementById(BACKGROUND_CANVAS_ID);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const background = new Background(canvas);
window.background = background;
animate(background);
