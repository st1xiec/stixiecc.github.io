import { POINTER_MYOPIA } from './constants.js';

const PointTypes = {
  POINT: 'point',
  POINTER: 'pointer',
  FIXED_POINT: 'fixed_point'
}

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * @typedef Options
 * @property {?number} countPoints
 */

class Point {
  type = PointTypes.POINT; 

  mass;

  x = 0;
  y = 0;

  vx = 0;
  vy = 0;

  /**
   * @param {[number, number]} - coordinate by x and y
   * @param {[number, number]} - vector by x and y
   * @param {number} - mass of point
   */
  constructor ([x, y], mass) {
    this.moveCoords(x, y);
    this.mass = mass;
  }

  moveCoords (x, y) {
    this.x += x;
    this.y += y;
  }

  moveVectors (vx, vy) {
    this.vx += vx;
    this.vy += vy;
  }

  /** @param {Point} */
  distanceTo (point) {
    return Math.sqrt(((point.x - this.x) ** 2) + ((point.y - this.y) ** 2));
  }
}

class Pointer extends Point {
  type = PointTypes.POINTER;

  constructor ([x, y]) {
    super([x, y], 0)
    addEventListener('mousemove', this.trackMouse.bind(this), false);

    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;
  }

  moveCoords () {}
  moveVectors () {}

  trackMouse (pointer) {
    this.x = pointer.pageX
    this.y = pointer.pageY;
  }

  /**
   * @param {Point} point
   * close range simulation
   */
  distanceTo (point) {
    const distance = super.distanceTo(point) - POINTER_MYOPIA;

    return distance < 0 ? 0 : distance;
  }
}

class FixedPoint extends Point {

  type = PointTypes.FIXED_POINT;

  constructor ([x, y], mass) {
    super([x, y], mass);

    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;
  }

  moveCoords () {}
  moveVectors () {}
}

export class Background {

  /** @type number */
  countPoints;

  /** @type Point[] */
  points;

  /** @type HTMLCanvasElement */
  canvas;

  /** @type CanvasRenderingContext2D */
  ctx;

  /**
   * @param {HTMLCanvasElement} canvas
   * @Param {Options} options
   */
  constructor (canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    this.countPoints = options.countPoints || this.calculateOptimalPoints();
    this.points = this.generatePoints();
  }

  draw () {
    this.clear();
    this.render();
  }

  render () {
    this.ctx.beginPath();

    for (const pointOne of this.points) {
      for (const pointTwo of this.points) {
        const distance = pointOne.distanceTo(pointTwo);

        if (distance < 200) {

          this.ctx.moveTo(pointOne.x, pointOne.y);
          this.ctx.lineTo(pointTwo.x, pointTwo.y);
        }


        this.influence(pointOne, pointTwo)
      }
    }

    this.ctx.stroke();
  }

  generatePoints () {

    const points = [];

    for (let i = 0; i < this.countPoints; i++) {
      const x = randomInt(0, this.canvas.width);
      const y = randomInt(0, this.canvas.height);

      const mass = randomInt(1, 10);

      const point = new Point([x, y], mass);
      points.push(point);
    }

    const pointer = new Pointer([window.innerWidth/2, window.innerHeight/2]);
    points.push(pointer);

    const fixed = new FixedPoint([window.innerWidth/2, window.innerHeight/2], 20);
    points.push(fixed);

    return points;
  }

  influence (pointOne, pointTwo) {

    if (pointOne.type === PointTypes.POINTER) return;

    const dx = pointOne.x - pointTwo.x;
    const dy = pointOne.y - pointTwo.y;

    const r = Math.hypot(dx, dy) || 1;

    pointTwo.moveVectors(dx / r, dy / r)

    const acc = pointTwo.mass / r**2 / 10000;

    const x = pointTwo.vx * acc;
    const y = pointTwo.vy * acc;

    pointTwo.moveCoords(x, y);

  }

  calculateOptimalPoints () {
    return Math.floor(Math.abs(window.innerHeight - window.innerWidth) / 40);
  }

  clear () {
    const color = '#333';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 0.9;
  }
}
