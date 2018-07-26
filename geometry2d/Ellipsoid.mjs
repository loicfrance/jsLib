import {PI2, PI_2, Vec2, Shape, Rect, Polygon} from "./geometry2d.mjs";
/**
 * @module geometry2d/Ellipsoid
 */
/**
 * @class Ellipsoid
 * @augments Shape
 * @classdesc a shape representing an ellipsoid, optimized for drawing. make sure to always have <!--
 * -->{@link Ellipsoid#radiusX|radiusX} &ge; <!--
 * -->{@link Ellipsoid#radiusX|radiusX} for the methods to work properly.
 * You can reorder radiusX and radiusY by calling the {@Ellipsoid#checkRadius|checkRadius} <!--
 * -->method.
 * <b>&#x26A0;</b> ellipsoids cannot be used for collision detection, and most of their methods take time. <!--
 * -->You can make an ellipsoid-like {@link Polygon|Polygon} by calling the method <!--
 * -->{@link Ellipsoid#toPolygon|toPolygon}, or directly by calling the static method <!--
 * -->[Polygon.createEllipsoid]{@link Polygon#createEllipsoid}.
 */
class Ellipsoid extends Shape {
    /**
     * @constructor
     * @param {Vec2}center
     * @param {number} radiusX
     * @param {number} radiusY
     * @param {number} radians
     */
    constructor(center, radiusX, radiusY, radians = 0) {
        super();
        /**
         * center of the ellipsoid
         * @name Ellipsoid#center
         * @type {Vec2}
         */
        this.center = center.clone();
        /**
         * horizontal radius
         * @name Ellipsoid#radiusX
         * @type {number}
         */
        this.radiusX = radiusX;
        /**
         * vertical radius;
         * @name Ellipsoid#radiusY
         * @type {number}
         */
        this.radiusY = radiusY;
        /**
         * @name Ellipsoid#angle
         * @type {number}
         */
        this.angle = radians;
    }

    /**
     * square of the focus distance : <code>{@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
     * -->- {@link Ellipsoid#radiusY|radiusY}<sup>2</sup></code>
     * @type {number}
     * @readonly
     */
    get squareFocusDistance() {
        return this.radiusX * this.radiusX - this.radiusY * this.radiusY;
    }

    /**
     * focus distance : <code>&radic;({@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
     * -->- {@link Ellipsoid#radiusY|radiusY}<sup>2</sup>)</code>
     * @type {number}
     * @readonly
     */
    get focusDistance() {
        return Math.sqrt(this.squareFocusDistance);
    }

    /**
     * excentricity = <code>([focus distance]{@link Ellipsoid#focusDistance|focusDistance}) <!--
     * -->/ ([horizontal radius]{@link Ellipsoid#radiusX})</code>
     * @type {number}
     */
    get excentricity() {
        return this.focusDistance / this.radiusX;
    }

    /**
     * approximation of the perimeter of the ellipsoid : <code>&pi; \* &radic;(2 \* <!--
     * -->({@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
     * -->+ {@link Ellipsoid#radiusY|radiusY}<sup>2</sup>))</code>
     * @type {number}
     */
    get perimeter() {
        return Math.PI * Math.sqrt(2 * this.squareFocusDistance);
    }

    /**
     * area of the ellipsoid : <code>{@link Ellipsoid#radiusX|radiusX} <!--
     * -->\* {@link Ellipsoid#radiusY|radiusY} \* &pi;</code>
     * @type {number}
     */
    get area() {
        return this.radiusX * this.radiusY * Math.PI;
    }

    /**
     * returns a copy of the <code>{@link Shape#center|center}</code> attribute of the instance.
     * @returns {Vec2} a copy of the center
     */
    copyCenter() {
        return this.center.clone();
    }

    /**
     * sets the center's attributes to the same as the parameter's
     * @param {Vec2}center
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#setCenterXY}
     */
    setCenter(center) {
        this.center.set(center);
        return this;
    }

    /**
     * sets the center's attributes to the parameters
     * @param {number} x
     * @param {number} y
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#setCenter}
     */
    setCenterXY(x, y) {
        this.center.setXY(x, y);
        return this;
    }

    /**
     * makes the ellipsoid the opposite of itself relative to the given vertical axis
     * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
     * @param {number} [axisX=center.x]
     *          abscissa of the vertical axis
     * @returns {Shape} <code>this</code>
     */
    mirrorHorizontally(axisX = this.center.x) {
        this.radians = -this.radians;
        this.center.mirrorHorizontally(axisX);
        return this;
    }

    /**
     * makes the ellipsoid the opposite of itself relative to the given horizontal axis
     * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
     * @param {number} [axisY=center.y]
     *          ordinate of the vertical axis
     * @returns {Shape} <code>this</code>
     */
    mirrorVertically(axisY = this.center.y) {
        this.radians = -this.radians;
        this.center.mirrorVertically(axisY);
        return this;
    }

    /**
     * moves the shape according to the parameters
     * @param {number} dX
     * @param {number} dY
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#move}
     */
    moveXY(dX, dY) {
        this.center.addXY(dX, dY);
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
        this.center.add(delta);
        return this;
    }

    /**
     * multiplies the vertical and horizontal radius by the given factor.
     * @param {number} factor
     * @returns {Ellipsoid} <code>this</code>
     */
    scale(factor) {
        this.radiusX *= factor;
        this.radiusY *= factor;
        return this;
    }

    /**
     * adds the argument to the vertical and horizontal radius.
     * @param {number} delta
     * @returns {Ellipsoid} <code>this</code>
     */
    growDistance(delta) {
        this.radiusX += delta;
        this.radiusY += delta;
        return this;
    }

    /**
     * rotate the ellipsoid by the specified angle, in radians
     * @param {number} radians
     * @returns {Ellipsoid} <code>this</code>
     */
    rotate(radians) {
        this.radians += radians;
        return this;
    }

    /**
     * sets the {@link Ellipsoid#radians|radians} attribute to the specified value.
     * @param {number} radians
     * @returns {Ellipsoid} <code>this</code>
     */
    setAngle(radians) {
        this.radians = radians;
        return this;
    }

    /**
     * checks if the horizontal radius is the same as the vertical radius. if they're not, they are inverted, <!--
     * -->and the ellipsoid rotated anticlockwise for it to look the same.
     * @returns {Ellipsoid} <code>this</code>
     */
    checkRadius() {
        if (this.radiusX < this.radiusY) {
            [this.radiusX, this.radiusY] = [this.radiusY, this.radiusX];
            this.setAngle(this.radians + PI_2);
        }
        return this;
    }

    /**
     * returns the point of the ellipsoid, relative to its center, corresponding to the given radians.
     * @param {number} radians
     * @returns {Vec2}
     * @see {@link Ellipsoid#pointForAngle}
     */
    relativePointForAngle(radians) {
        let r = radians - this.radians;
        return new Vec2(this.radiusX * Math.cos(r), this.radiusY * Math.sin(r)).rotate(this.radians);
    }

    /**
     * returns the point of the ellipsoid, in absolute coordinates, corresponding to the given radians.
     * @param {number} radians
     * @returns {Vec2}
     * @see {@link Ellipsoid#relativePointForAngle}
     */
    pointForAngle(radians) {
        return this.relativePointForAngle(radians).add(this.center);
    }

    /**
     * returns the square distance from the center to the ellipsoid for the specified angle in radians
     * @param {number} radians
     * @returns {number}
     * @see {@link Ellipsoid#radiusForAngle}
     */
    squareRadiusForAngle(radians) {
        return this.relativePointForAngle(radians).squareMagnitude;
    }

    /**
     * returns the distance from the center to the ellipsoid for the specified angle in radians
     * @param {number} radians
     * @returns {number}
     * @see {@link Ellipsoid#squareRadiusForAngle}
     */
    radiusForAngle(radians) {
        return Math.sqrt(this.squareRadiusForAngle(radians));
    }

    /**@inheritDoc*/
    pushPath(context) {
        context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, PI2);
    }
    /**
     * draws the shape on the canvas
     * @param {CanvasRenderingContext2D} context
     * @param {boolean} [fill=false]
     * @param {boolean} [stroke=!fill]
     * @see {@link Shape#pushPath}
     */
    draw(context, fill = false, stroke = !fill) {
        context.beginPath();
        context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, PI2);
        fill && context.fill();
        stroke && context.stroke();
    }
    /**
     * draw the shape on the canvas using its webgl context.
     * To fill the shape, the draw mode must de TRIANGLES.
     * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
     * -->by using the attributes {@link Ellipsoid#glPointsNumber} and <!--
     * -->{@link Ellipsoid#glTriangles}
     * @param {Array} verticesArray array where the points x and y coordinates will be placed
     * @param {number} vOffset indice of the first free place in the array (must be even)
     * @param {Array} indicesArray array where the indices of the points <!--
     * -->for the triangles to be drawned will be placed
     * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
     */
    getVertices(verticesArray, vOffset, indicesArray, iOffset){
        const o = offset/2;
        let n = this.glPointsNumber-1, dA = PI2/n, a = 0, i = -1;
        while(++i < n) {
            float32Array[vOffset++] = (t = this.pointForAngle(a += dA)).x;
            float32Array[vOffset++] = t.y;
            if(i > 1) {
                indicesArray[iOffset++] = o; //first point
                indicesArray[iOffset++] = o+i; //current point
                indicesArray[iOffset++] = o+i-1; //previous point
            }
        }
    }
    /**
     * number of points used to draw this shape.
     * @type {number}
     * @name Ellipsoid#glPointsNumber
     */
    get glTriangles() {
        return this.glPointsNumber-1;
    }

    /**@inheritDoc*/
    contains(point) {
        let p = point.clone().remove(this.center);
        return this.squareRadiusForAngle(p.angle) > p.squareMagnitude;
    }

    /**@inheritDoc*/
    getRect() {
        let h, w; //half-height, half-width
        if (this.radians) {
            let a = this.radiusX, b = this.radiusY, alpha = this.radians,
                tanAlpha = Math.tan(alpha), sinAlpha = Math.sin(alpha), cosAlpha = Math.cos(alpha),
                b_a = b / a, t_xMax = Math.atan(-b_a * tanAlpha), t_yMax = Math.atan(b_a / tanAlpha);
            h = Math.abs(a * Math.cos(t_yMax) * sinAlpha + b * Math.sin(t_yMax) * cosAlpha);
            w = Math.abs(a * Math.cos(t_xMax) * cosAlpha + b * Math.sin(t_xMax) * sinAlpha);
        } else {
            h = this.radiusY;
            w = this.radiusX;
        }
        return new Rect(this.center.x - w, this.center.y - h, this.center.x + w, this.center.y + h);
    }

    /**@inheritDoc*/
    getRadius() {
        return this.radiusX;
    }

    /**@inheritDoc*/
    getPercentPoint(percent) {
        return this.pointForAngle(PI2 * percent + this.radians);
    }

    /**@inheritDoc*/
    closestPointTo(p) {
        return this.pointForAngle(Vec2.translation(this.center, p).angle);
    }

    /**@inheritDoc*/
    clone() {
        return new Ellipsoid(this.center, this.radiusX, this.radiusY, this.radians);
    }

    /**
     * creates and returns the polygon equivalent of the ellipsoid
     * @param {number} edges
     * @returns {@link Polygon} polygon equivalent of this ellipsoid
     */
    toPolygon(edges) {
        return Polygon.createEllipsoid(this.center, this.radiusX, this.radiusY, edges, this.radians);
    }
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Ellipsoid#glPointsNumber
 */
Ellipsoid.prototype.glPointsNumber = 16;

export default Ellipsoid;
export {Ellipsoid};