import {Vec2, Shape, Rect, Line} from "./geometry2d.mjs";
/**
 * @module geometry2d/Ray
 */
/**
 * @class Ray
 * @augments Shape
 * @classdesc a class representing an infinite ray, defined by an origin point and the angle of the direction <!--
 * -->it is pointing toward. the origin of the ray is defined by the <!--
 * -->{@link Shape#center|center} attribute.
 */
class Ray extends Shape {
    /**
     * @constructor
     * @param {Vec2} origin
     * @param {number} radians
     */
    constructor(origin, radians) {
        super();
        /**
         * origin of the Ray
         * @name Ray#origin
         * @type {Vec2}
         */
        this.origin = origin;
        /**
         * @name Ray#angle
         * @type {number}
         */
        this.angle = radians;
    }

    /**
     * origin of the Ray. Equivalent to ray.origin
     * @name Ray#center
     * @returns {Vec2}
     */
    get center() { return this.origin; }

    /**
     * @param {Vec2} center
     */
    set center(center) { this.origin.set(center); }

    /**
     * <code>=Infinity</code>
     * @name Ray#perimeter
     * @type {Number}
     * @readonly
     */
    get perimeter() {
        return Infinity;
    }


    /**
     * moves the shape according to the parameters
     * @param {number} dX
     * @param {number} dY
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#move}
     */
    moveXY(dX, dY) {
        this.origin.addXY(dX, dY);
        return this;
    }

    /**
     * moves the shape according to the parameter
     * @param {Vec2} delta
     * @returns {Shape}
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#moveXY}
     */
    move(delta) {
        this.origin.add(delta);
        return this;
    }
    /**
     * rotates the ray around its origin.
     * @param {number} radians
     * @returns {Ray} <code>this</code>
     */
    rotate(radians) {
        this.angle += radians;
        return this;
    }

    /**
     * makes the ray the opposite of itself relative to the given horizontal axis
     * if no value is set for axisY, the mirror will be made relative to the origin's y coordinate.
     * @param {number} [axisY=center.y] ordinate of the horizontal axis
     * @returns {Ray} <code>this</code>
     * @see {@link Ray#mirrorHorizontally}
     */
    mirrorVertically(axisY = this.center.y) {
        this.origin.mirrorVertically(axisY);
        this.angle = -this.angle;
        return this;
    }

    /**
     * makes the ray the opposite of itself relative to the given vertical axis
     * if no value is set for axisX, the mirror will be made relative to the origin's x coordinate.
     * @param {number} [axisX=center.x]
     *          abscissa of the vertical axis
     * @returns {Ray} <code>this</code>
     * @see {@link Ray#mirrorVertically}
     */
    mirrorHorizontally(axisX = this.center.x) {
        this.origin.mirrorHorizontally(axisX);
        this.angle = Math.PI - this.angle;
        return this;
    }

    /**
     * returns the calculated end point of the instance as if the ray was a line stating at the origin <!--
     * -->and with the specified length.
     * @param {number} length
     * @returns {Vec2|Vec2}
     */
    endPoint(length) {
        return this.origin.clone().addXY(Math.cos(this.angle) * length, Math.sin(this.angle) * length);
    }

    /**
     * creates a {@link Line|Line} starting from the origin of the ray, with the same direction
     * and with the specified length
     * @param length
     * @returns {Line}
     */
    getLine(length) {
        return Line.createFromPointVector(this.origin, Vec2.createFromAngle(this.angle, length));
    }

    /**
     * adds the drawing instructions to the context. Be aware that if you just "fill" the line, <!--
     * -->it won't be drawn on the canvas, you must "stroke" it to make it appear on the canvas.
     * @param {CanvasRenderingContext2D} context
     */
    pushPath(context) {
        const p = this.endPoint(context.canvas.clientWidth + context.canvas.clientHeight);
        context.moveTo(this.origin.x, this.origin.y);
        context.moveTo(this.origin.x, this.origin.y);
        context.lineTo(p.x, p.y);
    }

    /**
     * draw the shape on the canvas using its webgl context.
     * To fill the shape, the draw mode must de TRIANGLES.
     * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
     * -->by using the attributes {@link Line#glPointsNumber} and <!--
     * -->{@link Line#glTriangles}
     * @param {Array} verticesArray array where the points x and y coordinates will be placed
     * @param {number} vOffset indice of the first free place in the array (must be even)
     * @param {Array} indicesArray array where the indices of the points <!--
     * -->for the triangles to be drawned will be placed
     * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
     */
    getVertices(verticesArray, vOffset, indicesArray, iOffset){
        const o = offset/2, t = this.endPoint(Number.MAX_SAFE_INTEGER);
        verticesArray[vOffset++] = this.origin.x;
        verticesArray[vOffset++] = this.origin.y;
        verticesArray[vOffset++] = t.x;
        verticesArray[vOffset++] = t.y;
        indicesArray[iOffset++] = o;
        indicesArray[iOffset++] = o+1;
        indicesArray[iOffset++] = o;
    }

    /**
     * check if the ray intersect with the shape.
     * @param {Shape} shape
     * @returns {boolean}
     */
    intersect(shape) {
        const rect = (shape instanceof Rect) ? shape : shape.getRect();
        return new Line(this.center,
            this.endPoint(Vec2.distance(this.origin, shape.center) + rect.width + rect.height)).intersect(shape);
    }

    /**
     * returns the intersection points between this ray and the given shape
     * @param {Shape} shape
     * @returns {Vec2[]}
     */
    getIntersectionPoints(shape) {
        const rect = (shape instanceof Rect) ? shape : shape.getRect();
        return this.getLine(Vec2.distance(this.origin, shape.center) + rect.width + rect.height)
            .getIntersectionPoints(shape);
    }

    /**
     * returns whether or not the line contains the given point.
     * The result is not really realistic because of number precision
     * @param {Vec2} point
     * @returns {boolean}
     */
    contains(point) {
        return this.endPoint(Vec2.distance(this.origin, point)).equals(point);
    }

    /**
     * creates and returns a {@link Rect} instance fitting the ray, with pone corner <!--
     * -->at an infinite position.
     * @returns {Rect}
     */
    getRect() {
        const endPoint = this.endPoint(Infinity);
        return new Rect(Math.min(endPoint.x, this.origin.x), Math.min(endPoint.y, this.origin.y),
            Math.max(endPoint.x, this.origin.x), Math.max(endPoint.y, this.origin.y));
    }

    /**
     * returns the director vector of the instance.
     * @returns {Vec2}
     */
    get directorVect() {
        return Vec2.createFromAngle(this.angle);
    }

    /**
     * returns the closest point of the instance to the specified point
     * @param {Vec2} p
     * @returns {Vec2}
     */
    closestpointTo(p) {
        let A = this.origin, AC = Vec2.translation(A, p), u = this.directorVect, d = Vec2.dotProd(u, AC);
        return d < 0 ? u.set(A) : u.mul(d).add(A);
    }

    /**
     * implemented for the needs of getCircle function, but not very useful as it only returns an infinite number
     * @returns {number}
     */
    getRadius() {
        return Infinity;
    }

    /**
     * returns a copy of the instance.
     * @returns {Ray}
     */
    clone() {
        return new Ray(this.origin, this.angle);
    }
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Ray#glPointsNumber
 */
Ray.prototype.glPointsNumber = 2;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Ray#glTriangles
 */
Ray.prototype.glTrinagles = 1;

export default Ray;
export {Ray};