import {Vec2, Rect, Circle} from "./geometry2d.mjs";
/**
 * @module geometry2d/Shape
 */
/**
 * @class Shape
 * @abstract
 * @classdesc the base class of all shapes. has only one member : <!--
 * --><code>{@link Shape#center|center}</code>, the center of the shape, <!--
 * -->and plenty of useful methods with default behavior.
 */
class Shape {
    /**
     * @constructor
     */
    constructor() { }

    /**
     * center of the shape
     * @name utils.geometry2d.Shape#center
     * @type {Vec2}
     */

    /**
     * perimeter of the instance.
     * @readonly
     * @type {number}
     */
    get perimeter() {
        return 0;
    }

    /**
     * area of the instance.
     * @readonly
     * @type {number}
     */
    get area() {
        return 0;
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
     * makes the shape bigger by multiplying it's dimensions by the given factor
     * @param {number} factor - the number which will multiply the dimensions
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#growDistance}
     */
    scale(factor) {
        return this;
    }

    /**
     * makes the shape bigger by adding to it's dimensions the given distance
     * @param {number} delta - the number to add to the dimensions
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#scale}
     */
    growDistance(delta) {
        return this;
    }

    /**
     * rotates the shape by the given angle in radians.
     * @param {number} radians - angle.
     * @returns {Shape} <code>this</code>
     */
    rotate(radians) {
        return this;
    }

    /**
     * adds the instructions to draw this instance to the context.
     * @param {CanvasRenderingContext2D} context
     * @see {@link Shape#draw}
     */
    pushPath(context) {
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
        this.pushPath(context);
        fill && context.fill();
        stroke && context.stroke();
    }

    /**
     * returns whether or not the instance intersect (=collide) with the given shape.
     * @param {Shape} shape
     * @returns {boolean} true if the 2 shapes intersect.
     */
    intersect(shape) {
        return false;
    }

    /**
     * returns the intersection points with the given shape
     * @param {Shape} shape
     * @returns {Vec2[]}
     */
    getIntersectionPoints(shape) {
        return [];
    }

    /**
     * @param {Vec2} point
     * @returns {boolean} true if the point is located inside the shape.
     */
    contains(point) {
        return false;
    }

    /**
     * returns a {@link Rect|Rect} containing the entire shape.
     * @returns {Rect} the outside {@link Rect|Rect}
     */
    getRect() {
        return Rect.createFromPoint(this.center);
    }

    /**
     * returns the maximum distance to the <code>{@link Shape#center|center}</code> <!--
     * -->a point of the shape could have.
     * @returns {number} max distance to <code>{@link Shape#center|center}</code>
     */
    getRadius() {
        return 0;
    }

    /**
     * creates a <code>{@link Circle|Circle}</code> with the same center as the shape, <!--
     * -->and the radius returned by <code>{@link Shape#getRadius|getRadius}</code>.
     * @returns {Circle}
     */
    getCircle() {
        return new Circle(this.center, this.getRadius());
    }

    /**
     * returns the point corresponding to a certain percent of the instance's outline,
     * the start point depends on the shape.
     * @param {number} percent - percentage. must be in [0-1[.
     * @returns {Vec2} the corresponding point.
     */
    getPercentPoint(percent) {
        return this.center
    };

    /**
     * returns the closest point of the shape to the given point
     * @param {Vec2} p
     * @returns {Vec2} closest point of the shape.
     */
    closestPointTo(p) {
        return this.center;
    }

    /**
     * returns a copy of this shape.
     * @returns {Shape} the instance's copy
     */
    clone() {
        return new Shape();
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
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Shape#glPointsNumber
 */
Shape.prototype.glPointsNumber = 0;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Shape#glTriangles
 */
Shape.prototype.glTriangles = 0;

export default Shape;
export {Shape};