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

/**
 * calculates the transformation matrix to rotate, mirror, scale and translate.
 * M = M_translate * M_rotate * M_scale * M_mirror
 * Y = M * X
 * M has the form :
 * a b x
 * c d y
 *
 * @param rotation : number
 * @param mirrorH : boolean
 * @param mirrorV : boolean
 * @param scaleX : number
 * @param scaleY : number
 * @param translateX : number
 * @param translateY : number
 * @param matrix : number[2][3]
 * @param inv_matrix : number[2][3]
 */
function transformMatrix(rotation, mirrorH, mirrorV, scaleX, scaleY,
                         translateX, translateY, matrix, inv_matrix=undefined)
{

    const sX = scaleX/2, sY = scaleY/2;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const mX = mirrorH ? -1 : 1;
    const mY = mirrorV ? -1 : 1;
    const a = mX*cos*sX;
    const b = -mY*sin*sX;
    const c = mX*sin*sY;
    const d = mY*cos*sY;
    const dx = translateX * a + translateY * c;
    const dy = translateX * b + translateY * d;
    matrix[0][0] = a;
    matrix[1][0] = b;
    matrix[0][1] = c;
    matrix[1][1] = d;
    matrix[0][2] = dx;
    matrix[1][2] = dy;

    if(inv_matrix) {
        const det = a*d - b*c;
        inv_matrix[0][0] = d / det;
        inv_matrix[0][1] = -c / det;
        inv_matrix[0][2] = (c*dy - d*dx) / det;
        inv_matrix[1][0] = -b / det;
        inv_matrix[1][1] = a / det;
        inv_matrix[1][2] = (b*dx - a*dy) / det;
    }

}

export { PI2, PI_2, transformMatrix };
export { Vec2 } from "./Vec2.mjs";
export { Shape } from "./Shape.mjs";
export { Rect } from "./Rect.mjs";
export { Circle } from "./Circle.mjs";
export { Ellipsoid } from "./Ellipsoid.mjs";
export { Line } from "./Line.mjs";
export { Point } from "./Point.mjs";
export { Polygon, ConvexPolygon } from "./Polygon.mjs";
export { Ray } from "./Ray.mjs";