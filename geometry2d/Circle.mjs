import {PI2, Vec2, Shape, Rect, Polygon} from "./geometry2d.mjs";
/**
 * @module geometry2d/Circle
 */
/**
 * @class Circle
 * @augments Shape
 * @classdesc a shape representing a circle. Adds one member to the one present in <!--
 * --><code>{@link Shape|Shape}</code> : <!--
 * --><code>{@link Circle#radius|radius}</code>, <!--
 * -->the radius of the circle.
 */
class Circle extends Shape {
    /**
     * @constructor
     * @param {Vec2} center
     * @param {number} radius
     */
    constructor(center, radius) {
        super();
        /**
         * @name Circle#center
         * the circle's center
         * @type {Vec2}
         */
        this.center = center.clone();
        /**
         * @name Circle#radius
         * @type {number}
         */
        this.radius = radius;
    }

    /**
     * perimeter of the circle : <code>2 \* &pi; \* {@link Circle#radius|radius}</code>
     * @type {number}
     */
    get perimeter() {
        return PI2 * this.radius;
    }

    /**
     * area of the circle : <code>&pi; \* {@link Circle#radius|radius}<sup>2</sup></code>
     * @type {number}
     */
    get area() {
        return Math.pow(this.radius, 2) * Math.PI;
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
     * makes the shape the opposite of itself relative to the given horizontal axis
     * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
     * @param {number} [axisY=center.y]
     *          ordinate of the horizontal axis
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#mirrorHorizontally}
     */
    mirrorVertically(axisY = this.center.y) {
        this.center.mirrorVertically(axisY);
        return this;
    }

    /**
     * makes the shape the opposite of itself relative to the given vertical axis
     * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
     * @param {number} [axisX=center.x]
     *          abscissa of the vertical axis
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#mirrorVertically}
     */
    mirrorHorizontally(axisX = this.center.x) {
        this.center.mirrorHorizontally(axisX);
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
     * @description multiplies the radius by the argument.
     * @param {number} factor
     * @returns {Circle} <code>this</code>
     * @see [superclass method]{@link Shape#scale}
     * @see {@link Circle#growDistance}
     */
    scale(factor) {
        this.radius *= factor;
        return this;
    }

    /**
     * adds the argument to the radius.
     * @param {number} delta
     * @returns {Circle} <code>this</code>
     * @see [superclass method]{@link Shape#growDistance}
     * @see {@link Circle#scale}
     */
    growDistance(delta) {
        this.radius += delta;
        return this;
    }

    /**
     * returns the point of the circle, relative to its center, corresponding to the given radians.
     * @param {number} radians
     * @returns {Vec2}
     * @see {@link Circle#pointForAngle}
     */
    relativePointForAngle(radians) {
        return Vec2.createFromAngle(radians, this.radius);
    }

    /**
     * returns the point of the circle, in absolute coordinates, corresponding to the given radians.
     * @param {number} radians
     * @returns {Vec2}
     * @see {@link Circle#relativePointForAngle}
     */
    pointForAngle(radians) {
        return Vec2.createFromAngle(radians, this.radius).add(this.center);
    }

    /**@inheritDoc*/
    pushPath(context) {
        context.arc(this.center.x, this.center.y, this.radius, 0, PI2, false);
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
        context.arc(this.center.x, this.center.y, this.radius, 0, PI2, false);
        fill && context.fill();
        stroke && context.stroke();
    }

    /**
     * draw the shape on the canvas using its webgl context.
     * To fill the shape, the draw mode must de TRIANGLES.
     * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
     * -->by using the attributes {@link Circle#glPointsNumber} and <!--
     * -->{@link Circle#glTriangles}
     * @param {Array} verticesArray array where the points x and y coordinates will be placed
     * @param {number} vOffset indice of the first free place in the array (must be even)
     * @param {Array} indicesArray array where the indices of the points <!--
     * -->for the triangles to be drawned will be placed
     * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
     */
    getVertices(verticesArray, vOffset, indicesArray, iOffset){
        const o = vOffset/2;
        let n = this.glPointsNumber, dA = PI2/n, a = -dA, i = -1, t;
        while(++i < n) {
            verticesArray[vOffset++] = (t = Vec2.createFromAngle(a += dA, this.radius)).x;
            verticesArray[vOffset++] = t.y;
            if(i > 1) {
                indicesArray[iOffset++] = o; //first point
                indicesArray[iOffset++] = o+i-1; //previous point
                indicesArray[iOffset++] = o+i; //current point
            }
        }
    }
    /**
     * number of points used to draw this shape.
     * @type {number}
     * @name Circle#glPointsNumber
     */
    get glTriangles() {
        return this.glPointsNumber-2;
    }

    /**
     * returns whether or not this circle instance intersect the specified shape.
     * This function only does the job for {@link Circle} instances. <!--
     * -->For the instances of other classes,
     * this function calls their method : <code>shape.intersect(this)</code>
     * @param {Shape} shape
     * @returns {boolean}
     */
    intersect(shape) {
        if (shape instanceof Rect) {
            // TODO optimiser
            return shape.toPolygon().intersect(this);
        }
        else if (shape instanceof Circle) {
            /*
            return !!(asm.circlesIntersect(this.center.x, this.center.y, this.radius,
                                shape.center.x, shape.center.y, shape.radius));
            /*/
            let d = Vec2.distance(this.center, shape.center);
            return d <= this.radius + shape.radius &&
                this.radius <= d + shape.radius && // the other circle is not inside this circle
                shape.radius <= d + this.radius; // this circle is not inside the other circle
            //*/
        }
        else return shape.intersect(this);
    }

    /**
     * returns the intersection points between this circle and the given shape
     * @param {Shape} shape
     * @returns {Vec2[]}
     */
    getIntersectionPoints(shape) {
        if(shape instanceof Rect) {
            //TODO optimiser
            return shape.toPolygon().getIntersectionPoints(this);
        }
        else if(shape instanceof Circle) {
            let trans = Vec2.translation(this.center, shape.center),
                d2 = trans.squareMagnitude,
                da = Math.acos(d2-shape.radius*shape.radius+this.radius*this.radius)/(2*Math.sqrt(d2)*this.radius),
                a = trans.angle;
            return [Vec2.createFromAngle(a + da, this.radius), Vec2.createFromAngle(a-da, this.radius)];
        }
        else return shape.getIntersectionPoints(this);
    }

    /**@inheritDoc*/
    contains(point) {
        return Vec2.distance(this.center, point) <= this.radius;
    }

    /**@inheritDoc*/
    getRect() {
        return Rect.createFromXY(this.center.x, this.center.y).addMargin(this.radius);
    }

    /**@inheritDoc*/
    getPercentPoint(percent) {
        return this.pointForAngle(percent * PI2);
    }

    /**@inheritDoc*/
    closestPointTo(p) {
        return Vec2.translation(this.center, p).setMagnitude(this.radius);
    }

    /**
     * @returns {number} the value of the {@link Circle#radius{radius} attribute
     */
    getRadius() {
        return this.radius;
    }

    /**
     * creates a copy of the circle. Does the same as {@link Circle#clone}
     * @returns {Circle}
     * @see [superclass method]{@link Shape#getCircle}
     */
    getCircle() {
        return new Circle(this.center, this.radius);
    }

    /**
     * creates a copy of the circle. Does the same as {@link Circle#getCircle}
     * @returns {Circle}
     * @see [superclass method]{@link Shape#clone}
     */
    clone() {
        return new Circle(this.center, this.radius);
    }

    /**
     * creates and returns an equivalent polygon.
     * @param {number} edges - number of edges you want your polygon to have
     * @param {number} startRadians
     * @returns {Polygon} the equivalent polygon
     */
    toPolygon(edges, startRadians = 0) {
        return Polygon.Regular(this.center, [this.radius], edges, startRadians);
    }
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Circle#glPointsNumber
 */
Circle.prototype.glPointsNumber = 16;

export default Circle;
export {Circle};