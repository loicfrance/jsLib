/**
* Created by Loic France on 12/20/2016.
*/

/**
 * @module geometry2d
 */

/**
 * 2 \* PI
 * @static
 * @constant
 * @type {number}
 */
const PI2 = 2 * Math.PI;
/**
 * PI / 2
 * @static
 * @constant
 * @type {number}
 */
const PI_2 = Math.PI/2;

export { PI2, PI_2 };
export { Vec2 } from "./Vec2.mjs";
export { Shape } from "./Shape.mjs";
export { Rect } from "./Rect.mjs";
export { Circle } from "./Circle.mjs";
export { Ellipsoid } from "./Ellipsoid.mjs";
export { Line } from "./Line.mjs";
export { Point } from "./Point.mjs";
export { Polygon } from "./Polygon.mjs";
export { Ray } from "./Ray.mjs";